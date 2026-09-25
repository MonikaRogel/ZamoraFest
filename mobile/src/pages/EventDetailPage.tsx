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
  useMemo,
  useState,
} from 'react';
import {
  useHistory,
  useParams,
} from 'react-router-dom';

import AsyncStateView from '../components/ui/AsyncStateView';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  EventRepositoryError,
} from '../features/events/event-repository';
import {
  eventRepository,
} from '../features/events/remote-event-repository';
import {
  remoteError,
  remoteLoading,
  remoteSuccess,
  type RemoteData,
} from '../state/remote-data';
import type {
  Evento,
} from '../types/api';

import './EventDetailPage.css';

const POSTGRES_INT_MAX =
  2_147_483_647;

interface EventDetailRouteParams {
  readonly id?: string;
}

function parseEventIdParam(
  value: string | undefined,
): number | null {
  if (
    value === undefined ||
    !/^[1-9]\d*$/.test(value)
  ) {
    return null;
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed < 1 ||
    parsed >
      POSTGRES_INT_MAX
  ) {
    return null;
  }

  return parsed;
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
      dateStyle:
        'long',
      timeStyle:
        'short',
    },
  ).format(
    date,
  );
}

function formatEventDateRange(
  event: Evento,
): string {
  const start =
    formatEventDate(
      event.fechaInicio,
    );

  if (
    event.fechaFin ===
    null
  ) {
    return start;
  }

  const end =
    formatEventDate(
      event.fechaFin,
    );

  return `${start} – ${end}`;
}

function formatEventCost(
  value: number,
): string {
  if (
    value ===
    0
  ) {
    return 'Gratuito';
  }

  return new Intl.NumberFormat(
    'es-EC',
    {
      style:
        'currency',
      currency:
        'USD',
    },
  ).format(
    value,
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

    if (
      error.kind ===
      'request'
    ) {
      return 'No fue posible consultar este evento. Verifique el enlace e intente nuevamente.';
    }
  }

  return 'Ocurrió un error inesperado al consultar el evento.';
}

function EventDetailPage() {
  const history =
    useHistory();

  const {
    id,
  } =
    useParams<
      EventDetailRouteParams
    >();

  const eventId =
    useMemo(
      () =>
        parseEventIdParam(
          id,
        ),
      [
        id,
      ],
    );

  const [
    eventState,
    setEventState,
  ] =
    useState<
      RemoteData<
        Evento | null,
        string
      >
    >(
      remoteLoading(),
    );

  const loadEvent =
    useCallback(
      async () => {
        if (
          eventId ===
          null
        ) {
          return;
        }

        setEventState(
          remoteLoading(),
        );

        try {
          const event =
            await eventRepository
              .getEventById(
                eventId,
              );

          setEventState(
            remoteSuccess(
              event,
            ),
          );
        } catch (
          error
        ) {
          setEventState(
            remoteError(
              getErrorMessage(
                error,
              ),
            ),
          );
        }
      },
      [
        eventId,
      ],
    );

  useEffect(
    () => {
      if (
        eventId ===
        null
      ) {
        return;
      }

      void loadEvent();
    },
    [
      eventId,
      loadEvent,
    ],
  );

  function handleBackToExplore() {
    history.push(
      '/explore',
    );
  }

  const event =
    eventState.status ===
    'success'
      ? eventState.data
      : null;

  return (
    <IonPage>
      <IonHeader className="zf-detail-header">
        <IonToolbar>
          <IonTitle>
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-event-detail">
          <div className="zf-event-detail__navigation">
            <IonButton
              fill="outline"
              type="button"
              aria-label="Volver a eventos"
              onClick={
                handleBackToExplore
              }
            >
              Volver a eventos
            </IonButton>
          </div>

          {eventId ===
            null && (
            <AsyncStateView
              state="error"
              title="Enlace de evento inválido"
              message="El identificador del evento debe ser un número entero positivo válido."
            />
          )}

          {eventId !==
            null &&
            (
              eventState.status ===
                'idle' ||
              eventState.status ===
                'loading'
            ) && (
              <AsyncStateView
                state="loading"
                title="Cargando evento"
                message="Estamos consultando la información del evento."
              />
            )}

          {eventId !==
            null &&
            eventState.status ===
              'error' && (
              <AsyncStateView
                state="error"
                title="No pudimos cargar el evento"
                message={
                  eventState.error
                }
                onAction={() => {
                  void loadEvent();
                }}
              />
            )}

          {eventId !==
            null &&
            eventState.status ===
              'success' &&
            eventState.data ===
              null && (
              <AsyncStateView
                state="empty"
                title="Evento no encontrado"
                message="El evento solicitado no existe o no se encuentra disponible públicamente."
              />
            )}

          {eventId !==
            null &&
            event !==
              null && (
              <>
                <ScreenHeader
                  eyebrow="Detalle del evento"
                  title={
                    event.titulo
                  }
                  description={
                    event.descripcion ??
                    undefined
                  }
                />

                <section
                  className="zf-event-detail__panel"
                  aria-labelledby="zf-event-information-heading"
                >
                  <h2
                    id="zf-event-information-heading"
                    className="zf-event-detail__section-title"
                  >
                    Información del evento
                  </h2>

                  <dl className="zf-event-detail__facts">
                    <div className="zf-event-detail__fact">
                      <dt>
                        Fecha
                      </dt>

                      <dd>
                        {formatEventDateRange(
                          event,
                        )}
                      </dd>
                    </div>

                    <div className="zf-event-detail__fact">
                      <dt>
                        Lugar
                      </dt>

                      <dd>
                        {
                          event
                            .lugar
                            .nombre
                        }
                      </dd>
                    </div>

                    <div className="zf-event-detail__fact">
                      <dt>
                        Dirección
                      </dt>

                      <dd>
                        {
                          event
                            .lugar
                            .direccionReferencial
                        }
                      </dd>
                    </div>

                    <div className="zf-event-detail__fact">
                      <dt>
                        Cantón
                      </dt>

                      <dd>
                        {
                          event
                            .lugar
                            .sector
                            .parroquia
                            .canton
                            .nombre
                        }
                      </dd>
                    </div>

                    <div className="zf-event-detail__fact">
                      <dt>
                        Costo
                      </dt>

                      <dd>
                        {formatEventCost(
                          event
                            .costoReferencial,
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section
                  className="zf-event-detail__panel"
                  aria-labelledby="zf-event-categories-heading"
                >
                  <h2
                    id="zf-event-categories-heading"
                    className="zf-event-detail__section-title"
                  >
                    Categorías
                  </h2>

                  <div
                    className="zf-event-detail__categories"
                    aria-label="Categorías del evento"
                  >
                    {event.categorias.map(
                      (
                        category,
                      ) => (
                        <span
                          key={
                            category.id
                          }
                          className="zf-event-detail__category"
                        >
                          {
                            category.nombre
                          }
                        </span>
                      ),
                    )}
                  </div>
                </section>

                {event.fuenteInformacion !==
                  null && (
                  <section
                    className="zf-event-detail__panel"
                    aria-labelledby="zf-event-source-heading"
                  >
                    <h2
                      id="zf-event-source-heading"
                      className="zf-event-detail__section-title"
                    >
                      Fuente de información
                    </h2>

                    <p className="zf-event-detail__source">
                      {
                        event
                          .fuenteInformacion
                      }
                    </p>
                  </section>
                )}
              </>
            )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default EventDetailPage;
