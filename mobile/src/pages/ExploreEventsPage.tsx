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
  eventCategoryRepository,
} from '../features/events/remote-event-category-repository';
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
  Categoria,
  Evento,
  PaginationMeta,
} from '../types/api';

import './ExploreEventsPage.css';

const EVENTS_PAGE_SIZE = 5;
const EVENT_TIME_ZONE = 'America/Guayaquil';

const CALENDAR_WEEKDAYS = [
  ['Lun', 'Lunes'],
  ['Mar', 'Martes'],
  ['Mié', 'Miércoles'],
  ['Jue', 'Jueves'],
  ['Vie', 'Viernes'],
  ['Sáb', 'Sábado'],
  ['Dom', 'Domingo'],
] as const;

interface CalendarMonth {
  readonly year: number;
  readonly month: number;
}

interface CalendarMonthRange {
  readonly fechaDesde: string;
  readonly fechaHasta: string;
}

function getCalendarMonth(
  timestamp: number,
): CalendarMonth {
  const parts =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone:
          EVENT_TIME_ZONE,
        year:
          'numeric',
        month:
          '2-digit',
      },
    ).formatToParts(
      new Date(
        timestamp,
      ),
    );

  const year = Number(
    parts.find(
      (part) =>
        part.type ===
        'year',
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type ===
        'month',
    )?.value,
  );

  if (
    !Number.isInteger(
      year,
    ) ||
    !Number.isInteger(
      month,
    )
  ) {
    throw new Error(
      'No fue posible determinar el mes actual.',
    );
  }

  return {
    year,
    month,
  };
}

function shiftCalendarMonth(
  calendarMonth:
    CalendarMonth,
  offset: number,
): CalendarMonth {
  const monthIndex =
    calendarMonth.month -
    1 +
    offset;

  return {
    year:
      calendarMonth.year +
      Math.floor(
        monthIndex / 12,
      ),
    month:
      ((
        (monthIndex % 12) +
        12
      ) %
        12) +
      1,
  };
}

function formatCalendarMonthLabel(
  calendarMonth:
    CalendarMonth,
): string {
  return new Intl.DateTimeFormat(
    'es-EC',
    {
      month:
        'long',
      year:
        'numeric',
      timeZone:
        'UTC',
    },
  ).format(
    new Date(
      Date.UTC(
        calendarMonth.year,
        calendarMonth.month -
          1,
        1,
      ),
    ),
  );
}

function formatCalendarDayBoundary(
  year: number,
  month: number,
  day: number,
): string {
  const value = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  return `${value.getUTCFullYear()}-${String(
    value.getUTCMonth() + 1,
  ).padStart(2, '0')}-${String(
    value.getUTCDate(),
  ).padStart(2, '0')}T00:00:00.000`;
}

function formatCalendarDayLabel(
  calendarMonth:
    CalendarMonth,
  day: number,
): string {
  return new Intl.DateTimeFormat(
    'es-EC',
    {
      day:
        'numeric',
      month:
        'long',
      year:
        'numeric',
      timeZone:
        'UTC',
    },
  ).format(
    new Date(
      Date.UTC(
        calendarMonth.year,
        calendarMonth.month -
          1,
        day,
      ),
    ),
  );
}

function getCalendarMonthStartColumn(
  calendarMonth:
    CalendarMonth,
): number {
  const sundayBasedWeekday =
    new Date(
      Date.UTC(
        calendarMonth.year,
        calendarMonth.month - 1,
        1,
      ),
    ).getUTCDay();

  return (
    ((sundayBasedWeekday + 6) % 7) +
    1
  );
}

function getCalendarMonthDays(
  calendarMonth:
    CalendarMonth,
): readonly number[] {
  const daysInMonth =
    new Date(
      Date.UTC(
        calendarMonth.year,
        calendarMonth.month,
        0,
      ),
    ).getUTCDate();

  return Array.from(
    {
      length:
        daysInMonth,
    },
    (_, index) =>
      index + 1,
  );
}

