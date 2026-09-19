import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useRef, useState } from 'react';
import {
  leafOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
} from 'ionicons/icons';

import { validateRegisterForm } from '../features/auth/register-validation';
import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import type { RegisteredVisitor } from '../types/api';

import './LoginPage.css';

function getRegisterErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof ApiRequestError)) {
    return 'No fue posible completar el registro. Intente nuevamente.';
  }

  if (error.status === 409) {
    return 'El correo electrónico ya está registrado.';
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

  return 'No fue posible completar el registro. Intente nuevamente.';
}

function RegisterPage() {
  const [nombre, setNombre] =
    useState('');
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');

  const [
    nombreError,
    setNombreError,
  ] = useState<string>();

  const [
    emailError,
    setEmailError,
  ] = useState<string>();

  const [
    passwordError,
    setPasswordError,
  ] = useState<string>();

  const [
    requestError,
    setRequestError,
  ] = useState<string>();

  const [
    registeredVisitor,
    setRegisteredVisitor,
  ] =
    useState<RegisteredVisitor | null>(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const inFlightRef =
    useRef(false);

  async function handleSubmit() {
    if (inFlightRef.current) {
      return;
    }

    const validation =
      validateRegisterForm({
        nombre,
        email,
        password,
      });

    setRequestError(undefined);

    if (!validation.ok) {
      setNombreError(
        validation.errors.nombre,
      );

      setEmailError(
        validation.errors.email,
      );

      setPasswordError(
        validation.errors.password,
      );

      return;
    }

    setNombreError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);

    inFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const visitor =
        await zamoraFestApi.register(
          validation.input,
        );

      setRegisteredVisitor(
        visitor,
      );
    } catch (error) {
      setRequestError(
        getRegisterErrorMessage(
          error,
        ),
      );
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (registeredVisitor !== null) {
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
                  icon={leafOutline}
                />
              </div>

              <div className="zf-brand-copy">
                <p className="zf-brand-name">
                  Zamora
                  <strong>Fest</strong>
                </p>

                <p className="zf-brand-tagline">
                  Agenda cultural de
                  Zamora Chinchipe
                </p>
              </div>
            </section>

            <IonText className="zf-title">
              <h1>
                Registro completado
              </h1>
            </IonText>

            <IonCard className="zf-auth-card">
              <IonCardContent>
                <IonText>
                  <p>
                    Su cuenta fue creada
                    correctamente. Ahora
                    puede iniciar sesión.
                  </p>
                </IonText>

                <dl className="zf-user-summary">
                  <div>
                    <dt>Nombre</dt>
                    <dd>
                      {
                        registeredVisitor.nombre
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>Correo</dt>
                    <dd>
                      {
                        registeredVisitor.email
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>Rol</dt>
                    <dd>
                      {
                        registeredVisitor.rol
                      }
                    </dd>
                  </div>
                </dl>

                <IonButton
                  className="zf-submit"
                  expand="block"
                  routerLink="/login"
                >
                  Ir a iniciar sesión
                </IonButton>
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
                icon={leafOutline}
              />
            </div>

            <div className="zf-brand-copy">
              <p className="zf-brand-name">
                Zamora
                <strong>Fest</strong>
              </p>

              <p className="zf-brand-tagline">
                Agenda cultural de
                Zamora Chinchipe
              </p>
            </div>
          </section>

          <IonText className="zf-title">
            <h1>
              Crear cuenta
            </h1>
          </IonText>

          <IonCard className="zf-auth-card zf-login-card">
            <IonCardContent>
              <IonText>
                <p>
                  El autorregistro crea
                  únicamente una cuenta
                  de visitante.
                </p>
              </IonText>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
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
                      icon={personOutline}
                      slot="start"
                      aria-hidden="true"
                    />

                    <IonInput
                      label="Nombre completo"
                      labelPlacement="stacked"
                      type="text"
                      autocomplete="name"
                      maxlength={100}
                      value={nombre}
                      aria-invalid={
                        nombreError !==
                        undefined
                      }
                      aria-describedby={
                        nombreError ===
                        undefined
                          ? undefined
                          : 'register-name-error'
                      }
                      onIonInput={(
                        event,
                      ) => {
                        setNombre(
                          event.detail
                            .value ?? '',
                        );
                      }}
                    />
                  </IonItem>

                  {nombreError !==
                    undefined && (
                    <IonNote
                      id="register-name-error"
                      role="alert"
                      className="zf-field-error"
                    >
                      {nombreError}
                    </IonNote>
                  )}

                  <IonItem className="zf-field">
                    <IonIcon
                      className="zf-field-icon"
                      icon={mailOutline}
                      slot="start"
                      aria-hidden="true"
                    />

                    <IonInput
                      label="Correo electrónico"
                      labelPlacement="stacked"
                      type="email"
                      inputmode="email"
                      autocomplete="email"
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
                          : 'register-email-error'
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
                      id="register-email-error"
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
                      autocomplete="new-password"
                      minlength={8}
                      value={password}
                      aria-invalid={
                        passwordError !==
                        undefined
                      }
                      aria-describedby={
                        passwordError ===
                        undefined
                          ? undefined
                          : 'register-password-error'
                      }
                      onIonInput={(
                        event,
                      ) => {
                        setPassword(
                          event.detail
                            .value ?? '',
                        );
                      }}
                    />
                  </IonItem>

                  {passwordError !==
                    undefined && (
                    <IonNote
                      id="register-password-error"
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
                      {requestError}
                    </p>
                  </IonText>
                )}

                <IonButton
                  className="zf-submit"
                  expand="block"
                  type="submit"
                  disabled={isSubmitting}
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
                        Registrando…
                      </span>
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </IonButton>

                <IonButton
                  fill="clear"
                  expand="block"
                  routerLink="/login"
                >
                  Ya tengo una cuenta
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </main>
      </IonContent>
    </IonPage>
  );
}

export default RegisterPage;
