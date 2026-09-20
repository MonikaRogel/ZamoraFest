import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  remoteError,
  remoteLoading,
  remoteSuccess,
  type RemoteData,
} from '../../state/remote-data';
import {
  EventFormDataRepositoryError,
  type EventFormData,
  type EventFormDataRepository,
} from './event-form-data-repository';
import {
  eventFormDataRepository,
} from './remote-event-form-data-repository';

function getEventFormDataErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    EventFormDataRepositoryError
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
      return 'Las categorías y los lugares no están disponibles temporalmente. Intente nuevamente en unos momentos.';
    }
  }

  return 'No fue posible cargar las categorías y los lugares. Intente nuevamente.';
}

export interface UseEventFormDataResult {
  readonly state:
    RemoteData<
      EventFormData,
      string
    >;

  readonly reload:
    () => void;
}

export function useEventFormData(
  repository:
    EventFormDataRepository =
      eventFormDataRepository,
): UseEventFormDataResult {
  const [
    requestVersion,
    setRequestVersion,
  ] =
    useState(0);

  const [
    state,
    setState,
  ] =
    useState<
      RemoteData<
        EventFormData,
        string
      >
    >(
      remoteLoading(),
    );

  const reload =
    useCallback(
      () => {
        setState(
          remoteLoading(),
        );

        setRequestVersion(
          (current) =>
            current + 1,
        );
      },
      [],
    );

  useEffect(
    () => {
      let active =
        true;

      void repository
        .load()
        .then(
          (data) => {
            if (
              !active
            ) {
              return;
            }

            setState(
              remoteSuccess(
                data,
              ),
            );
          },
          (error: unknown) => {
            if (
              !active
            ) {
              return;
            }

            setState(
              remoteError(
                getEventFormDataErrorMessage(
                  error,
                ),
              ),
            );
          },
        );

      return () => {
        active =
          false;
      };
    },
    [
      repository,
      requestVersion,
    ],
  );

  return {
    state,
    reload,
  };
}