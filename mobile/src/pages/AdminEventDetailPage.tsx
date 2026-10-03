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
  adminEventRepository,
} from '../features/events/remote-admin-event-repository';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';
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
      return 'El servicio de administración no está disponible temporalmente. Intenta nuevamente en unos momentos.';
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

function AdminEventDetailPage() {
  const history =
    useHistory();

  const {
    accessToken,
    invalidateSession,
  } =
    useApplicationState();

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

  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation,
  ] =
    useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);

  const loadEvent =
    useCallback(
      async () => {
        if (
          eventId ===
          null
        ) {
          return;
        }

        if (
          accessToken ===
          null
        ) {
          setEventState(
            remoteError(
              'Tu sesión ya no está disponible. Inicia sesión nuevamente.',
            ),
          );

          return;
        }

        setEventState(
          remoteLoading(),
        );

        try {
          const event =
            await adminEventRepository
              .getAdminEventById(
                eventId,
                accessToken,
              );

          setEventState(
            remoteSuccess(
              event,
            ),
          );
        } catch (
          error
        ) {
          if (
            isAuthenticationFailure(
              error,
            )
          ) {
            invalidateSession();

            return;
          }

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
        accessToken,
        eventId,
        invalidateSession,
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

  function handleBackToAdminEvents() {
    history.push(
      '/gestion/admin/eventos',
    );
  }

  async function handleReview(
    decision: 'APROBAR' | 'RECHAZAR',
  ) {
    if (eventId === null || accessToken === null) {
      return;
    }

    try {
      const updatedEvent = await adminEventRepository.reviewEvent(
        eventId,
        { decision },
        accessToken,
      );

      setEventState(remoteSuccess(updatedEvent));
    } catch (error) {
      if (isAuthenticationFailure(error)) {
        invalidateSession();
        return;
      }

      setEventState(remoteError(getErrorMessage(error)));
    }
  }

  async function handlePublish() {
    if (eventId === null || accessToken === null) {
      return;
    }

    try {
      const updatedEvent = await adminEventRepository.publishEvent(
        eventId,
        accessToken,
      );

      setEventState(remoteSuccess(updatedEvent));
    } catch (error) {
      if (isAuthenticationFailure(error)) {
        invalidateSession();
        return;
      }

      setEventState(remoteError(getErrorMessage(error)));
    }
  }

  async function handleDelete() {
    if (
      eventId === null ||
      accessToken === null
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await adminEventRepository
        .deleteEvent(
          eventId,
          accessToken,
        );

      setIsDeleting(false);

      history.push(
        '/gestion/admin/eventos',
      );
    } catch (error) {
      setIsDeleting(false);

      if (
        isAuthenticationFailure(
          error,
        )
      ) {
        invalidateSession();

        return;
      }

      setShowDeleteConfirmation(
        false,
      );

      setEventState(
        remoteError(
          getErrorMessage(
            error,
          ),
        ),
      );
    }
  }

  const event =
    eventState.status ===
    'success'
      ? eventState.data
      : null;

  const canReview =
    event !== null &&
    event.estadoEvento ===
      'BORRADOR' &&
    (
      event.estadoRevision ===
        'PENDIENTE' ||
      event.estadoRevision ===
        'RECHAZADO'
    );

  const canPublish =
    event !== null &&
    event.estadoEvento ===
      'BORRADOR' &&
    event.estadoRevision ===
      'APROBADO';

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
                handleBackToAdminEvents
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
                message="El evento solicitado no existe o ya no está disponible."
              />
            )}

          {eventId !==
            null &&
            event !==
              null && (
              <>
                <ScreenHeader
                  eyebrow="Detalle administrativo"
                  title={
                    event.titulo
                  }
                  description={
                    event.descripcion ??
                    undefined
                  }
                />

                {canReview && (
                  <section className="zf-event-detail__panel" aria-label="Acciones de revisión">
                    <IonButton type="button" onClick={() => { void handleReview('APROBAR'); }}>
                      Aprobar
                    </IonButton>
                    <IonButton type="button" fill="outline" onClick={() => { void handleReview('RECHAZAR'); }}>
                      Rechazar
                    </IonButton>
                  </section>
                )}
                {canPublish && (
                  <section className="zf-event-detail__panel" aria-label="Acciones de publicación">
                    <IonButton type="button" onClick={() => { void handlePublish(); }}>
                      Publicar
                    </IonButton>
                  </section>
                )}
                <section
                  className="zf-event-detail__panel"
                  aria-label="Acciones de eliminación"
                >
                  <IonButton
                    type="button"
                    fill="outline"
                    color="danger"
                    disabled={
                      isDeleting
                    }
                    onClick={() => {
                      setShowDeleteConfirmation(
                        true,
                      );
                    }}
                  >
                    Eliminar evento
                  </IonButton>

                  {showDeleteConfirmation && (
                    <div
                      role="alert"
                    >
                      <p>
                        Esta acción marcará el evento como eliminado y dejará de estar disponible.
                      </p>

                      <IonButton
                        type="button"
                        color="danger"
                        disabled={
                          isDeleting
                        }
                        onClick={() => {
                          void handleDelete();
                        }}
                      >
                        {isDeleting
                          ? 'Eliminando...'
                          : 'Confirmar eliminación'}
                      </IonButton>

                      <IonButton
                        type="button"
                        fill="clear"
                        disabled={
                          isDeleting
                        }
                        onClick={() => {
                          setShowDeleteConfirmation(
                            false,
                          );
                        }}
                      >
                        Cancelar
                      </IonButton>
                    </div>
                  )}
                </section>

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
                    <div className="zf-event-detail__fact">
                      <dt>Estado</dt>
                      <dd>
                        {formatEventStatus(event.estadoEvento)}
                      </dd>
                    </div>
                    <div className="zf-event-detail__fact">
                      <dt>Revisión</dt>
                      <dd>
                        {formatReviewStatus(event.estadoRevision)}
                      </dd>
                    </div>
                    <div className="zf-event-detail__fact">
                      <dt>Registrado por</dt>
                      <dd>
                        {event.usuarioCreador.nombreCompleto}
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

export default AdminEventDetailPage;
