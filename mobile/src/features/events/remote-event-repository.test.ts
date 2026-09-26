import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ApiRequestError,
} from '../../services/api/zamorafest-api';
import type {
  Evento,
  EventosResponse,
} from '../../types/api';
import {
  EventRepositoryError,
} from './event-repository';
import {
  createRemoteEventRepository,
} from './remote-event-repository';

const event: Evento = {
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
};

const response:
  EventosResponse = {
  data: [
    event,
  ],
  meta: {
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
  },
};

function createGetEventoByIdMock() {
  return vi.fn();
}

describe(
  'RemoteEventRepository',
  () => {
    it(
      'obtiene eventos mediante la capa HTTP y devuelve únicamente los datos',
      async () => {
        const getEventos =
          vi.fn()
            .mockResolvedValueOnce(
              response,
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        await expect(
          repository.listEvents(),
        ).resolves.toEqual([
          event,
        ]);

        expect(
          getEventos,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          getEventos,
        ).toHaveBeenCalledWith();

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'obtiene una página de eventos conservando la metadata de paginación',
      async () => {
        const pagedResponse:
          EventosResponse = {
          ...response,
          meta: {
            page: 2,
            limit: 10,
            total: 11,
            totalPages: 2,
          },
        };

        const getEventos =
          vi.fn()
            .mockResolvedValueOnce(
              pagedResponse,
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        const query = {
          page: 2,
          limit: 10,
          cantonId: 1,
          categoriaId: 1,
        };

        await expect(
          repository.listEventPage(
            query,
          ),
        ).resolves.toEqual({
          events: [
            event,
          ],
          meta:
            pagedResponse.meta,
        });

        expect(
          getEventos,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          getEventos,
        ).toHaveBeenCalledWith(
          query,
        );

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'traduce un fallo de conexión',
      async () => {
        const getEventos =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'Network error',
                null,
              ),
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        await expect(
          repository.listEvents(),
        ).rejects.toMatchObject({
          name:
            'EventRepositoryError',
          kind:
            'connection',
          status: null,
        });

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'traduce un error HTTP 5xx como fallo del servidor',
      async () => {
        const getEventos =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 503',
                503,
              ),
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        await expect(
          repository.listEvents(),
        ).rejects.toMatchObject({
          name:
            'EventRepositoryError',
          kind:
            'server',
          status: 503,
        });

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'traduce un error HTTP no 5xx como rechazo de solicitud',
      async () => {
        const getEventos =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 400',
                400,
              ),
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        await expect(
          repository.listEvents(),
        ).rejects.toMatchObject({
          name:
            'EventRepositoryError',
          kind:
            'request',
          status: 400,
        });

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'encapsula errores inesperados sin exponer la implementación HTTP',
      async () => {
        const getEventos =
          vi.fn()
            .mockRejectedValueOnce(
              new TypeError(
                'Unexpected failure',
              ),
            );

        const getEventoById =
          createGetEventoByIdMock();

        const repository =
          createRemoteEventRepository({
            getEventos,
            getEventoById,
          });

        const request =
          repository.listEvents();

        await expect(
          request,
        ).rejects.toBeInstanceOf(
          EventRepositoryError,
        );

        await expect(
          request,
        ).rejects.toMatchObject({
          kind:
            'unexpected',
          status: null,
        });

        expect(
          getEventoById,
        ).not.toHaveBeenCalled();
      },
    );
  },
);