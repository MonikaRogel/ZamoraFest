import {
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
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import type {
  Evento,
} from '../types/api';
import EventDetailPage from './EventDetailPage';

vi.mock(
  '../features/events/remote-event-repository',
  () => ({
    eventRepository: {
      listEvents:
        vi.fn(),
      getEventById:
        vi.fn(),
    },
  }),
);

const event: Evento = {
  id: 7,
  titulo:
    'Festival Cultural de Zamora',
  descripcion:
    'Música, danza y tradiciones de Zamora Chinchipe.',
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

function renderDetail(
  initialEntry:
    string = '/eventos/7',
) {
  return render(
    <MemoryRouter
      initialEntries={[
        initialEntry,
      ]}
    >
      <Route
        exact
        path="/eventos/:id"
      >
        <EventDetailPage />
      </Route>
    </MemoryRouter>,
  );
}

describe(
  'EventDetailPage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      'muestra loading mientras consulta el detalle',
      () => {
        vi.mocked(
          eventRepository
            .getEventById,
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
          eventRepository
            .getEventById,
        ).mockResolvedValueOnce(
          event,
        );

        renderDetail(
          '/eventos/7',
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
          eventRepository
            .getEventById,
        ).toHaveBeenCalledWith(
          7,
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
      'representa un evento público no encontrado',
      async () => {
        vi.mocked(
          eventRepository
            .getEventById,
        ).mockResolvedValueOnce(
          null,
        );

        renderDetail(
          '/eventos/99',
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
          eventRepository
            .getEventById,
        ).toHaveBeenCalledWith(
          99,
        );
      },
    );

    it(
      'representa un error del servidor',
      async () => {
        vi.mocked(
          eventRepository
            .getEventById,
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
            'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.',
          ),
        ).toBeInTheDocument();
      },
    );

    it.each([
      '/eventos/0',
      '/eventos/01',
      '/eventos/1.5',
      '/eventos/-1',
      '/eventos/2147483648',
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
          eventRepository
            .getEventById,
        ).not.toHaveBeenCalled();
      },
    );
  },
);