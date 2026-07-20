import type { ConnectionOptions } from 'bullmq';

import { env } from '../../config/env.js';

const redisUrl = new URL(env.REDIS_URL);
const databaseNumber = Number(redisUrl.pathname.slice(1) || '0');

export const bullMqConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || '6379'),
  db: Number.isInteger(databaseNumber) ? databaseNumber : 0,
  maxRetriesPerRequest: null,
  ...(redisUrl.username ? { username: decodeURIComponent(redisUrl.username) } : {}),
  ...(redisUrl.password ? { password: decodeURIComponent(redisUrl.password) } : {}),
} satisfies ConnectionOptions;
