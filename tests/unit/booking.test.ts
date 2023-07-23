import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
} from '../factories';
import app, { init } from '@/app';
import { prisma } from '@/config';
import { number } from 'joi';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import hotelRepository from '@/repositories/hotel-repository';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
})

const server = supertest(app);

describe('GET Booking Unit Tests', () => {

  it("should return a booking", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        TicketType: {
          includesHotel: true
        }
      } 
    })
    const createdAt = new Date().toISOString
    const updatedAt = new Date().toISOString
    jest.spyOn(bookingRepository, "findBooking").mockImplementationOnce((): any => {
      return {
        id: 1,
        roomId: 2,
        userId: 1,
        updatedAt,
        createdAt,
        Room: {
          id: 2,
          name: "name",
          capacity: 6,
          hotelId: 3,
          createdAt,
          updatedAt,
        }
      }
    });

    const booking = await bookingService.getBooking(1);
    expect(booking).toEqual({
      id: 1,
      roomId: 2,
      userId: 1,
      updatedAt,
      Room: {
        id: 2,
        name: "name",
        capacity: 6,
        hotelId: 3,
        createdAt,
        updatedAt,
      }
    })
  });

  it("should return NotFoundError when doesn't include hotel", async () => {

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        TicketType: {
          includesHotel: false
        }
      } 
    })
    const promisse = bookingService.getBooking(1);
    expect(promisse).rejects.toEqual({
      message: "No result for this search!",
      name: "NotFoundError"
    })
  });
});

describe('POST Booking Unit Tests', () => {

  it("should return NotFoundError when room doesn't exist", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce(null);

    const promisse = bookingService.postBooking(1, 2);
    expect(promisse).rejects.toEqual({
      message: "No result for this search!",
      name: "NotFoundError"
    })
  })

  it("should return ForbiddenError ticket is not paid", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "RESERVED",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })

    const promisse = bookingService.postBooking(1, 2);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })

  it("should return ForbiddenError when room is full", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce((): any => { 
      return {
        capacity: 2,
        Booking: [ { id: 1 }, { id: 2 } ]
      } 
    });

    const promisse = bookingService.postBooking(1, 2);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })

  it("should return ForbiddenError when post booking fail", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce((): any => { 
      return {
        capacity: 3,
        Booking: [ { id: 1 }, { id: 2 } ]
      } 
    });
    jest.spyOn(bookingRepository, "createBooking").mockImplementationOnce(null);

    const promisse = bookingService.postBooking(1, 2);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })
});

describe('PUT Booking Unit Tests', () => {

  it("should return ForbiddenError ticket is not paid", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "RESERVED",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })

    const promisse = bookingService.putBooking(1, 2, 1);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })

  it("should return NotFoundError when room doesn't exist", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce(null);

    const promisse = bookingService.putBooking(1, 2, 1);
    expect(promisse).rejects.toEqual({
      message: "No result for this search!",
      name: "NotFoundError"
    })
  })

  it("should return ForbiddenError when room is full", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce((): any => { 
      return {
        capacity: 2,
        Booking: [ { id: 1 }, { id: 2 } ]
      } 
    });

    const promisse = bookingService.putBooking(1, 2, 1);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })

  it("should return ForbiddenError when booking dosen't belong to the user", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce((): any => { 
      return {
        capacity: 3,
        Booking: [ { id: 1 }, { id: 2 } ]
      } 
    });
    jest.spyOn(bookingRepository, "findBookingById").mockImplementationOnce((): any => { 
      return {
        userId: 2
      } 
    });

    const promisse = bookingService.putBooking(1, 2, 1);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })

  it("should return ForbiddenError when PUT booking fail", async () => {
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => { return { id: 1 } })
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => { 
      return {
        id: 1,
        status: "PAID",
        TicketType: {
          includesHotel: true,
          isRemote: false
        }
      } 
    })
    jest.spyOn(hotelRepository, "findRoomsById").mockImplementationOnce((): any => { 
      return {
        capacity: 3,
        Booking: [ { id: 1 }, { id: 2 } ]
      } 
    });
    jest.spyOn(bookingRepository, "findBookingById").mockImplementationOnce((): any => { 
      return {
        userId: 1
      } 
    });
    jest.spyOn(bookingRepository, "updateBooking").mockImplementationOnce(null);

    const promisse = bookingService.putBooking(1, 2, 1);
    expect(promisse).rejects.toEqual({
      message: "Access to this resource is forbidden",
      name: "ForbiddenError"
    })
  })
});