import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useHistory,
} from 'react-router-dom';

import AsyncStateView from '../components/ui/AsyncStateView';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  ownEventRepository,
} from '../features/events/remote-own-event-repository';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  Evento,
  PaginationMeta,
} from '../types/api';

import './MyEventsPage.css';

const OWN_EVENTS_PAGE_SIZE =
  20;

type PageState =
  | {
      readonly status:
        'loading';
    }
  | {
      readonly status:
        'success';
      readonly events:
        readonly Evento[];
    }
  | {
      readonly status:
        'error';
      readonly message:
        string;
    };

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat(
    'es-EC',
    {
      dateStyle:
        'medium',
      timeStyle:
        'short',
    },
  ).format(
    date,
  );
}

function formatEventStatus(
  value: string,
): string {
  switch (
    value
  ) {
    case 'BORRADOR':
      return 'Borrador';

    case 'PROGRAMADO':
      return 'Programado';

    case 'FINALIZADO':
      return 'Finalizado';

    case 'CANCELADO':
      return 'Cancelado';

    default:
      return value;
  }
}

function formatReviewStatus(
  value: string,
): string {
  switch (
    value
  ) {
    case 'PENDIENTE':
      return 'Pendiente de revisión';

    case 'APROBADO':
      return 'Aprobado';

    case 'RECHAZADO':
      return 'Rechazado';

    default:
      return value;
  }
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
      return 'No fue posible conectarse con ZamoraFest. Revisa tu conexión e intenta nuevamente.';
    }

    if (
      error.kind ===
      'server'
    ) {
      return 'El servicio de gestión no está disponible temporalmente. Intenta nuevamente en unos momentos.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        401
    ) {
      return 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
    }

    if (
      error.kind ===
        'request' &&
      error.status ===
        403
    ) {
      return 'Tu cuenta no tiene autorización para consultar eventos propios.';
    }
  }

  return 'No fue posible cargar tus eventos. Intenta nuevamente.';
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

