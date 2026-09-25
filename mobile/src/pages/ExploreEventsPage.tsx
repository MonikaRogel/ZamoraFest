import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useHistory,
} from 'react-router-dom';

import AsyncStateView from '../components/ui/AsyncStateView';
import EventCard from '../components/ui/EventCard';
import FilterChip from '../components/ui/FilterChip';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import { useApplicationState } from '../state/ApplicationStateContext';
import {
  remoteError,
  remoteLoading,
  remoteSuccess,
  type RemoteData,
} from '../state/remote-data';
import type {
  Evento,
} from '../types/api';

import './ExploreEventsPage.css';

const EVENTS_PAGE_SIZE = 5;

function formatEventDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Fecha por confirmar';
  }

  return new Intl.DateTimeFormat(
    'es-EC',
    {
      dateStyle: 'long',
      timeStyle: 'short',
    },
  ).format(date);
}

function formatEventCost(
  value: number,
): string {
  if (
    value === 0
  ) {
    return 'Gratuito';
  }

  return new Intl.NumberFormat(
    'es-EC',
    {
      style: 'currency',
      currency: 'USD',
    },
  ).format(value);
}

function getEventStartTime(
  event: Evento,
): number | null {
  const startTime =
    new Date(
      event.fechaInicio,
    ).getTime();

  return Number.isNaN(
    startTime,
  )
    ? null
    : startTime;
}

function getErrorMessage(
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
      return 'No fue posible conectarse con ZamoraFest. Revise su conexión e intente nuevamente.';
    }

    if (
      error.kind ===
      'server'
    ) {
      return 'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.';
    }
  }

  return 'No fue posible cargar los eventos. Intente nuevamente.';
}

