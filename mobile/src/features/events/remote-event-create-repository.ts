import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventCreateRepositoryError,
  type EventCreateRepository,
} from './event-create-repository';

type EventCreateApi =
  Pick<
    ZamoraFestApi,
    'createEvento'
  >;

function mapRemoteError(
  error: unknown,
): EventCreateRepositoryError {
  if (
    error instanceof
    ApiRequestError
  ) {
    if (
      error.status ===
      null
    ) {
      return new EventCreateRepositoryError(
        'connection',
        'No fue posible conectar con ZamoraFest para crear el evento.',
        null,
        {
          cause:
            error,
        },
      );
    }

    if (
      error.status >=
      500
    ) {
      return new EventCreateRepositoryError(
        'server',
        'El servicio de creación de eventos no está disponible temporalmente.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventCreateRepositoryError(
      'request',
      'El servidor rechazó la creación del evento.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventCreateRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al crear el evento.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteEventCreateRepository(
  api:
    EventCreateApi =
      zamoraFestApi,
): EventCreateRepository {
  return {
    async create(
      input,
      accessToken,
    ) {
      try {
        return await api
          .createEvento(
            input,
            accessToken,
          );
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },
  };
}

export const eventCreateRepository =
  createRemoteEventCreateRepository();