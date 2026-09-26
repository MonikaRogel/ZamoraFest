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

function getInitials(
  name: string | undefined,
): string {
  if (
    name ===
    undefined
  ) {
    return '?';
  }

  const words =
    name
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );

  if (
    words.length ===
    0
  ) {
    return '?';
  }

  return words
    .slice(
      0,
      2,
    )
    .map(
      (word) =>
        word
          .charAt(
            0,
          )
          .toUpperCase(),
    )
    .join(
      '',
    );
}

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
    role ===
      null
      ? 'No disponible'
      : ROLE_LABELS[
          role
        ];

  const description =
    role ===
      'ASISTENTE'
      ? 'Tu sesión está autorizada para registrar eventos y consultar la agenda cultural.'
      : 'Consulta la información y las opciones disponibles para tu cuenta.';

  const initials =
    getInitials(
      user?.nombre,
    );

  function handleMyEvents() {
    history.push(
      '/gestion/eventos',
    );
  }

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
            title="Mi cuenta"
            description={
              description
            }
          />

          <section
            className="zf-management__account-card"
            aria-labelledby="zf-management-account-title"
          >
            <p
              className="zf-management__session-status"
              role="status"
              aria-label="Sesión activa"
            >
              <span
                className="zf-management__status-dot"
                aria-hidden="true"
              />

              Activo
            </p>

            <div className="zf-management__profile">
              <div
                className="zf-management__avatar"
                aria-hidden="true"
              >
                {initials}
              </div>

              <div className="zf-management__profile-copy">
                <h2 id="zf-management-account-title">
                  {user?.nombre ??
                    'Usuario de ZamoraFest'}
                </h2>

                <p className="zf-management__email">
                  {user?.email ??
                    'Correo no disponible'}
                </p>

                <p className="zf-management__role">
                  {roleLabel}
                </p>
              </div>
            </div>
          </section>

          <section
            className="zf-management__actions-card"
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
                <>
                  <div className="zf-management__action-group">
                    <IonButton
                      className="zf-management__secondary-action"
                      fill="outline"
                      expand="block"
                      type="button"
                      aria-label="Mis eventos"
                      onClick={
                        handleMyEvents
                      }
                    >
                      Mis eventos
                    </IonButton>

                    <p className="zf-management__action-note">
                      Consulta tus borradores,
                      eventos registrados y
                      estados de revisión.
                    </p>
                  </div>

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
                </>
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

              <div
                className="zf-management__logout-separator"
                aria-hidden="true"
              />

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
