import { randomUUID } from 'node:crypto';

import { hash as hashPassword } from 'bcryptjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { authService } from '../../src/modules/auth/auth.service.js';

let testDatabaseConfirmed = false;
let lugarId = '';
let categoriaIds: string[] = [];
let adminAccessToken = '';

async function cleanTestData(): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.imagenEvento.deleteMany();
  await prisma.programacionEvento.deleteMany();
  await prisma.eventoCategoria.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.lugar.deleteMany();
  await prisma.canton.deleteMany();
}

async function createSupportData(): Promise<void> {
  const suffix = randomUUID();
  const adminPassword = 'AdminPrueba123';

  const canton = await prisma.canton.create({
    data: {
      nombre: `Cantón API ${suffix}`,
    },
  });

  const lugar = await prisma.lugar.create({
    data: {
      nombre: `Lugar API ${suffix}`,
      direccion: 'Dirección utilizada en pruebas',
      cantonId: canton.id,
    },
  });

  const categorias = await Promise.all([
    prisma.categoria.create({
      data: {
        nombre: `Cultura ${suffix}`,
      },
    }),
    prisma.categoria.create({
      data: {
        nombre: `Música ${suffix}`,
      },
    }),
  ]);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administradora de prueba',
      email: `admin-${suffix}@zamorafest.test`,
      passwordHash: await hashPassword(adminPassword, 4),
      rol: 'ADMIN',
    },
  });

  const session = await authService.login({
    email: admin.email,
    password: adminPassword,
  });

  lugarId = lugar.id;
  categoriaIds = categorias.map(({ id }) => id);
  adminAccessToken = session.accessToken;
}

function validEventoPayload(estado: 'BORRADOR' | 'PUBLICADO' = 'PUBLICADO') {
  return {
    titulo: `Festival de prueba ${randomUUID()}`,
    descripcion: 'Descripción válida para verificar la gestión de eventos.',
    lugarId,
    categoriaIds,
    estado,
  };
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
  await prisma.$disconnect();
});

describe('API REST de eventos', () => {
  it('ejecuta el CRUD completo con eliminación lógica', async () => {
    const payload = validEventoPayload();

    const createResponse = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(payload);

    expect(createResponse.status).toBe(201);

    const createBody: unknown = createResponse.body;

    expect(createBody).toMatchObject({
      data: {
        titulo: payload.titulo,
        estado: 'PUBLICADO',
      },
    });

    const createdEvento = await prisma.evento.findFirstOrThrow({
      where: {
        titulo: payload.titulo,
      },
    });

    const totalCategorias = await prisma.eventoCategoria.count({
      where: {
        eventoId: createdEvento.id,
        eliminadoEn: null,
      },
    });

    expect(totalCategorias).toBe(2);

    const listResponse = await request(app).get('/api/v1/eventos?page=1&limit=10');

    expect(listResponse.status).toBe(200);

    const listBody: unknown = listResponse.body;

    expect(listBody).toMatchObject({
      data: [
        {
          id: createdEvento.id,
          titulo: payload.titulo,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    const getResponse = await request(app).get(`/api/v1/eventos/${createdEvento.id}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body as unknown).toMatchObject({
      data: {
        id: createdEvento.id,
        titulo: payload.titulo,
      },
    });

    const updateResponse = await request(app)
      .patch(`/api/v1/eventos/${createdEvento.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        titulo: 'Festival actualizado',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body as unknown).toMatchObject({
      data: {
        id: createdEvento.id,
        titulo: 'Festival actualizado',
      },
    });

    const deleteResponse = await request(app)
      .delete(`/api/v1/eventos/${createdEvento.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(deleteResponse.status).toBe(204);

    const deletedEvento = await prisma.evento.findUniqueOrThrow({
      where: {
        id: createdEvento.id,
      },
    });

    expect(deletedEvento.eliminadoEn).toBeInstanceOf(Date);

    const deletedGetResponse = await request(app).get(`/api/v1/eventos/${createdEvento.id}`);

    expect(deletedGetResponse.status).toBe(404);
  });

  it('rechaza datos inválidos con un error 400', async () => {
    const response = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        titulo: 'No',
        descripcion: 'Corta',
        lugarId: 'identificador-invalido',
        categoriaIds: [],
      });

    expect(response.status).toBe(400);
    expect(response.body as unknown).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'La solicitud contiene datos inválidos.',
      },
    });
  });

  it('no muestra públicamente los eventos en borrador', async () => {
    const payload = validEventoPayload('BORRADOR');

    const createResponse = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(payload);

    expect(createResponse.status).toBe(201);

    const createdEvento = await prisma.evento.findFirstOrThrow({
      where: {
        titulo: payload.titulo,
      },
    });

    const listResponse = await request(app).get('/api/v1/eventos');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body as unknown).toMatchObject({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

    const getResponse = await request(app).get(`/api/v1/eventos/${createdEvento.id}`);

    expect(getResponse.status).toBe(404);
  });
});
