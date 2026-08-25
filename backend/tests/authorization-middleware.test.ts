import type { NextFunction, Request, Response } from 'express';

import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../src/common/errors/app-error.js';
import { authorizeRoles } from '../src/middleware/auth.js';
import { registerSchema } from '../src/modules/auth/auth.schemas.js';

import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';

function requestWithIdentity(identity?: IdentidadAcceso): Request {
  return {
    auth: identity,
  } as unknown as Request;
}

function responseMock(): Response {
  return {} as Response;
}

function executeAuthorization(
  allowedRoles: Parameters<typeof authorizeRoles>,
  identity?: IdentidadAcceso,
) {
  const request = requestWithIdentity(identity);
  const response = responseMock();
  const next = vi.fn() as unknown as NextFunction;

  const middleware = authorizeRoles(...allowedRoles);

  middleware(request, response, next);

  return vi.mocked(next);
}

describe('T032 - middleware de autorizacion', () => {
  const visitante: IdentidadAcceso = {
    id: 101,
    rol: 'VISITANTE',
  };

  const asistente: IdentidadAcceso = {
    id: 202,
    rol: 'ASISTENTE',
  };

  const administrador: IdentidadAcceso = {
    id: 303,
    rol: 'ADMINISTRADOR',
  };

  it('rechaza una operacion protegida sin identidad', () => {
    const next = executeAuthorization(['VISITANTE']);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(AppError);

    expect(error).toMatchObject({
      statusCode: 401,
      code: 'AUTHENTICATION_REQUIRED',
    });
  });

  it('permite VISITANTE solamente donde su rol fue autorizado', () => {
    const allowed = executeAuthorization(['VISITANTE'], visitante);

    expect(allowed).toHaveBeenCalledWith();

    const denied = executeAuthorization(['ASISTENTE'], visitante);

    const error = denied.mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(AppError);

    expect(error).toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  it('permite ASISTENTE en una operacion reservada al asistente', () => {
    const next = executeAuthorization(['ASISTENTE'], asistente);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('permite ADMINISTRADOR en una operacion administrativa', () => {
    const next = executeAuthorization(['ADMINISTRADOR'], administrador);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('no convierte ADMINISTRADOR en ASISTENTE implicitamente', () => {
    const next = executeAuthorization(['ASISTENTE'], administrador);

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(AppError);

    expect(error).toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });
});

describe('T032 - prevencion de escalamiento en registro', () => {
  const base = {
    nombre: 'Usuario Prueba',
    email: 'usuario@example.com',
    password: 'ClaveSegura123',
  };

  it.each([
    ['rol', 'ADMINISTRADOR'],
    ['idRol', 1],
    ['estado', true],
  ])('rechaza el campo privilegiado %s', (campo, valor) => {
    const result = registerSchema.safeParse({
      ...base,
      [campo]: valor,
    });

    expect(result.success).toBe(false);
  });

  it('acepta un registro sin atributos privilegiados', () => {
    const result = registerSchema.safeParse(base);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error('El registro base fue rechazado.');
    }

    expect(Object.keys(result.data).sort()).toEqual(['email', 'nombre', 'password']);
  });
});
