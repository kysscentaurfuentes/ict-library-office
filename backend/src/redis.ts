// backend/src/redis.ts
import { Redis } from 'ioredis';
import { logger } from '../src/utils/logger.js'

export const redis = new Redis({
  host:
    process.env.REDIS_HOST || '127.0.0.1',

  port:
    Number(process.env.REDIS_PORT) || 6379,

  lazyConnect: true,
});

redis.on('connect', () => {
 logger.server(
  "Redis connected"
);
});

redis.on('error', (err: Error) => {
  logger.error(
  `[REDIS] ${err.message}`
);
});


if (process.env.DISABLE_REDIS !== 'true') {
  redis.connect().catch(() => {
    logger.server(
  "Redis unavailable. Continuing without Redis."
);
  });
}