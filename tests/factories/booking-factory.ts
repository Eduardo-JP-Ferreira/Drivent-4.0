import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBookig(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}
