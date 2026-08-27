import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';

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
  const [viewState, setViewState] = useState<ViewState>({
    status: 'loading',
  });
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEnvironmentStatus() {
      try {
        const health = await zamoraFestApi.getHealth();
        const eventos = await zamoraFestApi.getEventos();

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
            message: getErrorMessage(error),
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
    setViewState({ status: 'loading' });
    setRequestVersion((currentVersion) => currentVersion + 1);
  }

  const firstEvent =
    viewState.status === 'success'
      ? viewState.eventos.data[0]
      : undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ZamoraFest</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="environment-page">
        <main className="environment-shell">
          <section className="environment-introduction">
            <IonText color="dark">
              <h1>Entorno móvil</h1>
            </IonText>
            <p>
              Verificación de ejecución e integración con la API de
              ZamoraFest.
            </p>
          </section>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Aplicación</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="status-row">
              <span>Ionic React en ejecución</span>
              <IonBadge color="success">Activa</IonBadge>
            </IonCardContent>
          </IonCard>

          {viewState.status === 'loading' && (
            <IonCard>
              <IonCardContent className="loading-state">
                <IonSpinner name="crescent" />
                <span>Verificando conectividad y eventos…</span>
              </IonCardContent>
            </IonCard>
          )}

          {viewState.status === 'error' && (
            <IonCard color="light">
              <IonCardHeader>
                <IonCardTitle>Conexión no disponible</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="danger">
                  <p>{viewState.message}</p>
                </IonText>
                <IonButton onClick={retry}>Reintentar</IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {viewState.status === 'success' && (
            <>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Backend</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="status-row">
                    <span>Estado de salud</span>
                    <IonBadge color="success">
                      {viewState.health.status}
                    </IonBadge>
                  </div>
                  <dl className="response-summary">
                    <div>
                      <dt>Servicio</dt>
                      <dd>{viewState.health.service}</dd>
                    </div>
                    <div>
                      <dt>Conectividad</dt>
                      <dd>Verificada</dd>
                    </div>
                  </dl>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Respuesta de eventos</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <dl className="response-summary">
                    <div>
                      <dt>Recibidos</dt>
                      <dd>{viewState.eventos.data.length}</dd>
                    </div>
                    <div>
                      <dt>Total disponible</dt>
                      <dd>{viewState.eventos.meta.total}</dd>
                    </div>
                    <div>
                      <dt>Página</dt>
                      <dd>
                        {viewState.eventos.meta.page} de{' '}
                        {viewState.eventos.meta.totalPages}
                      </dd>
                    </div>
                    <div>
                      <dt>Evento de muestra</dt>
                      <dd>{firstEvent?.titulo ?? 'Sin eventos'}</dd>
                    </div>
                  </dl>
                </IonCardContent>
              </IonCard>
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default EnvironmentStatusPage;
