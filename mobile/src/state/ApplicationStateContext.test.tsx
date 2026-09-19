import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  ApplicationStateProvider,
  useApplicationState,
} from './ApplicationStateContext';

function Wrapper({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <ApplicationStateProvider>
      {children}
    </ApplicationStateProvider>
  );
}

describe('ApplicationStateContext', () => {
  it('expone inicialmente la aplicación sin autenticar', () => {
    const { result } = renderHook(
      () => useApplicationState(),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });

  it('expone sesión, usuario, rol y tokens después del login', () => {
    const { result } = renderHook(
      () => useApplicationState(),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.login({
        accessToken: 'access-prueba',
        refreshToken: 'refresh-prueba',
        tokenType: 'Bearer',
        expiresIn: 900,
        usuario: {
          id: 7,
          nombre: 'Asistente Demo',
          email: 'asistente@zamorafest.ec',
          rol: 'ASISTENTE',
        },
      });
    });

    expect(result.current.session).not.toBeNull();
    expect(result.current.user?.id).toBe(7);
    expect(result.current.role).toBe('ASISTENTE');
    expect(result.current.accessToken).toBe('access-prueba');
    expect(result.current.refreshToken).toBe('refresh-prueba');
  });

  it('el logout elimina completamente la autenticación en memoria', () => {
    const { result } = renderHook(
      () => useApplicationState(),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.login({
        accessToken: 'access-prueba',
        refreshToken: 'refresh-prueba',
        tokenType: 'Bearer',
        expiresIn: 900,
        usuario: {
          id: 7,
          nombre: 'Asistente Demo',
          email: 'asistente@zamorafest.ec',
          rol: 'ASISTENTE',
        },
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });

  it('mantiene destino pendiente y borrador como estado compartido', () => {
    const { result } = renderHook(
      () => useApplicationState(),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.setPendingDestination(
        '/gestion/eventos/nuevo',
      );

      result.current.updateEventDraft({
        titulo: 'Festival de prueba',
        lugarId: 3,
      });
    });

    expect(result.current.pendingDestination).toBe(
      '/gestion/eventos/nuevo',
    );

    expect(result.current.eventDraft.titulo).toBe(
      'Festival de prueba',
    );

    expect(result.current.eventDraft.lugarId).toBe(3);
  });
});
