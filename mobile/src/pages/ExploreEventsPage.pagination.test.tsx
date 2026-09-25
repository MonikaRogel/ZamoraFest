import {
  fireEvent,
  render,
  screen,
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
} from 'react-router-dom';

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import {
  ApplicationStateProvider,
} from '../state/ApplicationStateContext';
import type {
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

interface EventFixtureInput {
  readonly id:
    number;

  readonly title:
    string;

  readonly start:
    string;
}

function createEventFixture({
  id,
  title,
  start,
}: EventFixtureInput): Evento {
  return {
    id,
    titulo:
      title,
    descripcion:
      `Descripción del evento ${id}.`,
    fechaInicio:
      start,
    fechaFin:
      null,
    costoReferencial:
      0,
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
      id,
      nombre:
        `Lugar ${id}`,
      tipoLugar:
        'PARQUE',
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
        id: 1,
        nombre:
          'Cultura',
        descripcion:
          null,
      },
    ],
  };
}

const firstEvent =
  createEventFixture({
    id: 1,
    title:
      'Festival Cultural de Zamora',
    start:
      '2026-09-25T18:00:00.000Z',
  });

const secondEvent =
  createEventFixture({
    id: 2,
    title:
      'Feria Gastronómica Provincial',
    start:
      '2026-09-27T15:00:00.000Z',
  });

const thirdEvent =
  createEventFixture({
    id: 3,
    title:
      'Encuentro de Artes de Zamora Chinchipe',
    start:
      '2026-09-30T17:00:00.000Z',
  });

function renderExplore() {
  return render(
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[
          '/explore',
        ]}
      >
        <ExploreEventsPage />
      </MemoryRouter>
    </ApplicationStateProvider>,
  );
}

describe(
  'ExploreEventsPage pagination',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it(
      'acumula la página siguiente sin duplicados y deja de ofrecer más páginas al llegar al final',
      async () => {
        vi.spyOn(
          Date,
          'now',
        ).mockReturnValue(
          new Date(
            '2026-09-24T12:00:00.000Z',
          ).getTime(),
        );

        vi.mocked(
          eventRepository
            .listEventPage,
        )
          .mockResolvedValueOnce({
            events: [
              firstEvent,
              secondEvent,
            ],
            meta: {
              page: 1,
              limit: 5,
              total: 3,
              totalPages: 2,
            },
          })
          .mockResolvedValueOnce({
            events: [
              secondEvent,
              thirdEvent,
            ],
            meta: {
              page: 2,
              limit: 5,
              total: 3,
              totalPages: 2,
            },
          });

        renderExplore();

        const loadMoreButton =
          await screen.findByText(
            'Cargar más',
            {
              selector:
                'ion-button',
            },
          );

        expect(
          eventRepository
            .listEventPage,
        ).toHaveBeenNthCalledWith(
          1,
          {
            page: 1,
            limit: 5,
          },
        );

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
          screen.getByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).toBeInTheDocument();

        fireEvent.click(
          loadMoreButton,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Encuentro de Artes de Zamora Chinchipe',
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
          screen.getAllByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).toHaveLength(
          1,
        );

        expect(
          eventRepository
            .listEventPage,
        ).toHaveBeenNthCalledWith(
          2,
          {
            page: 2,
            limit: 5,
          },
        );

        expect(
          eventRepository
            .listEventPage,
        ).toHaveBeenCalledTimes(
          2,
        );

        expect(
          screen.queryByText(
            'Cargar más',
            {
              selector:
                'ion-button',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'conserva los eventos cargados y permite reintentar cuando falla la página siguiente',
      async () => {
        vi.spyOn(
          Date,
          'now',
        ).mockReturnValue(
          new Date(
            '2026-09-24T12:00:00.000Z',
          ).getTime(),
        );

        vi.mocked(
          eventRepository
            .listEventPage,
        )
          .mockResolvedValueOnce({
            events: [
              firstEvent,
              secondEvent,
            ],
            meta: {
              page: 1,
              limit: 5,
              total: 3,
              totalPages: 2,
            },
          })
          .mockRejectedValueOnce(
            new EventRepositoryError(
              'server',
              'Remote server error',
              500,
            ),
          );

        renderExplore();

        const loadMoreButton =
          await screen.findByText(
            'Cargar más',
            {
              selector:
                'ion-button',
            },
          );

        fireEvent.click(
          loadMoreButton,
        );

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.',
        );

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
          screen.getByRole(
            'heading',
            {
              name:
                'Feria Gastronómica Provincial',
            },
          ),
        ).toBeInTheDocument();

        expect(
          eventRepository
            .listEventPage,
        ).toHaveBeenNthCalledWith(
          2,
          {
            page: 2,
            limit: 5,
          },
        );

        expect(
          screen.getByText(
            'Cargar más',
            {
              selector:
                'ion-button',
            },
          ),
        ).toBeInTheDocument();
      },
    );
  },
);
