import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '../../config/env.js';
import { PrismaClient } from '../../generated/prisma/client.js';

const connectionString = env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL : env.DATABASE_URL;

if (!connectionString) {
  throw new Error(`No existe una conexión configurada para el entorno ${env.NODE_ENV}.`);
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
});
