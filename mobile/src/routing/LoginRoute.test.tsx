import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';

import {
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type { AuthSession } from '../types/api';
import LoginRoute from './LoginRoute';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../services/api/zamorafest-api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    readonly status: number | null;

    constructor(
      message: string,
      status: number | null = null,
    ) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
  zamoraFestApi: {
    login: vi.fn(),
  },
}));

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

function completeLoginForm(
  container: HTMLElement,
) {
  const inputs =
    container.querySelectorAll('ion-input');

  const form =
    container.querySelector('form');

  expect(inputs).toHaveLength(2);
  expect(form).not.toBeNull();

  fireEvent(
    inputs.item(0),
    new CustomEvent('ionInput', {
      bubbles: true,
      detail: {
        value: 'asistente@zamorafest.ec',
      },
    }),
  );

  fireEvent(
    inputs.item(1),
    new CustomEvent('ionInput', {
      bubbles: true,
      detail: {
        value: 'ClaveDemo123',
      },
    }),
  );

  return form!;
}

function SessionProbe() {
  const {
    user,
    role,
    pendingDestination,
  } = useApplicationState();

  return (
    <div>
      <span data-testid="session-email">
        {user?.email ?? 'sin-sesion'}
      </span>

      <span data-testid="session-role">
        {role ?? 'sin-rol'}
      </span>

      <span data-testid="pending-destination">
        {pendingDestination ?? 'sin-destino'}
      </span>
    </div>
  );
}

interface TestAppProps {
  readonly initialEntry: string;
}

function TestApp({
  initialEntry,
}: TestAppProps) {
  return (
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[initialEntry]}
      >
        <SessionProbe />

        <Route
          exact
          path="/login"
          component={LoginRoute}
        />

        <Route
          exact
          path="/explore"
          render={() => (
            <h1>Explorar eventos</h1>
          )}
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

describe('LoginRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('conserva un destino protegido válido como estado de aplicación', async () => {
    render(
      <TestApp
        initialEntry="/login?redirect=%2Fgestion"
      />,
    );

    expect(
      await screen.findByTestId(
        'pending-destination',
      ),
    ).toHaveTextContent('/gestion');
  });

  it('regresa a gestión después de login correcto', async () => {
    vi.mocked(
      zamoraFestApi.login,
    ).mockResolvedValueOnce(
      assistantSession,
    );

    const { container } = render(
      <TestApp
        initialEntry="/login?redirect=%2Fgestion"
      />,
    );

    const form =
      completeLoginForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByRole('heading', {
        name: 'Gestión protegida',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'pending-destination',
      ),
    ).toHaveTextContent('sin-destino');
  });

  it('regresa a creación cuando el ASISTENTE solicitó la ruta anidada', async () => {
    vi.mocked(
      zamoraFestApi.login,
    ).mockResolvedValueOnce(
      assistantSession,
    );

    const { container } = render(
      <TestApp
        initialEntry={
          '/login?redirect=%2Fgestion%2Feventos%2Fnuevo'
        }
      />,
    );

    const form =
      completeLoginForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByRole('heading', {
        name: 'Crear evento protegido',
      }),
    ).toBeInTheDocument();
  });

  it('rechaza un redirect externo y utiliza una ruta pública segura', async () => {
    vi.mocked(
      zamoraFestApi.login,
    ).mockResolvedValueOnce(
      assistantSession,
    );

    const { container } = render(
      <TestApp
        initialEntry={
          '/login?redirect=https%3A%2F%2Fmalicioso.example%2Frobar'
        }
      />,
    );

    const form =
      completeLoginForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByRole('heading', {
        name: 'Explorar eventos',
      }),
    ).toBeInTheDocument();
  });

  it('mantiene la sesión cuando el usuario carece del rol ASISTENTE', async () => {
    vi.mocked(
      zamoraFestApi.login,
    ).mockResolvedValueOnce(
      visitorSession,
    );

    const { container } = render(
      <TestApp
        initialEntry={
          '/login?redirect=%2Fgestion%2Feventos%2Fnuevo'
        }
      />,
    );

    const form =
      completeLoginForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByRole('heading', {
        name: 'Explorar eventos',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('session-email'),
    ).toHaveTextContent(
      'visitante@zamorafest.ec',
    );

    expect(
      screen.getByTestId('session-role'),
    ).toHaveTextContent('VISITANTE');
  });
});
