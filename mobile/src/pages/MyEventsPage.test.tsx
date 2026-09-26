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
  ownEventRepository,
} from '../features/events/remote-own-event-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
  Evento,
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

const ownEvent:
  Evento = {
  id:
    101,
  titulo:
    'Festival propio',
  descripcion:
    'Borrador administrado por el asistente.',
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
    'Dirección de Cultura',
  fechaCreacion:
    '2026-09-25T20:00:00.000Z',
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
      null,
    longitud:
      null,
    sector: {
      id:
        1,
      nombre:
        'Cabecera parroquial',
      tipoSector:
        'CABECERA_PARROQUIAL',
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
        'Festividades',
      descripcion:
        null,
    },
  ],
};

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
        <Route
          exact
          path="/seed"
        >
          <SeedAssistantSession />
        </Route>

        <Route
          exact
          path="/gestion/eventos"
        >
          <MyEventsPage />
        </Route>
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
  'MyEventsPage',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();
      },
    );

    it(
      'muestra carga mientras consulta los eventos propios',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
        ).mockReturnValueOnce(
          new Promise(
            () => undefined,
          ),
        );

        enterMyEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Cargando tus eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          ownEventRepository
            .listOwnEventPage,
        ).toHaveBeenCalledWith(
          {
            page:
              1,
            limit:
              20,
          },
          'access-asistente',
        );
      },
    );

    it(
      'muestra un estado vacío cuando el asistente todavía no registra eventos',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
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

        enterMyEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Todavía no tienes eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Crea tu primer borrador para comenzar a gestionar la agenda.',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'muestra los eventos propios con estado funcional y estado de revisión',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
        ).mockResolvedValueOnce({
          events: [
            ownEvent,
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

        enterMyEvents();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Mis eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Festival propio',
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
            'Parque Central',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'muestra un error recuperable cuando el servicio no está disponible',
      async () => {
        vi.mocked(
          ownEventRepository
            .listOwnEventPage,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'server',
            'Remote server error',
            503,
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
            'El servicio de gestión no está disponible temporalmente. Intenta nuevamente en unos momentos.',
          ),
        ).toBeInTheDocument();
      },
    );
  },
);