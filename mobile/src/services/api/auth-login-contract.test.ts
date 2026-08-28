import { describe, expect, it, vi } from 'vitest';

import {
  ApiRequestError,
  createZamoraFestApi,
} from './zamorafest-api';

describe('contrato HTTP de login', () => {
  it('envía POST al endpoint real y devuelve solo el usuario seguro', async () => {
    const fetcher = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              accessToken: 'token-acceso-secreto',
              refreshToken: 'token-refresh-secreto',
              tokenType: 'Bearer',
              expiresIn: 900,
              usuario: {
                id: 7,
                nombre: 'Usuario Demo',
                email: 'demo@zamorafest.ec',
                rol: 'VISITANTE',
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher: fetcher as typeof fetch,
    });

    const user = await api.login({
      email: 'demo@zamorafest.ec',
      password: 'ClaveDemo123',
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetcher.mock.calls[0];

    expect(requestUrl.toString()).toBe(
      'http://127.0.0.1:3000/api/v1/auth/login',
    );
    expect(requestInit?.method).toBe('POST');

    expect(JSON.parse(String(requestInit?.body))).toEqual({
      email: 'demo@zamorafest.ec',
      password: 'ClaveDemo123',
    });

    expect(user).toEqual({
      id: 7,
      nombre: 'Usuario Demo',
      email: 'demo@zamorafest.ec',
      rol: 'VISITANTE',
    });

    expect(user).not.toHaveProperty('accessToken');
    expect(user).not.toHaveProperty('refreshToken');
  });

  it('conserva el estado HTTP 401 sin devolver datos sensibles', async () => {
    const fetcher = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Credenciales inválidas.',
            },
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher: fetcher as typeof fetch,
    });

    try {
      await api.login({
        email: 'demo@zamorafest.ec',
        password: 'incorrecta',
      });

      throw new Error('Se esperaba ApiRequestError.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRequestError);

      if (error instanceof ApiRequestError) {
        expect(error.status).toBe(401);
      }
    }
  });
});
