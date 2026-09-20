import {
  ApiRequestError,
  zamoraFestApi,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventFormDataRepositoryError,
  type EventFormDataRepository,
} from './event-form-data-repository';

type EventFormDataApi =
  Pick<
    ZamoraFestApi,
    'getCategorias'
    | 'getLugares'
  >;

function mapRemoteError(
  error: unknown,
): EventFormDataRepositoryError {
  if (
    error instanceof
    ApiRequestError
  ) {
    if (
      error.status ===
      null
    ) {
      return new EventFormDataRepositoryError(
        'connection',
        'No fue posible conectar con los datos auxiliares del formulario.',
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
      return new EventFormDataRepositoryError(
        'server',
        'Los datos auxiliares del formulario no están disponibles temporalmente.',
        error.status,
        {
          cause:
            error,
        },
      );
    }

    return new EventFormDataRepositoryError(
      'request',
      'La fuente remota rechazó la consulta de datos auxiliares.',
      error.status,
      {
        cause:
          error,
      },
    );
  }

  return new EventFormDataRepositoryError(
    'unexpected',
    'Ocurrió un error inesperado al consultar los datos auxiliares.',
    null,
    {
      cause:
        error,
    },
  );
}

export function createRemoteEventFormDataRepository(
  api:
    EventFormDataApi =
      zamoraFestApi,
): EventFormDataRepository {
  return {
    async load() {
      try {
        const [
          categoriasResponse,
          lugaresResponse,
        ] =
          await Promise.all([
            api.getCategorias(),
            api.getLugares(),
          ]);

        return {
          categorias:
            categoriasResponse.data,

          lugares:
            lugaresResponse.data,
        };
      } catch (error) {
        throw mapRemoteError(
          error,
        );
      }
    },
  };
}

export const eventFormDataRepository =
  createRemoteEventFormDataRepository();