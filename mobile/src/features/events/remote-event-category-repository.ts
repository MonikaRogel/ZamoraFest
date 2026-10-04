import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventCategoryRepositoryError,
  type EventCategoryRepository,
} from './event-category-repository';

type EventCategoryApi =
  Pick<
    ZamoraFestApi,
    'getCategorias'
  >;

function mapRemoteError(
  error: unknown,
): EventCategoryRepositoryError {
  if (
    error instanceof
    ApiRequestError
  ) {
    if (
      error.status ===
      null
    ) {
      return new EventCategoryRepositoryError(
        'connection',
        'No fue posible conectar con las categorías.',
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
      return new EventCategoryRepositoryError(
        'server',
        'Las categorías no están disponibles temporalmente.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventCategoryRepositoryError(
      'request',
      'La fuente remota rechazó la consulta de categorías.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventCategoryRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al consultar las categorías.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteEventCategoryRepository(
  api:
    EventCategoryApi =
      zamoraFestApi,
): EventCategoryRepository {
  return {
    async list() {
      try {
        const response =
          await api.getCategorias();

        return response.data;
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },
  };
}

export const eventCategoryRepository =
  createRemoteEventCategoryRepository();
