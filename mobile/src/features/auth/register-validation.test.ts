import { describe, expect, it } from 'vitest';

import { validateRegisterForm } from './register-validation';

describe('validateRegisterForm', () => {
  it('normaliza nombre y correo antes del registro', () => {
    const result = validateRegisterForm({
      nombre: '  María Pérez  ',
      email: '  Maria@Ejemplo.COM  ',
      password: 'ClaveDemo123',
    });

    expect(result).toEqual({
      ok: true,
      input: {
        nombre: 'María Pérez',
        email: 'maria@ejemplo.com',
        password: 'ClaveDemo123',
      },
    });
  });

  it('rechaza nombre vacío', () => {
    const result = validateRegisterForm({
      nombre: '   ',
      email: 'usuario@ejemplo.com',
      password: 'ClaveDemo123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.nombre).toBe(
        'Ingrese su nombre.',
      );
    }
  });

  it('rechaza nombre menor a dos caracteres', () => {
    const result = validateRegisterForm({
      nombre: 'A',
      email: 'usuario@ejemplo.com',
      password: 'ClaveDemo123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.nombre).toBe(
        'El nombre debe tener al menos 2 caracteres.',
      );
    }
  });

  it('rechaza nombre superior a cien caracteres', () => {
    const result = validateRegisterForm({
      nombre: 'A'.repeat(101),
      email: 'usuario@ejemplo.com',
      password: 'ClaveDemo123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.nombre).toBe(
        'El nombre no puede superar los 100 caracteres.',
      );
    }
  });

  it('rechaza correo inválido', () => {
    const result = validateRegisterForm({
      nombre: 'Usuario Demo',
      email: 'usuario@@ejemplo.com',
      password: 'ClaveDemo123',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.email).toBe(
        'Ingrese un correo electrónico válido.',
      );
    }
  });

  it('exige al menos ocho caracteres de contraseña', () => {
    const result = validateRegisterForm({
      nombre: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      password: '1234567',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.password).toBe(
        'La contraseña debe tener al menos 8 caracteres.',
      );
    }
  });

  it('acepta exactamente 72 bytes UTF-8', () => {
    const result = validateRegisterForm({
      nombre: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      password: 'á'.repeat(36),
    });

    expect(result.ok).toBe(true);
  });

  it('rechaza una contraseña superior a 72 bytes UTF-8', () => {
    const result = validateRegisterForm({
      nombre: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      password: 'á'.repeat(37),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.password).toBe(
        'La contraseña supera el límite permitido.',
      );
    }
  });

  it('preserva exactamente la contraseña', () => {
    const password = '  Clave segura  ';

    const result = validateRegisterForm({
      nombre: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      password,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.input.password).toBe(password);
    }
  });
});
