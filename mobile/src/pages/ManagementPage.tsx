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

import PrimaryButton from '../components/ui/PrimaryButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthRole,
} from '../types/api';

import './ManagementPage.css';

const ROLE_LABELS:
  Record<AuthRole, string> = {
    VISITANTE:
      'Visitante',
    ASISTENTE:
      'Asistente',
    ADMINISTRADOR:
      'Administrador',
  };

function ManagementPage() {
  const history =
    useHistory();

  const {
    user,
    role,
    logout,
  } =
    useApplicationState();

  const roleLabel =
    role === null
      ? 'No disponible'
      : ROLE_LABELS[role];

  const description =
    role === 'ASISTENTE'
      ? 'Tu sesión está autorizada para las funciones de gestión compatibles con el rol Asistente.'
      : 'Tu sesión autenticada mantiene acceso únicamente a las funciones compatibles con tu rol.';

  function handleCreateEvent() {
    history.push(
      '/gestion/eventos/nuevo',
    );
  }

  function handleExplore() {
    history.push(
      '/explore',
    );
  }

  function handleLogout() {
    logout();

    history.replace(
      '/login',
    );
  }

  return (
    <IonPage>
      <IonHeader className="zf-management__header">
        <IonToolbar className="zf-management__toolbar">
          <IonTitle className="zf-management__brand">
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-management">
          <ScreenHeader
            eyebrow="Área protegida"
            title="Gestión de ZamoraFest"
            description={
              description
            }
          />

          <section
            className="zf-management__panel"
            aria-labelledby="zf-management-session-title"
          >
            <div className="zf-management__section-heading">
              <h2 id="zf-management-session-title">
                Sesión activa
              </h2>

              <p>
                Información de la cuenta
                autenticada actualmente.
              </p>
            </div>

            <dl className="zf-management__identity">
              <div className="zf-management__identity-item">
                <dt>
                  Nombre
                </dt>

                <dd>
                  {user?.nombre ??
                    'No disponible'}
                </dd>
              </div>

              <div className="zf-management__identity-item">
                <dt>
                  Correo
                </dt>

                <dd>
                  {user?.email ??
                    'No disponible'}
                </dd>
              </div>

              <div className="zf-management__identity-item">
                <dt>
                  Rol
                </dt>

                <dd>
                  {roleLabel}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="zf-management__panel"
            aria-labelledby="zf-management-actions-title"
          >
            <div className="zf-management__section-heading">
              <h2 id="zf-management-actions-title">
                Acciones disponibles
              </h2>

              <p>
                Las opciones mostradas
                respetan la autorización
                asociada a la sesión.
              </p>
            </div>

            <div className="zf-management__actions">
              {role ===
                'ASISTENTE' && (
                <div className="zf-management__action-group">
                  <PrimaryButton
                    ariaLabel="Crear evento"
                    onClick={
                      handleCreateEvent
                    }
                  >
                    Crear evento
                  </PrimaryButton>

                  <p className="zf-management__action-note">
                    Registra un nuevo
                    borrador de evento
                    utilizando los lugares y
                    categorías disponibles.
                  </p>
                </div>
              )}

              <IonButton
                className="zf-management__secondary-action"
                fill="outline"
                expand="block"
                type="button"
                aria-label="Explorar eventos"
                onClick={
                  handleExplore
                }
              >
                Explorar eventos
              </IonButton>

              <IonButton
                className="zf-management__logout"
                fill="clear"
                expand="block"
                type="button"
                aria-label="Cerrar sesión"
                onClick={
                  handleLogout
                }
              >
                Cerrar sesión
              </IonButton>
            </div>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
}

export default ManagementPage;