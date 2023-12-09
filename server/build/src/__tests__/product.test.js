"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const server_1 = __importDefault(require("../utils/server"));
const mongoose_1 = __importDefault(require("mongoose"));
const product_service_1 = require("../service/product.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const app = (0, server_1.default)();
const userId = new mongoose_1.default.Types.ObjectId().toString();
const productPayload = {
    user: userId,
    title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
    description: 'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
    price: 879.99,
    image: 'https://i.imgur.com/QlRphfQ.jpg',
};
const userPayload = {
    _id: userId,
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
};
describe('product', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        yield mongoose_1.default.connect(mongoServer.getUri());
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoose_1.default.connection.close();
    }));
    describe('get product route', () => {
        describe('given the product does not exit', () => {
            it('should return a 404', () => __awaiter(void 0, void 0, void 0, function* () {
                const productId = '651ed9931599bef83bcabc1a';
                yield (0, supertest_1.default)(app).get(`/api/products/${productId}`).expect(404);
            }));
        });
        describe('given the product does exit', () => {
            it('should return a 200 status and the product', () => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield (0, product_service_1.createProduct)(productPayload);
                const { body, statusCode } = yield (0, supertest_1.default)(app).get(`/api/products/${product._id}`);
                expect(statusCode).toBe(200);
                expect(body._id).toBe(product._id.toString());
            }));
        });
    });
    describe('create product route', () => {
        describe('given the user is not logged in', () => {
            it('should return a 403', () => __awaiter(void 0, void 0, void 0, function* () {
                const { statusCode } = yield (0, supertest_1.default)(app).post('/api/products');
                expect(statusCode).toBe(403);
            }));
        });
        describe('given the user is logged in', () => {
            it('should return a 200 status and the product', () => __awaiter(void 0, void 0, void 0, function* () {
                const jwt = (0, jwt_utils_1.signJwt)(userPayload);
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post('/api/products')
                    .set('Authorization', `Bearer ${jwt}`)
                    .send(productPayload);
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    __v: 0,
                    _id: expect.any(String),
                    createdAt: expect.any(String),
                    description: 'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
                    image: 'https://i.imgur.com/QlRphfQ.jpg',
                    price: 879.99,
                    title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
                    updatedAt: expect.any(String),
                    user: expect.any(String),
                });
            }));
        });
    });
});
