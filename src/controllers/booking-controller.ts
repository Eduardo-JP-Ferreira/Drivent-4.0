import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';


export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const bookingList = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(bookingList);
  } catch (e) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
