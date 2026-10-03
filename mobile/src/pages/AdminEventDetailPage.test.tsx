import {
  act,
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
  useHistory,
} from 'react-router-dom';

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
import AdminEventDetailPage from './AdminEventDetailPage';

vi.mock(
  '../features/events/remote-admin-event-repository',
  () => ({
    adminEventRepository: {
      getAdminEventById:
        vi.fn(),
      reviewEvent:
        vi.fn(),
      publishEvent:
        vi.fn(),
      deleteEvent:
        vi.fn(),
    },
  }),
);

const adminSession: AuthSession = {
  accessToken: 'access-admin',
  refreshToken: 'refresh-admin',
  tokenType: 'Bearer',
  expiresIn: 900,
  usuario: {
    id: 1,
    nombre: 'Administrador Demo',
    email: 'admin@zamorafest.ec',
    rol: 'ADMINISTRADOR',
  },
};

const event: Evento = {
  id: 7,
  titulo:
    'Festival Cultural de Zamora',
  descripcion:
    'Música, danza y tradiciones de Zamora Chinchipe.',
  fechaInicio:
    '2026-10-20T18:00:00.000Z',
  fechaFin:
    '2026-10-20T22:00:00.000Z',
  costoReferencial: 0,
  estadoEvento:
    'BORRADOR',
  estadoRevision:
    'PENDIENTE',
  fuenteInformacion:
    'Dirección de Cultura',
  fechaCreacion:
    '2026-09-01T12:00:00.000Z',
  fechaActualizacion: null,
  fechaRevision: null,
  lugar: {
    id: 1,
    nombre:
      'Parque Central de Zamora',
    tipoLugar:
      'PARQUE',
    direccionReferencial:
      'Centro de Zamora',
    referencia: null,
    latitud: -4.069,
    longitud: -78.956,
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
  usuarioRevisor: null,
  categorias: [
    {
      id: 1,
      nombre:
        'Cultura',
      descripcion: null,
    },
  ],
};

const approvedEvent: Evento = {
  ...event,
  estadoRevision: 'APROBADO',
};

function SeedAdminSession({
  destination,
}: {
  readonly destination: string;
}) {
  const { login } = useApplicationState();
  const history = useHistory();

  return (
    <button
      type="button"
      onClick={() => {
        login(adminSession);
        history.push(destination);
      }}
    >
      Iniciar administrador de detalle
    </button>
  );
}

function renderDetail(
  initialEntry:
    string = '/gestion/admin/eventos/7',
) {
  const result = render(
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
          <SeedAdminSession
            destination={initialEntry}
          />
        </Route>

        <Route
          exact
          path="/gestion/admin/eventos/:id"
      >
        <AdminEventDetailPage />
      </Route>

      <Route
        exact
        path="/gestion/admin/eventos"
      >
        <h1>
          Administración de eventos de prueba
        </h1>
      </Route>
      </MemoryRouter>
    </ApplicationStateProvider>,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Iniciar administrador de detalle',
      },
    ),
  );

  return result;
}

