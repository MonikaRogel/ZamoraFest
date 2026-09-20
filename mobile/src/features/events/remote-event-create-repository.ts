import {
  ApiRequestError,
  zamoraFestApi,
  type ApiErrorResponse,
  type ZamoraFestApi,
} from '../../services/api/zamorafest-api';
import {
  EventCreateRepositoryError,
  type EventCreateRepository,
  type EventCreateValidationDetail,
} from './event-create-repository';

type EventCreateApi =
  Pick<
    ZamoraFestApi,
    'createEvento'
  >;

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function isValidationDetail(
  value: unknown,
): value is EventCreateValidationDetail {
  return (
    isRecord(
      value,
    ) &&
    typeof value.path ===
      'string' &&
    typeof value.message ===
      'string'
  );
}

function getValidationDetails(
  body:
    ApiErrorResponse | null,
): readonly EventCreateValidationDetail[] {
  if (
    body ===
      null ||
    body.error.code !==
      'VALIDATION_ERROR' ||
    !Array.isArray(
      body.error.details,
    )
  ) {
    return [];
  }

  return body
    .error
    .details
    .filter(
      isValidationDetail,
    );
}

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

    const code =
      error.body
        ?.error
        .code ??
      null;

    const details =
      getValidationDetails(
        error.body,
      );

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

          code,

          details,
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

        code,

        details,
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