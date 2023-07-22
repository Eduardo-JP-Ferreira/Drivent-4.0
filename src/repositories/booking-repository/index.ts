import { Booking } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findBookig(userId: number): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      Room: true,
      User: false,
    }
  });
}

export default {
  findBookig,
};
