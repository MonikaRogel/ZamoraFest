import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  RegisterRequest,
  RegisteredVisitor,
} from '../../types/api';
import {
  ApiRequestError,
  createZamoraFestApi,
} from './zamorafest-api';

const validVisitor: RegisteredVisitor = {
  id: 25,
  nombre: 'María Pérez',
  email: 'maria@ejemplo.com',
  rol: 'VISITANTE',
};

function jsonResponse(
  payload: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

function createFetchMock(
  responseFactory: () => Response,
) {
  const mock = vi.fn(
    async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      void input;
      void init;

      return responseFactory();
    },
  );

  return {
    fetcher: mock as unknown as typeof fetch,
    mock,
  };
}

describe('contrato HTTP de registro', () => {
  it('registra mediante POST /api/v1/auth/register', async () => {
    const { fetcher, mock } =
      createFetchMock(() =>
        jsonResponse(
          {
            data: validVisitor,
          },
          201,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    const input: RegisterRequest = {
      nombre: 'María Pérez',
      email: 'maria@ejemplo.com',
      password: 'ClaveDemo123',
    };

    await expect(
      api.register(input),
    ).resolves.toEqual(validVisitor);

    expect(mock).toHaveBeenCalledOnce();

    const firstCall =
      mock.mock.calls.at(0);

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error(
        'No se registró la solicitud de registro.',
      );
    }

    const [url, options] = firstCall;

    expect(url.toString()).toBe(
      'http://127.0.0.1:3000/api/v1/auth/register',
    );

    expect(options?.method).toBe('POST');

    expect(options?.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });

  it('envía exclusivamente nombre, email y password', async () => {
    const { fetcher, mock } =
      createFetchMock(() =>
        jsonResponse(
          {
            data: validVisitor,
          },
          201,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    const runtimeInput = {
      nombre: 'María Pérez',
      email: 'maria@ejemplo.com',
      password: 'ClaveDemo123',
      rol: 'ADMINISTRADOR',
      idRol: 99,
      estado: false,
    };

    await api.register(
      runtimeInput as RegisterRequest,
    );

    const firstCall =
      mock.mock.calls.at(0);

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error(
        'No se registró la solicitud de registro.',
      );
    }

    const [, options] = firstCall;

    expect(
      JSON.parse(
        String(options?.body),
      ),
    ).toEqual({
      nombre: 'María Pérez',
      email: 'maria@ejemplo.com',
      password: 'ClaveDemo123',
    });
  });

  it('acepta únicamente VISITANTE como respuesta de registro público', async () => {
    const { fetcher } =
      createFetchMock(() =>
        jsonResponse(
          {
            data: validVisitor,
          },
          201,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(
      api.register({
        nombre: 'María Pérez',
        email: 'maria@ejemplo.com',
        password: 'ClaveDemo123',
      }),
    ).resolves.toMatchObject({
      rol: 'VISITANTE',
    });
  });

  it('rechaza una respuesta que intente devolver un rol privilegiado', async () => {
    const { fetcher } =
      createFetchMock(() =>
        jsonResponse(
          {
            data: {
              ...validVisitor,
              rol: 'ADMINISTRADOR',
            },
          },
          201,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    const request = api.register({
      nombre: 'María Pérez',
      email: 'maria@ejemplo.com',
      password: 'ClaveDemo123',
    });

    await expect(
      request,
    ).rejects.toBeInstanceOf(
      ApiRequestError,
    );

    await expect(
      request,
    ).rejects.toMatchObject({
      message:
        'La API devolvió una respuesta incompatible con el contrato esperado.',
      status: 201,
    });
  });

  it('conserva HTTP 409 cuando el correo ya está registrado', async () => {
    const { fetcher } =
      createFetchMock(() =>
        jsonResponse(
          {
            error: {
              code: 'EMAIL_ALREADY_REGISTERED',
              message:
                'El correo electrónico ya está registrado.',
            },
          },
          409,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(
      api.register({
        nombre: 'María Pérez',
        email: 'maria@ejemplo.com',
        password: 'ClaveDemo123',
      }),
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 409,
    });
  });

  it('conserva HTTP 422 cuando el backend rechaza la validación', async () => {
    const { fetcher } =
      createFetchMock(() =>
        jsonResponse(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message:
                'La solicitud contiene datos inválidos.',
            },
          },
          422,
        ),
      );

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(
      api.register({
        nombre: 'María Pérez',
        email: 'maria@ejemplo.com',
        password: 'ClaveDemo123',
      }),
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 422,
    });
  });
});