function getEventsOnCalendarDay(
  events:
    readonly Evento[],
  calendarMonth:
    CalendarMonth,
  day: number,
): readonly Evento[] {
  const fechaDesde =
    formatCalendarDayBoundary(
      calendarMonth.year,
      calendarMonth.month,
      day,
    );

  const fechaHasta =
    formatCalendarDayBoundary(
      calendarMonth.year,
      calendarMonth.month,
      day + 1,
    );

  return events.filter(
    (event) =>
      event.fechaInicio <
        fechaHasta &&
      event.fechaFin >
        fechaDesde,
  );
}

function countEventsOnCalendarDay(
  events:
    readonly Evento[],
  calendarMonth:
    CalendarMonth,
  day: number,
): number {
  return getEventsOnCalendarDay(
    events,
    calendarMonth,
    day,
  ).length;
}

function formatCalendarDayAriaLabel(
  calendarMonth:
    CalendarMonth,
  day: number,
  eventCount: number,
): string {
  const dayLabel =
    formatCalendarDayLabel(
      calendarMonth,
      day,
    );

  if (eventCount === 0) {
    return `${dayLabel}, sin eventos`;
  }

  return `${dayLabel}, ${eventCount} ${
    eventCount === 1
      ? 'evento'
      : 'eventos'
  }`;
}

function formatMonthBoundary(
  year: number,
  month: number,
): string {
  return `${year}-${String(
    month,
  ).padStart(2, '0')}-01T00:00:00.000`;
}

function getCalendarMonthRange(
  calendarMonth:
    CalendarMonth,
): CalendarMonthRange {
  const nextMonth =
    calendarMonth.month ===
    12
      ? {
          year:
            calendarMonth.year +
            1,
          month: 1,
        }
      : {
          year:
            calendarMonth.year,
          month:
            calendarMonth.month +
            1,
        };

  return {
    fechaDesde:
      formatMonthBoundary(
        calendarMonth.year,
        calendarMonth.month,
      ),
    fechaHasta:
      formatMonthBoundary(
        nextMonth.year,
        nextMonth.month,
      ),
  };
}

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

