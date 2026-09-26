import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ApiRequestError,
  createZamoraFestApi,
} from './zamorafest-api';

function jsonResponse(
  payload: unknown,
): Response {
  return new Response(
    JSON.stringify(
      payload,
    ),
    {
      status:
        200,
      headers: {
        'Content-Type':
          'application/json',
      },
    },
  );
}

describe(
  'Contrato de fecha final de Evento',
  () => {
    it(
      'rechaza una respuesta que contenga fechaFin nula',
      async () => {
        const invalidResponse = {
          data: [
            {
              id:
                1,

              titulo:
                'Evento inválido',

              descripcion:
                'Respuesta incompatible con el contrato actual.',

              fechaInicio:
                '2026-09-26T18:00:00.000Z',

              fechaFin:
                null,

              costoReferencial:
                0,

              estadoEvento:
                'PROGRAMADO',

              estadoRevision:
                'APROBADO',

              fuenteInformacion:
                null,

              fechaCreacion:
                '2026-09-01T12:00:00.000Z',

              fechaActualizacion:
                null,

              fechaRevision:
                null,

              lugar: {
                id:
                  1,

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
                  id:
                    1,

                  nombre:
                    'Centro',

                  tipoSector:
                    'CABECERA_PARROQUIAL',

                  parroquia: {
                    id:
                      1,

                    nombre:
                      'Zamora',

                    codigoDpa:
                      '190150',

                    canton: {
                      id:
                        1,

                      nombre:
                        'Zamora',

                      codigoDpa:
                        '1901',

                      provincia: {
                        id:
                          1,

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
                id:
                  7,

                nombreCompleto:
                  'Asistente Demo',

                rol: {
                  id:
                    2,

                  nombre:
                    'ASISTENTE',
                },
              },

              usuarioRevisor:
                null,

              categorias: [
                {
                  id:
                    1,

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
              5,

            total:
              1,

            totalPages:
              1,
          },
        };

        const fetcher =
          vi.fn(
            async () =>
              jsonResponse(
                invalidResponse,
              ),
          ) as unknown as
            typeof fetch;

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        const request =
          api.getEventos();

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
        });
      },
    );
  },
);