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
  useLocation,
} from 'react-router-dom';

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import type {
  Evento,
} from '../types/api';
import ExploreEventsPage from './ExploreEventsPage';

vi.mock(
  '../features/events/remote-event-repository',
  () => ({
    eventRepository: {
      listEvents: vi.fn(),
      getEventById: vi.fn(),
    },
  }),
);

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
    fechaFin: null,
    costoReferencial: 0,
    estadoEvento:
      'PROGRAMADO',
    estadoRevision:
      'APROBADO',
    fuenteInformacion: null,
    fechaCreacion:
      '2026-09-01T12:00:00.000Z',
    fechaActualizacion:
      '2026-09-01T12:00:00.000Z',
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
  },

  {
    id: 2,
    titulo:
      'Feria Gastronómica Provincial',
    descripcion:
      'Productos y gastronomía de la provincia.',
    fechaInicio:
      '2026-09-25T15:00:00.000Z',
    fechaFin: null,
    costoReferencial: 2,
    estadoEvento:
      'PROGRAMADO',
    estadoRevision:
      'APROBADO',
    fuenteInformacion: null,
    fechaCreacion:
      '2026-09-02T12:00:00.000Z',
    fechaActualizacion:
      '2026-09-02T12:00:00.000Z',
    fechaRevision: null,
    lugar: {
      id: 2,
      nombre:
        'Recinto Ferial',
      tipoLugar:
        'RECINTO',
      direccionReferencial:
        'Zamora',
      referencia: null,
      latitud: null,
      longitud: null,
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
        id: 2,
        nombre:
          'Gastronomía',
        descripcion: null,
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

function renderExplore() {
  return render(
    <MemoryRouter
      initialEntries={[
        '/explore',
      ]}
    >
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
    </MemoryRouter>,
  );
}

describe(
  'ExploreEventsPage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
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