import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import type {
  Evento,
} from '../../types/api';
import {
  EventRepositoryError,
  type EventListPage,
} from './event-repository';

export interface AdminEventListQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly estadoRevision?:
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO';
  readonly estadoEvento?:
    | 'BORRADOR'
    | 'PROGRAMADO'
    | 'CANCELADO'
    | 'FINALIZADO'
    | 'ELIMINADO';
}

export interface AdminEventReviewInput {
  readonly decision:
    | 'APROBAR'
    | 'RECHAZAR';
}

export interface AdminEventRepository {
  listAdminEventPage(
    query:
      AdminEventListQuery | undefined,
    accessToken:
      string,
  ): Promise<EventListPage>;

  getAdminEventById(
    id: number,
    accessToken: string,
  ): Promise<Evento | null>;

  reviewEvent(
    id: number,
    input: AdminEventReviewInput,
    accessToken: string,
  ): Promise<Evento>;

  publishEvent(
    id: number,
    accessToken: string,
  ): Promise<Evento>;

  deleteEvent(
    id: number,
    accessToken: string,
  ): Promise<void>;
}

type AdminEventsApi =
  Pick<
    ZamoraFestApi,
    | 'getAdminEventos'
    | 'getAdminEventoById'
    | 'reviewEvento'
    | 'publishEvento'
    | 'deleteEvento'
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
        'No fue posible conectar con la administración remota de eventos.',
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
        'La administración remota de eventos no está disponible.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventRepositoryError(
      'request',
      'La administración remota rechazó la solicitud de eventos.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al administrar eventos.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteAdminEventRepository(
  api:
    AdminEventsApi = zamoraFestApi,
): AdminEventRepository {
  return {
    async listAdminEventPage(
      query,
      accessToken,
    ) {
      try {
        const response =
          await api
            .getAdminEventos(
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

    async getAdminEventById(
      id,
      accessToken,
    ) {
      try {
        return await api
          .getAdminEventoById(
            id,
            accessToken,
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

    async reviewEvent(
      id,
      input,
      accessToken,
    ) {
      try {
        return await api
          .reviewEvento(
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

    async publishEvent(
      id,
      accessToken,
    ) {
      try {
        return await api
          .publishEvento(
            id,
            accessToken,
          );
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },

    async deleteEvent(
      id,
      accessToken,
    ) {
      try {
        await api
          .deleteEvento(
            id,
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

export const adminEventRepository =
  createRemoteAdminEventRepository();
