import logger from 'pino';
import dayjs from 'dayjs';

const log = logger({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: `"${dayjs().format()}"`,
    },
  },
  base: {
    pid: false,
  },
});

export default log;
