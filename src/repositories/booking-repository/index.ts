import { Booking } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findBooking(userId: number): Promise<Booking> {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    }
  });
}

async function findBookingById(id: number): Promise<Booking> {
  return await prisma.booking.findFirst({
    where: {
      id,
    },
    include: {
      Room: true,
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function updateBooking(id: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id,
    },
    data: {
      roomId,
    }
  });
}

export default {
  findBooking,
  findBookingById,
  createBooking,
  updateBooking,
};
