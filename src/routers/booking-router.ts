import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, postBooking } from '@/controllers';
import { bookingSchema } from '@/schemas';



const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/health', (_req, res) => res.send('Booking OK!'))
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), postBooking)


export { bookingRouter };
