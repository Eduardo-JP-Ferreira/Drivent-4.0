
import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookig(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if(ticket.status === 'RESERVED' || ticket.TicketType.isRemote === true || 
    ticket.TicketType.includesHotel === false) throw forbiddenError();

  const booking = await bookingRepository.createBookig(userId, roomId);
  if (!booking) throw forbiddenError();

  return booking.id;
}

const bookingService = { getBooking, postBooking };
export default bookingService;
