"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './config.env' });
exports.default = {
    port: process.env.PORT || 1337,
    dbUri: process.env.DB_URI,
    saltWorkFactor: 10,
    accessTokenTtl: "15m",
    refreshTokenTtl: "1y",
    publicKey: fs_1.default.readFileSync('public.pem', 'utf-8'),
    privateKey: fs_1.default.readFileSync('private.pem', 'utf-8'),
};
