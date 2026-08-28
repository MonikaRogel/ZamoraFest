import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from '../src/modules/auth/auth.schemas.js';

const EMAIL = 'usuario@example.com';

describe('límite real de bcrypt', () => {
  it('acepta 72 bytes ASCII exactos en login', () => {
    const result = loginSchema.safeParse({
      email: EMAIL,
      password: 'a'.repeat(72),
    });

    expect(result.success).toBe(true);
  });

  it('rechaza 73 bytes ASCII en login', () => {
    const result = loginSchema.safeParse({
      email: EMAIL,
      password: 'a'.repeat(73),
    });

    expect(result.success).toBe(false);
  });

  it('no aplica el mínimo de 8 caracteres de registro al login', () => {
    const result = loginSchema.safeParse({
      email: EMAIL,
      password: '1234567',
    });

    expect(result.success).toBe(true);
  });

  it('acepta exactamente 72 bytes UTF-8 multibyte', () => {
    const result = loginSchema.safeParse({
      email: EMAIL,
      password: 'á'.repeat(36),
    });

    expect(result.success).toBe(true);
  });

  it('rechaza 74 bytes UTF-8 aunque sean solo 37 caracteres', () => {
    const result = loginSchema.safeParse({
      email: EMAIL,
      password: 'á'.repeat(37),
    });

    expect(result.success).toBe(false);
  });

  it('mantiene el mínimo de 8 caracteres en registro', () => {
    const result = registerSchema.safeParse({
      nombre: 'Usuario Seguro',
      email: EMAIL,
      password: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('acepta 72 bytes UTF-8 exactos en registro', () => {
    const result = registerSchema.safeParse({
      nombre: 'Usuario Seguro',
      email: EMAIL,
      password: 'á'.repeat(36),
    });

    expect(result.success).toBe(true);
  });

  it('rechaza más de 72 bytes UTF-8 en registro', () => {
    const result = registerSchema.safeParse({
      nombre: 'Usuario Seguro',
      email: EMAIL,
      password: 'á'.repeat(37),
    });

    expect(result.success).toBe(false);
  });
});
