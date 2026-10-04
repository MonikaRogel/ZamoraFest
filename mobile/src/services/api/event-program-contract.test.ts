import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { ProgramacionesResponse } from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const programacionesResponse:
  ProgramacionesResponse = {
    data: [
      {
        id: 7,
        eventoId: 7,
        lugarId: 1,
        tituloActividad:
          'Presentación cultural',
        descripcion: null,
        fechaHoraInicio:
          '2026-09-20T18:00:00.000Z',
        fechaHoraFin: null,
        artistaInvitado: null,
        orden: null,
        estado: true,
        lugar: {
          id: 1,
          nombre:
            'Parque Central',
          direccionReferencial:
            null,
          sector: {
            nombre:
              'Centro',
            parroquia: {
              nombre:
                'Zamora',
              canton: {
                id: 1,
                nombre:
                  'Zamora',
              },
            },
          },
        },
      },
    ],
  };

describe(
  'GET /api/v1/eventos/:eventoId/programaciones',
  () => {
    it(
      'consulta la programación pública mediante GET',
      async () => {
        const fetcher = vi.fn(
          async () =>
            new Response(
              JSON.stringify(programacionesResponse),
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
          api.getProgramaciones(7),
        ).resolves.toEqual(programacionesResponse);

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
            'No se registró la solicitud de programación.',
          );
        }

        const [
          url,
          options,
        ] = firstCall;

        expect(
          url.toString(),
        ).toBe(
          'http://127.0.0.1:3000/api/v1/eventos/7/programaciones',
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
              JSON.stringify(programacionesResponse),
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
          await api.getProgramaciones(7);

        expect(
          result.data[0]?.descripcion,
        ).toBeNull();

        expect(
          result.data[0]?.fechaHoraFin,
        ).toBeNull();
      },
    );

    it(
      'rechaza una programación incompatible con el contrato',
      async () => {
        const fetcher = vi.fn(
          async () =>
            new Response(
              JSON.stringify({
                data: [
                  {
                    id: 7,
                  },
                ],
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
          api.getProgramaciones(7),
        ).rejects.toMatchObject({
          name:
            'ApiRequestError',
          message:
            'La API devolvió una respuesta incompatible con el contrato esperado.',
          status: 200,
        });
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
          api.getProgramaciones(99),
        ).rejects.toMatchObject({
          name:
            'ApiRequestError',
          status: 404,
        });
      },
    );
  },
);