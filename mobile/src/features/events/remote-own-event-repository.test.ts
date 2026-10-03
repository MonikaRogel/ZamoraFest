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
  createRemoteOwnEventRepository,
} from './remote-own-event-repository';

const ownEvent:
  Evento = {
  id: 101,
  titulo:
    'Festival propio',
  descripcion:
    'Borrador del asistente.',
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
    id: 1,
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
      id: 1,
      nombre:
        'Cabecera parroquial',
      tipoSector:
        'CABECERA_PARROQUIAL',
      parroquia: {
        id: 1,
        nombre:
          'Zamora',
        codigoDpa:
          '190150',
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
    id: 7,
    nombreCompleto:
      'Asistente Demo',
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
        'Festividades',
      descripcion:
        null,
    },
  ],
};

const response:
  EventosResponse = {
  data: [
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
};

describe(
  'RemoteOwnEventRepository',
  () => {
    it(
      'consulta eventos propios conservando paginación y token de acceso',
      async () => {
        const getOwnEventos =
          vi.fn()
            .mockResolvedValueOnce(
              response,
            );

        const repository =
          createRemoteOwnEventRepository({
            getOwnEventos,
            getOwnEventoById:
              vi.fn(),
            updateEvento:
              vi.fn(),
          });

        const query = {
          page:
            1,
          limit:
            20,
        };

        await expect(
          repository
            .listOwnEventPage(
              query,
              'access-asistente',
            ),
        ).resolves.toEqual({
          events: [
            ownEvent,
          ],
          meta:
            response.meta,
        });

        expect(
          getOwnEventos,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          getOwnEventos,
        ).toHaveBeenCalledWith(
          query,
          'access-asistente',
        );
      },
    );

    it(
      'traduce un rechazo HTTP conservando el estado recibido',
      async () => {
        const getOwnEventos =
          vi.fn()
            .mockRejectedValueOnce(
              new ApiRequestError(
                'HTTP 403',
                403,
              ),
            );

        const repository =
          createRemoteOwnEventRepository({
            getOwnEventos,
            getOwnEventoById:
              vi.fn(),
            updateEvento:
              vi.fn(),
          });

        const request =
          repository
            .listOwnEventPage(
              {
                page:
                  1,
                limit:
                  20,
              },
              'access-asistente',
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
      'obtiene el detalle propio por id conservando el token de acceso',
      async () => {
        const getOwnEventoById =
          vi.fn()
            .mockResolvedValueOnce(
              ownEvent,
            );

        const repository =
          createRemoteOwnEventRepository({
            getOwnEventos:
              vi.fn(),
            getOwnEventoById,
            updateEvento:
              vi.fn(),
          } as never);

        await expect(
          repository
            .getOwnEventById(
              101,
              'access-asistente',
            ),
        ).resolves.toEqual(
          ownEvent,
        );

        expect(
          getOwnEventoById,
        ).toHaveBeenCalledWith(
          101,
          'access-asistente',
        );
      },
    );

    it(
      'actualiza un evento propio conservando id, cambios y token',
      async () => {
        const updateEvento =
          vi.fn()
            .mockResolvedValueOnce({
              ...ownEvent,
              titulo:
                'Festival propio actualizado',
            });

        const repository =
          createRemoteOwnEventRepository({
            getOwnEventos:
              vi.fn(),
            getOwnEventoById:
              vi.fn(),
            updateEvento,
          } as never);

        const input = {
          titulo:
            'Festival propio actualizado',
        };

        await expect(
          repository
            .updateOwnEvent(
              101,
              input,
              'access-asistente',
            ),
        ).resolves.toMatchObject({
          id:
            101,
          titulo:
            'Festival propio actualizado',
        });

        expect(
          updateEvento,
        ).toHaveBeenCalledWith(
          101,
          input,
          'access-asistente',
        );
      },
    );
  },
);