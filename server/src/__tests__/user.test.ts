import mongoose from 'mongoose';
import supertest from 'supertest';
import createServer from '../utils/server';
import * as UserService from '../service/user.service';
import * as SessionService from '../service/session.service';
import { create } from 'lodash';
import { createSessionHandler } from '../controller/session.controller';

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
  _id: userId,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
  picture: 'https://example.com/picture.jpg',
};

const userInput = {
  email: 'test@example.com',
  name: 'Jane Doe',
  picture: 'https://example.com/picture.jpg',
  password: 'Password123',
  passwordConfirmation: 'Password123',
};

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: 'PostmanRuntime/7.28.4',
  createdAt: new Date('2021-09-30T13:31:07.674Z'),
  updatedAt: new Date('2021-09-30T13:31:07.674Z'),
  __v: 0,
};

describe('user', () => {
  // user registeration

  describe('user registeration', () => {
    describe('given the username and password are valid', () => {
      it('should return the user payload', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);
        const { body, statusCode } = await supertest(app)
          .post('/api/users')
          .send(userInput);
        expect(statusCode).toBe(200);
        expect(body).toEqual(userPayload);
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
      });
    });

    describe('given the passwords do not match', () => {
      it('should return a 400', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);
        const { body, statusCode } = await supertest(app)
          .post('/api/users')
          .send({ ...userInput, passwordConfirmation: 'doesnotmatch' });
        expect(statusCode).toBe(400);
        expect(createUserServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the user service throws an error', () => {
      it('should return a 409', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          .mockRejectedValueOnce('Oh no :(');
        const { statusCode } = await supertest(app)
          .post('/api/users')
          .send(userInput);
        expect(statusCode).toBe(409);
        expect(createUserServiceMock).toHaveBeenCalled();
      });
    });
  });

  describe('create user session', () => {
    describe('given the username and password are valid', () => {
      it('should return a signed accesstoken & refreshtoken', async () => {
        jest
          .spyOn(UserService, 'validatePassword')
          // @ts-ignore
          .mockReturnValue(userPayload);
        jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValue(sessionPayload);

        const req = {
          get: () => {
            return 'a user agent';
          },
          body: {
            email: 'test@example.com',
            password: 'Password123',
          },
        };

        const send = jest.fn();
        const cookie = jest.fn();

        const res = {
          send,
          cookie,
        };

        // @ts-ignore
        await createSessionHandler(req, res);

        expect(cookie).toHaveReturnedTimes(2);

        expect(send).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });

        type sameSite = 'strict' | 'lax' | 'none' | 'strict';
        expect(cookie).toHaveBeenCalledWith('accessToken', expect.any(String), {
          maxAge: 900000, // 15 minutes
          httpOnly: true,
          domain: 'localhost',
          path: '/',
          sameSite: expect.any(String) as sameSite,
          secure: false,
        });
        expect(cookie).toHaveBeenCalledWith(
          'refreshToken',
          expect.any(String),
          {
            maxAge: 3.154e10, // 1 year
            httpOnly: true,
            domain: 'localhost',
            path: '/',
            sameSite: expect.any(String) as sameSite,
            secure: false,
          }
        );
      });
    });
  });
});
