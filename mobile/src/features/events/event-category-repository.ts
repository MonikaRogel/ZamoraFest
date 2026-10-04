import type {
  Categoria,
} from '../../types/api';

export type EventCategoryRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export class EventCategoryRepositoryError
  extends Error {
  readonly kind:
    EventCategoryRepositoryErrorKind;

  readonly status:
    number | null;

  constructor(
    kind:
      EventCategoryRepositoryErrorKind,
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
      'EventCategoryRepositoryError';

    this.kind =
      kind;

    this.status =
      status;
  }
}

export interface EventCategoryRepository {
  list(): Promise<
    readonly Categoria[]
  >;
}
