import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

export default {
  port: process.env.PORT || 1337,
  origin: 'http://localhost:3000',
  dbUri: process.env.DB_URI,
  saltWorkFactor: 10,
  accessTokenTtl: '15m',
  refreshTokenTtl: '1y',
  publicKey: fs.readFileSync('public.pem', 'utf-8'),
  privateKey: fs.readFileSync('private.pem', 'utf-8'),
};