function MyEventsPage() {
  const history =
    useHistory();

  const {
    accessToken,
  } =
    useApplicationState();

  const [
    pageState,
    setPageState,
  ] = useState<PageState>({
    status:
      'loading',
  });

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

  const loadEvents =
    useCallback(
      async () => {
        if (
          accessToken ===
          null
        ) {
          setPageState({
            status:
              'error',
            message:
              'Tu sesión ya no está disponible. Inicia sesión nuevamente.',
          });

          return;
        }

        setPageState({
          status:
            'loading',
        });

        setPagination(
          null,
        );

        setLoadMoreError(
          null,
        );

        try {
          const page =
            await ownEventRepository
              .listOwnEventPage(
                {
                  page:
                    1,
                  limit:
                    OWN_EVENTS_PAGE_SIZE,
                },
                accessToken,
              );

          setPagination(
            page.meta,
          );

          setPageState({
            status:
              'success',
            events:
              page.events,
          });
        } catch (
          error
        ) {
          setPageState({
            status:
              'error',
            message:
              getErrorMessage(
                error,
              ),
          });
        }
      },
      [
        accessToken,
      ],
    );

  const loadMore =
    useCallback(
      async () => {
        if (
          accessToken ===
            null ||
          pagination ===
            null ||
          pagination.page >=
            pagination.totalPages ||
          isLoadingMore ||
          pageState.status !==
            'success'
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
          const nextPage =
            await ownEventRepository
              .listOwnEventPage(
                {
                  page:
                    pagination.page +
                    1,
                  limit:
                    pagination.limit,
                },
                accessToken,
              );

          setPageState(
            (
              currentState,
            ) => {
              if (
                currentState.status !==
                'success'
              ) {
                return currentState;
              }

              return {
                status:
                  'success',
                events:
                  mergeEvents(
                    currentState.events,
                    nextPage.events,
                  ),
              };
            },
          );

          setPagination(
            nextPage.meta,
          );
        } catch (
          error
        ) {
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
        accessToken,
        isLoadingMore,
        pageState.status,
        pagination,
      ],
    );

  useEffect(
    () => {
      void loadEvents();
    },
    [
      loadEvents,
    ],
  );

  const hasMoreEvents =
    pagination !==
      null &&
    pagination.page <
      pagination.totalPages;

  return (
    <IonPage>
      <IonHeader className="zf-my-events__header">
        <IonToolbar className="zf-my-events__toolbar">
          <IonTitle className="zf-my-events__brand">
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-my-events">
          <IonButton
            className="zf-my-events__back"
            fill="outline"
            type="button"
            aria-label="Volver a mi cuenta"
            onClick={() => {
              history.push(
                '/gestion',
              );
            }}
          >
            Volver a mi cuenta
          </IonButton>

          <ScreenHeader
            eyebrow="Gestión de eventos"
            title="Mis eventos"
            description="Consulta los borradores y eventos que has registrado, junto con su estado de revisión."
          />

          {pageState.status ===
            'loading' && (
            <AsyncStateView
              state="loading"
              title="Cargando tus eventos"
              message="Estamos consultando los eventos asociados a tu cuenta."
            />
          )}

          {pageState.status ===
            'error' && (
            <AsyncStateView
              state="error"
              title="No pudimos cargar tus eventos"
              message={
                pageState.message
              }
              onAction={() => {
                void loadEvents();
              }}
            />
          )}

          {pageState.status ===
            'success' &&
            pageState.events
              .length ===
              0 && (
              <AsyncStateView
                state="empty"
                title="Todavía no tienes eventos"
                message="Crea tu primer borrador para comenzar a gestionar la agenda."
              />
            )}

          {pageState.status ===
            'success' &&
            pageState.events
              .length >
              0 && (
              <section
                className="zf-my-events__section"
                aria-labelledby="zf-my-events-list-title"
              >
                <div className="zf-my-events__section-heading">
                  <div>
                    <h2 id="zf-my-events-list-title">
                      Eventos registrados
                    </h2>

                    {pagination !==
                      null && (
                      <p>
                        {
                          pagination.total
                        }{' '}
                        {pagination.total ===
                        1
                          ? 'evento registrado'
                          : 'eventos registrados'}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="zf-my-events__list"
                  aria-label="Eventos propios"
                >
                  {pageState.events.map(
                    (
                      event,
                    ) => (
                      <article
                        className="zf-my-events__card"
                        key={
                          event.id
                        }
                      >
                        <div className="zf-my-events__status-row">
                          <span
                            className={`zf-my-events__badge zf-my-events__badge--event-${event.estadoEvento.toLowerCase()}`}
                          >
                            {formatEventStatus(
                              event.estadoEvento,
                            )}
                          </span>

                          <span
                            className={`zf-my-events__badge zf-my-events__badge--review-${event.estadoRevision.toLowerCase()}`}
                          >
                            {formatReviewStatus(
                              event.estadoRevision,
                            )}
                          </span>
                        </div>

                        <div className="zf-my-events__card-copy">
                          <h2>
                            {
                              event.titulo
                            }
                          </h2>

                          {event.descripcion !==
                            null && (
                            <p>
                              {
                                event.descripcion
                              }
                            </p>
                          )}
                        </div>

                        <dl className="zf-my-events__details">
                          <div>
                            <dt>
                              Inicio
                            </dt>

                            <dd>
                              {formatDate(
                                event.fechaInicio,
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Fin
                            </dt>

                            <dd>
                              {formatDate(
                                event.fechaFin,
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Lugar
                            </dt>

                            <dd>
                              {
                                event.lugar
                                  .nombre
                              }
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Cantón
                            </dt>

                            <dd>
                              {
                                event.lugar
                                  .sector
                                  .parroquia
                                  .canton
                                  .nombre
                              }
                            </dd>
                          </div>
                        </dl>

                        {event.categorias
                          .length >
                          0 && (
                          <div
                            className="zf-my-events__categories"
                            aria-label={`Categorías de ${event.titulo}`}
                          >
                            {event.categorias.map(
                              (
                                category,
                              ) => (
                                <span
                                  key={
                                    category.id
                                  }
                                >
                                  {
                                    category.nombre
                                  }
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </article>
                    ),
                  )}
                </div>

                {loadMoreError !==
                  null && (
                  <p
                    className="zf-my-events__load-more-error"
                    role="alert"
                  >
                    {
                      loadMoreError
                    }
                  </p>
                )}

                {hasMoreEvents && (
                  <IonButton
                    className="zf-my-events__load-more"
                    expand="block"
                    type="button"
                    disabled={
                      isLoadingMore
                    }
                    aria-busy={
                      isLoadingMore
                    }
                    onClick={() => {
                      void loadMore();
                    }}
                  >
                    {isLoadingMore
                      ? 'Cargando más eventos...'
                      : 'Cargar más'}
                  </IonButton>
                )}
              </section>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default MyEventsPage;