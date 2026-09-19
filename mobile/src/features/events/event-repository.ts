import type { Evento } from '../../types/api';

export type EventRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export class EventRepositoryError extends Error {
  readonly kind: EventRepositoryErrorKind;
  readonly status: number | null;

  constructor(
    kind: EventRepositoryErrorKind,
    message: string,
    status: number | null = null,
    options?: ErrorOptions,
  ) {
    super(message, options);

    this.name = 'EventRepositoryError';
    this.kind = kind;
    this.status = status;
  }
}

export interface EventRepository {
  listEvents(): Promise<readonly Evento[]>;
}
