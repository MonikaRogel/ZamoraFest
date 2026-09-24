import type {
  Evento,
  PaginationMeta,
} from '../../types/api';

export type EventRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export interface EventListQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly cantonId?: number;
  readonly categoriaId?: number;
}

export interface EventListPage {
  readonly events:
    readonly Evento[];

  readonly meta:
    PaginationMeta;
}

export class EventRepositoryError
  extends Error {
  readonly kind:
    EventRepositoryErrorKind;

  readonly status:
    number | null;

  constructor(
    kind:
      EventRepositoryErrorKind,
    message: string,
    status:
      number | null = null,
    options?: ErrorOptions,
  ) {
    super(
      message,
      options,
    );

    this.name =
      'EventRepositoryError';

    this.kind =
      kind;

    this.status =
      status;
  }
}

export interface EventRepository {
  listEvents():
    Promise<readonly Evento[]>;

  getEventById(
    id: number,
  ): Promise<Evento | null>;
}

export interface PagedEventRepository {
  listEventPage(
    query?:
      EventListQuery,
  ): Promise<EventListPage>;
}
