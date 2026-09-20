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
  status: number,
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

function createFetchMock(
  responseFactory:
    () => Response,
) {
  const mock =
    vi.fn(
      async () =>
        responseFactory(),
    );

  return (
    mock as unknown as
      typeof fetch
  );
}

describe(
  'ApiRequestError - cuerpo estructurado',
  () => {
    it(
      'conserva code, message y details de un error HTTP estructurado',
      async () => {
        const body = {
          error: {
            code:
              'VALIDATION_ERROR',

            message:
              'La solicitud contiene datos inválidos.',

            details: [
              {
                path:
                  'titulo',

                message:
                  'El título es obligatorio.',
              },

              {
                path:
                  'categoriaIds',

                message:
                  'Debe seleccionar al menos una categoría.',
              },
            ],
          },
        };

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',

            fetcher:
              createFetchMock(
                () =>
                  jsonResponse(
                    body,
                    422,
                  ),
              ),
          });

        try {
          await api.getHealth();

          throw new Error(
            'La solicitud debía fallar.',
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            ApiRequestError,
          );

          expect(
            error,
          ).toMatchObject({
            status:
              422,

            body,
          });
        }
      },
    );

    it(
      'descarta como cuerpo estructurado un JSON sin el contrato de error esperado',
      async () => {
        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',

            fetcher:
              createFetchMock(
                () =>
                  jsonResponse(
                    {
                      message:
                        'Formato desconocido',
                    },
                    422,
                  ),
              ),
          });

        try {
          await api.getHealth();

          throw new Error(
            'La solicitud debía fallar.',
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            ApiRequestError,
          );

          expect(
            error,
          ).toMatchObject({
            status:
              422,

            body:
              null,
          });
        }
      },
    );

    it(
      'mantiene compatibilidad con errores HTTP que no contienen JSON válido',
      async () => {
        const fetcher =
          vi.fn(
            async () =>
              new Response(
                'respuesta no JSON',
                {
                  status:
                    503,

                  headers: {
                    'Content-Type':
                      'text/plain',
                  },
                },
              ),
          ) as unknown as
            typeof fetch;

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',

            fetcher,
          });

        try {
          await api.getHealth();

          throw new Error(
            'La solicitud debía fallar.',
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            ApiRequestError,
          );

          expect(
            error,
          ).toMatchObject({
            status:
              503,

            body:
              null,
          });
        }
      },
    );
  },
);
