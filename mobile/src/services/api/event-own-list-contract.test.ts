import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  EventosResponse,
} from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const ownEventosResponse:
  EventosResponse = {
  data: [
    {
      id: 101,
      titulo:
        'Festival propio',
      descripcion:
        'Borrador administrado por el asistente.',
      fechaInicio:
        '2026-10-20T18:00:00.000Z',
      fechaFin:
        '2026-10-20T22:00:00.000Z',
      costoReferencial:
        0,
      estadoEvento:
        'BORRADOR',
      estadoRevision:
        'PENDIENTE',
      fuenteInformacion:
        'Dirección de Cultura',
      fechaCreacion:
        '2026-09-25T20:00:00.000Z',
      fechaActualizacion:
        null,
      fechaRevision:
        null,
      lugar: {
        id: 1,
        nombre:
          'Parque Central',
        tipoLugar:
          'PARQUE',
        direccionReferencial:
          'Centro de Zamora',
        referencia:
          null,
        latitud:
          null,
        longitud:
          null,
        sector: {
          id: 1,
          nombre:
            'Cabecera parroquial',
          tipoSector:
            'CABECERA_PARROQUIAL',
          parroquia: {
            id: 1,
            nombre:
              'Zamora',
            codigoDpa:
              '190150',
            canton: {
              id: 1,
              nombre:
                'Zamora',
              codigoDpa:
                '1901',
              provincia: {
                id: 1,
                nombre:
                  'Zamora Chinchipe',
                codigoDpa:
                  '19',
              },
            },
          },
        },
      },
      usuarioCreador: {
        id: 7,
        nombreCompleto:
          'Asistente Demo',
        rol: {
          id: 2,
          nombre:
            'ASISTENTE',
        },
      },
      usuarioRevisor:
        null,
      categorias: [
        {
          id: 1,
          nombre:
            'Festividades',
          descripcion:
            null,
        },
      ],
    },
  ],
  meta: {
    page:
      1,
    limit:
      20,
    total:
      1,
    totalPages:
      1,
  },
};

function jsonResponse(
  payload: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(
      payload,
    ),
    {
      status,
      headers: {
        'Content-Type':
          'application/json',
      },
    },
  );
}

function createFetchMock() {
  const mock =
    vi.fn(
      async (
        input:
          RequestInfo | URL,
        init?:
          RequestInit,
      ) => {
        void input;
        void init;

        return jsonResponse(
          ownEventosResponse,
        );
      },
    );

  return {
    fetcher:
      mock as unknown as
        typeof fetch,
    mock,
  };
}

describe(
  'Contrato API de Mis eventos',
  () => {
    it(
      'consulta la primera página con autenticación Bearer',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock();

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getOwnEventos(
            undefined,
            'access-asistente',
          ),
        ).resolves.toEqual(
          ownEventosResponse,
        );

        expect(
          mock,
        ).toHaveBeenCalledOnce();

        const firstCall =
          mock.mock.calls.at(
            0,
          );

        expect(
          firstCall,
        ).toBeDefined();

        if (
          !firstCall
        ) {
          throw new Error(
            'No se registró la solicitud de eventos propios.',
          );
        }

        const [
          url,
          options,
        ] =
          firstCall;

        expect(
          url.toString(),
        ).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/mios?page=1&limit=20',
        );

        expect(
          options,
        ).toEqual({
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
            Authorization:
              'Bearer access-asistente',
          },
        });
      },
    );

    it(
      'envía la paginación solicitada sin filtros públicos',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock();

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await api.getOwnEventos(
          {
            page:
              2,
            limit:
              10,
          },
          'access-asistente',
        );

        const firstCall =
          mock.mock.calls.at(
            0,
          );

        expect(
          firstCall,
        ).toBeDefined();

        if (
          !firstCall
        ) {
          throw new Error(
            'No se registró la solicitud paginada de eventos propios.',
          );
        }

        const [
          url,
        ] =
          firstCall;

        expect(
          url.toString(),
        ).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/mios?page=2&limit=10',
        );

        expect(
          url.toString(),
        ).not.toContain(
          'cantonId',
        );

        expect(
          url.toString(),
        ).not.toContain(
          'categoriaId',
        );
      },
    );
  },
);