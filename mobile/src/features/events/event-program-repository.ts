import type {
  Programacion,
} from '../../types/api';

export type EventProgramRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export class EventProgramRepositoryError
  extends Error {
  readonly kind:
    EventProgramRepositoryErrorKind;

  readonly status:
    number | null;

  constructor(
    kind:
      EventProgramRepositoryErrorKind,
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
      'EventProgramRepositoryError';

    this.kind =
      kind;

    this.status =
      status;
  }
}

export interface EventProgramRepository {
  list(
    eventoId: number,
  ): Promise<
    readonly Programacion[]
  >;
}
