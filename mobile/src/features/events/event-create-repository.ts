import type {
  CreateEventoRequest,
  Evento,
} from '../../types/api';

export type EventCreateRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export interface EventCreateValidationDetail {
  readonly path:
    string;

  readonly message:
    string;
}

interface EventCreateRepositoryErrorOptions
  extends ErrorOptions {
  readonly code?:
    string | null;

  readonly details?:
    readonly EventCreateValidationDetail[];
}

export class EventCreateRepositoryError
  extends Error {
  readonly kind:
    EventCreateRepositoryErrorKind;

  readonly status:
    number | null;

  readonly code:
    string | null;

  readonly details:
    readonly EventCreateValidationDetail[];

  constructor(
    kind:
      EventCreateRepositoryErrorKind,
    message:
      string,
    status:
      number | null = null,
    options?:
      EventCreateRepositoryErrorOptions,
  ) {
    super(
      message,
      options,
    );

    this.name =
      'EventCreateRepositoryError';

    this.kind =
      kind;

    this.status =
      status;

    this.code =
      options?.code ??
      null;

    this.details =
      options?.details ??
      [];
  }
}

export interface EventCreateRepository {
  create(
    input:
      CreateEventoRequest,
    accessToken:
      string,
  ): Promise<Evento>;
}
