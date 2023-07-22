
import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookig(userId);
  if (!booking) throw notFoundError();

  return booking;
}
const bookingService = { getBooking };
export default bookingService;
