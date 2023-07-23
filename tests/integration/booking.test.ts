import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import * as jwt from 'jsonwebtoken';
import {
  createBookig,
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
import { number, string } from 'joi';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});


const server = supertest(app);

describe('/GET BOOKING when token is not valid', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
  
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('/GET BOOKING when token is valid', () => {

  it('should respond with status 404 when user ticket is remote ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 when user has no enrollment ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    await createTicketTypeRemote();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 when there is no booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    const createdHotel = await createHotel();

    const createdRoom = await createRoomWithHotelId(createdHotel.id);

    const response = await server.get(`/booking`).set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('should respond with status 200 and booking Id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    const createdHotel = await createHotel();

    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const createOneBooking = await createBookig(user.id, createdRoom.id)

    const response = await server.get(`/booking`).set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({
      id: createOneBooking.id,
      roomId: createdRoom.id,
      userId: user.id,
      updatedAt: createOneBooking.updatedAt.toISOString(),
      Room: {
        id: createdRoom.id,
        name: createdRoom.name,
        capacity: createdRoom.capacity,
        hotelId: createdRoom.hotelId,
        createdAt: createdRoom.createdAt.toISOString(),
        updatedAt: createdRoom.updatedAt.toISOString(),
      }
    })
  });
});

describe('/POST BOOKING when token is not valid', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
  
    const body = {roomId: Number(1)}
    const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(body);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const body = {roomId: Number(1)}
    const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(body);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('/POST BOOKING when token is valid', () => {

  it('should respond with status 403 when user ticket is remote ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const createdHotel = await createHotel();
    const createdRoom = await createRoomWithHotelId(createdHotel.id);

    const body = {roomId: Number(createdRoom.id)}
    const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 when user has no enrollment ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createTicketTypeRemote(); 
    const createdHotel = await createHotel();
    const createdRoom = await createRoomWithHotelId(createdHotel.id);

    const body = {roomId: Number(createdRoom.id)}
    const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 200 and booking Id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    const createdHotel = await createHotel();

    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const body = {roomId: Number(createdRoom.id)}
    const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number)
    })
  });
});

describe('/PUT BOOKING when token is valid', () => {

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put(`/booking/${1}`)
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
  
    const body = {roomId: Number(2)}
    const response = await server.put(`/booking/${1}`).set('Authorization', `Bearer ${token}`).send(body);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const body = {roomId: Number(2)}
    const response = await server.put(`/booking/${1}`).set('Authorization', `Bearer ${token}`).send(body);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('/POST BOOKING when token is valid', () => {

  it('should respond with status 403 when user ticket is remote ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const createdHotel = await createHotel();
    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const createdRoom2 = await createRoomWithHotelId(createdHotel.id);

    const createOneBooking = await createBookig(user.id, createdRoom.id)

    const body = {roomId: Number(createdRoom2.id)}
    const response = await server.put(`/booking/${createOneBooking.id}`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 when user has no enrollment ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createTicketTypeRemote(); 
    const createdHotel = await createHotel();
    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const createdRoom2 = await createRoomWithHotelId(createdHotel.id);

    const createOneBooking = await createBookig(user.id, createdRoom.id)

    const body = {roomId: Number(createdRoom2.id)}
    const response = await server.put(`/booking/${createOneBooking.id}`).set('Authorization', `Bearer ${token}`).send(body);
  });

  it('should respond with status 200 and booking Id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    const createdHotel = await createHotel();

    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const createdRoom2 = await createRoomWithHotelId(createdHotel.id);

    const createOneBooking = await createBookig(user.id, createdRoom.id)

    const body = {roomId: Number(createdRoom2.id)}
    const response = await server.put(`/booking/${createOneBooking.id}`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number)
    })
  });
});

