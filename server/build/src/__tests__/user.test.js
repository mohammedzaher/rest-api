"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../utils/server"));
const UserService = __importStar(require("../service/user.service"));
const SessionService = __importStar(require("../service/session.service"));
const session_controller_1 = require("../controller/session.controller");
const app = (0, server_1.default)();
const userId = new mongoose_1.default.Types.ObjectId().toString();
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
    _id: new mongoose_1.default.Types.ObjectId().toString(),
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
            it('should return the user payload', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(UserService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload);
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post('/api/users')
                    .send(userInput);
                expect(statusCode).toBe(200);
                expect(body).toEqual(userPayload);
                expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
            }));
        });
        describe('given the passwords do not match', () => {
            it('should return a 400', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(UserService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload);
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post('/api/users')
                    .send(Object.assign(Object.assign({}, userInput), { passwordConfirmation: 'doesnotmatch' }));
                expect(statusCode).toBe(400);
                expect(createUserServiceMock).not.toHaveBeenCalled();
            }));
        });
        describe('given the user service throws an error', () => {
            it('should return a 409', () => __awaiter(void 0, void 0, void 0, function* () {
                const createUserServiceMock = jest
                    .spyOn(UserService, 'createUser')
                    .mockRejectedValueOnce('Oh no :(');
                const { statusCode } = yield (0, supertest_1.default)(app)
                    .post('/api/users')
                    .send(userInput);
                expect(statusCode).toBe(409);
                expect(createUserServiceMock).toHaveBeenCalled();
            }));
        });
    });
    describe('create user session', () => {
        describe('given the username and password are valid', () => {
            it('should return a signed accesstoken & refreshtoken', () => __awaiter(void 0, void 0, void 0, function* () {
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
                yield (0, session_controller_1.createSessionHandler)(req, res);
                expect(cookie).toHaveReturnedTimes(2);
                expect(send).toHaveBeenCalledWith({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
                expect(cookie).toHaveBeenCalledWith('accessToken', expect.any(String), {
                    maxAge: 900000,
                    httpOnly: true,
                    domain: 'localhost',
                    path: '/',
                    sameSite: expect.any(String),
                    secure: false,
                });
                expect(cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), {
                    maxAge: 3.154e10,
                    httpOnly: true,
                    domain: 'localhost',
                    path: '/',
                    sameSite: expect.any(String),
                    secure: false,
                });
            }));
        });
    });
});
