import { randomUUID } from 'node:crypto';

import { hash as hashPassword } from 'bcryptjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { closeRecordatorioQueue } from '../../src/infrastructure/queue/recordatorio.queue.js';
import { authService } from '../../src/modules/auth/auth.service.js';
import { recordatorioWorker } from '../../src/workers/recordatorio.worker.js';

const responseSchema = z.object({
  data: z.object({
    id: z.string().uuid(),
    estado: z.literal('PENDIENTE'),
  }),
});

let testDatabaseConfirmed = false;
let eventoId = '';
let accessToken = '';

async function cleanTestData(): Promise<void> {
  await prisma.recordatorio.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.eventoCategoria.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.lugar.deleteMany();
  await prisma.canton.deleteMany();
}

async function createSupportData(): Promise<void> {
  const suffix = randomUUID();
  const password = 'ClaveRecordatorio123';

  const canton = await prisma.canton.create({
    data: {
      nombre: `Cantón recordatorio ${suffix}`,
    },
  });

  const lugar = await prisma.lugar.create({
    data: {
      nombre: `Lugar recordatorio ${suffix}`,
      cantonId: canton.id,
    },
  });

  const categoria = await prisma.categoria.create({
    data: {
      nombre: `Categoría recordatorio ${suffix}`,
    },
  });

  const evento = await prisma.evento.create({
    data: {
      titulo: `Evento recordatorio ${suffix}`,
      descripcion: 'Evento publicado utilizado para probar BullMQ.',
      estado: 'PUBLICADO',
      lugarId: lugar.id,
      categorias: {
        create: {
          categoriaId: categoria.id,
        },
      },
    },
  });

  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Usuario de recordatorios',
      email: `recordatorio-${suffix}@zamorafest.test`,
      passwordHash: await hashPassword(password, 4),
      rol: 'ASISTENTE',
    },
  });

  const session = await authService.login({
    email: usuario.email,
    password,
  });

  eventoId = evento.id;
  accessToken = session.accessToken;
}

beforeAll(async () => {
  const result = await prisma.$queryRaw<Array<{ baseDatos: string }>>`
    SELECT current_database() AS "baseDatos"
  `;

  testDatabaseConfirmed = result[0]?.baseDatos === 'zamorafest_test';
  expect(testDatabaseConfirmed).toBe(true);
});

beforeEach(async () => {
  await cleanTestData();
  await createSupportData();
});

afterEach(async () => {
  if (testDatabaseConfirmed) {
    await cleanTestData();
  }
});

afterAll(async () => {
  await recordatorioWorker.close();
  await closeRecordatorioQueue();
  await prisma.$disconnect();
});

describe('API y cola de recordatorios', () => {
  it('encola y procesa un recordatorio mediante BullMQ', async () => {
    const response = await request(app)
      .post('/api/v1/recordatorios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        eventoId,
      });

    expect(response.status).toBe(202);

    const body = responseSchema.parse(response.body as unknown);

    await expect
      .poll(
        async () => {
          const recordatorio = await prisma.recordatorio.findUnique({
            where: {
              id: body.data.id,
            },
            select: {
              estado: true,
            },
          });

          return recordatorio?.estado;
        },
        {
          timeout: 5000,
          interval: 100,
        },
      )
      .toBe('COMPLETADO');

    const completedRecordatorio = await prisma.recordatorio.findUniqueOrThrow({
      where: {
        id: body.data.id,
      },
    });

    expect(completedRecordatorio.procesadoEn).toBeInstanceOf(Date);
    expect(completedRecordatorio.error).toBeNull();
  });
});
