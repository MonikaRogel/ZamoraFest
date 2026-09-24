import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonList,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  useRef,
  useState,
} from 'react';
import {
  leafOutline,
  lockClosedOutline,
  personOutline,
} from 'ionicons/icons';

import { validateLoginForm } from '../features/auth/login-validation';
import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import { useApplicationState } from '../state/ApplicationStateContext';
import type { AuthenticatedUser } from '../types/api';

import './LoginPage.css';

interface LoginPageProps {
  readonly onAuthenticated?:
    (
      user:
        AuthenticatedUser,
    ) => void;

  readonly registrationSucceeded?:
    boolean;
}

function getLoginErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof ApiRequestError)) {
    return 'No fue posible iniciar sesión. Intente nuevamente.';
  }

  if (error.status === 401) {
    return 'El correo o la contraseña son incorrectos.';
  }

  if (
    error.status === 400 ||
    error.status === 422
  ) {
    return 'Revise los datos ingresados e intente nuevamente.';
  }

  if (error.status === 429) {
    return 'Se realizaron demasiados intentos. Intente nuevamente más tarde.';
  }

  if (error.status === null) {
    return 'No se pudo conectar con ZamoraFest. Verifique la conexión e intente nuevamente.';
  }

  return 'No fue posible iniciar sesión. Intente nuevamente.';
}