function mergeEvents(
  currentEvents:
    readonly Evento[],
  newEvents:
    readonly Evento[],
): readonly Evento[] {
  const eventsById =
    new Map<
      number,
      Evento
    >();

  currentEvents.forEach(
    (event) => {
      eventsById.set(
        event.id,
        event,
      );
    },
  );

  newEvents.forEach(
    (event) => {
      eventsById.set(
        event.id,
        event,
      );
    },
  );

  return Array.from(
    eventsById.values(),
  );
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
    pagination,
    setPagination,
  ] = useState<
    PaginationMeta | null
  >(
    null,
  );

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(
    false,
  );

  const [
    loadMoreError,
    setLoadMoreError,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    categories,
    setCategories,
  ] = useState<
    readonly Categoria[]
  >([]);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<
    number | null
  >(
    null,
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState<
    CalendarMonth
  >(() =>
    getCalendarMonth(
      Date.now(),
    ),
  );

  const [
    calendarEventsState,
    setCalendarEventsState,
  ] = useState<
    RemoteData<
      readonly Evento[],
      string
    >
  >(
    remoteLoading(),
  );

  const [
    selectedCalendarDay,
    setSelectedCalendarDay,
  ] = useState<
    number | null
  >(null);

  const loadEvents =
    useCallback(
      async () => {
        setEventsState(
          remoteLoading(),
        );

        setPagination(
          null,
        );

        setLoadMoreError(
          null,
        );

        try {
          const page =
            await eventRepository
              .listEventPage({
                page: 1,
                limit: EVENTS_PAGE_SIZE,
                ...(selectedCategoryId === null ? {} : { categoriaId: selectedCategoryId }),
              });

          setPagination(
            page.meta,
          );

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
      [selectedCategoryId],
    );

  const loadCalendarEvents =
    useCallback(
      async () => {
        setCalendarEventsState(
          remoteLoading(),
        );

        const range =
          getCalendarMonthRange(
            calendarMonth,
          );

        try {
          const calendarEvents =
            await eventRepository
              .listEventsInRange({
                ...range,
                ...(selectedCategoryId === null ? {} : { categoriaId: selectedCategoryId }),
              });

          setCalendarEventsState(
            remoteSuccess(
              calendarEvents,
            ),
          );
        } catch (error) {
          setCalendarEventsState(
            remoteError(
              getErrorMessage(
                error,
              ),
            ),
          );
        }
      },
      [
        calendarMonth,
        selectedCategoryId,
      ],
    );

  const loadMoreEvents =
    useCallback(
      async () => {
        if (
          pagination ===
            null ||
          pagination.page >=
            pagination.totalPages ||
          isLoadingMore
        ) {
          return;
        }

        setIsLoadingMore(
          true,
        );

        setLoadMoreError(
          null,
        );

        try {
          const page =
            await eventRepository
              .listEventPage({
                page:
                  pagination.page +
                  1,
                limit:
                  pagination.limit,
                ...(selectedCategoryId === null ? {} : { categoriaId: selectedCategoryId }),
              });

          setEventsState(
            (
              currentState,
            ) => {
              if (
                currentState.status !==
                'success'
              ) {
                return currentState;
              }

              return remoteSuccess(
                mergeEvents(
                  currentState.data,
                  page.events,
                ),
              );
            },
          );

          setPagination(
            page.meta,
          );
        } catch (error) {
          setLoadMoreError(
            getErrorMessage(
              error,
            ),
          );
        } finally {
          setIsLoadingMore(
            false,
          );
        }
      },
      [
        isLoadingMore,
        pagination,
        selectedCategoryId,
      ],
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
    let active = true;

    void eventCategoryRepository
      .list()
      .then(
        (data) => {
          if (active) {
            setCategories(data);
          }
        },
        () => {
          if (active) {
            setCategories([]);
          }
        },
      );

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [
    loadEvents,
  ]);

  useEffect(() => {
    void loadCalendarEvents();
  }, [
    loadCalendarEvents,
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

  const calendarEvents =
    useMemo(
      () =>
        calendarEventsState.status ===
        'success'
          ? calendarEventsState.data
          : [],
      [
        calendarEventsState,
      ],
    );

  const calendarDays =
    useMemo(
      () =>
        getCalendarMonthDays(
          calendarMonth,
        ),
      [calendarMonth],
    );

  const selectedCalendarEvents =
    useMemo(
      () =>
        selectedCalendarDay ===
        null
          ? []
          : getEventsOnCalendarDay(
              calendarEvents,
              calendarMonth,
              selectedCalendarDay,
            ),
      [
        calendarEvents,
        calendarMonth,
        selectedCalendarDay,
      ],
    );

  const nextEvent =
    useMemo(
      () => {
        const now =
          Date.now();

        return (
          [
            ...events,
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
        events,
      ],
    );

  const remainingEvents =
    useMemo(
      () =>
        nextEvent ===
        null
          ? events
          : events.filter(
              (event) =>
                event.id !==
                nextEvent.id,
            ),
      [
        nextEvent,
        events,
      ],
    );

  const hasMoreEvents =
    pagination !==
      null &&
    pagination.page <
      pagination.totalPages;

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

          {categories.length > 0 && (
            <section
              className="zf-explore__filters"
              aria-label="Filtrar eventos por categoría"
            >
              <FilterChip
                label="Todos"
                selected={
                  selectedCategoryId ===
                  null
                }
                onClick={() => {
                  setSelectedCategoryId(
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
                      category.id
                    }
                    label={
                      category.nombre
                    }
                    selected={
                      selectedCategoryId ===
                      category.id
                    }
                    onClick={() => {
                      setSelectedCategoryId(
                        category.id,
                      );
                    }}
                  />
                ),
              )}
            </section>
          )}
          <section
            className="zf-explore__calendar"
            aria-labelledby="zf-calendar-heading"
          >
            <div className="zf-explore__section-heading">
              <h2 id="zf-calendar-heading">
                {`Calendario de ${formatCalendarMonthLabel(
                  calendarMonth,
                )}`}
              </h2>

              <div
                className="zf-explore__calendar-navigation"
                aria-label="Navegación del calendario"
              >
                <button
                  type="button"
                  className="zf-explore__calendar-navigation-button"
                  aria-label="Mes anterior"
                  onClick={() => {
                    setSelectedCalendarDay(
                      null,
                    );
                    setCalendarMonth(
                      (currentMonth) =>
                        shiftCalendarMonth(
                          currentMonth,
                          -1,
                        ),
                    );
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="zf-explore__calendar-navigation-button"
                  aria-label="Mes siguiente"
                  onClick={() => {
                    setSelectedCalendarDay(
                      null,
                    );
                    setCalendarMonth(
                      (currentMonth) =>
                        shiftCalendarMonth(
                          currentMonth,
                          1,
                        ),
                    );
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            {(
              calendarEventsState.status ===
                'idle' ||
              calendarEventsState.status ===
                'loading'
            ) && (
              <AsyncStateView
                state="loading"
                title="Cargando calendario"
                message="Estamos consultando los eventos del mes."
              />
            )}
            {calendarEventsState.status ===
              'error' && (
              <AsyncStateView
                state="error"
                title="No pudimos cargar el calendario"
                message={
                  calendarEventsState.error
                }
                onAction={() => {
                  void loadCalendarEvents();
                }}
              />
            )}
            {calendarEventsState.status ===
              'success' && (
              <div className="zf-explore__calendar-grid">
                {CALENDAR_WEEKDAYS.map(
                  ([shortLabel, fullLabel]) => (
                    <abbr
                      key={shortLabel}
                      className="zf-explore__calendar-weekday"
                      title={fullLabel}
                    >
                      {shortLabel}
                    </abbr>
                  ),
                )}

                {calendarDays.map(
                  (day) => {
                    const eventCount =
                      countEventsOnCalendarDay(
                        calendarEvents,
                        calendarMonth,
                        day,
                      );

                    return (
                      <button
                        key={day}
                        type="button"
                        className="zf-explore__calendar-day"
                        style={
                          day === 1
                            ? {
                                gridColumnStart:
                                  getCalendarMonthStartColumn(
                                    calendarMonth,
                                  ),
                              }
                            : undefined
                        }
                        aria-label={formatCalendarDayAriaLabel(
                          calendarMonth,
                          day,
                          eventCount,
                        )}
                        aria-pressed={
                          selectedCalendarDay ===
                          day
                        }
                        onClick={() => {
                          setSelectedCalendarDay(
                            day,
                          );
                        }}
                      >
                        <span>
                          {day}
                        </span>
                        {eventCount >
                          0 && (
                          <span
                            className="zf-explore__calendar-event-count"
                            aria-hidden="true"
                          >
                            {eventCount}
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {selectedCalendarDay !==
            null &&
            selectedCalendarEvents.length >
              0 && (
              <section
                className="zf-explore__calendar-events"
                aria-labelledby="zf-calendar-events-heading"
              >
                <div className="zf-explore__section-heading">
                  <h2 id="zf-calendar-events-heading">
                    {`Eventos del ${formatCalendarDayLabel(
                      calendarMonth,
                      selectedCalendarDay,
                    )}`}
                  </h2>
                </div>

                <div
                  className="zf-explore__list"
                  aria-label="Eventos del día seleccionado"
                >
                  {selectedCalendarEvents.map(
                    (event) => (
                      <EventCard
                        key={event.id}
                        variant="compact"
                        title={event.titulo}
                        description={
                          event.descripcion ??
                          undefined
                        }
                        dateLabel={formatEventDate(
                          event.fechaInicio,
                        )}
                        locationLabel={
                          event.lugar.nombre
                        }
                        categoryLabels={
                          event.categorias.map(
                            (category) =>
                              category.nombre,
                          )
                        }
                        costLabel={formatEventCost(
                          event.costoReferencial,
                        )}
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
            selectedCategoryId ===
              null &&
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
            (
              events.length >
                0 ||
              selectedCategoryId !==
                null
            ) && (
              <>


                {events.length ===
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

                {loadMoreError !==
                  null && (
                  <p role="alert">
                    {
                      loadMoreError
                    }
                  </p>
                )}

                {hasMoreEvents && (
                  <IonButton
                    type="button"
                    expand="block"
                    disabled={
                      isLoadingMore
                    }
                    aria-busy={
                      isLoadingMore
                    }
                    onClick={() => {
                      void loadMoreEvents();
                    }}
                  >
                    {isLoadingMore
                      ? 'Cargando más eventos...'
                      : 'Cargar más'}
                  </IonButton>
                )}
              </>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default ExploreEventsPage;
