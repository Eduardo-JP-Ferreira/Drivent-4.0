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
    }
  });
}

async function createBookig(userId: number, roomId: number): Promise<Booking> {
  return prisma.booking.create({
   data: {
    roomId,
    userId,
   }
  });
}

export default {
  findBookig,
  createBookig
};
