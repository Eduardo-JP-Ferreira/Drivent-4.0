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



describe('when token is valid', () => {
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
    });
});

