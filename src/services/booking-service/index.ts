
import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelRepository from '@/repositories/hotel-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket || ticket.TicketType.includesHotel === false) throw notFoundError();

  const booking = await bookingRepository.findBookig(userId);
  if (!booking) throw notFoundError();

  delete booking.createdAt, booking.updatedAt, booking.roomId, booking.userId

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote === true || 
    ticket.TicketType.includesHotel === false) throw forbiddenError();

  const roomExist = await hotelRepository.findRoomsById(roomId);
  if(!roomExist) throw notFoundError();
  
  const booking = await bookingRepository.createBookig(userId, roomId);
  if (!booking) throw forbiddenError();

  return booking.id;
}

const bookingService = { getBooking, postBooking };
export default bookingService;
