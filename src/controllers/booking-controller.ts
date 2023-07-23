import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { InputBookingBody } from '@/protocols';


export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const bookingList = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(bookingList);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as InputBookingBody;

  try {
    const booking = await bookingService.postBooking(userId, roomId);
    return res.status(httpStatus.OK).send({bookingId: booking});
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
