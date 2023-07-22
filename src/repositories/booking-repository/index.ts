import { Booking } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findBookig(userId: number): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      userId,
    }
  });
}

export default {
  findBookig,
};
