import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventRepositoryError,
  type EventListQuery,
  type EventRepository,
  type PagedEventRepository,
} from './event-repository';

type EventsApi = Pick<
  ZamoraFestApi,
  'getEventos' | 'getEventoById'
>;

type RemoteEventRepository =
  EventRepository &
  PagedEventRepository;

function mapRemoteError(
  error: unknown,
): EventRepositoryError {
  if (
    error instanceof
    ApiRequestError
  ) {
    if (
      error.status ===
      null
    ) {
      return new EventRepositoryError(
        'connection',
        'No fue posible conectar con la fuente remota de eventos.',
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
      return new EventRepositoryError(
        'server',
        'La fuente remota de eventos no está disponible.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventRepositoryError(
      'request',
      'La fuente remota rechazó la solicitud de eventos.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al consultar eventos.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteEventRepository(
  api:
    EventsApi = zamoraFestApi,
): RemoteEventRepository {
  return {
    async listEvents() {
      try {
        const response =
          await api.getEventos();

        return response.data;
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },

    async listEventPage(
      query:
        EventListQuery = {},
    ) {
      try {
        const response =
          await api.getEventos(
            query,
          );

        return {
          events:
            response.data,
          meta:
            response.meta,
        };
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },

    async getEventById(
      id: number,
    ) {
      try {
        return await api
          .getEventoById(
            id,
          );
      } catch (error) {
        if (
          error instanceof
            ApiRequestError &&
          error.status ===
            404
        ) {
          return null;
        }

        throw mapRemoteError(
          error,
        );
      }
    },
  };
}

export const eventRepository =
  createRemoteEventRepository();
