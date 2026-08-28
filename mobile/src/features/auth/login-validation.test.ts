import { describe, expect, it } from 'vitest';

import { validateLoginForm } from './login-validation';

describe('validateLoginForm', () => {
  it('normaliza el correo con trim y lowercase', () => {
    const result = validateLoginForm({
      email: '  Usuario@Ejemplo.COM  ',
      password: 'Clave123',
    });

    expect(result).toEqual({
      ok: true,
      input: {
        email: 'usuario@ejemplo.com',
        password: 'Clave123',
      },
    });
  });

  it('rechaza correo vacío', () => {
    const result = validateLoginForm({
      email: '   ',
      password: 'Clave123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.email).toBe('Ingrese su correo electrónico.');
    }
  });

  it('rechaza formato de correo inválido', () => {
    const result = validateLoginForm({
      email: 'usuario@@ejemplo.com',
      password: 'Clave123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.email).toBe('Ingrese un correo electrónico válido.');
    }
  });

  it('permite una contraseña menor a 8 caracteres en login', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: '1234567',
    });

    expect(result.ok).toBe(true);
  });

  it('acepta exactamente 72 bytes ASCII', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: 'a'.repeat(72),
    });

    expect(result.ok).toBe(true);
  });

  it('rechaza 73 bytes ASCII', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: 'a'.repeat(73),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.password).toBe('La contraseña supera el límite permitido.');
    }
  });

  it('acepta exactamente 72 bytes UTF-8 multibyte', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: 'á'.repeat(36),
    });

    expect(result.ok).toBe(true);
  });

  it('rechaza 74 bytes UTF-8 aunque sean 37 caracteres', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: 'á'.repeat(37),
    });

    expect(result.ok).toBe(false);
  });

  it('preserva exactamente los espacios de la contraseña', () => {
    const password = '  clave segura  ';

    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.input.password).toBe(password);
    }
  });

  it('rechaza contraseña vacía', () => {
    const result = validateLoginForm({
      email: 'usuario@ejemplo.com',
      password: '',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.password).toBe('Ingrese su contraseña.');
    }
  });
});
