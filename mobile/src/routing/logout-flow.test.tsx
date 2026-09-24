import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  useHistory,
  useLocation,
} from 'react-router-dom';
import {
  describe,
  expect,
  it,
} from 'vitest';

import ManagementPage from '../pages/ManagementPage';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
} from '../types/api';
import ProtectedRoute from './ProtectedRoute';

const assistantSession:
  AuthSession = {
    accessToken:
      'access-asistente',

    refreshToken:
      'refresh-asistente',

    tokenType:
      'Bearer',

    expiresIn:
      900,

    usuario: {
      id:
        10,

      nombre:
        'Asistente Demo',

      email:
        'asistente@zamorafest.ec',

      rol:
        'ASISTENTE',
    },
  };

function SeedState() {
  const {
    login,
    setPendingDestination,
    updateEventDraft,
  } =
    useApplicationState();

  const history =
    useHistory();

  return (
    <button
      type="button"
      onClick={() => {
        login(
          assistantSession,
        );

        setPendingDestination(
          '/gestion/eventos/nuevo',
        );

        updateEventDraft({
          titulo:
            'Borrador antes del logout',

          lugarId:
            73,

          categoriaIds: [
            41,
          ],
        });

        history.push(
          '/gestion',
        );
      }}
    >
      Preparar sesión de prueba
    </button>
  );
}

function LoginProbe() {
  const {
    session,
    user,
    role,
    accessToken,
    refreshToken,
    pendingDestination,
    eventDraft,
  } =
    useApplicationState();

  const history =
    useHistory();

  const location =
    useLocation();

  return (
    <main>
      <h1>
        Login de prueba
      </h1>

      <output data-testid="logout-session">
        {session === null
          ? 'null'
          : 'activa'}
      </output>

      <output data-testid="logout-user">
        {user === null
          ? 'null'
          : user.email}
      </output>

      <output data-testid="logout-role">
        {role === null
          ? 'null'
          : role}
      </output>

      <output data-testid="logout-access-token">
        {accessToken === null
          ? 'null'
          : accessToken}
      </output>

      <output data-testid="logout-refresh-token">
        {refreshToken === null
          ? 'null'
          : refreshToken}
      </output>

      <output data-testid="logout-destination">
        {pendingDestination === null
          ? 'null'
          : pendingDestination}
      </output>

      <output data-testid="logout-draft-title">
        {eventDraft.titulo}
      </output>

      <output data-testid="logout-location">
        {`${location.pathname}${location.search}${location.hash}`}
      </output>

      <button
        type="button"
        onClick={() => {
          history.push(
            '/gestion',
          );
        }}
      >
        Intentar volver a gestión
      </button>
    </main>
  );
}

function TestApp() {
  return (
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[
          '/seed',
        ]}
      >
        <Route
          exact
          path="/seed"
        >
          <SeedState />
        </Route>

        <Route
          exact
          path="/login"
        >
          <LoginProbe />
        </Route>

        <ProtectedRoute
          exact
          path="/gestion"
          render={() => (
            <ManagementPage />
          )}
        />
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

async function loginAndLogout() {
  render(
    <TestApp />,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Preparar sesión de prueba',
      },
    ),
  );

  expect(
    await screen.findByRole(
      'heading',
      {
        name:
          'Mi cuenta',
      },
    ),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByText(
      'Cerrar sesión',
      {
        selector:
          'ion-button',
      },
    ),
  );

  expect(
    await screen.findByRole(
      'heading',
      {
        name:
          'Login de prueba',
      },
    ),
  ).toBeInTheDocument();
}

describe(
  'flujo integrado de logout',
  () => {
    it(
      'elimina autenticación, tokens, destino pendiente y borrador',
      async () => {
        await loginAndLogout();

        expect(
          screen.getByTestId(
            'logout-session',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-user',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-role',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-access-token',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-refresh-token',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-destination',
          ),
        ).toHaveTextContent(
          'null',
        );

        expect(
          screen.getByTestId(
            'logout-draft-title',
          ),
        ).toBeEmptyDOMElement();
      },
    );

    it(
      'vuelve a exigir login al intentar entrar a gestión después del logout',
      async () => {
        await loginAndLogout();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                'Intentar volver a gestión',
            },
          ),
        );

        await waitFor(
          () => {
            expect(
              screen.getByTestId(
                'logout-location',
              ),
            ).toHaveTextContent(
              '/login?redirect=%2Fgestion',
            );
          },
        );

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Mi cuenta',
            },
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Login de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );
  },
);