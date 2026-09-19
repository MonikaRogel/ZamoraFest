import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type { AuthSession } from '../types/api';
import ProtectedRoute from './ProtectedRoute';

const assistantSession: AuthSession = {
  accessToken: 'access-asistente',
  refreshToken: 'refresh-asistente',
  tokenType: 'Bearer',
  expiresIn: 900,
  usuario: {
    id: 10,
    nombre: 'Asistente Demo',
    email: 'asistente@zamorafest.ec',
    rol: 'ASISTENTE',
  },
};

const visitorSession: AuthSession = {
  accessToken: 'access-visitante',
  refreshToken: 'refresh-visitante',
  tokenType: 'Bearer',
  expiresIn: 900,
  usuario: {
    id: 20,
    nombre: 'Visitante Demo',
    email: 'visitante@zamorafest.ec',
    rol: 'VISITANTE',
  },
};

interface SeedSessionProps {
  readonly session: AuthSession;
  readonly destination: string;
}

function SeedSession({
  session,
  destination,
}: SeedSessionProps) {
  const { login } = useApplicationState();
  const history = useHistory();

  return (
    <button
      type="button"
      onClick={() => {
        login(session);
        history.push(destination);
      }}
    >
      Iniciar sesión de prueba
    </button>
  );
}

function LoginProbe() {
  const location = useLocation();

  return (
    <>
      <h1>Login de prueba</h1>

      <p data-testid="login-location">
        {`${location.pathname}${location.search}${location.hash}`}
      </p>
    </>
  );
}

function SafeAreaProbe() {
  const {
    user,
    role,
  } = useApplicationState();

  return (
    <>
      <h1>Área pública segura</h1>

      <p>{user?.email}</p>
      <p>{role}</p>
    </>
  );
}

interface TestAppProps {
  readonly initialEntry: string;
  readonly seedSession?: AuthSession;
  readonly seedDestination?: string;
}

function TestApp({
  initialEntry,
  seedSession,
  seedDestination = '/gestion',
}: TestAppProps) {
  return (
    <ApplicationStateProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Route exact path="/seed">
          {seedSession !== undefined && (
            <SeedSession
              session={seedSession}
              destination={seedDestination}
            />
          )}
        </Route>

        <Route
          exact
          path="/login"
          component={LoginProbe}
        />

        <Route
          exact
          path="/explore"
          component={SafeAreaProbe}
        />

        <ProtectedRoute
          exact
          path="/gestion"
          render={() => (
            <h1>Gestión protegida</h1>
          )}
        />

        <ProtectedRoute
          exact
          path="/gestion/eventos/nuevo"
          allowedRoles={['ASISTENTE']}
          forbiddenRedirect="/explore"
          render={() => (
            <h1>Crear evento protegido</h1>
          )}
        />
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

describe('ProtectedRoute', () => {
  it('redirige una ruta protegida al login cuando no existe sesión', async () => {
    render(
      <TestApp initialEntry="/gestion" />,
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Login de prueba',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('login-location'),
    ).toHaveTextContent(
      '/login?redirect=%2Fgestion',
    );
  });

  it('conserva el destino anidado solicitado al redirigir al login', async () => {
    render(
      <TestApp
        initialEntry="/gestion/eventos/nuevo"
      />,
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Login de prueba',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('login-location'),
    ).toHaveTextContent(
      '/login?redirect=%2Fgestion%2Feventos%2Fnuevo',
    );
  });

  it('permite entrar a gestión cuando existe una sesión autenticada', async () => {
    render(
      <TestApp
        initialEntry="/seed"
        seedSession={assistantSession}
        seedDestination="/gestion"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión de prueba',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Gestión protegida',
      }),
    ).toBeInTheDocument();
  });

  it('permite crear eventos cuando el rol es ASISTENTE', async () => {
    render(
      <TestApp
        initialEntry="/seed"
        seedSession={assistantSession}
        seedDestination="/gestion/eventos/nuevo"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión de prueba',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Crear evento protegido',
      }),
    ).toBeInTheDocument();
  });

  it('conserva la sesión cuando el usuario autenticado no posee el rol requerido', async () => {
    render(
      <TestApp
        initialEntry="/seed"
        seedSession={visitorSession}
        seedDestination="/gestion/eventos/nuevo"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión de prueba',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Área pública segura',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'visitante@zamorafest.ec',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('VISITANTE'),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Crear evento protegido',
      }),
    ).not.toBeInTheDocument();
  });
});
