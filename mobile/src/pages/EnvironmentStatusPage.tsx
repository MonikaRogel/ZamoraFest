import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useEffect,
  useState,
} from 'react';

import AsyncStateView from '../components/ui/AsyncStateView';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import type {
  EventosResponse,
  HealthResponse,
} from '../types/api';

import './EnvironmentStatusPage.css';

type ViewState =
  | {
      readonly status: 'loading';
    }
  | {
      readonly status: 'success';
      readonly health: HealthResponse;
      readonly eventos: EventosResponse;
    }
  | {
      readonly status: 'error';
      readonly message: string;
    };

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'No se pudo completar la verificación del entorno.';
}

function EnvironmentStatusPage() {
  const [
    viewState,
    setViewState,
  ] = useState<ViewState>({
    status: 'loading',
  });

  const [
    requestVersion,
    setRequestVersion,
  ] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEnvironmentStatus() {
      try {
        const health =
          await zamoraFestApi.getHealth();

        const eventos =
          await zamoraFestApi.getEventos();

        if (active) {
          setViewState({
            status: 'success',
            health,
            eventos,
          });
        }
      } catch (error) {
        if (active) {
          setViewState({
            status: 'error',
            message:
              getErrorMessage(
                error,
              ),
          });
        }
      }
    }

    void loadEnvironmentStatus();

    return () => {
      active = false;
    };
  }, [requestVersion]);

  function retry() {
    setViewState({
      status: 'loading',
    });

    setRequestVersion(
      (currentVersion) =>
        currentVersion + 1,
    );
  }

  const firstEvent =
    viewState.status ===
    'success'
      ? viewState.eventos
          .data[0]
      : undefined;

  return (
    <IonPage>
      <IonHeader className="zf-environment__header">
        <IonToolbar className="zf-environment__toolbar">
          <IonTitle className="zf-environment__brand">
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-environment">
          <ScreenHeader
            eyebrow="Diagnóstico técnico"
            title="Entorno móvil"
            description="Verificación de ejecución e integración con la API de ZamoraFest."
          />

          <section
            className="zf-environment__panel"
            aria-labelledby="zf-environment-app-title"
          >
            <div className="zf-environment__status-row">
              <div>
                <h2 id="zf-environment-app-title">
                  Aplicación
                </h2>

                <p>
                  Ionic React en
                  ejecución.
                </p>
              </div>

              <span className="zf-environment__badge">
                Activa
              </span>
            </div>
          </section>

          {viewState.status ===
            'loading' && (
            <AsyncStateView
              state="loading"
              title="Verificando entorno"
              message="Estamos comprobando la conectividad con el backend y la disponibilidad de eventos."
            />
          )}

          {viewState.status ===
            'error' && (
            <AsyncStateView
              state="error"
              title="Conexión no disponible"
              message={
                viewState.message
              }
              actionLabel="Reintentar"
              onAction={
                retry
              }
            />
          )}

          {viewState.status ===
            'success' && (
            <>
              <section
                className="zf-environment__panel"
                aria-labelledby="zf-environment-backend-title"
              >
                <div className="zf-environment__status-row">
                  <div>
                    <h2 id="zf-environment-backend-title">
                      Backend
                    </h2>

                    <p>
                      Estado de la API
                      conectada.
                    </p>
                  </div>

                  <span className="zf-environment__badge">
                    {
                      viewState
                        .health
                        .status
                    }
                  </span>
                </div>

                <dl className="zf-environment__summary">
                  <div>
                    <dt>
                      Servicio
                    </dt>

                    <dd>
                      {
                        viewState
                          .health
                          .service
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Conectividad
                    </dt>

                    <dd>
                      Verificada
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className="zf-environment__panel"
                aria-labelledby="zf-environment-events-title"
              >
                <div className="zf-environment__section-heading">
                  <h2 id="zf-environment-events-title">
                    Respuesta de eventos
                  </h2>

                  <p>
                    Resumen de la
                    respuesta obtenida
                    desde la API.
                  </p>
                </div>

                <dl className="zf-environment__summary">
                  <div>
                    <dt>
                      Recibidos
                    </dt>

                    <dd>
                      {
                        viewState
                          .eventos
                          .data
                          .length
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Total disponible
                    </dt>

                    <dd>
                      {
                        viewState
                          .eventos
                          .meta
                          .total
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Página
                    </dt>

                    <dd>
                      {
                        viewState
                          .eventos
                          .meta
                          .page
                      }{' '}
                      de{' '}
                      {
                        viewState
                          .eventos
                          .meta
                          .totalPages
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Evento de muestra
                    </dt>

                    <dd>
                      {
                        firstEvent
                          ?.titulo ??
                        'Sin eventos'
                      }
                    </dd>
                  </div>
                </dl>
              </section>
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default EnvironmentStatusPage;
