// backend/src/redis.ts
import { Redis } from 'ioredis';

export const redis = new Redis({
  host: 'redis',
  port: 6379,
});

redis.on('connect', () => {
  console.log('🟥 Redis connected');
});

redis.on('error', (err: Error) => {
  console.error('Redis error:', err);
});