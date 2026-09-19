import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ApiRequestError,
} from '../../services/api/zamorafest-api';
import type { Evento } from '../../types/api';
import {
  createRemoteEventRepository,
} from './remote-event-repository';

const event = {
  id: 7,
} as Evento;

describe(
  'RemoteEventRepository.getEventById',
  () => {
    it(
      'devuelve el evento obtenido desde la API',
      async () => {
        const getEventos =
          vi.fn();

        const getEventoById =
          vi.fn()
            .mockResolvedValueOnce(
              event,
            );

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        await expect(
          repository.getEventById(
            7,
          ),
        ).resolves.toBe(event);

        expect(
          getEventoById,
        ).toHaveBeenCalledWith(
          7,
        );
      },
    );

    it(
      'representa HTTP 404 como ausencia del evento',
      async () => {
        const repository =
          createRemoteEventRepository({
            getEventos:
              vi.fn(),
            getEventoById:
              vi.fn()
                .mockRejectedValueOnce(
                  new ApiRequestError(
                    'HTTP 404',
                    404,
                  ),
                ),
          });

        await expect(
          repository.getEventById(
            99,
          ),
        ).resolves.toBeNull();
      },
    );

    it(
      'mantiene otros errores como errores del repositorio',
      async () => {
        const repository =
          createRemoteEventRepository({
            getEventos:
              vi.fn(),
            getEventoById:
              vi.fn()
                .mockRejectedValueOnce(
                  new ApiRequestError(
                    'HTTP 503',
                    503,
                  ),
                ),
          });

        await expect(
          repository.getEventById(
            7,
          ),
        ).rejects.toMatchObject({
          name:
            'EventRepositoryError',
          kind: 'server',
          status: 503,
        });
      },
    );
  },
);