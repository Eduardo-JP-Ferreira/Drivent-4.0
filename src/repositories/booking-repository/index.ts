import { Booking } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findBookig(userId: number): Promise<Booking> {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    }
  });
}

async function createBookig(userId: number, roomId: number): Promise<Booking> {
  return await prisma.booking.create({
   data: {
    userId,
    roomId    
   }
  });
}

export default {
  findBookig,
  createBookig
};
