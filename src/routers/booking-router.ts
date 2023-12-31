import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, postBooking, putBooking} from '@/controllers';
import { bookingSchema } from '@/schemas';



const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema) ,postBooking)
  .put('/:bookingId', putBooking)

export { bookingRouter };
