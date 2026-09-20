import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useHistory,
} from 'react-router-dom';

import AsyncStateView from '../components/ui/AsyncStateView';
import PrimaryButton from '../components/ui/PrimaryButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import type {
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
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
}

function CreateEventPage({
  repository,
}: CreateEventPageProps) {
  const history =
    useHistory();

  const {
    eventDraft,
    updateEventDraft,
  } =
    useApplicationState();

  const {
    state,
    reload,
  } =
    useEventFormData(
      repository,
    );

  function handleBack() {
    history.push(
      '/gestion',
    );
  }

  function handlePlaceChange(
    value: string,
  ) {
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
        parsed > 0
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

    updateEventDraft({
      categoriaIds:
        nextIds,
    });
  }

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
                onSubmit={(
                  event,
                ) => {
                  event
                    .preventDefault();
                }}
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
                      value={
                        eventDraft
                          .titulo
                      }
                      onChange={(
                        event,
                      ) => {
                        updateEventDraft({
                          titulo:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
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
                      onChange={(
                        event,
                      ) => {
                        updateEventDraft({
                          descripcion:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
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
                        onChange={(
                          event,
                        ) => {
                          updateEventDraft({
                            fechaInicio:
                              event
                                .currentTarget
                                .value,
                          });
                        }}
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
                        onChange={(
                          event,
                        ) => {
                          updateEventDraft({
                            fechaFin:
                              event
                                .currentTarget
                                .value,
                          });
                        }}
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
                      value={
                        eventDraft
                          .costoReferencial
                      }
                      onChange={(
                        event,
                      ) => {
                        updateEventDraft({
                          costoReferencial:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
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
                      value={
                        eventDraft
                          .fuenteInformacion
                      }
                      onChange={(
                        event,
                      ) => {
                        updateEventDraft({
                          fuenteInformacion:
                            event
                              .currentTarget
                              .value,
                        });
                      }}
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
                      onChange={(
                        event,
                      ) => {
                        handlePlaceChange(
                          event
                            .currentTarget
                            .value,
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

                  <fieldset className="zf-create-event__categories">
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
                </section>

                <section className="zf-create-event__actions">
                  <PrimaryButton
                    type="submit"
                    disabled
                    ariaLabel="Crear evento, envío en preparación"
                  >
                    Crear evento
                  </PrimaryButton>

                  <p className="zf-create-event__pending-note">
                    La estructura del
                    formulario ya está
                    disponible. El envío al
                    backend se habilitará en
                    el siguiente incremento.
                  </p>
                </section>
              </form>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default CreateEventPage;