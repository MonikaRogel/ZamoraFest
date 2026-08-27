import type { CorsOptions } from 'cors';

import { env } from './env.js';

const allowedOrigins = new Set(env.CORS_ALLOWED_ORIGINS);

export const corsOptions: CorsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: false,
  maxAge: 600,
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
  origin(origin, callback) {
    callback(null, origin === undefined || allowedOrigins.has(origin));
  },
};
