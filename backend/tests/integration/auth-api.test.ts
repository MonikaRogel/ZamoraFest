import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';

const TEST_EMAIL_PREFIX = 't049.';
const TEST_EMAIL_REQUEST = 'T049.Usuario@ZamoraFest.test';
const TEST_EMAIL = 't049.usuario@zamorafest.test';
const TEST_PASSWORD = 'ClaveSeguraT049';
const TEST_NAME = 'Usuario T049';

const usuarioResponseSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    nombre: z.string(),
    email: z.email(),
    rol: z.enum(['VISITANTE', 'ASISTENTE', 'ADMINISTRADOR']),
  }),
});

const sessionResponseSchema = z.object({
  data: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number().int().positive(),
    usuario: z.object({
      id: z.number().int().positive(),
      nombre: z.string(),
      email: z.email(),
      rol: z.enum(['VISITANTE', 'ASISTENTE', 'ADMINISTRADOR']),
    }),
  }),
});

async function confirmTestDatabase(): Promise<void> {
  const databases = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  expect(databases[0]?.databaseName).toBe('zamorafest_test');
}

async function ensureVisitanteRoleActive(): Promise<void> {
  const updated = await prisma.rol.updateMany({
    where: {
      nombre: 'VISITANTE',
    },
    data: {
      estado: true,
    },
  });

  expect(updated.count).toBe(1);
}

async function cleanAuthTestData(): Promise<void> {
  const usuarios = await prisma.usuario.findMany({
    where: {
      correo: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  const ids = usuarios.map((usuario) => usuario.id);

  if (ids.length === 0) {
    return;
  }

  await prisma.refreshToken.deleteMany({
    where: {
      usuarioId: {
        in: ids,
      },
    },
  });

  await prisma.usuario.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

async function registerTestUser() {
  const response = await request(app).post('/api/v1/auth/register').send({
    nombre: TEST_NAME,
    email: TEST_EMAIL_REQUEST,
    password: TEST_PASSWORD,
  });

  expect(response.status).toBe(201);

  const usuario = usuarioResponseSchema.parse(response.body as unknown).data;

  expect(usuario).toMatchObject({
    nombre: TEST_NAME,
    email: TEST_EMAIL,
    rol: 'VISITANTE',
  });

  return usuario;
}

async function loginTestUser() {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  expect(response.status).toBe(200);

  return sessionResponseSchema.parse(response.body as unknown).data;
}

beforeAll(async () => {
  await confirmTestDatabase();
});

beforeEach(async () => {
  await ensureVisitanteRoleActive();
  await cleanAuthTestData();
});

afterEach(async () => {
  await ensureVisitanteRoleActive();
  await cleanAuthTestData();
});

afterAll(async () => {
  await ensureVisitanteRoleActive();
  await cleanAuthTestData();
  await prisma.$disconnect();
});

describe('T049 - autenticación canónica', () => {
  it('inicia sesión con usuario VISITANTE activo y credenciales válidas', async () => {
    const usuario = await registerTestUser();
    const session = await loginTestUser();

    expect(session.usuario).toEqual(usuario);
    expect(session.accessToken).not.toBe(session.refreshToken);
    expect(session.tokenType).toBe('Bearer');
    expect(session.expiresIn).toBe(900);

    const tokensPersistidos = await prisma.refreshToken.count({
      where: {
        usuarioId: usuario.id,
      },
    });

    expect(tokensPersistidos).toBe(1);
  });

  it('rechaza un access token inválido', async () => {
    const response = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', 'Bearer token-invalido-t049')
      .send({});

    expect(response.status).toBe(401);

    expect(response.body as unknown).toMatchObject({
      error: {
        code: 'INVALID_ACCESS_TOKEN',
      },
    });
  });

  it('renueva correctamente una sesión mediante refresh token', async () => {
    const usuario = await registerTestUser();
    const firstSession = await loginTestUser();

    const response = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: firstSession.refreshToken,
    });

    expect(response.status).toBe(200);

    const secondSession = sessionResponseSchema.parse(response.body as unknown).data;

    expect(secondSession.usuario).toEqual(usuario);
    expect(secondSession.accessToken).not.toBe(firstSession.accessToken);
    expect(secondSession.refreshToken).not.toBe(firstSession.refreshToken);

    const tokensPersistidos = await prisma.refreshToken.count({
      where: {
        usuarioId: usuario.id,
      },
    });

    expect(tokensPersistidos).toBe(2);
  });

  it('revoca el refresh token anterior durante la rotación e impide reutilizarlo', async () => {
    const usuario = await registerTestUser();
    const firstSession = await loginTestUser();

    const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: firstSession.refreshToken,
    });

    expect(refreshResponse.status).toBe(200);

    const reuseResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: firstSession.refreshToken,
    });

    expect(reuseResponse.status).toBe(401);

    expect(reuseResponse.body as unknown).toMatchObject({
      error: {
        code: 'INVALID_REFRESH_TOKEN',
      },
    });

    const revokedTokens = await prisma.refreshToken.count({
      where: {
        usuarioId: usuario.id,
        revocadoEn: {
          not: null,
        },
      },
    });

    const activeTokens = await prisma.refreshToken.count({
      where: {
        usuarioId: usuario.id,
        revocadoEn: null,
      },
    });

    expect(revokedTokens).toBe(1);
    expect(activeTokens).toBe(1);
  });

  it('rechaza login y refresh cuando el rol VISITANTE está inactivo', async () => {
    await registerTestUser();
    const session = await loginTestUser();

    await prisma.rol.update({
      where: {
        nombre: 'VISITANTE',
      },
      data: {
        estado: false,
      },
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(loginResponse.status).toBe(401);

    expect(loginResponse.body as unknown).toMatchObject({
      error: {
        code: 'INVALID_CREDENTIALS',
      },
    });

    const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: session.refreshToken,
    });

    expect(refreshResponse.status).toBe(401);

    expect(refreshResponse.body as unknown).toMatchObject({
      error: {
        code: 'INVALID_REFRESH_TOKEN',
      },
    });
  });
});
