import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventProgramRepositoryError,
  type EventProgramRepository,
} from './event-program-repository';

type EventProgramApi =
  Pick<
    ZamoraFestApi,
    'getProgramaciones'
  >;

function mapRemoteError(
  error: unknown,
): EventProgramRepositoryError {
  if (
    error instanceof
    ApiRequestError
  ) {
    if (
      error.status ===
      null
    ) {
      return new EventProgramRepositoryError(
        'connection',
        'No fue posible conectar con la programación del evento.',
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
      return new EventProgramRepositoryError(
        'server',
        'La programación del evento no está disponible temporalmente.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventProgramRepositoryError(
      'request',
      'La fuente remota rechazó la consulta de programación.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventProgramRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al consultar la programación.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteEventProgramRepository(
  api:
    EventProgramApi =
      zamoraFestApi,
): EventProgramRepository {
  return {
    async list(
      eventoId: number,
    ) {
      try {
        const response =
          await api.getProgramaciones(
            eventoId,
          );

        return response.data;
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },
  };
}

export const eventProgramRepository =
  createRemoteEventProgramRepository();
