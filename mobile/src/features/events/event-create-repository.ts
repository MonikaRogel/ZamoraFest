import type {
  CreateEventoRequest,
  Evento,
} from '../../types/api';

export type EventCreateRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export class EventCreateRepositoryError
  extends Error {
  readonly kind:
    EventCreateRepositoryErrorKind;

  readonly status:
    number | null;

  constructor(
    kind:
      EventCreateRepositoryErrorKind,
    message: string,
    status:
      number | null = null,
    options?:
      ErrorOptions,
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
