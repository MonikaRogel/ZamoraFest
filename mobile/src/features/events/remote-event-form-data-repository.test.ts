import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ApiRequestError,
} from '../../services/api/zamorafest-api';
import type {
  CategoriasResponse,
  LugaresResponse,
} from '../../types/api';
import {
  createRemoteEventFormDataRepository,
} from './remote-event-form-data-repository';

const categoriasResponse:
  CategoriasResponse = {
    data: [
      {
        id: 1,
        nombre:
          'Cultura',
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
          'Parque Central',
        tipoLugar:
          'PARQUE',
        direccionReferencial:
          'Centro de Zamora',
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

describe(
  'RemoteEventFormDataRepository',
  () => {
    it(
      'obtiene categorías y lugares reales mediante la capa HTTP',
      async () => {
        const getCategorias =
          vi.fn()
            .mockResolvedValueOnce(
              categoriasResponse,
            );

        const getLugares =
          vi.fn()
            .mockResolvedValueOnce(
              lugaresResponse,
            );

        const repository =
          createRemoteEventFormDataRepository({
            getCategorias,
            getLugares,
          });

        await expect(
          repository.load(),
        ).resolves.toEqual({
          categorias:
            categoriasResponse.data,
          lugares:
            lugaresResponse.data,
        });

        expect(
          getCategorias,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          getLugares,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      'traduce fallos de conexión',
      async () => {
        const getCategorias =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'Network error',
                null,
              ),
            );

        const getLugares =
          vi.fn()
            .mockResolvedValueOnce(
              lugaresResponse,
            );

        const repository =
          createRemoteEventFormDataRepository({
            getCategorias,
            getLugares,
          });

        await expect(
          repository.load(),
        ).rejects.toMatchObject({
          name:
            'EventFormDataRepositoryError',
          kind:
            'connection',
          status:
            null,
        });
      },
    );

    it(
      'traduce errores HTTP 5xx como fallo del servidor',
      async () => {
        const getCategorias =
          vi.fn()
            .mockResolvedValueOnce(
              categoriasResponse,
            );

        const getLugares =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 503',
                503,
              ),
            );

        const repository =
          createRemoteEventFormDataRepository({
            getCategorias,
            getLugares,
          });

        await expect(
          repository.load(),
        ).rejects.toMatchObject({
          name:
            'EventFormDataRepositoryError',
          kind:
            'server',
          status:
            503,
        });
      },
    );

    it(
      'encapsula errores inesperados',
      async () => {
        const getCategorias =
          vi.fn()
            .mockRejectedValueOnce(
              new TypeError(
                'Unexpected failure',
              ),
            );

        const getLugares =
          vi.fn()
            .mockResolvedValueOnce(
              lugaresResponse,
            );

        const repository =
          createRemoteEventFormDataRepository({
            getCategorias,
            getLugares,
          });

        await expect(
          repository.load(),
        ).rejects.toMatchObject({
          name:
            'EventFormDataRepositoryError',
          kind:
            'unexpected',
          status:
            null,
        });
      },
    );
  },
);