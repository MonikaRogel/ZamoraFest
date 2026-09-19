import { describe, expect, it } from 'vitest';

import type { AuthSession } from '../types/api';
import {
  applicationReducer,
  initialApplicationState,
  initialEventDraft,
} from './application-state';

const session: AuthSession = {
  accessToken: 'access-token-prueba',
  refreshToken: 'refresh-token-prueba',
  tokenType: 'Bearer',
  expiresIn: 900,
  usuario: {
    id: 7,
    nombre: 'Usuario Demo',
    email: 'demo@zamorafest.ec',
    rol: 'ASISTENTE',
  },
};

describe('applicationReducer', () => {
  it('mantiene la aplicación inicialmente sin sesión', () => {
    expect(initialApplicationState).toEqual({
      session: null,
      pendingDestination: null,
      eventDraft: initialEventDraft,
    });
  });

  it('conserva la sesión autenticada completa únicamente en el estado', () => {
    const state = applicationReducer(
      initialApplicationState,
      {
        type: 'LOGIN',
        session,
      },
    );

    expect(state.session).toEqual(session);
    expect(state.session?.usuario.rol).toBe('ASISTENTE');
    expect(state.session?.accessToken).toBe(
      'access-token-prueba',
    );
    expect(state.session?.refreshToken).toBe(
      'refresh-token-prueba',
    );
  });

  it('conserva un destino protegido pendiente', () => {
    const state = applicationReducer(
      initialApplicationState,
      {
        type: 'SET_PENDING_DESTINATION',
        destination: '/gestion/eventos/nuevo',
      },
    );

    expect(state.pendingDestination).toBe(
      '/gestion/eventos/nuevo',
    );
  });

  it('preserva el borrador de evento como estado de aplicación', () => {
    const state = applicationReducer(
      initialApplicationState,
      {
        type: 'UPDATE_EVENT_DRAFT',
        changes: {
          titulo: 'Festival cultural',
          lugarId: 4,
          categoriaIds: [1, 3],
        },
      },
    );

    expect(state.eventDraft).toEqual({
      ...initialEventDraft,
      titulo: 'Festival cultural',
      lugarId: 4,
      categoriaIds: [1, 3],
    });
  });

  it('el logout elimina sesión, destino pendiente y borrador', () => {
    const authenticatedState = {
      session,
      pendingDestination: '/gestion/eventos/nuevo',
      eventDraft: {
        ...initialEventDraft,
        titulo: 'Evento temporal',
      },
    };

    const state = applicationReducer(
      authenticatedState,
      {
        type: 'LOGOUT',
      },
    );

    expect(state).toEqual(initialApplicationState);
  });
});
