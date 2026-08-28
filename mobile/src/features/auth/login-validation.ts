import type { LoginRequest } from '../../types/api';

export interface LoginFormValues {
  readonly email: string;
  readonly password: string;
}

export interface LoginFieldErrors {
  readonly email?: string;
  readonly password?: string;
}

export type LoginValidationResult =
  | {
      readonly ok: true;
      readonly input: LoginRequest;
    }
  | {
      readonly ok: false;
      readonly errors: LoginFieldErrors;
    };

const EMAIL_MAX_LENGTH = 254;
const BCRYPT_MAX_BYTES = 72;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function passwordBytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function hasValidEmailShape(value: string): boolean {
  const atIndex = value.indexOf('@');

  if (
    atIndex <= 0 ||
    atIndex !== value.lastIndexOf('@') ||
    value.includes(' ')
  ) {
    return false;
  }

  const domain = value.slice(atIndex + 1);

  return (
    domain.length > 0 &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.')
  );
}

export function validateLoginForm(
  values: LoginFormValues,
): LoginValidationResult {
  const email = normalizeEmail(values.email);
  const errors: {
    email?: string;
    password?: string;
  } = {};

  if (email.length === 0) {
    errors.email = 'Ingrese su correo electrónico.';
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = 'El correo no puede superar los 254 caracteres.';
  } else if (!hasValidEmailShape(email)) {
    errors.email = 'Ingrese un correo electrónico válido.';
  }

  if (values.password.length === 0) {
    errors.password = 'Ingrese su contraseña.';
  } else if (passwordBytes(values.password) > BCRYPT_MAX_BYTES) {
    errors.password = 'La contraseña supera el límite permitido.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    input: {
      email,
      password: values.password,
    },
  };
}
