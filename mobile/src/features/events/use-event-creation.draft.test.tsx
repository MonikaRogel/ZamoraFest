import {
  act,
  renderHook,
} from '@testing-library/react';
import type {
  ReactNode,
} from 'react';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ApplicationStateProvider,
  useApplicationState,
} from '../../state/ApplicationStateContext';
import {
  initialEventDraft,
} from '../../state/application-state';
import type {
  CreateEventoRequest,
  Evento,
} from '../../types/api';
import {
  EventCreateRepositoryError,
  type EventCreateRepository,
} from './event-create-repository';
import {
  useEventCreation,
} from './use-event-creation';

const input:
  CreateEventoRequest = {
    titulo:
      'Festival Amazónico',

    descripcion:
      'Encuentro cultural.',

    fechaInicio:
      '2026-09-25T18:00',

    fechaFin:
      null,

    costoReferencial:
      5.5,

    lugarId:
      73,

    categoriaIds: [
      41,
    ],

    fuenteInformacion:
      null,
  };

const createdEvent:
  Evento = {
    id:
      501,

    titulo:
      'Festival Amazónico',

    descripcion:
      'Encuentro cultural.',

    fechaInicio:
      '2026-09-25T18:00:00.000',

    fechaFin:
      null,

    costoReferencial:
      5.5,

    estadoEvento:
      'BORRADOR',

    estadoRevision:
      'PENDIENTE',

    fuenteInformacion:
      null,

    fechaCreacion:
      '2026-09-22T16:00:00.000',

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
        'Centro de Zamora',

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

function Wrapper({
  children,
}: {
  readonly children:
    ReactNode;
}) {
  return (
    <ApplicationStateProvider>
      {children}
    </ApplicationStateProvider>
  );
}

function useDraftCreationSubject(
  repository:
    EventCreateRepository,
) {
  const application =
    useApplicationState();

  const creation =
    useEventCreation(
      repository,
    );

  return {
    application,
    creation,
  };
}

describe(
  'useEventCreation - borrador',
  () => {
    it(
      'limpia el borrador únicamente después de una creación exitosa',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () =>
              createdEvent,
          );

        const {
          result,
        } =
          renderHook(
            () =>
              useDraftCreationSubject({
                create,
              }),
            {
              wrapper:
                Wrapper,
            },
          );

        act(
          () => {
            result
              .current
              .application
              .updateEventDraft({
                titulo:
                  'Festival Amazónico',

                descripcion:
                  'Encuentro cultural.',

                fechaInicio:
                  '2026-09-25T18:00',

                costoReferencial:
                  '5.50',

                lugarId:
                  73,

                categoriaIds: [
                  41,
                ],
              });
          },
        );

        expect(
          result
            .current
            .application
            .eventDraft
            .titulo,
        ).toBe(
          'Festival Amazónico',
        );

        await act(
          async () => {
            const response =
              await result
                .current
                .creation
                .create(
                  input,
                  'access-asistente',
                );

            expect(
              response,
            ).toEqual(
              createdEvent,
            );
          },
        );

        expect(
          create,
        ).toHaveBeenCalledWith(
          input,
          'access-asistente',
        );

        expect(
          result
            .current
            .creation
            .state,
        ).toEqual({
          status:
            'success',

          data:
            createdEvent,
        });

        expect(
          result
            .current
            .application
            .eventDraft,
        ).toEqual(
          initialEventDraft,
        );
      },
    );

    it(
      'conserva el borrador cuando la creación falla',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () => {
              throw new EventCreateRepositoryError(
                'server',
                'Servicio no disponible.',
                503,
              );
            },
          );

        const {
          result,
        } =
          renderHook(
            () =>
              useDraftCreationSubject({
                create,
              }),
            {
              wrapper:
                Wrapper,
            },
          );

        act(
          () => {
            result
              .current
              .application
              .updateEventDraft({
                titulo:
                  'Festival pendiente',

                lugarId:
                  73,

                categoriaIds: [
                  41,
                ],
              });
          },
        );

        await act(
          async () => {
            const response =
              await result
                .current
                .creation
                .create(
                  input,
                  'access-asistente',
                );

            expect(
              response,
            ).toBeNull();
          },
        );

        expect(
          result
            .current
            .application
            .eventDraft
            .titulo,
        ).toBe(
          'Festival pendiente',
        );

        expect(
          result
            .current
            .application
            .eventDraft
            .lugarId,
        ).toBe(
          73,
        );

        expect(
          result
            .current
            .application
            .eventDraft
            .categoriaIds,
        ).toEqual([
          41,
        ]);
      },
    );
  },
);