import {
  IonButton,
  IonContent,
  IonPage,
} from '@ionic/react';
import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import {
  useParams,
} from 'react-router-dom';

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  validateEventCreateDraft,
} from '../features/events/event-create-validation';
import type {
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import {
  useEventFormData,
} from '../features/events/use-event-form-data';
import {
  ownEventRepository,
  type OwnEventRepository,
} from '../features/events/remote-own-event-repository';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  EventDraft,
} from '../state/application-state';
import type {
  Evento,
} from '../types/api';

interface EditEventPageProps {
  readonly eventRepository?:
    OwnEventRepository;

  readonly formDataRepository?:
    EventFormDataRepository;
}

type EventLoadState =
  | {
      readonly status:
        'loading';
    }
  | {
      readonly status:
        'success';
      readonly event:
        Evento;
      readonly draft:
        EventDraft;
    }
  | {
      readonly status:
        'error';
      readonly message:
        string;
    };

type UpdateState =
  | {
      readonly status:
        'idle';
    }
  | {
      readonly status:
        'saving';
    }
  | {
      readonly status:
        'success';
      readonly message:
        string;
    }
  | {
      readonly status:
        'error';
      readonly message:
        string;
    };

function toDraft(
  event:
    Evento,
): EventDraft {
  return {
    titulo:
      event.titulo,
    descripcion:
      event.descripcion ?? '',
    fechaInicio:
      event.fechaInicio,
    fechaFin:
      event.fechaFin,
    costoReferencial:
      String(
        event.costoReferencial,
      ),
    lugarId:
      event.lugar.id,
    categoriaIds:
      event.categorias.map(
        (category) =>
          category.id,
      ),
    fuenteInformacion:
      event.fuenteInformacion ??
      '',
  };
}

function isAuthenticationFailure(
  error: unknown,
): boolean {
  return (
    error instanceof
      EventRepositoryError &&
    error.kind ===
      'request' &&
    error.status ===
      401
  );
}

function getLoadErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    EventRepositoryError
  ) {
    if (
      error.kind ===
      'connection'
    ) {
      return 'No fue posible conectarse con ZamoraFest. Revisa tu conexión e intenta nuevamente.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        403
    ) {
      return 'Tu cuenta no tiene autorización para editar este evento.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        404
    ) {
      return 'El evento solicitado no existe o ya no está disponible.';
    }
  }

  return 'No fue posible cargar el evento. Intenta nuevamente.';
}

function getUpdateErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    EventRepositoryError
  ) {
    if (
      error.kind ===
      'connection'
    ) {
      return 'No fue posible conectarse con ZamoraFest. Revisa tu conexión e intenta nuevamente.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        403
    ) {
      return 'Tu cuenta no tiene autorización para editar este evento.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        404
    ) {
      return 'El evento solicitado no existe o ya no está disponible.';
    }
  }

  return 'No fue posible guardar los cambios. Intenta nuevamente.';
}

