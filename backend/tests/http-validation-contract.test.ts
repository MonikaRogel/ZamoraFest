import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../src/app.js';

const validationErrorResponseSchema = z.object({
  error: z.object({
    code: z.literal('VALIDATION_ERROR'),
    message: z.string(),
    details: z.array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    ),
  }),
});

const malformedJsonResponseSchema = z.object({
  error: z.object({
    code: z.literal('MALFORMED_JSON'),
    message: z.string(),
  }),
});

describe('Semana 11 - contrato HTTP de validación', () => {
  it('responde 422 cuando un body JSON es procesable pero viola el contrato', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      nombre: 'A',
      email: 'correo-invalido',
      password: '123',
    });

    expect(response.status).toBe(422);

    const body = validationErrorResponseSchema.parse(response.body as unknown);

    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('La solicitud contiene datos inválidos.');

    expect(body.error.details.some((detail) => detail.path === 'email')).toBe(true);
  });

  it('mantiene 400 cuando un query param es inválido', async () => {
    const response = await request(app).get('/api/v1/eventos?page=0');

    expect(response.status).toBe(400);

    const body = validationErrorResponseSchema.parse(response.body as unknown);

    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('La solicitud contiene datos inválidos.');

    expect(body.error.details.some((detail) => detail.path === 'page')).toBe(true);
  });

  it('responde 400 y no 500 cuando el JSON está sintácticamente malformado', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"nombre":"Usuario incompleto"');

    expect(response.status).toBe(400);

    const body = malformedJsonResponseSchema.parse(response.body as unknown);

    expect(body.error.code).toBe('MALFORMED_JSON');
  });
});
