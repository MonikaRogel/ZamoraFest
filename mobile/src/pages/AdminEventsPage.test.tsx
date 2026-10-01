import {
  render,
  screen,
} from '@testing-library/react';
import {
  fireEvent,
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
  adminEventRepository,
} from '../features/events/remote-admin-event-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
  Evento,
} from '../types/api';
import AdminEventsPage from './AdminEventsPage';

vi.mock(
  '../features/events/remote-admin-event-repository',
  () => ({
    adminEventRepository: {
      listAdminEventPage:
        vi.fn(),
    },
  }),
);

const adminSession:
  AuthSession = {
  accessToken:
    'access-admin',
  refreshToken:
    'refresh-admin',
  tokenType:
    'Bearer',
  expiresIn:
    900,
  usuario: {
    id:
      1,
    nombre:
      'Administrador Demo',
    email:
      'admin@zamorafest.ec',
    rol:
      'ADMINISTRADOR',
  },
};

const pendingEvent:
  Evento = {
  id:
    301,
  titulo:
    'Festival Cultural de Zamora',
  descripcion:
    'Evento pendiente de revisión administrativa.',
  fechaInicio:
    '2026-10-20T18:00:00.000Z',
  fechaFin:
    '2026-10-20T22:00:00.000Z',
  costoReferencial:
    0,
  estadoEvento:
    'BORRADOR',
  estadoRevision:
    'PENDIENTE',
  fuenteInformacion:
    'GAD Municipal',
  fechaCreacion:
    '2026-09-29T15:00:00.000Z',
  fechaActualizacion:
    null,
  fechaRevision:
    null,
  lugar: {
    id:
      1,
    nombre:
      'Parque Central',
    tipoLugar:
      'PARQUE',
    direccionReferencial:
      'Centro de Zamora',
    referencia:
      null,
    latitud:
      -4.066,
    longitud:
      -78.956,
    sector: {
      id:
        1,
      nombre:
        'Centro',
      tipoSector:
        'BARRIO',
      parroquia: {
        id:
          1,
        nombre:
          'Zamora',
        codigoDpa:
          '190150',
        canton: {
          id:
            1,
          nombre:
            'Zamora',
          codigoDpa:
            '1901',
          provincia: {
            id:
              1,
            nombre:
              'Zamora Chinchipe',
            codigoDpa:
              '19',
          },
        },
      },
    },
  },
  usuarioCreador: {
    id:
      7,
    nombreCompleto:
      'Asistente Demo',
    rol: {
      id:
        2,
      nombre:
        'ASISTENTE',
    },
  },
  usuarioRevisor:
    null,
  categorias: [
    {
      id:
        1,
      nombre:
        'Cultura',
      descripcion:
        null,
    },
  ],
};

function SeedAdminSession() {
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
          adminSession,
        );

        history.push(
          '/gestion/admin/eventos',
        );
      }}
    >
      Iniciar administrador de prueba
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
        <Route
          exact
          path="/seed"
        >
          <SeedAdminSession />
        </Route>

        <Route
          exact
          path="/gestion/admin/eventos"
        >
          <AdminEventsPage />
        </Route>
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

function enterAdminEvents() {
  render(
    <TestApp />,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Iniciar administrador de prueba',
      },
    ),
  );
}

describe(
  'AdminEventsPage',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();
      },
    );

    it(
      'muestra carga mientras consulta los eventos administrativos',
      async () => {
        vi.mocked(
          adminEventRepository
            .listAdminEventPage,
        ).mockReturnValueOnce(
          new Promise(
            () => undefined,
          ),
        );

        enterAdminEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Cargando eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          adminEventRepository
            .listAdminEventPage,
        ).toHaveBeenCalledWith(
          {
            page:
              1,
            limit:
              20,
          },
          'access-admin',
        );
      },
    );

    it(
      'muestra un estado vacío cuando no existen eventos administrativos',
      async () => {
        vi.mocked(
          adminEventRepository
            .listAdminEventPage,
        ).mockResolvedValueOnce({
          events:
            [],
          meta: {
            page:
              1,
            limit:
              20,
            total:
              0,
            totalPages:
              0,
          },
        });

        enterAdminEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No hay eventos para administrar',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'muestra los eventos con estado, revisión y creador',
      async () => {
        vi.mocked(
          adminEventRepository
            .listAdminEventPage,
        ).mockResolvedValueOnce({
          events: [
            pendingEvent,
          ],
          meta: {
            page:
              1,
            limit:
              20,
            total:
              1,
            totalPages:
              1,
          },
        });

        enterAdminEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Administración de eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Festival Cultural de Zamora',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Borrador',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Pendiente de revisión',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Asistente Demo',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Revisar',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'muestra un error recuperable cuando el servicio administrativo falla',
      async () => {
        vi.mocked(
          adminEventRepository
            .listAdminEventPage,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'server',
            'Remote server error',
            503,
          ),
        );

        enterAdminEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No pudimos cargar los eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'El servicio de administración no está disponible temporalmente. Intenta nuevamente en unos momentos.',
          ),
        ).toBeInTheDocument();
      },
    );
  },
);
