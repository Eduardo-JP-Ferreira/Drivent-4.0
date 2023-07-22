import { Router } from 'express';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/health', (_req, res) => res.send('Booking OK!'))
  .get('/')


export { bookingRouter };
