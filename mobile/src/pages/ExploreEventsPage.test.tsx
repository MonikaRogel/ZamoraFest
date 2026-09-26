import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  MemoryRouter,
  Route,
  useHistory,
  useLocation,
} from 'react-router-dom';

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
  Evento,
} from '../types/api';
import ExploreEventsPage from './ExploreEventsPage';

vi.mock(
  '../features/events/remote-event-repository',
  () => ({
    eventRepository: {
      listEvents:
        vi.fn(),
      listEventPage:
        vi.fn(),
      getEventById:
        vi.fn(),
    },
  }),
);

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

const eventos:
  readonly Evento[] = [
    {
      id: 1,
      titulo:
        'Festival Cultural de Zamora',
      descripcion:
        'Música, danza y tradiciones locales.',
      fechaInicio:
        '2026-09-20T18:00:00.000Z',
      fechaFin:
        '2026-09-20T22:00:00.000Z',
      costoReferencial: 0,
      estadoEvento:
        'PROGRAMADO',
      estadoRevision:
        'APROBADO',
      fuenteInformacion:
        null,
      fechaCreacion:
        '2026-09-01T12:00:00.000Z',
      fechaActualizacion:
        '2026-09-01T12:00:00.000Z',
      fechaRevision:
        null,
      lugar: {
        id: 1,
        nombre:
          'Parque Central de Zamora',
        tipoLugar:
          'PARQUE',
        direccionReferencial:
          'Centro de Zamora',
        referencia:
          null,
        latitud:
          -4.069,
        longitud:
          -78.956,
        sector: {
          id: 1,
          nombre:
            'Centro',
          tipoSector:
            'URBANO',
          parroquia: {
            id: 1,
            nombre:
              'Zamora',
            codigoDpa:
              '190101',
            canton: {
              id: 1,
              nombre:
                'Zamora',
              codigoDpa:
                '1901',
              provincia: {
                id: 1,
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
        id: 1,
        nombreCompleto:
          'Gestor Cultural',
        rol: {
          id: 2,
          nombre:
            'ASISTENTE',
        },
      },
      usuarioRevisor:
        null,
      categorias: [
        {
          id: 1,
          nombre:
            'Cultura',
          descripcion:
            null,
        },
      ],
    },

    {
      id: 2,
      titulo:
        'Feria Gastronómica Provincial',
      descripcion:
        'Productos y gastronomía de la provincia.',
      fechaInicio:
        '2026-09-25T15:00:00.000Z',
      fechaFin:
        '2026-09-25T20:00:00.000Z',
      costoReferencial:
        2,
      estadoEvento:
        'PROGRAMADO',
      estadoRevision:
        'APROBADO',
      fuenteInformacion:
        null,
      fechaCreacion:
        '2026-09-02T12:00:00.000Z',
      fechaActualizacion:
        '2026-09-02T12:00:00.000Z',
      fechaRevision:
        null,
      lugar: {
        id: 2,
        nombre:
          'Recinto Ferial',
        tipoLugar:
          'RECINTO',
        direccionReferencial:
          'Zamora',
        referencia:
          null,
        latitud:
          null,
        longitud:
          null,
        sector: {
          id: 1,
          nombre:
            'Centro',
          tipoSector:
            'URBANO',
          parroquia: {
            id: 1,
            nombre:
              'Zamora',
            codigoDpa:
              '190101',
            canton: {
              id: 1,
              nombre:
                'Zamora',
              codigoDpa:
                '1901',
              provincia: {
                id: 1,
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
        id: 1,
        nombreCompleto:
          'Gestor Cultural',
        rol: {
          id: 2,
          nombre:
            'ASISTENTE',
        },
      },
      usuarioRevisor:
        null,
      categorias: [
        {
          id: 2,
          nombre:
            'Gastronomía',
          descripcion:
            null,
        },
      ],
    },
  ];

function DetailRouteProbe() {
  const location =
    useLocation();

  return (
    <p data-testid="detail-route">
      {location.pathname}
    </p>
  );
}

function LoginRouteProbe() {
  return (
    <h1>
      Login de prueba
    </h1>
  );
}

function ManagementRouteProbe() {
  return (
    <h1>
      Cuenta protegida de prueba
    </h1>
  );
}

function SeedVisitorSession() {
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
          visitorSession,
        );

        history.push(
          '/explore',
        );
      }}
    >
      Iniciar visitante de prueba
    </button>
  );
}

interface TestAppProps {
  readonly initialEntry:
    string;
}

function TestApp({
  initialEntry,
}: TestAppProps) {
  return (
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[
          initialEntry,
        ]}
      >
        <Route
          exact
          path="/seed"
        >
          <SeedVisitorSession />
        </Route>

        <Route
          exact
          path="/explore"
        >
          <ExploreEventsPage />
        </Route>

        <Route
          exact
          path="/eventos/:id"
        >
          <DetailRouteProbe />
        </Route>

        <Route
          exact
          path="/login"
        >
          <LoginRouteProbe />
        </Route>

        <Route
          exact
          path="/gestion"
        >
          <ManagementRouteProbe />
        </Route>
      </MemoryRouter>
    </ApplicationStateProvider>
  );
}

function renderExplore() {
  return render(
    <TestApp
      initialEntry="/explore"
    />,
  );
}

describe(
  'ExploreEventsPage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      vi.mocked(
        eventRepository
          .listEventPage,
      ).mockImplementation(
        async (
          query = {},
        ) => {
          const events =
            await eventRepository
              .listEvents();

          const page =
            query.page ??
            1;

          const limit =
            query.limit ??
            5;

          return {
            events,
            meta: {
              page,
              limit,
              total:
                events.length,
              totalPages:
                events.length ===
                0
                  ? 0
                  : Math.ceil(
                      events.length /
                        limit,
                    ),
            },
          };
        },
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it(
      'muestra el estado de carga mientras espera el repositorio',
      () => {
        vi.mocked(
          eventRepository
            .listEvents,
        ).mockReturnValueOnce(
          new Promise(
            () => undefined,
          ),
        );

        renderExplore();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Cargando eventos',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'ofrece iniciar sesión cuando no existe una sesión activa',
      async () => {
        vi.mocked(
          eventRepository
            .listEvents,
        ).mockResolvedValueOnce(
          [],
        );

        renderExplore();

        const loginButton =
          await screen.findByText(
            'Iniciar sesión',
            {
              selector:
                'ion-button',
            },
          );

        expect(
          loginButton,
        ).toHaveAttribute(
          'aria-label',
          'Iniciar sesión',
        );

        fireEvent.click(
          loginButton,
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
      },
    );

    it(
      'muestra Mi cuenta y navega a gestión cuando existe sesión',
      async () => {
        vi.mocked(
          eventRepository
            .listEvents,
        ).mockResolvedValueOnce(
          eventos,
        );

        render(
          <TestApp
            initialEntry="/seed"
          />,
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                'Iniciar visitante de prueba',
            },
          ),
        );

        const accountButton =
          await screen.findByText(
            'Mi cuenta',
            {
              selector:
                'ion-button',
            },
          );

        expect(
          accountButton,
        ).toHaveAttribute(
          'aria-label',
          'Abrir mi cuenta',
        );

        fireEvent.click(
          accountButton,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Cuenta protegida de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'destaca como próximo el evento futuro más cercano',
      async () => {
        vi.spyOn(
          Date,
          'now',
        ).mockReturnValue(
          new Date(
            '2026-09-18T12:00:00.000Z',
          ).getTime(),
        );

        vi.mocked(
          eventRepository
            .listEvents,
        ).mockResolvedValueOnce(
          eventos,
        );

        renderExplore();

        const nextEventHeading =
          await screen.findByRole(
            'heading',
            {
              name:
                'Próximo evento',
            },
          );

        const nextEventSection =
          nextEventHeading.closest(
            'section',
          );

        expect(
          nextEventSection,
        ).not.toBeNull();

        expect(
          within(
            nextEventSection!,
          ).getByRole(
            'heading',
            {
              name:
                'Festival Cultural de Zamora',
            },
          ),
        ).toBeInTheDocument();

        expect(
          within(
            nextEventSection!,
          ).queryByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'muestra eventos y permite filtrarlos por categoría',
      async () => {
        vi.mocked(
          eventRepository
            .listEvents,
        ).mockResolvedValueOnce(
          eventos,
        );

        renderExplore();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Festival Cultural de Zamora',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).toBeInTheDocument();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                'Gastronomía',
            },
          ),
        );

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Festival Cultural de Zamora',
            },
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'traduce un error del servidor a un mensaje para el usuario',
      async () => {
        vi.mocked(
          eventRepository
            .listEvents,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'server',
            'Remote server error',
            500,
          ),
        );

        renderExplore();

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
            'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'navega al detalle usando únicamente el identificador del evento',
      async () => {
        vi.spyOn(
          Date,
          'now',
        ).mockReturnValue(
          new Date(
            '2026-09-18T12:00:00.000Z',
          ).getTime(),
        );

        vi.mocked(
          eventRepository
            .listEvents,
        ).mockResolvedValueOnce(
          eventos,
        );

        renderExplore();

        const nextEventHeading =
          await screen.findByRole(
            'heading',
            {
              name:
                'Próximo evento',
            },
          );

        const nextEventSection =
          nextEventHeading.closest(
            'section',
          );

        expect(
          nextEventSection,
        ).not.toBeNull();

        const detailButton =
          within(
            nextEventSection!,
          ).getByText(
            'Ver detalles',
            {
              selector:
                'ion-button',
            },
          );

        fireEvent.click(
          detailButton,
        );

        expect(
          await screen.findByTestId(
            'detail-route',
          ),
        ).toHaveTextContent(
          '/eventos/1',
        );
      },
    );
  },
);
