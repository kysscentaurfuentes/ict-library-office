// backend/src/redis.ts
import { Redis } from 'ioredis';

export const redis = new Redis({
  host:
    process.env.REDIS_HOST || '127.0.0.1',

  port:
    Number(process.env.REDIS_PORT) || 6379,

  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('🟥 Redis connected');
});

redis.on('error', (err: Error) => {
  console.error('Redis error:', err);
});


if (process.env.DISABLE_REDIS !== 'true') {
  redis.connect().catch(() => {
    console.log(
      '⚠️ Redis unavailable. Continuing without Redis.'
    );
  });
}