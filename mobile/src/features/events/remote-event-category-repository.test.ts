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
} from '../../types/api';
import {
  createRemoteEventCategoryRepository,
} from './remote-event-category-repository';

const categoriasResponse:
  CategoriasResponse = {
    data: [
      {
        id: 1,
        nombre:
          'Cultural',
        descripcion:
          'Eventos culturales y tradicionales.',
      },
    ],
  };

describe(
  'RemoteEventCategoryRepository',
  () => {
    it(
      'obtiene las categorías mediante la capa HTTP',
      async () => {
        const getCategorias =
          vi.fn()
            .mockResolvedValueOnce(
              categoriasResponse,
            );

        const repository =
          createRemoteEventCategoryRepository({
            getCategorias,
          });

        await expect(
          repository.list(),
        ).resolves.toEqual(
          categoriasResponse.data,
        );

        expect(
          getCategorias,
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

        const repository =
          createRemoteEventCategoryRepository({
            getCategorias,
          });

        await expect(
          repository.list(),
        ).rejects.toMatchObject({
          name:
            'EventCategoryRepositoryError',
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
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 503',
                503,
              ),
            );

        const repository =
          createRemoteEventCategoryRepository({
            getCategorias,
          });

        await expect(
          repository.list(),
        ).rejects.toMatchObject({
          name:
            'EventCategoryRepositoryError',
          kind:
            'server',
          status:
            503,
        });
      },
    );

    it(
      'traduce errores HTTP 4xx como rechazo de la solicitud',
      async () => {
        const getCategorias =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 400',
                400,
              ),
            );

        const repository =
          createRemoteEventCategoryRepository({
            getCategorias,
          });

        await expect(
          repository.list(),
        ).rejects.toMatchObject({
          name:
            'EventCategoryRepositoryError',
          kind:
            'request',
          status:
            400,
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

        const repository =
          createRemoteEventCategoryRepository({
            getCategorias,
          });

        await expect(
          repository.list(),
        ).rejects.toMatchObject({
          name:
            'EventCategoryRepositoryError',
          kind:
            'unexpected',
          status:
            null,
        });
      },
    );
  },
);
