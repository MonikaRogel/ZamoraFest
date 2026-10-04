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
  ProgramacionesResponse,
} from '../../types/api';
import {
  createRemoteEventProgramRepository,
} from './remote-event-program-repository';

const programacionesResponse:
  ProgramacionesResponse = {
    data: [],
  };

describe(
  'RemoteEventProgramRepository',
  () => {
    it(
      'obtiene la programación mediante la capa HTTP',
      async () => {
        const getProgramaciones =
          vi.fn()
            .mockResolvedValueOnce(
              programacionesResponse,
            );

        const repository =
          createRemoteEventProgramRepository({
            getProgramaciones,
          });

        await expect(
          repository.list(6),
        ).resolves.toEqual(
          programacionesResponse.data,
        );

        expect(
          getProgramaciones,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          getProgramaciones,
        ).toHaveBeenCalledWith(
          6,
        );
      },
    );

    it(
      'traduce fallos de conexión',
      async () => {
        const getProgramaciones =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'Network error',
                null,
              ),
            );

        const repository =
          createRemoteEventProgramRepository({
            getProgramaciones,
          });

        await expect(
          repository.list(6),
        ).rejects.toMatchObject({
          name:
            'EventProgramRepositoryError',
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
        const getProgramaciones =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 503',
                503,
              ),
            );

        const repository =
          createRemoteEventProgramRepository({
            getProgramaciones,
          });

        await expect(
          repository.list(6),
        ).rejects.toMatchObject({
          name:
            'EventProgramRepositoryError',
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
        const getProgramaciones =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 400',
                400,
              ),
            );

        const repository =
          createRemoteEventProgramRepository({
            getProgramaciones,
          });

        await expect(
          repository.list(6),
        ).rejects.toMatchObject({
          name:
            'EventProgramRepositoryError',
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
        const getProgramaciones =
          vi.fn()
            .mockRejectedValueOnce(
              new TypeError(
                'Unexpected failure',
              ),
            );

        const repository =
          createRemoteEventProgramRepository({
            getProgramaciones,
          });

        await expect(
          repository.list(6),
        ).rejects.toMatchObject({
          name:
            'EventProgramRepositoryError',
          kind:
            'unexpected',
          status:
            null,
        });
      },
    );
  },
);
