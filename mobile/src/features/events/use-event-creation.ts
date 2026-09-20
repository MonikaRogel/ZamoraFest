import {
  useCallback,
  useState,
} from 'react';

import {
  remoteError,
  remoteIdle,
  remoteLoading,
  remoteSuccess,
  type RemoteData,
} from '../../state/remote-data';
import type {
  CreateEventoRequest,
  Evento,
} from '../../types/api';
import {
  EventCreateRepositoryError,
  type EventCreateRepository,
} from './event-create-repository';
import {
  eventCreateRepository,
} from './remote-event-create-repository';

function getCreationErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    EventCreateRepositoryError
  ) {
    if (
      error.kind ===
      'connection'
    ) {
      return 'No fue posible conectarse con ZamoraFest. Revise su conexión e intente nuevamente.';
    }

    if (
      error.kind ===
      'server'
    ) {
      return 'El servicio de creación no está disponible temporalmente. Intente nuevamente en unos momentos.';
    }

    if (
      error.status ===
      401
    ) {
      return 'La sesión no pudo autorizar la creación del evento.';
    }

    if (
      error.status ===
      403
    ) {
      return 'La sesión no tiene permisos para crear eventos.';
    }
  }

  return 'No fue posible crear el evento. Revise los datos e intente nuevamente.';
}

export interface UseEventCreationResult {
  readonly state:
    RemoteData<
      Evento,
      string
    >;

  readonly failure:
    EventCreateRepositoryError | null;

  readonly create:
    (
      input:
        CreateEventoRequest,
      accessToken:
        string,
    ) => Promise<Evento | null>;

  readonly reset:
    () => void;
}

export function useEventCreation(
  repository:
    EventCreateRepository =
      eventCreateRepository,
): UseEventCreationResult {
  const [
    state,
    setState,
  ] =
    useState<
      RemoteData<
        Evento,
        string
      >
    >(
      remoteIdle(),
    );

  const [
    failure,
    setFailure,
  ] =
    useState<
      EventCreateRepositoryError | null
    >(
      null,
    );

  const create =
    useCallback(
      async (
        input:
          CreateEventoRequest,
        accessToken:
          string,
      ) => {
        setFailure(
          null,
        );

        setState(
          remoteLoading(),
        );

        try {
          const evento =
            await repository
              .create(
                input,
                accessToken,
              );

          setFailure(
            null,
          );

          setState(
            remoteSuccess(
              evento,
            ),
          );

          return evento;
        } catch (error) {
          setFailure(
            error instanceof
              EventCreateRepositoryError
              ? error
              : null,
          );

          setState(
            remoteError(
              getCreationErrorMessage(
                error,
              ),
            ),
          );

          return null;
        }
      },
      [
        repository,
      ],
    );

  const reset =
    useCallback(
      () => {
        setFailure(
          null,
        );

        setState(
          remoteIdle(),
        );
      },
      [],
    );

  return {
    state,
    failure,
    create,
    reset,
  };
}
