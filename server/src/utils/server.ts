import express from 'express';
import cors from 'cors';
import deserializeUser from '../middleware/deserializeUser';
import routes from '../routes';
import config from 'config';
import cookieParser from 'cookie-parser';

function createServer() {
  const app = express();

  app.use(
    cors({
      origin: config.get<string>('origin'),
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(express.json());

  app.use(deserializeUser);

  routes(app);

  return app;
}

export default createServer;