function LoginPage({
  onAuthenticated,
  registrationSucceeded =
    false,
}: LoginPageProps) {
  const {
    login,
    user:
      authenticatedUser,
  } =
    useApplicationState();

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    emailError,
    setEmailError,
  ] =
    useState<string>();

  const [
    passwordError,
    setPasswordError,
  ] =
    useState<string>();

  const [
    requestError,
    setRequestError,
  ] =
    useState<string>();

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const inFlightRef =
    useRef(false);

  async function handleSubmit() {
    if (inFlightRef.current) {
      return;
    }

    const validation =
      validateLoginForm({
        email,
        password,
      });

    setRequestError(
      undefined,
    );

    if (!validation.ok) {
      setEmailError(
        validation
          .errors
          .email,
      );

      setPasswordError(
        validation
          .errors
          .password,
      );

      return;
    }

    setEmailError(undefined);
    setPasswordError(
      undefined,
    );

    inFlightRef.current = true;

    setIsSubmitting(
      true,
    );

    try {
      const session =
        await zamoraFestApi
          .login(
            validation.input,
          );

      login(
        session,
      );

      onAuthenticated?.(
        session.usuario,
      );
    } catch (error) {
      setRequestError(
        getLoginErrorMessage(
          error,
        ),
      );
    } finally {
      inFlightRef.current =
        false;

      setIsSubmitting(
        false,
      );
    }
  }

  if (
    authenticatedUser !==
    null
  ) {
    return (
      <IonPage className="zf-auth-page">
        <IonHeader className="zf-auth-header">
          <IonToolbar className="zf-auth-toolbar">
            <IonTitle>
              ZamoraFest
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent
          fullscreen
          className="zf-auth-content"
        >
          <main className="zf-auth-shell">
            <section
              className="zf-brand-block"
              aria-label="ZamoraFest"
            >
              <div
                className="zf-mark"
                aria-hidden="true"
              >
                <IonIcon
                  icon={
                    leafOutline
                  }
                />
              </div>

              <div className="zf-brand-copy">
                <p className="zf-brand-name">
                  Zamora
                  <strong>
                    Fest
                  </strong>
                </p>

                <p className="zf-brand-tagline">
                  Agenda cultural de Zamora Chinchipe
                </p>
              </div>
            </section>

            <IonText className="zf-title">
              <h1>
                Acceso confirmado
              </h1>
            </IonText>

            <IonCard className="zf-auth-card">
              <IonCardHeader>
                <IonCardTitle className="zf-card-title">
                  Usuario autenticado
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <dl className="zf-user-summary">
                  <div>
                    <dt>
                      Identificador
                    </dt>

                    <dd>
                      {
                        authenticatedUser.id
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Nombre
                    </dt>

                    <dd>
                      {
                        authenticatedUser.nombre
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Correo
                    </dt>

                    <dd>
                      {
                        authenticatedUser.email
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Rol
                    </dt>

                    <dd>
                      {
                        authenticatedUser.rol
                      }
                    </dd>
                  </div>
                </dl>
              </IonCardContent>
            </IonCard>
          </main>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="zf-auth-page">
      <IonHeader className="zf-auth-header">
        <IonToolbar className="zf-auth-toolbar">
          <IonTitle>
            ZamoraFest
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className="zf-auth-content"
      >
        <main className="zf-auth-shell">
          <section
            className="zf-brand-block"
            aria-label="ZamoraFest"
          >
            <div
              className="zf-mark"
              aria-hidden="true"
            >
              <IonIcon
                icon={
                  leafOutline
                }
              />
            </div>

            <div className="zf-brand-copy">
              <p className="zf-brand-name">
                Zamora
                <strong>
                  Fest
                </strong>
              </p>

              <p className="zf-brand-tagline">
                Agenda cultural de Zamora Chinchipe
              </p>
            </div>
          </section>

          <IonText className="zf-title">
            <h1>
              Iniciar sesión
            </h1>
          </IonText>

          <IonCard className="zf-auth-card zf-login-card">
            <IonCardContent>
              {registrationSucceeded && (
                <IonText
                  className="zf-registration-success"
                  role="status"
                >
                  <p>
                    Cuenta creada correctamente como visitante. Ahora puede iniciar sesión.
                  </p>
                </IonText>
              )}

              <form
                onSubmit={(
                  event,
                ) => {
                  event
                    .preventDefault();

                  void handleSubmit();
                }}
                noValidate
              >
                <IonList
                  className="zf-fields"
                  lines="none"
                >
                  <IonItem className="zf-field">
                    <IonIcon
                      className="zf-field-icon"
                      icon={
                        personOutline
                      }
                      slot="start"
                      aria-hidden="true"
                    />

                    <IonInput
                      label="Correo electrónico"
                      labelPlacement="stacked"
                      type="email"
                      inputmode="email"
                      autocomplete="username"
                      maxlength={254}
                      value={email}
                      aria-invalid={
                        emailError !==
                        undefined
                      }
                      aria-describedby={
                        emailError ===
                        undefined
                          ? undefined
                          : 'login-email-error'
                      }
                      onIonInput={(
                        event,
                      ) => {
                        setEmail(
                          event.detail
                            .value ?? '',
                        );
                      }}
                    />
                  </IonItem>

                  {emailError !==
                    undefined && (
                    <IonNote
                      id="login-email-error"
                      role="alert"
                      className="zf-field-error"
                    >
                      {emailError}
                    </IonNote>
                  )}

                  <IonItem className="zf-field">
                    <IonIcon
                      className="zf-field-icon"
                      icon={
                        lockClosedOutline
                      }
                      slot="start"
                      aria-hidden="true"
                    />

                    <IonInput
                      label="Contraseña"
                      labelPlacement="stacked"
                      type="password"
                      autocomplete="current-password"
                      value={password}
                      aria-invalid={
                        passwordError !==
                        undefined
                      }
                      aria-describedby={
                        passwordError ===
                        undefined
                          ? undefined
                          : 'login-password-error'
                      }
                      onIonInput={(
                        event,
                      ) => {
                        setPassword(
                          event.detail
                            .value ?? '',
                        );
                      }}
                    >
                      <IonInputPasswordToggle
                        slot="end"
                        color="light"
                      />
                    </IonInput>
                  </IonItem>

                  {passwordError !==
                    undefined && (
                    <IonNote
                      id="login-password-error"
                      role="alert"
                      className="zf-field-error"
                    >
                      {passwordError}
                    </IonNote>
                  )}
                </IonList>

                {requestError !==
                  undefined && (
                  <IonText
                    className="zf-request-error"
                    role="alert"
                  >
                    <p>
                      {
                        requestError
                      }
                    </p>
                  </IonText>
                )}

                <IonButton
                  className="zf-submit"
                  expand="block"
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  aria-busy={
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <IonSpinner
                        name="crescent"
                      />

                      <span className="ion-padding-start">
                        Ingresando…
                      </span>
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </IonButton>

                <IonButton
                  className="zf-auth-secondary"
                  fill="clear"
                  expand="block"
                  routerLink="/register"
                >
                  Crear cuenta
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </main>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;
