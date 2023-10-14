import express from 'express';
import config from 'config';
import connect from './utils/connect';
import logger from './utils/logger';
import createSever from './utils/server';
import swaggerDocs from './utils/swagger';

const port = config.get<number>('port');

const app = createSever();

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connect();

  swaggerDocs(app, port);
});
