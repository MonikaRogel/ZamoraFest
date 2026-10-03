import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import type {
  Evento,
  UpdateEventoRequest,
} from '../../types/api';
import {
  EventRepositoryError,
  type EventListPage,
} from './event-repository';

export interface OwnEventListQuery {
  readonly page?: number;
  readonly limit?: number;
}

export interface OwnEventRepository {
  listOwnEventPage(
    query:
      OwnEventListQuery | undefined,
    accessToken:
      string,
  ): Promise<EventListPage>;
  getOwnEventById(
    id: number,
    accessToken: string,
  ): Promise<Evento>;

  updateOwnEvent(
    id: number,
    input: UpdateEventoRequest,
    accessToken: string,
  ): Promise<Evento>;
}

type OwnEventsApi =
  Pick<
    ZamoraFestApi,
    | 'getOwnEventos'
    | 'getOwnEventoById'
    | 'updateEvento'
  >;

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
        'No fue posible conectar con la fuente remota de eventos propios.',
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
        'La fuente remota de eventos propios no está disponible.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventRepositoryError(
      'request',
      'La fuente remota rechazó la solicitud de eventos propios.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al consultar eventos propios.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteOwnEventRepository(
  api:
    OwnEventsApi = zamoraFestApi,
): OwnEventRepository {
  return {
    async listOwnEventPage(
      query,
      accessToken,
    ) {
      try {
        const response =
          await api
            .getOwnEventos(
              query,
              accessToken,
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

    async getOwnEventById(
      id,
      accessToken,
    ) {
      try {
        return await api
          .getOwnEventoById(
            id,
            accessToken,
          );
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },

    async updateOwnEvent(
      id,
      input,
      accessToken,
    ) {
      try {
        return await api
          .updateEvento(
            id,
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

export const ownEventRepository =
  createRemoteOwnEventRepository();