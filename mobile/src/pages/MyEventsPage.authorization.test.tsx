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
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  ownEventRepository,
} from '../features/events/remote-own-event-repository';
import ProtectedRoute from '../routing/ProtectedRoute';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
} from '../types/api';
import MyEventsPage from './MyEventsPage';

vi.mock(
  '../features/events/remote-own-event-repository',
  () => ({
    ownEventRepository: {
      listOwnEventPage:
        vi.fn(),
    },
  }),
);

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
      7,

    nombre:
      'Asistente Demo',

    email:
      'asistente@zamorafest.ec',

    rol:
      'ASISTENTE',
  },
};

function SessionProbe() {
  const {
    user,
    role,
  } =
    useApplicationState();

  return (
    <div>
      <span data-testid="session-email">
        {
          user?.email ??
          'sin-sesion'
        }
      </span>

      <span data-testid="session-role">
        {
          role ??
          'sin-rol'
        }
      </span>
    </div>
  );
}

function SeedAssistantSession() {
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
          assistantSession,
        );

        history.push(
          '/gestion/eventos',
        );
      }}
    >
      Iniciar asistente de prueba
    </button>
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
        <SessionProbe />

        <Route
          exact
          path="/seed"
        >
          <SeedAssistantSession />
        </Route>

        <Route
          exact
          path="/login"
        >
          <h1>
            Inicio de sesión requerido
          </h1>
        </Route>

        <ProtectedRoute
          exact
          path="/gestion/eventos"
          allowedRoles={[
            'ASISTENTE',
          ]}
          render={() => (
            <MyEventsPage />
          )}
        />
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

function enterMyEvents() {
  render(
    <TestApp />,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Iniciar asistente de prueba',
      },
    ),
  );
}

describe(
  'MyEventsPage - autorización 401 y 403',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();
      },
    );

    it(
      'invalida la sesión ante 401 y regresa al login protegido',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'request',
            'Access token expired',
            401,
          ),
        );

        enterMyEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Inicio de sesión requerido',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByTestId(
            'session-email',
          ),
        ).toHaveTextContent(
          'sin-sesion',
        );

        expect(
          screen.getByTestId(
            'session-role',
          ),
        ).toHaveTextContent(
          'sin-rol',
        );
      },
    );

    it(
      'mantiene la sesión ante 403 y muestra el error de autorización',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'request',
            'Forbidden',
            403,
          ),
        );

        enterMyEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No pudimos cargar tus eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Tu cuenta no tiene autorización para consultar eventos propios.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByTestId(
            'session-email',
          ),
        ).toHaveTextContent(
          'asistente@zamorafest.ec',
        );

        expect(
          screen.getByTestId(
            'session-role',
          ),
        ).toHaveTextContent(
          'ASISTENTE',
        );

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Inicio de sesión requerido',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );
  },
);