function ExploreEventsPage() {
  const history =
    useHistory();
  const { user } = useApplicationState();

  const [
    eventsState,
    setEventsState,
  ] = useState<
    RemoteData<
      readonly Evento[],
      string
    >
  >(
    remoteLoading(),
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    string | null
  >(
    null,
  );

  const loadEvents =
    useCallback(
      async () => {
        setEventsState(
          remoteLoading(),
        );

        try {
          const page =
            await eventRepository
              .listEventPage({
                page: 1,
                limit: EVENTS_PAGE_SIZE,
              });

          setEventsState(
            remoteSuccess(
              page.events,
            ),
          );
        } catch (error) {
          setEventsState(
            remoteError(
              getErrorMessage(
                error,
              ),
            ),
          );
        }
      },
      [],
    );

  const openEventDetail =
    useCallback(
      (
        eventId: number,
      ) => {
        history.push(
          `/eventos/${eventId}`,
        );
      },
      [
        history,
      ],
    );

  useEffect(() => {
    void loadEvents();
  }, [
    loadEvents,
  ]);

  const events =
    useMemo(
      () =>
        eventsState.status ===
        'success'
          ? eventsState.data
          : [],
      [
        eventsState,
      ],
    );

  const categories =
    useMemo(
      () =>
        Array.from(
          new Set(
            events.flatMap(
              (event) =>
                event.categorias.map(
                  (
                    category,
                  ) =>
                    category.nombre,
                ),
            ),
          ),
        ).sort(
          (
            a,
            b,
          ) =>
            a.localeCompare(
              b,
              'es',
            ),
        ),
      [
        events,
      ],
    );

  const visibleEvents =
    useMemo(
      () => {
        if (
          selectedCategory ===
          null
        ) {
          return events;
        }

        return events.filter(
          (event) =>
            event.categorias.some(
              (
                category,
              ) =>
                category.nombre ===
                selectedCategory,
            ),
        );
      },
      [
        events,
        selectedCategory,
      ],
    );

  const nextEvent =
    useMemo(
      () => {
        const now =
          Date.now();

        return (
          [
            ...visibleEvents,
          ]
            .filter(
              (event) => {
                const startTime =
                  getEventStartTime(
                    event,
                  );

                return (
                  startTime !==
                    null &&
                  startTime >=
                    now
                );
              },
            )
            .sort(
              (
                firstEvent,
                secondEvent,
              ) => {
                const firstStart =
                  getEventStartTime(
                    firstEvent,
                  );

                const secondStart =
                  getEventStartTime(
                    secondEvent,
                  );

                return (
                  (
                    firstStart ??
                    Number
                      .POSITIVE_INFINITY
                  ) -
                  (
                    secondStart ??
                    Number
                      .POSITIVE_INFINITY
                  )
                );
              },
            )[0] ??
          null
        );
      },
      [
        visibleEvents,
      ],
    );

  const remainingEvents =
    useMemo(
      () =>
        nextEvent ===
        null
          ? visibleEvents
          : visibleEvents.filter(
              (event) =>
                event.id !==
                nextEvent.id,
            ),
      [
        nextEvent,
        visibleEvents,
      ],
    );

  return (
    <IonPage>
      <IonHeader className="zf-app-header">
        <IonToolbar>
          <IonTitle className="zf-app-brand">
            <span className="zf-app-brand__name">
              ZamoraFest
            </span>

            <span
              className="zf-app-brand__separator"
              aria-hidden="true"
            />

            <span className="zf-app-brand__descriptor">
              Agenda cultural y festiva
            </span>
          </IonTitle>
          <IonButtons slot="end" className="zf-app-session-actions">
            <IonButton
              className="zf-app-session-button"
              type="button"
              aria-label={user === null ? 'Iniciar sesión' : 'Abrir mi cuenta'}
              onClick={() => history.push(user === null ? '/login' : '/gestion')}
            >
              {user === null ? 'Iniciar sesión' : 'Mi cuenta'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-explore">
          <ScreenHeader
            title="Descubre Zamora Chinchipe"
            description="Fiestas, ferias, música y tradiciones de la provincia."
          />

          {(
            eventsState.status ===
              'idle' ||
            eventsState.status ===
              'loading'
          ) && (
            <AsyncStateView
              state="loading"
              title="Cargando eventos"
              message="Estamos consultando la agenda disponible."
            />
          )}

          {eventsState.status ===
            'error' && (
            <AsyncStateView
              state="error"
              title="No pudimos cargar los eventos"
              message={
                eventsState.error
              }
              onAction={() => {
                void loadEvents();
              }}
            />
          )}

          {eventsState.status ===
            'success' &&
            events.length ===
              0 && (
              <AsyncStateView
                state="empty"
                title="No hay eventos disponibles"
                message="La agenda no tiene eventos publicados en este momento."
              />
            )}

          {eventsState.status ===
            'success' &&
            events.length >
              0 && (
              <>
                {categories.length >
                  0 && (
                  <section
                    className="zf-explore__filters"
                    aria-label="Filtrar eventos por categoría"
                  >
                    <FilterChip
                      label="Todos"
                      selected={
                        selectedCategory ===
                        null
                      }
                      onClick={() => {
                        setSelectedCategory(
                          null,
                        );
                      }}
                    />

                    {categories.map(
                      (
                        category,
                      ) => (
                        <FilterChip
                          key={
                            category
                          }
                          label={
                            category
                          }
                          selected={
                            selectedCategory ===
                            category
                          }
                          onClick={() => {
                            setSelectedCategory(
                              category,
                            );
                          }}
                        />
                      ),
                    )}
                  </section>
                )}

                {visibleEvents.length ===
                0 ? (
                  <AsyncStateView
                    state="empty"
                    title="Sin coincidencias"
                    message="No hay eventos disponibles para el filtro seleccionado."
                  />
                ) : (
                  <>
                    {nextEvent && (
                      <section
                        className="zf-explore__featured"
                        aria-labelledby="zf-next-event-heading"
                      >
                        <div className="zf-explore__section-heading">
                          <h2 id="zf-next-event-heading">
                            Próximo evento
                          </h2>
                        </div>

                        <EventCard
                          variant="featured"
                          title={
                            nextEvent.titulo
                          }
                          description={
                            nextEvent.descripcion ??
                            undefined
                          }
                          dateLabel={
                            formatEventDate(
                              nextEvent
                                .fechaInicio,
                            )
                          }
                          locationLabel={
                            nextEvent
                              .lugar
                              .nombre
                          }
                          categoryLabels={
                            nextEvent
                              .categorias
                              .map(
                                (
                                  category,
                                ) =>
                                  category
                                    .nombre,
                              )
                          }
                          costLabel={
                            formatEventCost(
                              nextEvent
                                .costoReferencial,
                            )
                          }
                          onAction={() => {
                            openEventDetail(
                              nextEvent.id,
                            );
                          }}
                        />
                      </section>
                    )}

                    {remainingEvents.length >
                      0 && (
                      <section
                        className="zf-explore__events"
                        aria-labelledby="zf-more-events-heading"
                      >
                        <div className="zf-explore__section-heading">
                          <h2 id="zf-more-events-heading">
                            {nextEvent
                              ? 'Más eventos'
                              : 'Eventos disponibles'}
                          </h2>
                        </div>

                        <div
                          className="zf-explore__list"
                          aria-label="Eventos disponibles"
                        >
                          {remainingEvents.map(
                            (
                              event,
                            ) => (
                              <EventCard
                                key={
                                  event.id
                                }
                                variant="compact"
                                title={
                                  event.titulo
                                }
                                description={
                                  event.descripcion ??
                                  undefined
                                }
                                dateLabel={
                                  formatEventDate(
                                    event
                                      .fechaInicio,
                                  )
                                }
                                locationLabel={
                                  event
                                    .lugar
                                    .nombre
                                }
                                categoryLabels={
                                  event
                                    .categorias
                                    .map(
                                      (
                                        category,
                                      ) =>
                                        category
                                          .nombre,
                                    )
                                }
                                costLabel={
                                  formatEventCost(
                                    event
                                      .costoReferencial,
                                  )
                                }
                                onAction={() => {
                                  openEventDetail(
                                    event.id,
                                  );
                                }}
                              />
                            ),
                          )}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default ExploreEventsPage;
