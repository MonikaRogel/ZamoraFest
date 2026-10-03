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
  createRemoteAdminEventRepository,
} from './remote-admin-event-repository';

const adminEvent: Evento = {
  id: 301,
  titulo: 'Festival Cultural de Zamora',
  descripcion: 'Evento pendiente de revisión administrativa.',
  fechaInicio: '2026-10-20T18:00:00.000',
  fechaFin: '2026-10-20T22:00:00.000',
  costoReferencial: 0,
  estadoEvento: 'BORRADOR',
  estadoRevision: 'PENDIENTE',
  fuenteInformacion: 'GAD Municipal',
  fechaCreacion: '2026-09-29T15:00:00.000',
  fechaActualizacion: '2026-09-29T15:05:00.000',
  fechaRevision: null,
  lugar: {
    id: 1,
    nombre: 'Parque Central',
    tipoLugar: 'PARQUE',
    direccionReferencial: 'Centro de Zamora',
    referencia: null,
    latitud: -4.066,
    longitud: -78.956,
    sector: {
      id: 1,
      nombre: 'Centro',
      tipoSector: 'BARRIO',
      parroquia: {
        id: 1,
        nombre: 'Zamora',
        codigoDpa: '190150',
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
    id: 7,
    nombreCompleto: 'Asistente Demo',
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
};

const adminResponse: EventosResponse = {
  data: [adminEvent],
  meta: {
    page: 2,
    limit: 10,
    total: 11,
    totalPages: 2,
  },
};

describe(
  'RemoteAdminEventRepository',
  () => {
    it(
      'consulta el listado administrativo conservando filtros, paginación y token',
      async () => {
        const getAdminEventos =
          vi.fn()
            .mockResolvedValueOnce(
              adminResponse,
            );

        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos,
            getAdminEventoById:
              vi.fn(),
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn(),
            deleteEvento:
              vi.fn(),
          });

        const query = {
          page: 2,
          limit: 10,
          estadoRevision:
            'PENDIENTE',
          estadoEvento:
            'BORRADOR',
        } as const;

        await expect(
          repository
            .listAdminEventPage(
              query,
              'access-admin',
            ),
        ).resolves.toEqual({
          events: [
            adminEvent,
          ],
          meta:
            adminResponse.meta,
        });

        expect(
          getAdminEventos,
        ).toHaveBeenCalledWith(
          query,
          'access-admin',
        );
      },
    );

    it(
      'consulta el detalle administrativo conservando id y token',
      async () => {
        const getAdminEventoById =
          vi.fn()
            .mockResolvedValueOnce(
              adminEvent,
            );

        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById,
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn(),
            deleteEvento:
              vi.fn(),
          });

        await expect(
          repository
            .getAdminEventById(
              301,
              'access-admin',
            ),
        ).resolves.toEqual(
          adminEvent,
        );

        expect(
          getAdminEventoById,
        ).toHaveBeenCalledWith(
          301,
          'access-admin',
        );
      },
    );

    it(
      'devuelve null cuando el detalle administrativo no existe',
      async () => {
        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById:
              vi.fn()
                .mockRejectedValueOnce(
                  new ApiRequestError(
                    'HTTP 404',
                    404,
                  ),
                ),
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn(),
            deleteEvento:
              vi.fn(),
          });

        await expect(
          repository
            .getAdminEventById(
              999,
              'access-admin',
            ),
        ).resolves.toBeNull();
      },
    );

    it(
      'delega la decisión de revisión con el token del administrador',
      async () => {
        const approvedEvent: Evento = {
          ...adminEvent,
          estadoRevision:
            'APROBADO',
          fechaRevision:
            '2026-09-29T16:00:00.000',
        };

        const reviewEvento =
          vi.fn()
            .mockResolvedValueOnce(
              approvedEvent,
            );

        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById:
              vi.fn(),
            reviewEvento,
            publishEvento:
              vi.fn(),
            deleteEvento:
              vi.fn(),
          });

        const decision = {
          decision:
            'APROBAR',
        } as const;

        await expect(
          repository
            .reviewEvent(
              301,
              decision,
              'access-admin',
            ),
        ).resolves.toEqual(
          approvedEvent,
        );

        expect(
          reviewEvento,
        ).toHaveBeenCalledWith(
          301,
          decision,
          'access-admin',
        );
      },
    );

    it(
      'delega la publicación con el token del administrador',
      async () => {
        const publishedEvent: Evento = {
          ...adminEvent,
          estadoRevision:
            'APROBADO',
          estadoEvento:
            'PROGRAMADO',
        };

        const publishEvento =
          vi.fn()
            .mockResolvedValueOnce(
              publishedEvent,
            );

        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById:
              vi.fn(),
            reviewEvento:
              vi.fn(),
            publishEvento,
            deleteEvento:
              vi.fn(),
          });

        await expect(
          repository
            .publishEvent(
              301,
              'access-admin',
            ),
        ).resolves.toEqual(
          publishedEvent,
        );

        expect(
          publishEvento,
        ).toHaveBeenCalledWith(
          301,
          'access-admin',
        );
      },
    );

    it(
      'traduce un rechazo HTTP conservando el estado recibido',
      async () => {
        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn()
                .mockRejectedValueOnce(
                  new ApiRequestError(
                    'HTTP 403',
                    403,
                  ),
                ),
            getAdminEventoById:
              vi.fn(),
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn(),
            deleteEvento:
              vi.fn(),
          });

        const request =
          repository
            .listAdminEventPage(
              {
                page: 1,
                limit: 20,
              },
              'access-admin',
            );

        await expect(
          request,
        ).rejects.toBeInstanceOf(
          EventRepositoryError,
        );

        await expect(
          request,
        ).rejects.toMatchObject({
          kind:
            'request',
          status:
            403,
        });
      },
    );

    it(
      'traduce un fallo de conexión',
      async () => {
        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById:
              vi.fn(),
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn()
                .mockRejectedValueOnce(
                  new ApiRequestError(
                    'Sin conexión.',
                    null,
                  ),
                ),
            deleteEvento:
              vi.fn(),
          });

        await expect(
          repository
            .publishEvent(
              301,
              'access-admin',
            ),
        ).rejects.toMatchObject({
          name:
            'EventRepositoryError',
          kind:
            'connection',
          status:
            null,
        });
      },
    );
    it(
      'delega la eliminación lógica con el token del administrador',
      async () => {
        const deleteEvento =
          vi.fn()
            .mockResolvedValueOnce(
              undefined,
            );

        const repository =
          createRemoteAdminEventRepository({
            getAdminEventos:
              vi.fn(),
            getAdminEventoById:
              vi.fn(),
            reviewEvento:
              vi.fn(),
            publishEvento:
              vi.fn(),
            deleteEvento,
          });

        await expect(
          repository
            .deleteEvent(
              301,
              'access-admin',
            ),
        ).resolves.toBeUndefined();

        expect(
          deleteEvento,
        ).toHaveBeenCalledWith(
          301,
          'access-admin',
        );
      },
    );
  },
);
