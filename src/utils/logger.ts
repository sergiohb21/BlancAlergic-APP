import pino from 'pino';

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  browser: {
    asObject: true,
    serialize: true,
    transmit: {
      level: 'error',
      send: (_level, logEvent) => {
        if (isProduction) {
          console.error('[PINO ERROR]', logEvent);
        }
      },
    },
  },
  base: {
    pid: undefined,
    hostname: undefined,
    env: isDevelopment ? 'development' : 'production',
    app: 'BlancAlergic-APP',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;