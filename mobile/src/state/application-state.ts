import type { AuthSession } from '../types/api';

export interface EventDraft {
  readonly titulo: string;
  readonly descripcion: string;
  readonly fechaInicio: string;
  readonly fechaFin: string;
  readonly costoReferencial: string;
  readonly lugarId: number | null;
  readonly categoriaIds: readonly number[];
  readonly fuenteInformacion: string;
}

export interface ApplicationState {
  readonly session: AuthSession | null;
  readonly pendingDestination: string | null;
  readonly eventDraft: EventDraft;
}

export type ApplicationAction =
  | {
      readonly type: 'LOGIN';
      readonly session: AuthSession;
    }
  | {
      readonly type: 'INVALIDATE_SESSION';
    }
  | {
      readonly type: 'LOGOUT';
    }
  | {
      readonly type: 'SET_PENDING_DESTINATION';
      readonly destination: string | null;
    }
  | {
      readonly type: 'UPDATE_EVENT_DRAFT';
      readonly changes: Partial<EventDraft>;
    }
  | {
      readonly type: 'CLEAR_EVENT_DRAFT';
    };

export const initialEventDraft: EventDraft = {
  titulo: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  costoReferencial: '',
  lugarId: null,
  categoriaIds: [],
  fuenteInformacion: '',
};

export const initialApplicationState: ApplicationState = {
  session: null,
  pendingDestination: null,
  eventDraft: initialEventDraft,
};

export function applicationReducer(
  state: ApplicationState,
  action: ApplicationAction,
): ApplicationState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        session: action.session,
      };

    case 'INVALIDATE_SESSION':
      return {
        ...state,
        session: null,
      };

    case 'LOGOUT':
      return {
        session: null,
        pendingDestination: null,
        eventDraft: initialEventDraft,
      };

    case 'SET_PENDING_DESTINATION':
      return {
        ...state,
        pendingDestination: action.destination,
      };

    case 'UPDATE_EVENT_DRAFT':
      return {
        ...state,
        eventDraft: {
          ...state.eventDraft,
          ...action.changes,
        },
      };

    case 'CLEAR_EVENT_DRAFT':
      return {
        ...state,
        eventDraft: initialEventDraft,
      };

    default:
      return state;
  }
}