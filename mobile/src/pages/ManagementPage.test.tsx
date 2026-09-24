import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  useHistory,
} from 'react-router-dom';
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
} from '../types/api';
import ManagementPage from './ManagementPage';

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
      id: 10,
      nombre:
        'Asistente Demo',
      email:
        'asistente@zamorafest.ec',
      rol:
        'ASISTENTE',
    },
  };

const visitorSession:
  AuthSession = {
    accessToken:
      'access-visitante',
    refreshToken:
      'refresh-visitante',
    tokenType:
      'Bearer',
    expiresIn:
      900,
    usuario: {
      id: 20,
      nombre:
        'Visitante Demo',
      email:
        'visitante@zamorafest.ec',
      rol:
        'VISITANTE',
    },
  };

const administratorSession:
  AuthSession = {
    accessToken:
      'access-administrador',
    refreshToken:
      'refresh-administrador',
    tokenType:
      'Bearer',
    expiresIn:
      900,
    usuario: {
      id: 30,
      nombre:
        'Administrador Demo',
      email:
        'administrador@zamorafest.ec',
      rol:
        'ADMINISTRADOR',
    },
  };

interface SeedSessionProps {
  readonly session:
    AuthSession;
}

function SeedSession({
  session,
}: SeedSessionProps) {
  const {
    login,
  } =
    useApplicationState();

  const history =
    useHistory();

  return (
    <button
      type="button"
      onClick={() => {
        login(
          session,
        );

        history.push(
          '/gestion',
        );
      }}
    >
      Iniciar sesión de prueba
    </button>
  );
}

function LoginProbe() {
  const {
    session,
  } =
    useApplicationState();

  return (
    <>
      <h1>
        Login de prueba
      </h1>

      <p data-testid="session-state">
        {session ===
        null
          ? 'sin sesión'
          : 'con sesión'}
      </p>
    </>
  );
}

function ExploreProbe() {
  return (
    <h1>
      Agenda pública de prueba
    </h1>
  );
}

function CreateEventProbe() {
  return (
    <h1>
      Formulario de creación de prueba
    </h1>
  );
}

interface TestAppProps {
  readonly session:
    AuthSession;
}

function TestApp({
  session,
}: TestAppProps) {
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
          <SeedSession
            session={
              session
            }
          />
        </Route>

        <Route
          exact
          path="/gestion"
          component={
            ManagementPage
          }
        />

        <Route
          exact
          path="/gestion/eventos/nuevo"
          component={
            CreateEventProbe
          }
        />

        <Route
          exact
          path="/explore"
          component={
            ExploreProbe
          }
        />

        <Route
          exact
          path="/login"
          component={
            LoginProbe
          }
        />
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

function enterManagement(
  session:
    AuthSession,
) {
  render(
    <TestApp
      session={
        session
      }
    />,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Iniciar sesión de prueba',
      },
    ),
  );
}

describe(
  'ManagementPage',
  () => {
    it(
      'muestra la identidad y el rol del usuario autenticado',
      async () => {
        enterManagement(
          assistantSession,
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

        expect(
          screen.getByText(
            'Asistente Demo',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'asistente@zamorafest.ec',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Asistente',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'habilita el acceso al formulario únicamente para ASISTENTE',
      async () => {
        enterManagement(
          assistantSession,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Mi cuenta',
          },
        );

        fireEvent.click(
          screen.getByText(
            'Crear evento',
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
                'Formulario de creación de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'no muestra creación de eventos a VISITANTE',
      async () => {
        enterManagement(
          visitorSession,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Mi cuenta',
          },
        );

        expect(
          screen.queryByText(
            'Crear evento',
            {
              selector:
                'ion-button',
            },
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.getByText(
            'Visitante',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'mantiene ADMINISTRADOR separado de ASISTENTE',
      async () => {
        enterManagement(
          administratorSession,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Mi cuenta',
          },
        );

        expect(
          screen.getByText(
            'Administrador',
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            'Crear evento',
            {
              selector:
                'ion-button',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'permite explorar eventos desde el área protegida',
      async () => {
        enterManagement(
          assistantSession,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Mi cuenta',
          },
        );

        fireEvent.click(
          screen.getByText(
            'Explorar eventos',
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
                'Agenda pública de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'cierra la sesión y regresa al login',
      async () => {
        enterManagement(
          assistantSession,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Mi cuenta',
          },
        );

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

        expect(
          screen.getByTestId(
            'session-state',
          ),
        ).toHaveTextContent(
          'sin sesión',
        );
      },
    );
  },
);