describe(
  'AdminEventDetailPage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      'muestra loading mientras consulta el detalle',
      () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockReturnValueOnce(
          new Promise(
            () => undefined,
          ),
        );

        renderDetail();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Cargando evento',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'reconstruye el detalle directamente desde el identificador de la URL',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          event,
        );

        renderDetail(
          '/gestion/admin/eventos/7',
        );

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
          adminEventRepository
            .getAdminEventById,
        ).toHaveBeenCalledWith(
          7,
          'access-admin',
        );

        expect(
          screen.getByText(
            'Parque Central de Zamora',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Cultura',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Dirección de Cultura',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'permite volver al listado administrativo desde el detalle',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          event,
        );

        renderDetail();

        await screen.findByRole(
          'heading',
          {
            name:
              'Festival Cultural de Zamora',
          },
        );

        fireEvent.click(
          screen.getByText(
            'Volver a eventos',
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
                'Administración de eventos de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'permite aprobar un evento revisable',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          event,
        );

        vi.mocked(
          adminEventRepository
            .reviewEvent,
        ).mockResolvedValueOnce({
          ...event,
          estadoRevision:
            'APROBADO',
        });

        renderDetail();

        await screen.findByRole(
          'heading',
          {
            name:
              'Festival Cultural de Zamora',
          },
        );

        await act(async () => {
          fireEvent.click(
            screen.getByText(
              'Aprobar',
              {
                selector:
                  'ion-button',
              },
            ),
          );
        });

        expect(
          adminEventRepository
            .reviewEvent,
        ).toHaveBeenCalledWith(
          7,
          {
            decision:
              'APROBAR',
          },
          'access-admin',
        );
      },
    );
    it(
      'permite publicar un evento aprobado',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          approvedEvent,
        );

        vi.mocked(
          adminEventRepository
            .publishEvent,
        ).mockResolvedValueOnce({
          ...approvedEvent,
          estadoEvento:
            'PROGRAMADO',
        });

        renderDetail();

        await screen.findByRole(
          'heading',
          {
            name:
              'Festival Cultural de Zamora',
          },
        );

        await act(async () => {
          fireEvent.click(
            screen.getByText(
              'Publicar',
              {
                selector:
                  'ion-button',
              },
            ),
          );
        });

        expect(
          adminEventRepository
            .publishEvent,
        ).toHaveBeenCalledWith(
          7,
          'access-admin',
        );
      },
    );
    it(
      'permite rechazar un evento revisable',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          event,
        );

        vi.mocked(
          adminEventRepository
            .reviewEvent,
        ).mockResolvedValueOnce({
          ...event,
          estadoRevision:
            'RECHAZADO',
        });

        renderDetail();

        await screen.findByRole(
          'heading',
          {
            name:
              'Festival Cultural de Zamora',
          },
        );

        await act(async () => {
          fireEvent.click(
            screen.getByText(
              'Rechazar',
              {
                selector:
                  'ion-button',
              },
            ),
          );
        });

        expect(
          adminEventRepository
            .reviewEvent,
        ).toHaveBeenCalledWith(
          7,
          {
            decision:
              'RECHAZAR',
          },
          'access-admin',
        );
      },
    );
    it(
      'representa un evento administrativo no encontrado',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          null,
        );

        renderDetail(
          '/gestion/admin/eventos/99',
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Evento no encontrado',
            },
          ),
        ).toBeInTheDocument();

        expect(
          adminEventRepository
            .getAdminEventById,
        ).toHaveBeenCalledWith(
          99,
          'access-admin',
        );
      },
    );

    it(
      'elimina lógicamente un evento solo después de confirmarlo',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockResolvedValueOnce(
          event,
        );

        vi.mocked(
          adminEventRepository
            .deleteEvent,
        ).mockResolvedValueOnce(
          undefined,
        );

        renderDetail();

        await screen.findByRole(
          'heading',
          {
            name:
              'Festival Cultural de Zamora',
          },
        );

        fireEvent.click(
          screen.getByText(
            'Eliminar evento',
            {
              selector:
                'ion-button',
            },
          ),
        );

        expect(
          adminEventRepository
            .deleteEvent,
        ).not.toHaveBeenCalled();

        expect(
          screen.getByText(
            'Esta acción marcará el evento como eliminado y dejará de estar disponible.',
          ),
        ).toBeInTheDocument();

        await act(async () => {
          fireEvent.click(
            screen.getByText(
              'Confirmar eliminación',
              {
                selector:
                  'ion-button',
              },
            ),
          );
        });

        expect(
          adminEventRepository
            .deleteEvent,
        ).toHaveBeenCalledWith(
          7,
          'access-admin',
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Administración de eventos de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'representa un error del servidor',
      async () => {
        vi.mocked(
          adminEventRepository
            .getAdminEventById,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'server',
            'Remote server error',
            503,
          ),
        );

        renderDetail();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No pudimos cargar el evento',
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

    it.each([
      '/gestion/admin/eventos/0',
      '/gestion/admin/eventos/01',
      '/gestion/admin/eventos/1.5',
      '/gestion/admin/eventos/-1',
      '/gestion/admin/eventos/2147483648',
    ])(
      'rechaza el identificador inválido %s sin consultar el backend',
      async (
        initialEntry,
      ) => {
        renderDetail(
          initialEntry,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Enlace de evento inválido',
            },
          ),
        ).toBeInTheDocument();

        expect(
          adminEventRepository
            .getAdminEventById,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
