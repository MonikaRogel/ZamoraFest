import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import type { EventosResponse } from '../types/api';
import ExploreEventsPage from './ExploreEventsPage';

vi.mock('../services/api/zamorafest-api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    readonly status: number | null;

    constructor(message: string, status: number | null = null) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
  zamoraFestApi: {
    getEventos: vi.fn(),
  },
}));

const eventosResponse: EventosResponse = {
  data: [
    {
      id: 1,
      titulo: 'Festival Cultural de Zamora',
      descripcion: 'Música, danza y tradiciones locales.',
      fechaInicio: '2026-09-20T18:00:00.000Z',
      fechaFin: null,
      costoReferencial: 0,
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
      fuenteInformacion: null,
      fechaCreacion: '2026-09-01T12:00:00.000Z',
      fechaActualizacion: '2026-09-01T12:00:00.000Z',
      fechaRevision: null,
      lugar: {
        id: 1,
        nombre: 'Parque Central de Zamora',
        tipoLugar: 'PARQUE',
        direccionReferencial: 'Centro de Zamora',
        referencia: null,
        latitud: -4.069,
        longitud: -78.956,
        sector: {
          id: 1,
          nombre: 'Centro',
          tipoSector: 'URBANO',
          parroquia: {
            id: 1,
            nombre: 'Zamora',
            codigoDpa: '190101',
            canton: {
              id: 1,
              nombre: 'Zamora',
              codigoDpa: '1901',
              provincia: {
                id: 1,
                nombre: 'Zamora Chinchipe',
                codigoDpa: '19',
              },
            },
          },
        },
      },
      usuarioCreador: {
        id: 1,
        nombreCompleto: 'Gestor Cultural',
        rol: {
          id: 2,
          nombre: 'ASISTENTE',
        },
      },
      usuarioRevisor: null,
      categorias: [
        {
          id: 1,
          nombre: 'Cultura',
          descripcion: null,
        },
      ],
    },
    {
      id: 2,
      titulo: 'Feria Gastronómica Provincial',
      descripcion: 'Productos y gastronomía de la provincia.',
      fechaInicio: '2026-09-25T15:00:00.000Z',
      fechaFin: null,
      costoReferencial: 2,
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
      fuenteInformacion: null,
      fechaCreacion: '2026-09-02T12:00:00.000Z',
      fechaActualizacion: '2026-09-02T12:00:00.000Z',
      fechaRevision: null,
      lugar: {
        id: 2,
        nombre: 'Recinto Ferial',
        tipoLugar: 'RECINTO',
        direccionReferencial: 'Zamora',
        referencia: null,
        latitud: null,
        longitud: null,
        sector: {
          id: 1,
          nombre: 'Centro',
          tipoSector: 'URBANO',
          parroquia: {
            id: 1,
            nombre: 'Zamora',
            codigoDpa: '190101',
            canton: {
              id: 1,
              nombre: 'Zamora',
              codigoDpa: '1901',
              provincia: {
                id: 1,
                nombre: 'Zamora Chinchipe',
                codigoDpa: '19',
              },
            },
          },
        },
      },
      usuarioCreador: {
        id: 1,
        nombreCompleto: 'Gestor Cultural',
        rol: {
          id: 2,
          nombre: 'ASISTENTE',
        },
      },
      usuarioRevisor: null,
      categorias: [
        {
          id: 2,
          nombre: 'Gastronomía',
          descripcion: null,
        },
      ],
    },
  ],
  meta: {
    page: 1,
    limit: 5,
    total: 2,
    totalPages: 1,
  },
};

describe('ExploreEventsPage', () => {
  it('muestra el estado de carga mientras espera la API', () => {
    vi.mocked(zamoraFestApi.getEventos).mockReturnValueOnce(
      new Promise(() => undefined),
    );

    render(<ExploreEventsPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Cargando eventos',
      }),
    ).toBeInTheDocument();
  });

it('destaca como próximo el evento futuro más cercano', async () => {
  const dateNowSpy = vi
    .spyOn(Date, 'now')
    .mockReturnValue(
      new Date('2026-09-18T12:00:00.000Z').getTime(),
    );

  vi.mocked(zamoraFestApi.getEventos).mockResolvedValueOnce(
    eventosResponse,
  );

  render(<ExploreEventsPage />);

  const nextEventHeading = await screen.findByRole('heading', {
    name: 'Próximo evento',
  });

  const nextEventSection = nextEventHeading.closest('section');

  expect(nextEventSection).not.toBeNull();

  expect(
    within(nextEventSection!).getByRole('heading', {
      name: 'Festival Cultural de Zamora',
    }),
  ).toBeInTheDocument();

  expect(
    within(nextEventSection!).queryByRole('heading', {
      name: 'Feria Gastronómica Provincial',
    }),
  ).not.toBeInTheDocument();

  dateNowSpy.mockRestore();
});

  it('muestra eventos y permite filtrarlos por categoría', async () => {
    vi.mocked(zamoraFestApi.getEventos).mockResolvedValueOnce(
      eventosResponse,
    );

    render(<ExploreEventsPage />);

    expect(
      await screen.findByRole('heading', {
        name: 'Festival Cultural de Zamora',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Feria Gastronómica Provincial',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Gastronomía',
      }),
    );

    expect(
      screen.queryByRole('heading', {
        name: 'Festival Cultural de Zamora',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Feria Gastronómica Provincial',
      }),
    ).toBeInTheDocument();
  });

  it('traduce un error del servidor a un mensaje para el usuario', async () => {
    vi.mocked(zamoraFestApi.getEventos).mockRejectedValueOnce(
      new ApiRequestError('HTTP 500', 500),
    );

    render(<ExploreEventsPage />);

    expect(
      await screen.findByRole('heading', {
        name: 'No pudimos cargar los eventos',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.',
      ),
    ).toBeInTheDocument();
  });
});