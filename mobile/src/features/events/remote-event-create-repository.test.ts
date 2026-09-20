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
  CreateEventoRequest,
  Evento,
} from '../../types/api';
import {
  EventCreateRepositoryError,
} from './event-create-repository';
import {
  createRemoteEventCreateRepository,
} from './remote-event-create-repository';

const input:
  CreateEventoRequest = {
    titulo:
      'Festival Amazónico',
    descripcion:
      null,
    fechaInicio:
      '2026-09-25T18:00',
    fechaFin:
      null,
    costoReferencial:
      0,
    lugarId:
      73,
    categoriaIds: [
      41,
    ],
    fuenteInformacion:
      null,
  };

const evento:
  Evento = {
    id:
      501,

    titulo:
      'Festival Amazónico',

    descripcion:
      null,

    fechaInicio:
      '2026-09-25T18:00:00.000',

    fechaFin:
      null,

    costoReferencial:
      0,

    estadoEvento:
      'BORRADOR',

    estadoRevision:
      'PENDIENTE',

    fuenteInformacion:
      null,

    fechaCreacion:
      '2026-09-19T20:00:00.000',

    fechaActualizacion:
      null,

    fechaRevision:
      null,

    lugar: {
      id:
        73,

      nombre:
        'Casa Cultural Zamora',

      tipoLugar:
        'CENTRO_CULTURAL',

      direccionReferencial:
        'Centro',

      referencia:
        null,

      latitud:
        null,

      longitud:
        null,

      sector: {
        id:
          31,

        nombre:
          'Centro',

        tipoSector:
          'BARRIO',

        parroquia: {
          id:
            22,

          nombre:
            'Zamora',

          codigoDpa:
            '190150',

          canton: {
            id:
              12,

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
        10,

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
          41,

        nombre:
          'Cultura comunitaria',

        descripcion:
          null,
      },
    ],
  };

describe(
  'RemoteEventCreateRepository',
  () => {
    it(
      'delega la creación con el access token recibido',
      async () => {
        const createEvento =
          vi.fn(
            async () =>
              evento,
          );

        const repository =
          createRemoteEventCreateRepository({
            createEvento,
          });

        await expect(
          repository.create(
            input,
            'access-asistente',
          ),
        ).resolves.toEqual(
          evento,
        );

        expect(
          createEvento,
        ).toHaveBeenCalledWith(
          input,
          'access-asistente',
        );
      },
    );

    it(
      'traduce un fallo de conexión',
      async () => {
        const repository =
          createRemoteEventCreateRepository({
            createEvento:
              vi.fn(
                async () => {
                  throw new ApiRequestError(
                    'Sin conexión.',
                    null,
                  );
                },
              ),
          });

        await expect(
          repository.create(
            input,
            'access-asistente',
          ),
        ).rejects.toMatchObject({
          name:
            'EventCreateRepositoryError',

          kind:
            'connection',

          status:
            null,

          code:
            null,

          details:
            [],
        });
      },
    );

    it(
      'conserva el estado HTTP de una respuesta rechazada',
      async () => {
        const repository =
          createRemoteEventCreateRepository({
            createEvento:
              vi.fn(
                async () => {
                  throw new ApiRequestError(
                    'Forbidden',
                    403,
                  );
                },
              ),
          });

        try {
          await repository.create(
            input,
            'access-asistente',
          );

          throw new Error(
            'La operación debía fallar.',
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            EventCreateRepositoryError,
          );

          expect(
            error,
          ).toMatchObject({
            kind:
              'request',

            status:
              403,

            code:
              null,

            details:
              [],
          });
        }
      },
    );

    it(
      'conserva VALIDATION_ERROR y details con path de un 422',
      async () => {
        const validationBody = {
          error: {
            code:
              'VALIDATION_ERROR',

            message:
              'La solicitud contiene datos inválidos.',

            details: [
              {
                path:
                  'titulo',

                message:
                  'El título es obligatorio.',
              },

              {
                path:
                  'categoriaIds.0',

                message:
                  'La categoría seleccionada no es válida.',
              },
            ],
          },
        };

        const repository =
          createRemoteEventCreateRepository({
            createEvento:
              vi.fn(
                async () => {
                  throw new ApiRequestError(
                    'Unprocessable Entity',
                    422,
                    {
                      body:
                        validationBody,
                    },
                  );
                },
              ),
          });

        try {
          await repository.create(
            input,
            'access-asistente',
          );

          throw new Error(
            'La operación debía fallar.',
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            EventCreateRepositoryError,
          );

          expect(
            error,
          ).toMatchObject({
            kind:
              'request',

            status:
              422,

            code:
              'VALIDATION_ERROR',

            details: [
              {
                path:
                  'titulo',

                message:
                  'El título es obligatorio.',
              },

              {
                path:
                  'categoriaIds.0',

                message:
                  'La categoría seleccionada no es válida.',
              },
            ],
          });
        }
      },
    );

    it(
      'traduce errores inesperados',
      async () => {
        const repository =
          createRemoteEventCreateRepository({
            createEvento:
              vi.fn(
                async () => {
                  throw new Error(
                    'Fallo inesperado.',
                  );
                },
              ),
          });

        await expect(
          repository.create(
            input,
            'access-asistente',
          ),
        ).rejects.toMatchObject({
          name:
            'EventCreateRepositoryError',

          kind:
            'unexpected',

          status:
            null,

          code:
            null,

          details:
            [],
        });
      },
    );
  },
);
