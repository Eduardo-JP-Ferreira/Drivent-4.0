
import { conflictError, forbiddenError, notFoundError, unauthorizedError } from '@/errors';
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
  if (!enrollment) throw forbiddenError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || 
    !ticket.TicketType.includesHotel) throw forbiddenError();

  const roomExist = await hotelRepository.findRoomsById(roomId);
  if(!roomExist) throw notFoundError();
  if(roomExist.Booking.length === roomExist.capacity) throw forbiddenError();

  const booking = await bookingRepository.createBookig(userId, roomId);
  if (!booking) throw forbiddenError();

  return booking.id;
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || 
    !ticket.TicketType.includesHotel) throw forbiddenError();

  const roomExist = await hotelRepository.findRoomsById(roomId);
  if(!roomExist) throw notFoundError();
  if(roomExist.Booking.length === roomExist.capacity) throw forbiddenError();

  const verifyBookingId = await bookingRepository.findBookingById(bookingId)
  if(verifyBookingId.userId !== userId) throw forbiddenError();

  const update = await bookingRepository.createBookig(bookingId, roomId);
  if (!update) throw forbiddenError();

  return update.id;
}

const bookingService = { getBooking, postBooking, putBooking };
export default bookingService;
