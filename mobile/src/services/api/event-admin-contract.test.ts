import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  Evento,
  EventosResponse,
} from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const adminEvento: Evento = {
  id: 301,
  titulo: 'Festival Cultural de Zamora',
  descripcion: 'Evento pendiente de revisión administrativa.',
  fechaInicio: '2026-10-20T18:00:00.000',
  fechaFin: '2026-10-20T22:00:00.000',
  costoReferencial: 0,
  estadoEvento: 'BORRADOR',
  estadoRevision: 'PENDIENTE',
  fuenteInformacion: 'GAD Municipal',
  fechaCreacion: '2026-09-29T15:00:00.000',
  fechaActualizacion: '2026-09-29T15:05:00.000',
  fechaRevision: null,
  lugar: {
    id: 1,
    nombre: 'Parque Central',
    tipoLugar: 'PARQUE',
    direccionReferencial: 'Centro de Zamora',
    referencia: null,
    latitud: -4.066,
    longitud: -78.956,
    sector: {
      id: 1,
      nombre: 'Centro',
      tipoSector: 'BARRIO',
      parroquia: {
        id: 1,
        nombre: 'Zamora',
        codigoDpa: '190150',
        canton: {
          id: 1,
          nombre: 'Zamora',
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
    id: 7,
    nombreCompleto: 'Asistente Demo',
    rol: {
      id: 2,
      nombre: 'ASISTENTE',
    },
  },
  usuarioRevisor: null,
  categorias: [
    {
      id: 1,
      nombre: 'Cultura',
      descripcion: null,
    },
  ],
};

const adminEventosResponse: EventosResponse = {
  data: [adminEvento],
  meta: {
    page: 2,
    limit: 10,
    total: 11,
    totalPages: 2,
  },
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

describe(
  'Contrato API de administración de eventos',
  () => {
    it(
      'consulta el listado administrativo con filtros y autenticación Bearer',
      async () => {
        const { fetcher, mock } = createFetchMock(
          () => jsonResponse(adminEventosResponse),
        );

        const api = createZamoraFestApi({
          baseUrl: 'http://127.0.0.1:3000',
          fetcher,
        });

        await expect(
          api.getAdminEventos(
            {
              page: 2,
              limit: 10,
              estadoRevision: 'PENDIENTE',
              estadoEvento: 'BORRADOR',
            },
            'access-admin',
          ),
        ).resolves.toEqual(adminEventosResponse);

        const firstCall = mock.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        if (!firstCall) {
          throw new Error('No se registró la solicitud administrativa.');
        }

        const [url, options] = firstCall;

        expect(url.toString()).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/admin?page=2&limit=10&estadoRevision=PENDIENTE&estadoEvento=BORRADOR',
        );

        expect(options).toEqual({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer access-admin',
          },
        });
      },
    );

    it(
      'consulta el detalle administrativo autenticado',
      async () => {
        const { fetcher, mock } = createFetchMock(
          () => jsonResponse({ data: adminEvento }),
        );

        const api = createZamoraFestApi({
          baseUrl: 'http://127.0.0.1:3000',
          fetcher,
        });

        await expect(
          api.getAdminEventoById(301, 'access-admin'),
        ).resolves.toEqual(adminEvento);

        const firstCall = mock.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        if (!firstCall) {
          throw new Error('No se registró la solicitud de detalle administrativo.');
        }

        expect(firstCall[0].toString()).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/admin/301',
        );

        expect(firstCall[1]).toEqual({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer access-admin',
          },
        });
      },
    );

    it(
      'envía la decisión de revisión con POST y Bearer token',
      async () => {
        const approvedEvent: Evento = {
          ...adminEvento,
          estadoRevision: 'APROBADO',
          fechaRevision: '2026-09-29T16:00:00.000',
        };

        const { fetcher, mock } = createFetchMock(
          () => jsonResponse({ data: approvedEvent }),
        );

        const api = createZamoraFestApi({
          baseUrl: 'http://127.0.0.1:3000',
          fetcher,
        });

        await expect(
          api.reviewEvento(
            301,
            { decision: 'APROBAR' },
            'access-admin',
          ),
        ).resolves.toEqual(approvedEvent);

        const firstCall = mock.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        if (!firstCall) {
          throw new Error('No se registró la solicitud de revisión.');
        }

        expect(firstCall[0].toString()).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/301/revision',
        );

        expect(firstCall[1]).toEqual({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer access-admin',
          },
          body: JSON.stringify({
            decision: 'APROBAR',
          }),
        });
      },
    );

    it(
      'publica el evento aprobado mediante POST autenticado',
      async () => {
        const publishedEvent: Evento = {
          ...adminEvento,
          estadoRevision: 'APROBADO',
          estadoEvento: 'PROGRAMADO',
          fechaRevision: '2026-09-29T16:00:00.000',
        };

        const { fetcher, mock } = createFetchMock(
          () => jsonResponse({ data: publishedEvent }),
        );

        const api = createZamoraFestApi({
          baseUrl: 'http://127.0.0.1:3000',
          fetcher,
        });

        await expect(
          api.publishEvento(301, 'access-admin'),
        ).resolves.toEqual(publishedEvent);

        const firstCall = mock.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        if (!firstCall) {
          throw new Error('No se registró la solicitud de publicación.');
        }

        expect(firstCall[0].toString()).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/301/publicacion',
        );

        expect(firstCall[1]).toEqual({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer access-admin',
          },
        });
      },
    );
  },
);
