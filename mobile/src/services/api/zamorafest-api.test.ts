import { describe, expect, it, vi } from 'vitest';

import type {
  EventosResponse,
  HealthResponse,
} from '../../types/api';
import {
  ApiRequestError,
  createZamoraFestApi,
} from './zamorafest-api';

const validHealthResponse: HealthResponse = {
  status: 'ok',
  service: 'zamorafest-backend',
};

const validEventosResponse: EventosResponse = {
  data: [
    {
      id: 1,
      titulo: 'Evento de prueba',
      descripcion: 'Descripción verificable',
      fechaInicio: '2026-08-27T10:00:00.000Z',
      fechaFin: null,
      costoReferencial: 0,
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
      fuenteInformacion: null,
      fechaCreacion: '2026-08-27T09:00:00.000Z',
      fechaActualizacion: '2026-08-27T09:00:00.000Z',
      fechaRevision: '2026-08-27T09:30:00.000Z',
      lugar: {
        id: 1,
        nombre: 'Lugar de prueba',
        tipoLugar: 'ESPACIO_PUBLICO',
        direccionReferencial: 'Dirección de prueba',
        referencia: null,
        latitud: null,
        longitud: null,
        sector: {
          id: 1,
          nombre: 'Sector de prueba',
          tipoSector: 'CABECERA_PARROQUIAL',
          parroquia: {
            id: 1,
            nombre: 'Parroquia de prueba',
            codigoDpa: '190101',
            canton: {
              id: 1,
              nombre: 'Cantón de prueba',
              codigoDpa: '1901',
              provincia: {
                id: 1,
                nombre: 'Zamora Chinchipe',
                codigoDpa: '19',
              },
            },
          },
        },
      },
      usuarioCreador: {
        id: 1,
        nombreCompleto: 'Usuario de prueba',
        rol: {
          id: 1,
          nombre: 'ASISTENTE',
        },
      },
      usuarioRevisor: {
        id: 2,
        nombreCompleto: 'Revisor de prueba',
        rol: {
          id: 2,
          nombre: 'ADMIN',
        },
      },
      categorias: [
        {
          id: 1,
          nombre: 'Cultura',
          descripcion: null,
        },
      ],
    },
  ],
  meta: {
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
  },
};

function jsonResponse(
  payload: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createFetchMock(responseFactory: () => Response) {
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

describe('ZamoraFest API', () => {
  it('consulta health mediante GET y valida su respuesta', async () => {
    const { fetcher, mock } = createFetchMock(() =>
      jsonResponse(validHealthResponse),
    );
    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(api.getHealth()).resolves.toEqual(
      validHealthResponse,
    );

    expect(mock).toHaveBeenCalledOnce();

    const firstCall = mock.mock.calls.at(0);

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error('No se registró la solicitud health.');
    }

    const [url, options] = firstCall;

    expect(url.toString()).toBe(
      'http://127.0.0.1:3000/api/v1/health',
    );
    expect(options).toEqual({
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('consulta la primera página de cinco eventos', async () => {
    const { fetcher, mock } = createFetchMock(() =>
      jsonResponse(validEventosResponse),
    );
    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(api.getEventos()).resolves.toEqual(
      validEventosResponse,
    );

    const firstCall = mock.mock.calls.at(0);

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error('No se registró la solicitud de eventos.');
    }

    const [url] = firstCall;

    expect(url.toString()).toBe(
      'http://127.0.0.1:3000/api/v1/eventos?page=1&limit=5',
    );
  });

  it('controla errores de conexión', async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError('Network error');
    }) as unknown as typeof fetch;

    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(api.getHealth()).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'No se pudo establecer conexión con la API.',
      status: null,
    });
  });

  it('conserva el estado de una respuesta HTTP fallida', async () => {
    const { fetcher } = createFetchMock(() =>
      jsonResponse(
        {
          error: 'Servicio no disponible',
        },
        503,
      ),
    );
    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(api.getHealth()).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 503,
    });
  });

  it('controla respuestas que no contienen JSON válido', async () => {
    const { fetcher } = createFetchMock(
      () =>
        new Response('contenido-inválido', {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    );
    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    await expect(api.getHealth()).rejects.toMatchObject({
      name: 'ApiRequestError',
      message:
        'La API devolvió una respuesta que no contiene JSON válido.',
      status: 200,
    });
  });

  it('rechaza respuestas incompatibles con el contrato', async () => {
    const { fetcher } = createFetchMock(() =>
      jsonResponse({
        status: 'desconocido',
      }),
    );
    const api = createZamoraFestApi({
      baseUrl: 'http://127.0.0.1:3000',
      fetcher,
    });

    const request = api.getHealth();

    await expect(request).rejects.toBeInstanceOf(ApiRequestError);
    await expect(request).rejects.toMatchObject({
      message:
        'La API devolvió una respuesta incompatible con el contrato esperado.',
    });
  });
});
