import type { RegisterRequest } from '../../types/api';

export interface RegisterFormValues {
  readonly nombre: string;
  readonly email: string;
  readonly password: string;
}

export interface RegisterFieldErrors {
  readonly nombre?: string;
  readonly email?: string;
  readonly password?: string;
}

export type RegisterValidationResult =
  | {
      readonly ok: true;
      readonly input: RegisterRequest;
    }
  | {
      readonly ok: false;
      readonly errors: RegisterFieldErrors;
    };

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
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

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterValidationResult {
  const nombre = values.nombre.trim();
  const email = normalizeEmail(values.email);

  const errors: {
    nombre?: string;
    email?: string;
    password?: string;
  } = {};

  if (nombre.length === 0) {
    errors.nombre = 'Ingrese su nombre.';
  } else if (nombre.length < NAME_MIN_LENGTH) {
    errors.nombre =
      'El nombre debe tener al menos 2 caracteres.';
  } else if (nombre.length > NAME_MAX_LENGTH) {
    errors.nombre =
      'El nombre no puede superar los 100 caracteres.';
  }

  if (email.length === 0) {
    errors.email = 'Ingrese su correo electrónico.';
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email =
      'El correo no puede superar los 254 caracteres.';
  } else if (!hasValidEmailShape(email)) {
    errors.email =
      'Ingrese un correo electrónico válido.';
  }

  if (values.password.length === 0) {
    errors.password = 'Ingrese una contraseña.';
  } else if (
    values.password.length < PASSWORD_MIN_LENGTH
  ) {
    errors.password =
      'La contraseña debe tener al menos 8 caracteres.';
  } else if (
    passwordBytes(values.password) > BCRYPT_MAX_BYTES
  ) {
    errors.password =
      'La contraseña supera el límite permitido.';
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
      nombre,
      email,
      password: values.password,
    },
  };
}
