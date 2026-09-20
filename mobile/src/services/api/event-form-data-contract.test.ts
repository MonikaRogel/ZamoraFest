import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  CategoriasResponse,
  LugaresResponse,
} from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const categoriasResponse:
  CategoriasResponse = {
    data: [
      {
        id: 1,
        nombre:
          'Cultura',
        descripcion:
          'Eventos culturales',
      },
      {
        id: 2,
        nombre:
          'Gastronomía',
        descripcion:
          null,
      },
    ],
  };

const lugaresResponse:
  LugaresResponse = {
    data: [
      {
        id: 1,
        nombre:
          'Parque Central de Zamora',
        tipoLugar:
          'PARQUE',
        direccionReferencial:
          null,
        sector: {
          id: 1,
          nombre:
            'Centro',
          tipoSector:
            'BARRIO',
          parroquia: {
            id: 1,
            nombre:
              'Zamora',
            canton: {
              id: 1,
              nombre:
                'Zamora',
              provincia: {
                id: 1,
                nombre:
                  'Zamora Chinchipe',
              },
            },
          },
        },
      },
    ],
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

function createFetchMock(
  responseFactory:
    () => Response,
) {
  const mock = vi.fn(
    async (
      input:
        RequestInfo | URL,
      init?:
        RequestInit,
    ) => {
      void input;
      void init;

      return responseFactory();
    },
  );

  return {
    fetcher:
      mock as unknown as typeof fetch,
    mock,
  };
}

describe(
  'Datos auxiliares del formulario de Evento',
  () => {
    it(
      'consulta categorías activas mediante GET',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock(
            () =>
              jsonResponse(
                categoriasResponse,
              ),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getCategorias(),
        ).resolves.toEqual(
          categoriasResponse,
        );

        expect(
          mock,
        ).toHaveBeenCalledTimes(
          1,
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
            'No se registró la solicitud de categorías.',
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
          'http://127.0.0.1:3000/api/v1/categorias',
        );

        expect(
          options,
        ).toEqual({
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
          },
        });
      },
    );

    it(
      'consulta lugares activos mediante GET y acepta dirección referencial nula',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock(
            () =>
              jsonResponse(
                lugaresResponse,
              ),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        const result =
          await api.getLugares();

        expect(
          result,
        ).toEqual(
          lugaresResponse,
        );

        expect(
          result
            .data[0]
            ?.direccionReferencial,
        ).toBeNull();

        expect(
          mock,
        ).toHaveBeenCalledTimes(
          1,
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
            'No se registró la solicitud de lugares.',
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
          'http://127.0.0.1:3000/api/v1/lugares',
        );

        expect(
          options,
        ).toEqual({
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
          },
        });
      },
    );

    it(
      'rechaza categorías con identificadores inválidos',
      async () => {
        const {
          fetcher,
        } =
          createFetchMock(
            () =>
              jsonResponse({
                data: [
                  {
                    id: 0,
                    nombre:
                      'Categoría inválida',
                    descripcion:
                      null,
                  },
                ],
              }),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getCategorias(),
        ).rejects.toMatchObject({
          name:
            'ApiRequestError',
          message:
            'La API devolvió una respuesta incompatible con el contrato esperado.',
          status:
            200,
        });
      },
    );

    it(
      'rechaza lugares cuya jerarquía territorial está incompleta',
      async () => {
        const {
          fetcher,
        } =
          createFetchMock(
            () =>
              jsonResponse({
                data: [
                  {
                    id: 1,
                    nombre:
                      'Lugar incompleto',
                    tipoLugar:
                      'PARQUE',
                    direccionReferencial:
                      'Centro',
                    sector: {
                      id: 1,
                      nombre:
                        'Centro',
                      tipoSector:
                        'BARRIO',
                    },
                  },
                ],
              }),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        await expect(
          api.getLugares(),
        ).rejects.toMatchObject({
          name:
            'ApiRequestError',
          message:
            'La API devolvió una respuesta incompatible con el contrato esperado.',
          status:
            200,
        });
      },
    );
  },
);