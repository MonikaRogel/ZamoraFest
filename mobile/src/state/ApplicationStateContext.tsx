/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import type {
  AuthRole,
  AuthSession,
  AuthenticatedUser,
} from '../types/api';
import {
  applicationReducer,
  initialApplicationState,
  type EventDraft,
} from './application-state';

interface ApplicationStateContextValue {
  readonly session: AuthSession | null;
  readonly user: AuthenticatedUser | null;
  readonly role: AuthRole | null;
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly pendingDestination: string | null;
  readonly eventDraft: EventDraft;
  readonly login: (session: AuthSession) => void;
  readonly logout: () => void;
  readonly setPendingDestination: (
    destination: string | null,
  ) => void;
  readonly updateEventDraft: (
    changes: Partial<EventDraft>,
  ) => void;
  readonly clearEventDraft: () => void;
}

const ApplicationStateContext =
  createContext<ApplicationStateContextValue | null>(null);

interface ApplicationStateProviderProps {
  readonly children: ReactNode;
}

export function ApplicationStateProvider({
  children,
}: ApplicationStateProviderProps) {
  const [state, dispatch] = useReducer(
    applicationReducer,
    initialApplicationState,
  );

  const value = useMemo<ApplicationStateContextValue>(
    () => ({
      session: state.session,
      user: state.session?.usuario ?? null,
      role: state.session?.usuario.rol ?? null,
      accessToken: state.session?.accessToken ?? null,
      refreshToken: state.session?.refreshToken ?? null,
      pendingDestination: state.pendingDestination,
      eventDraft: state.eventDraft,

      login(session) {
        dispatch({
          type: 'LOGIN',
          session,
        });
      },

      logout() {
        dispatch({
          type: 'LOGOUT',
        });
      },

      setPendingDestination(destination) {
        dispatch({
          type: 'SET_PENDING_DESTINATION',
          destination,
        });
      },

      updateEventDraft(changes) {
        dispatch({
          type: 'UPDATE_EVENT_DRAFT',
          changes,
        });
      },

      clearEventDraft() {
        dispatch({
          type: 'CLEAR_EVENT_DRAFT',
        });
      },
    }),
    [state],
  );

  return (
    <ApplicationStateContext.Provider value={value}>
      {children}
    </ApplicationStateContext.Provider>
  );
}

export function useApplicationState(): ApplicationStateContextValue {
  const context = useContext(ApplicationStateContext);

  if (context === null) {
    throw new Error(
      'useApplicationState debe utilizarse dentro de ApplicationStateProvider.',
    );
  }

  return context;
}
