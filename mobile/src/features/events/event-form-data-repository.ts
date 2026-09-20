import type {
  Categoria,
  LugarConsulta,
} from '../../types/api';

export interface EventFormData {
  readonly categorias:
    readonly Categoria[];

  readonly lugares:
    readonly LugarConsulta[];
}

export type EventFormDataRepositoryErrorKind =
  | 'connection'
  | 'server'
  | 'request'
  | 'unexpected';

export class EventFormDataRepositoryError
  extends Error {
  readonly kind:
    EventFormDataRepositoryErrorKind;

  readonly status:
    number | null;

  constructor(
    kind:
      EventFormDataRepositoryErrorKind,
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
      'EventFormDataRepositoryError';

    this.kind =
      kind;

    this.status =
      status;
  }
}

export interface EventFormDataRepository {
  load(): Promise<EventFormData>;
}