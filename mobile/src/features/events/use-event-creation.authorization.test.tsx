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
import type {
  AuthSession,
  CreateEventoRequest,
} from '../../types/api';
import {
  EventCreateRepositoryError,
  type EventCreateRepository,
} from './event-create-repository';
import {
  useEventCreation,
} from './use-event-creation';

const session:
  AuthSession = {
    accessToken:
      'access-asistente',

    refreshToken:
      'refresh-asistente',

    tokenType:
      'Bearer',

    expiresIn:
      900,

    usuario: {
      id:
        10,

      nombre:
        'Asistente Demo',

      email:
        'asistente@zamorafest.test',

      rol:
        'ASISTENTE',
    },
  };

const input:
  CreateEventoRequest = {
    titulo:
      'Festival Amazónico',

    descripcion:
      'Encuentro cultural.',

    fechaInicio:
      '2026-09-25T18:00',

    fechaFin:
      '2026-09-25T22:00',

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

function useAuthorizationTestSubject(
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

function prepareAuthenticatedState(
  result:
    ReturnType<
      typeof renderSubject
    >['result'],
) {
  act(
    () => {
      result
        .current
        .application
        .login(
          session,
        );

      result
        .current
        .application
        .setPendingDestination(
          '/gestion/eventos/nuevo',
        );

      result
        .current
        .application
        .updateEventDraft({
          titulo:
            'Festival Amazónico',

          lugarId:
            73,

          categoriaIds: [
            41,
          ],
        });
    },
  );
}

function renderSubject(
  repository:
    EventCreateRepository,
) {
  return renderHook(
    () =>
      useAuthorizationTestSubject(
        repository,
      ),
    {
      wrapper:
        Wrapper,
    },
  );
}

describe(
  'useEventCreation - autorización 401 y 403',
  () => {
    it(
      'invalida la sesión ante 401 y conserva destino y borrador',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () => {
              throw new EventCreateRepositoryError(
                'request',
                'El token de acceso no es válido o ha expirado.',
                401,
                {
                  code:
                    'INVALID_ACCESS_TOKEN',
                },
              );
            },
          );

        const {
          result,
        } =
          renderSubject({
            create,
          });

        prepareAuthenticatedState(
          result,
        );

        expect(
          result
            .current
            .application
            .session,
        ).toEqual(
          session,
        );

        await act(
          async () => {
            const response =
              await result
                .current
                .creation
                .create(
                  input,
                  session
                    .accessToken,
                );

            expect(
              response,
            ).toBeNull();
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
            .failure,
        ).toMatchObject({
          status:
            401,

          code:
            'INVALID_ACCESS_TOKEN',
        });

        expect(
          result
            .current
            .creation
            .state,
        ).toEqual({
          status:
            'error',

          error:
            'La sesión no pudo autorizar la creación del evento.',
        });

        expect(
          result
            .current
            .application
            .session,
        ).toBeNull();

        expect(
          result
            .current
            .application
            .user,
        ).toBeNull();

        expect(
          result
            .current
            .application
            .role,
        ).toBeNull();

        expect(
          result
            .current
            .application
            .accessToken,
        ).toBeNull();

        expect(
          result
            .current
            .application
            .refreshToken,
        ).toBeNull();

        expect(
          result
            .current
            .application
            .pendingDestination,
        ).toBe(
          '/gestion/eventos/nuevo',
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

    it(
      'mantiene la sesión ante 403 y conserva un mensaje de permiso insuficiente',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () => {
              throw new EventCreateRepositoryError(
                'request',
                'No tiene permisos para realizar esta operación.',
                403,
                {
                  code:
                    'FORBIDDEN',
                },
              );
            },
          );

        const {
          result,
        } =
          renderSubject({
            create,
          });

        prepareAuthenticatedState(
          result,
        );

        await act(
          async () => {
            const response =
              await result
                .current
                .creation
                .create(
                  input,
                  session
                    .accessToken,
                );

            expect(
              response,
            ).toBeNull();
          },
        );

        expect(
          result
            .current
            .creation
            .failure,
        ).toMatchObject({
          status:
            403,

          code:
            'FORBIDDEN',
        });

        expect(
          result
            .current
            .creation
            .state,
        ).toEqual({
          status:
            'error',

          error:
            'La sesión no tiene permisos para crear eventos.',
        });

        expect(
          result
            .current
            .application
            .session,
        ).toEqual(
          session,
        );

        expect(
          result
            .current
            .application
            .user,
        ).toEqual(
          session.usuario,
        );

        expect(
          result
            .current
            .application
            .role,
        ).toBe(
          'ASISTENTE',
        );

        expect(
          result
            .current
            .application
            .accessToken,
        ).toBe(
          'access-asistente',
        );

        expect(
          result
            .current
            .application
            .refreshToken,
        ).toBe(
          'refresh-asistente',
        );

        expect(
          result
            .current
            .application
            .pendingDestination,
        ).toBe(
          '/gestion/eventos/nuevo',
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
      },
    );
  },
);