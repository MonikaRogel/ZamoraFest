import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import {
  useHistory,
} from 'react-router-dom';

import AsyncStateView from '../components/ui/AsyncStateView';
import PrimaryButton from '../components/ui/PrimaryButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import type {
  EventCreateRepository,
} from '../features/events/event-create-repository';
import {
  mapEventCreateServerValidation,
} from '../features/events/event-create-server-validation';
import {
  type EventCreateFieldErrors,
  validateEventCreateDraft,
} from '../features/events/event-create-validation';
import type {
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import {
  useEventCreation,
} from '../features/events/use-event-creation';
import {
  useEventFormData,
} from '../features/events/use-event-form-data';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';

import './CreateEventPage.css';

interface CreateEventPageProps {
  readonly repository?:
    EventFormDataRepository;

  readonly creationRepository?:
    EventCreateRepository;
}

interface FieldErrorProps {
  readonly id:
    string;

  readonly message?:
    string;
}

function FieldError({
  id,
  message,
}: FieldErrorProps) {
  if (
    message ===
    undefined
  ) {
    return null;
  }

  return (
    <p
      id={id}
      className="zf-create-event__field-error"
      role="alert"
    >
      {message}
    </p>
  );
}

type EventCreateFieldName =
  keyof EventCreateFieldErrors;

function CreateEventPage({
  repository,
  creationRepository,
}: CreateEventPageProps) {
  const history =
    useHistory();

  const {
    accessToken,
    eventDraft,
    updateEventDraft,
  } =
    useApplicationState();

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<EventCreateFieldErrors>(
      {},
    );

  const {
    state,
    reload,
  } =
    useEventFormData(
      repository,
    );

  const {
    state:
      creationState,
    failure:
      creationFailure,
    create:
      createEvent,
  } =
    useEventCreation(
      creationRepository,
    );

  const serverValidation =
    useMemo(
      () => {
        if (
          creationFailure ===
          null
        ) {
          return null;
        }

        return mapEventCreateServerValidation(
          creationFailure,
        );
      },
      [
        creationFailure,
      ],
    );

  useEffect(
    () => {
      if (
        serverValidation ===
          null ||
        !serverValidation
          .handled
      ) {
        return;
      }

      setFieldErrors(
        (current) => ({
          ...current,
          ...serverValidation
            .fieldErrors,
        }),
      );
    },
    [
      serverValidation,
    ],
  );

  function handleBack() {
    history.push(
      '/gestion',
    );
  }

  function clearFieldError(
    field:
      EventCreateFieldName,
  ) {
    setFieldErrors(
      (current) => ({
        ...current,

        [field]:
          undefined,
      }),
    );
  }

  function validateField(
    field:
      EventCreateFieldName,
  ) {
    const validation =
      validateEventCreateDraft(
        eventDraft,
      );

    const message =
      validation.ok
        ? undefined
        : validation
            .errors[
              field
            ];

    setFieldErrors(
      (current) => ({
        ...current,

        [field]:
          message,
      }),
    );
  }

  function validateStartField() {
    const validation =
      validateEventCreateDraft(
        eventDraft,
      );

    setFieldErrors(
      (current) => ({
        ...current,

        fechaInicio:
          validation.ok
            ? undefined
            : validation
                .errors
                .fechaInicio,

        fechaFin:
          eventDraft
            .fechaFin
            .trim()
            .length ===
          0
            ? current
                .fechaFin
            : validation.ok
              ? undefined
              : validation
                  .errors
                  .fechaFin,
      }),
    );
  }

  function handlePlaceChange(
    value: string,
  ) {
    clearFieldError(
      'lugarId',
    );

    if (
      value ===
      ''
    ) {
      updateEventDraft({
        lugarId:
          null,
      });

      return;
    }

    const parsed =
      Number(
        value,
      );

    updateEventDraft({
      lugarId:
        Number.isInteger(
          parsed,
        ) &&
        parsed >
          0
          ? parsed
          : null,
    });
  }

  function handleCategoryChange(
    categoryId: number,
    checked: boolean,
  ) {
    const currentIds =
      eventDraft
        .categoriaIds;

    const nextIds =
      checked
        ? Array.from(
            new Set([
              ...currentIds,
              categoryId,
            ]),
          )
        : currentIds.filter(
            (id) =>
              id !==
              categoryId,
          );

    clearFieldError(
      'categoriaIds',
    );

    updateEventDraft({
      categoriaIds:
        nextIds,
    });
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event
      .preventDefault();

    if (
      accessToken ===
      null
    ) {
      return;
    }

    const validation =
      validateEventCreateDraft(
        eventDraft,
      );

    if (
      !validation.ok
    ) {
      setFieldErrors(
        validation.errors,
      );

      return;
    }

    setFieldErrors(
      {},
    );

    await createEvent(
      validation.input,
      accessToken,
    );
  }

  const creationErrorMessage =
    creationState.status ===
      'error'
      ? (
          serverValidation
            ?.handled ===
          true
            ? (
                serverValidation
                  .generalError ??
                'Revise los campos señalados e intente nuevamente.'
              )
            : creationState
                .error
        )
      : undefined;

  return (
    <IonPage>
      <IonHeader className="zf-create-event__header">
        <IonToolbar className="zf-create-event__toolbar">
          <IonTitle className="zf-create-event__brand">
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-create-event">
          <ScreenHeader
            eyebrow="Área protegida"
            title="Crear nuevo evento"
            description="Registra la información principal del evento utilizando los datos disponibles en ZamoraFest."
            actions={
              <IonButton
                className="zf-create-event__back"
                fill="outline"
                type="button"
                aria-label="Volver a gestión"
                onClick={
                  handleBack
                }
              >
                Volver
              </IonButton>
            }
          />

          {(
            state.status ===
              'idle' ||
            state.status ===
              'loading'
          ) && (
            <AsyncStateView
              state="loading"
              title="Cargando formulario"
              message="Estamos consultando las categorías y los lugares disponibles."
            />
          )}

          {state.status ===
            'error' && (
            <AsyncStateView
              state="error"
              title="No pudimos preparar el formulario"
              message={
                state.error
              }
              actionLabel="Reintentar"
              onAction={
                reload
              }
            />
          )}

          {state.status ===
            'success' &&
            (
              state.data
                .categorias
                .length ===
                0 ||
              state.data
                .lugares
                .length ===
                0
            ) && (
              <AsyncStateView
                state="empty"
                title="Faltan datos para crear eventos"
                message="Se necesita al menos una categoría y un lugar activo antes de continuar."
                actionLabel="Actualizar"
                onAction={
                  reload
                }
              />
            )}

          {state.status ===
            'success' &&
            state.data
              .categorias
              .length >
              0 &&
            state.data
              .lugares
              .length >
              0 && (
              <form
                className="zf-create-event__form"
                noValidate
                onSubmit={
                  handleSubmit
                }
              >
                <section
                  className="zf-create-event__panel"
                  aria-labelledby="zf-create-event-main-title"
                >
                  <div className="zf-create-event__section-heading">
                    <h2 id="zf-create-event-main-title">
                      Información principal
                    </h2>

                    <p>
                      Completa los datos
                      principales del
                      evento.
                    </p>
                  </div>

                  <div className="zf-create-event__field">
                    <label htmlFor="event-title">
                      Título
                    </label>

                    <input
                      id="event-title"
                      name="titulo"
                      type="text"
                      maxLength={
                        200
                      }
                      value={
                        eventDraft
                          .titulo
                      }
                      aria-invalid={
                        fieldErrors
                          .titulo !==
                        undefined
                      }
                      aria-describedby={
                        fieldErrors
                          .titulo ===
                        undefined
                          ? undefined
                          : 'event-title-error'
                      }
                      onChange={(
                        event,
                      ) => {
                        clearFieldError(
                          'titulo',
                        );

                        updateEventDraft({
                          titulo:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
                      onBlur={() => {
                        validateField(
                          'titulo',
                        );
                      }}
                    />

                    <FieldError
                      id="event-title-error"
                      message={
                        fieldErrors
                          .titulo
                      }
                    />
                  </div>

                  <div className="zf-create-event__field">
                    <label htmlFor="event-description">
                      Descripción
                    </label>

                    <textarea
                      id="event-description"
                      name="descripcion"
                      rows={5}
                      value={
                        eventDraft
                          .descripcion
                      }
                      aria-invalid={
                        fieldErrors
                          .descripcion !==
                        undefined
                      }
                      aria-describedby={
                        fieldErrors
                          .descripcion ===
                        undefined
                          ? undefined
                          : 'event-description-error'
                      }
                      onChange={(
                        event,
                      ) => {
                        clearFieldError(
                          'descripcion',
                        );

                        updateEventDraft({
                          descripcion:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
                      onBlur={() => {
                        validateField(
                          'descripcion',
                        );
                      }}
                    />

                    <FieldError
                      id="event-description-error"
                      message={
                        fieldErrors
                          .descripcion
                      }
                    />
                  </div>

                  <div className="zf-create-event__field-grid">
                    <div className="zf-create-event__field">
                      <label htmlFor="event-start">
                        Fecha y hora de inicio
                      </label>

                      <input
                        id="event-start"
                        name="fechaInicio"
                        type="datetime-local"
                        value={
                          eventDraft
                            .fechaInicio
                        }
                        aria-invalid={
                          fieldErrors
                            .fechaInicio !==
                          undefined
                        }
                        aria-describedby={
                          fieldErrors
                            .fechaInicio ===
                          undefined
                            ? undefined
                            : 'event-start-error'
                        }
                        onChange={(
                          event,
                        ) => {
                          clearFieldError(
                            'fechaInicio',
                          );

                          clearFieldError(
                            'fechaFin',
                          );

                          updateEventDraft({
                            fechaInicio:
                              event
                                .currentTarget
                                .value,
                          });
                        }}
                        onBlur={
                          validateStartField
                        }
                      />

                      <FieldError
                        id="event-start-error"
                        message={
                          fieldErrors
                            .fechaInicio
                        }
                      />
                    </div>

                    <div className="zf-create-event__field">
                      <label htmlFor="event-end">
                        Fecha y hora de fin
                      </label>

                      <input
                        id="event-end"
                        name="fechaFin"
                        type="datetime-local"
                        value={
                          eventDraft
                            .fechaFin
                        }
                        aria-invalid={
                          fieldErrors
                            .fechaFin !==
                          undefined
                        }
                        aria-describedby={
                          fieldErrors
                            .fechaFin ===
                          undefined
                            ? undefined
                            : 'event-end-error'
                        }
                        onChange={(
                          event,
                        ) => {
                          clearFieldError(
                            'fechaFin',
                          );

                          updateEventDraft({
                            fechaFin:
                              event
                                .currentTarget
                                .value,
                          });
                        }}
                        onBlur={() => {
                          validateField(
                            'fechaFin',
                          );
                        }}
                      />

                      <FieldError
                        id="event-end-error"
                        message={
                          fieldErrors
                            .fechaFin
                        }
                      />
                    </div>
                  </div>

                  <div className="zf-create-event__field">
                    <label htmlFor="event-cost">
                      Costo referencial
                    </label>

                    <input
                      id="event-cost"
                      name="costoReferencial"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={
                        eventDraft
                          .costoReferencial
                      }
                      aria-invalid={
                        fieldErrors
                          .costoReferencial !==
                        undefined
                      }
                      aria-describedby={
                        fieldErrors
                          .costoReferencial ===
                        undefined
                          ? undefined
                          : 'event-cost-error'
                      }
                      onChange={(
                        event,
                      ) => {
                        clearFieldError(
                          'costoReferencial',
                        );

                        updateEventDraft({
                          costoReferencial:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
                      onBlur={() => {
                        validateField(
                          'costoReferencial',
                        );
                      }}
                    />

                    <FieldError
                      id="event-cost-error"
                      message={
                        fieldErrors
                          .costoReferencial
                      }
                    />
                  </div>

                  <div className="zf-create-event__field">
                    <label htmlFor="event-source">
                      Fuente de información
                    </label>

                    <textarea
                      id="event-source"
                      name="fuenteInformacion"
                      rows={3}
                      maxLength={
                        500
                      }
                      value={
                        eventDraft
                          .fuenteInformacion
                      }
                      aria-invalid={
                        fieldErrors
                          .fuenteInformacion !==
                        undefined
                      }
                      aria-describedby={
                        fieldErrors
                          .fuenteInformacion ===
                        undefined
                          ? undefined
                          : 'event-source-error'
                      }
                      onChange={(
                        event,
                      ) => {
                        clearFieldError(
                          'fuenteInformacion',
                        );

                        updateEventDraft({
                          fuenteInformacion:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
                      onBlur={() => {
                        validateField(
                          'fuenteInformacion',
                        );
                      }}
                    />

                    <FieldError
                      id="event-source-error"
                      message={
                        fieldErrors
                          .fuenteInformacion
                      }
                    />
                  </div>
                </section>

                <section
                  className="zf-create-event__panel"
                  aria-labelledby="zf-create-event-location-title"
                >
                  <div className="zf-create-event__section-heading">
                    <h2 id="zf-create-event-location-title">
                      Lugar
                    </h2>

                    <p>
                      Selecciona un lugar
                      activo obtenido del
                      backend.
                    </p>
                  </div>

                  <div className="zf-create-event__field">
                    <label htmlFor="event-place">
                      Lugar del evento
                    </label>

                    <select
                      id="event-place"
                      name="lugarId"
                      value={
                        eventDraft
                          .lugarId ===
                        null
                          ? ''
                          : String(
                              eventDraft
                                .lugarId,
                            )
                      }
                      aria-invalid={
                        fieldErrors
                          .lugarId !==
                        undefined
                      }
                      aria-describedby={
                        fieldErrors
                          .lugarId ===
                        undefined
                          ? undefined
                          : 'event-place-error'
                      }
                      onChange={(
                        event,
                      ) => {
                        handlePlaceChange(
                          event
                            .currentTarget
                            .value,
                        );
                      }}
                      onBlur={() => {
                        validateField(
                          'lugarId',
                        );
                      }}
                    >
                      <option value="">
                        Seleccione un lugar
                      </option>

                      {state.data
                        .lugares
                        .map(
                          (
                            place,
                          ) => (
                            <option
                              key={
                                place.id
                              }
                              value={
                                place.id
                              }
                            >
                              {place.nombre}
                              {' — '}
                              {
                                place
                                  .sector
                                  .parroquia
                                  .nombre
                              }
                              {', '}
                              {
                                place
                                  .sector
                                  .parroquia
                                  .canton
                                  .nombre
                              }
                            </option>
                          ),
                        )}
                    </select>

                    <FieldError
                      id="event-place-error"
                      message={
                        fieldErrors
                          .lugarId
                      }
                    />
                  </div>
                </section>

                <section
                  className="zf-create-event__panel"
                  aria-labelledby="zf-create-event-categories-title"
                >
                  <div className="zf-create-event__section-heading">
                    <h2 id="zf-create-event-categories-title">
                      Categorías
                    </h2>

                    <p>
                      Selecciona una o más
                      categorías obtenidas
                      del backend.
                    </p>
                  </div>

                  <fieldset
                    className="zf-create-event__categories"
                    aria-invalid={
                      fieldErrors
                        .categoriaIds !==
                      undefined
                    }
                    aria-describedby={
                      fieldErrors
                        .categoriaIds ===
                      undefined
                        ? undefined
                        : 'event-categories-error'
                    }
                    onBlur={() => {
                      validateField(
                        'categoriaIds',
                      );
                    }}
                  >
                    <legend>
                      Categorías del evento
                    </legend>

                    {state.data
                      .categorias
                      .map(
                        (
                          category,
                        ) => (
                          <label
                            key={
                              category.id
                            }
                            className="zf-create-event__category"
                          >
                            <input
                              type="checkbox"
                              name="categoriaIds"
                              value={
                                category.id
                              }
                              checked={
                                eventDraft
                                  .categoriaIds
                                  .includes(
                                    category.id,
                                  )
                              }
                              onChange={(
                                event,
                              ) => {
                                handleCategoryChange(
                                  category.id,
                                  event
                                    .currentTarget
                                    .checked,
                                );
                              }}
                            />

                            <span>
                              {
                                category
                                  .nombre
                              }
                            </span>
                          </label>
                        ),
                      )}
                  </fieldset>

                  <FieldError
                    id="event-categories-error"
                    message={
                      fieldErrors
                        .categoriaIds
                    }
                  />
                </section>

                {creationState.status ===
                  'error' && (
                  <AsyncStateView
                    state="error"
                    title="No pudimos crear el evento"
                    message={
                      creationErrorMessage
                    }
                  />
                )}

                {creationState.status ===
                  'success' && (
                  <section
                    className="zf-create-event__panel"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="zf-create-event__section-heading">
                      <h2>
                        Evento creado correctamente
                      </h2>

                      <p>
                        {
                          creationState
                            .data
                            .titulo
                        }{' '}
                        fue registrado con
                        el identificador{' '}
                        {
                          creationState
                            .data
                            .id
                        }.
                      </p>
                    </div>
                  </section>
                )}

                <section className="zf-create-event__actions">
                  <PrimaryButton
                    type="submit"
                    disabled={
                      accessToken ===
                        null ||
                      creationState
                        .status ===
                        'success'
                    }
                    loading={
                      creationState
                        .status ===
                      'loading'
                    }
                    loadingLabel="Creando evento..."
                    ariaLabel="Crear evento"
                  >
                    Crear evento
                  </PrimaryButton>
                </section>
              </form>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default CreateEventPage;