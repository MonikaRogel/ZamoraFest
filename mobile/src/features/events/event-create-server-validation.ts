import type {
  EventCreateFieldErrors,
} from './event-create-validation';
import {
  EventCreateRepositoryError,
} from './event-create-repository';

type EventCreateFieldName =
  keyof EventCreateFieldErrors;

type MutableEventCreateFieldErrors =
  Partial<
    Record<
      EventCreateFieldName,
      string
    >
  >;

export interface EventCreateServerValidationResult {
  readonly handled:
    boolean;

  readonly fieldErrors:
    EventCreateFieldErrors;

  readonly generalError?:
    string;
}

function getFieldName(
  path: string,
): EventCreateFieldName | null {
  const root =
    path
      .split(
        '.',
      )
      .at(
        0,
      );

  switch (
    root
  ) {
    case 'titulo':
    case 'descripcion':
    case 'fechaInicio':
    case 'fechaFin':
    case 'costoReferencial':
    case 'lugarId':
    case 'categoriaIds':
    case 'fuenteInformacion':
      return root;

    default:
      return null;
  }
}

export function mapEventCreateServerValidation(
  error: unknown,
): EventCreateServerValidationResult {
  if (
    !(
      error instanceof
      EventCreateRepositoryError
    ) ||
    error.status !==
      422 ||
    error.code !==
      'VALIDATION_ERROR'
  ) {
    return {
      handled:
        false,

      fieldErrors:
        {},
    };
  }

  const fieldErrors:
    MutableEventCreateFieldErrors = {};

  const generalMessages:
    string[] = [];

  for (
    const detail of
      error.details
  ) {
    const field =
      getFieldName(
        detail.path,
      );

    if (
      field ===
      null
    ) {
      generalMessages.push(
        detail.message,
      );

      continue;
    }

    if (
      fieldErrors[
        field
      ] ===
      undefined
    ) {
      fieldErrors[
        field
      ] =
        detail.message;
    }
  }

  const uniqueGeneralMessages =
    Array.from(
      new Set(
        generalMessages,
      ),
    );

  if (
    uniqueGeneralMessages
      .length >
    0
  ) {
    return {
      handled:
        true,

      fieldErrors,

      generalError:
        uniqueGeneralMessages
          .join(
            ' ',
          ),
    };
  }

  if (
    Object.keys(
      fieldErrors,
    ).length ===
    0
  ) {
    return {
      handled:
        true,

      fieldErrors,

      generalError:
        'La solicitud contiene datos inválidos.',
    };
  }

  return {
    handled:
      true,

    fieldErrors,
  };
}