import { compare } from 'bcryptjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';

const usuarioResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    nombre: z.string(),
    email: z.string(),
    rol: z.enum(['ASISTENTE', 'ADMIN']),
  }),
});

const sessionResponseSchema = z.object({
  data: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number().positive(),
    usuario: z.object({
      id: z.string(),
      nombre: z.string(),
      email: z.string(),
      rol: z.enum(['ASISTENTE', 'ADMIN']),
    }),
  }),
});

let testDatabaseConfirmed = false;

const userCredentials = {
  nombre: 'Usuario de prueba',
  email: 'Usuario.Prueba@ZamoraFest.test',
  normalizedEmail: 'usuario.prueba@zamorafest.test',
  password: 'ClaveSegura123',
};

async function cleanAuthData(): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.usuario.deleteMany();
}

async function registerAssistant(): Promise<void> {
  const response = await request(app).post('/api/v1/auth/register').send({
    nombre: userCredentials.nombre,
    email: userCredentials.email,
    password: userCredentials.password,
  });

  expect(response.status).toBe(201);
}

async function loginAssistant() {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: userCredentials.normalizedEmail,
    password: userCredentials.password,
  });

  expect(response.status).toBe(200);

  return sessionResponseSchema.parse(response.body as unknown).data;
}

beforeAll(async () => {
  const result = await prisma.$queryRaw<Array<{ baseDatos: string }>>`
    SELECT current_database() AS "baseDatos"
  `;

  testDatabaseConfirmed = result[0]?.baseDatos === 'zamorafest_test';

  expect(testDatabaseConfirmed).toBe(true);
});

beforeEach(async () => {
  await cleanAuthData();
});

afterEach(async () => {
  if (testDatabaseConfirmed) {
    await cleanAuthData();
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API de autenticación y autorización', () => {
  it('registra un asistente y almacena la contraseña con hash', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      nombre: userCredentials.nombre,
      email: userCredentials.email,
      password: userCredentials.password,
    });

    expect(response.status).toBe(201);

    const body = usuarioResponseSchema.parse(response.body as unknown);

    expect(body.data).toMatchObject({
      nombre: userCredentials.nombre,
      email: userCredentials.normalizedEmail,
      rol: 'ASISTENTE',
    });

    const usuario = await prisma.usuario.findFirstOrThrow({
      where: {
        email: userCredentials.normalizedEmail,
      },
    });

    expect(usuario.passwordHash).not.toBe(userCredentials.password);
    expect(await compare(userCredentials.password, usuario.passwordHash)).toBe(true);

    const publicBody: unknown = response.body;

    expect(JSON.stringify(publicBody)).not.toContain('passwordHash');
  });

  it('inicia sesión y rota el refresh token', async () => {
    await registerAssistant();

    const firstSession = await loginAssistant();

    const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: firstSession.refreshToken,
    });

    expect(refreshResponse.status).toBe(200);

    const secondSession = sessionResponseSchema.parse(refreshResponse.body as unknown).data;

    expect(secondSession.accessToken).not.toBe(firstSession.accessToken);
    expect(secondSession.refreshToken).not.toBe(firstSession.refreshToken);

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
        revocadoEn: {
          not: null,
        },
      },
    });

    expect(revokedTokens).toBe(1);
  });

  it('responde 401 sin token y 403 para el rol ASISTENTE', async () => {
    const withoutToken = await request(app).post('/api/v1/eventos').send({});

    expect(withoutToken.status).toBe(401);
    expect(withoutToken.body as unknown).toMatchObject({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
      },
    });

    await registerAssistant();
    const session = await loginAssistant();

    const forbiddenResponse = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({});

    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body as unknown).toMatchObject({
      error: {
        code: 'FORBIDDEN',
      },
    });

    const publicResponse = await request(app).get('/api/v1/eventos');

    expect(publicResponse.status).toBe(200);
  });
});