function EditEventPage({
  eventRepository:
    eventRepositoryProp =
      ownEventRepository,
  formDataRepository,
}: EditEventPageProps) {
  const {
    id,
  } =
    useParams<{
      id: string;
    }>();

  const {
    accessToken,
    invalidateSession,
  } =
    useApplicationState();

  const formDataState =
    useEventFormData(
      formDataRepository,
    ).state;

  const [
    eventState,
    setEventState,
  ] =
    useState<EventLoadState>({
      status:
        'loading',
    });

  const [
    updateState,
    setUpdateState,
  ] =
    useState<UpdateState>({
      status:
        'idle',
    });

  useEffect(
    () => {
      if (
        accessToken ===
        null
      ) {
        return;
      }

      const eventId =
        Number(id);

      if (
        !Number.isInteger(
          eventId,
        ) ||
        eventId <=
          0
      ) {
        setEventState({
          status:
            'error',
          message:
            'El identificador del evento no es válido.',
        });

        return;
      }

      let active =
        true;

      setEventState({
        status:
          'loading',
      });

      void eventRepositoryProp
        .getOwnEventById(
          eventId,
          accessToken,
        )
        .then(
          (event) => {
            if (
              !active
            ) {
              return;
            }

            setEventState({
              status:
                'success',
              event,
              draft:
                toDraft(
                  event,
                ),
            });
          },
          (error: unknown) => {
            if (
              !active
            ) {
              return;
            }

            if (
              isAuthenticationFailure(
                error,
              )
            ) {
              invalidateSession();

              return;
            }

            setEventState({
              status:
                'error',
              message:
                getLoadErrorMessage(
                  error,
                ),
            });
          },
        );

      return () => {
        active =
          false;
      };
    },
    [
      accessToken,
      eventRepositoryProp,
      id,
      invalidateSession,
    ],
  );

  const isLoading =
    eventState.status ===
      'loading' ||
    formDataState.status ===
      'loading' ||
    formDataState.status ===
      'idle';

  function updateDraft(
    changes:
      Partial<EventDraft>,
  ) {
    setUpdateState({
      status:
        'idle',
    });

    setEventState(
      (current) => {
        if (
          current.status !==
          'success'
        ) {
          return current;
        }

        return {
          ...current,
          draft: {
            ...current.draft,
            ...changes,
          },
        };
      },
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      eventState.status !==
        'success' ||
      accessToken ===
        null
    ) {
      return;
    }

    const validation =
      validateEventCreateDraft(
        eventState.draft,
      );

    if (
      !validation.ok
    ) {
      setUpdateState({
        status:
          'error',
        message:
          'Revisa los campos del formulario e intenta nuevamente.',
      });

      return;
    }

    const eventId =
      Number(id);

    if (
      !Number.isInteger(
        eventId,
      ) ||
      eventId <=
        0
    ) {
      return;
    }

    setUpdateState({
      status:
        'saving',
    });

    try {
      const updated =
        await eventRepositoryProp
          .updateOwnEvent(
            eventId,
            validation.input,
            accessToken,
          );

      setEventState({
        status:
          'success',
        event:
          updated,
        draft:
          toDraft(
            updated,
          ),
      });

      setUpdateState({
        status:
          'success',
        message:
          'Evento actualizado correctamente.',
      });
    } catch (
      error: unknown
    ) {
      if (
        isAuthenticationFailure(
          error,
        )
      ) {
        invalidateSession();

        return;
      }

      setUpdateState({
        status:
          'error',
        message:
          getUpdateErrorMessage(
            error,
          ),
      });
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <main>
          {isLoading && (
            <h1>
              Cargando evento
            </h1>
          )}

          {!isLoading &&
            eventState.status ===
              'error' && (
              <>
                <h1>
                  Editar evento
                </h1>
                <p>
                  {
                    eventState
                      .message
                  }
                </p>
              </>
            )}

          {!isLoading &&
            formDataState.status ===
              'error' && (
              <>
                <h1>
                  Editar evento
                </h1>
                <p>
                  {
                    formDataState
                      .error
                  }
                </p>
              </>
            )}

          {!isLoading &&
            eventState.status ===
              'success' &&
            formDataState.status ===
              'success' &&
            (eventState.event
              .estadoEvento !==
              'BORRADOR' ||
              eventState.event
                .estadoRevision ===
                'APROBADO') && (
              <>
                <h1>
                  Editar evento
                </h1>
                <p>
                  Este evento ya no puede editarse.
                </p>
              </>
            )}

          {!isLoading &&
            eventState.status ===
              'success' &&
            formDataState.status ===
              'success' &&
            eventState.event
              .estadoEvento ===
              'BORRADOR' &&
            eventState.event
              .estadoRevision !==
              'APROBADO' && (
              <>
                <h1>
                  Editar evento
                </h1>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  <label
                    htmlFor="edit-event-title"
                  >
                    Titulo
                  </label>

                  <input
                    id="edit-event-title"
                    name="titulo"
                    type="text"
                    maxLength={200}
                    value={
                      eventState
                        .draft
                        .titulo
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        titulo:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-description"
                  >
                    Descripcion (opcional)
                  </label>

                  <textarea
                    id="edit-event-description"
                    name="descripcion"
                    rows={5}
                    value={
                      eventState
                        .draft
                        .descripcion
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        descripcion:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-start"
                  >
                    Fecha y hora de inicio
                  </label>

                  <input
                    id="edit-event-start"
                    name="fechaInicio"
                    type="datetime-local"
                    value={
                      eventState
                        .draft
                        .fechaInicio
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        fechaInicio:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-end"
                  >
                    Fecha y hora de fin
                  </label>

                  <input
                    id="edit-event-end"
                    name="fechaFin"
                    type="datetime-local"
                    value={
                      eventState
                        .draft
                        .fechaFin
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        fechaFin:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-cost"
                  >
                    Costo referencial
                  </label>

                  <input
                    id="edit-event-cost"
                    name="costoReferencial"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={
                      eventState
                        .draft
                        .costoReferencial
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        costoReferencial:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-source"
                  >
                    Fuente de informacion (opcional)
                  </label>

                  <textarea
                    id="edit-event-source"
                    name="fuenteInformacion"
                    rows={3}
                    maxLength={500}
                    value={
                      eventState
                        .draft
                        .fuenteInformacion
                    }
                    onChange={(
                      event,
                    ) => {
                      updateDraft({
                        fuenteInformacion:
                          event
                            .currentTarget
                            .value,
                      });
                    }}
                  />

                  <label
                    htmlFor="edit-event-place"
                  >
                    Lugar del evento
                  </label>

                  <select
                    id="edit-event-place"
                    name="lugarId"
                    value={
                      eventState
                        .draft
                        .lugarId ===
                      null
                        ? ''
                        : String(
                            eventState
                              .draft
                              .lugarId,
                          )
                    }
                    onChange={(
                      event,
                    ) => {
                      const value =
                        event
                          .currentTarget
                          .value;

                      const parsed =
                        Number(
                          value,
                        );

                      updateDraft({
                        lugarId:
                          value ===
                          ''
                            ? null
                            : Number.isInteger(
                                  parsed,
                                ) &&
                                parsed >
                                  0
                              ? parsed
                              : null,
                      });
                    }}
                  >
                    <option value="">
                      Seleccione un lugar
                    </option>

                    {formDataState
                      .data
                      .lugares
                      .map(
                        (place) => (
                          <option
                            key={
                              place.id
                            }
                            value={
                              place.id
                            }
                          >
                            {place.nombre}
                          </option>
                        ),
                      )}
                  </select>

                  <fieldset>
                    <legend>
                      Categorias del evento
                    </legend>

                    {formDataState
                      .data
                      .categorias
                      .map(
                        (category) => (
                          <label
                            key={
                              category.id
                            }
                          >
                            <input
                              type="checkbox"
                              name="categoriaIds"
                              value={
                                category.id
                              }
                              checked={
                                eventState
                                  .draft
                                  .categoriaIds
                                  .includes(
                                    category.id,
                                  )
                              }
                              onChange={(
                                event,
                              ) => {
                                const currentIds =
                                  eventState
                                    .draft
                                    .categoriaIds;

                                const nextIds =
                                  event
                                    .currentTarget
                                    .checked
                                    ? Array.from(
                                        new Set([
                                          ...currentIds,
                                          category.id,
                                        ]),
                                      )
                                    : currentIds
                                        .filter(
                                          (id) =>
                                            id !==
                                            category.id,
                                        );

                                updateDraft({
                                  categoriaIds:
                                    nextIds,
                                });
                              }}
                            />

                            <span>
                              {category.nombre}
                            </span>
                          </label>
                        ),
                      )}
                  </fieldset>

                  {updateState.status ===
                    'error' && (
                    <p
                      role="alert"
                    >
                      {
                        updateState
                          .message
                      }
                    </p>
                  )}

                  {updateState.status ===
                    'success' && (
                    <p
                      role="status"
                      aria-live="polite"
                    >
                      {
                        updateState
                          .message
                      }
                    </p>
                  )}

                  <IonButton
                    type="submit"
                    disabled={
                      updateState.status ===
                      'saving'
                    }
                  >
                    {updateState.status ===
                    'saving'
                      ? 'Guardando cambios...'
                      : 'Guardar cambios'}
                  </IonButton>
                </form>
              </>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default EditEventPage;
