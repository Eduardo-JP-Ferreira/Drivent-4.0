import { prisma } from '@/config';

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findRoomsById(id: number) {
  return prisma.room.findFirst({
    where: {
      id,
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findRoomsById
};

export default hotelRepository;
