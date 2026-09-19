import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Evento } from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const event: Evento = {
  id: 7,
  titulo: 'Festival de Zamora',
  descripcion: null,
  fechaInicio:
    '2026-09-20T18:00:00.000Z',
  fechaFin: null,
  costoReferencial: 0,
  estadoEvento: 'PROGRAMADO',
  estadoRevision: 'APROBADO',
  fuenteInformacion: null,
  fechaCreacion:
    '2026-09-01T12:00:00.000Z',
  fechaActualizacion: null,
  fechaRevision: null,
  lugar: {
    id: 1,
    nombre: 'Parque Central',
    tipoLugar: 'PARQUE',
    direccionReferencial:
      'Centro de Zamora',
    referencia: null,
    latitud: -4.069,
    longitud: -78.956,
    sector: {
      id: 1,
      nombre: 'Centro',
      tipoSector: 'URBANO',
      parroquia: {
        id: 1,
        nombre: 'Zamora',
        codigoDpa: '190101',
        canton: {
          id: 1,
          nombre: 'Zamora',
          codigoDpa: '1901',
          provincia: {
            id: 1,
            nombre:
              'Zamora Chinchipe',
            codigoDpa: '19',
          },
        },
      },
    },
  },
  usuarioCreador: {
    id: 1,
    nombreCompleto:
      'Gestor Cultural',
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

describe(
  'GET /api/v1/eventos/:id',
  () => {
    it(
      'consulta el detalle público mediante GET',
      async () => {
        const fetcher = vi.fn(
          async () =>
            new Response(
              JSON.stringify({
                data: event,
              }),
              {
                status: 200,
                headers: {
                  'Content-Type':
                    'application/json',
                },
              },
            ),
        ) as unknown as typeof fetch;

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getEventoById(7),
        ).resolves.toEqual(event);

        expect(
          fetcher,
        ).toHaveBeenCalledTimes(1);

        const firstCall =
          vi.mocked(fetcher)
            .mock.calls[0];

        expect(
          firstCall,
        ).toBeDefined();

        if (!firstCall) {
          throw new Error(
            'No se registró la solicitud de detalle.',
          );
        }

        const [
          url,
          options,
        ] = firstCall;

        expect(
          url.toString(),
        ).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/7',
        );

        expect(
          options,
        ).toEqual({
          method: 'GET',
          headers: {
            Accept:
              'application/json',
          },
        });
      },
    );

    it(
      'acepta campos nullable del contrato real',
      async () => {
        const fetcher = vi.fn(
          async () =>
            new Response(
              JSON.stringify({
                data: event,
              }),
              {
                status: 200,
                headers: {
                  'Content-Type':
                    'application/json',
                },
              },
            ),
        ) as unknown as typeof fetch;

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        const result =
          await api.getEventoById(7);

        expect(
          result.descripcion,
        ).toBeNull();

        expect(
          result.fechaActualizacion,
        ).toBeNull();
      },
    );

    it(
      'conserva HTTP 404 para que el repositorio pueda representar no encontrado',
      async () => {
        const fetcher = vi.fn(
          async () =>
            new Response(
              JSON.stringify({
                error: {
                  code:
                    'EVENTO_NOT_FOUND',
                  message:
                    'El evento público no existe.',
                },
              }),
              {
                status: 404,
                headers: {
                  'Content-Type':
                    'application/json',
                },
              },
            ),
        ) as unknown as typeof fetch;

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getEventoById(99),
        ).rejects.toMatchObject({
          name:
            'ApiRequestError',
          status: 404,
        });
      },
    );
  },
);