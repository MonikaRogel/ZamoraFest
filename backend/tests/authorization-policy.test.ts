import { describe, expect, it } from 'vitest';

import {
  puedeActualizarEvento,
  puedeCrearEvento,
  puedeEliminarEvento,
  puedeGestionarRecursoPropio,
  puedePublicarEvento,
  puedeRevisarEvento,
} from '../src/modules/auth/authorization.policy.js';

import type { IdentidadAcceso, RolAutorizado } from '../src/modules/auth/auth.service.js';

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

describe('T032 - matriz de autorizacion ZamoraFest', () => {
  it('VISITANTE administra solamente recursos propios', () => {
    expect(puedeGestionarRecursoPropio(visitante, visitante.id)).toBe(true);

    expect(puedeGestionarRecursoPropio(visitante, 999)).toBe(false);
  });

  it('ASISTENTE puede crear eventos y actualizar borradores', () => {
    expect(puedeCrearEvento(asistente.rol)).toBe(true);

    expect(puedeActualizarEvento(asistente.rol, 'BORRADOR')).toBe(true);

    expect(puedeActualizarEvento(asistente.rol, 'PROGRAMADO')).toBe(false);

    expect(puedeActualizarEvento(asistente.rol, 'CANCELADO')).toBe(false);

    expect(puedeActualizarEvento(asistente.rol, 'FINALIZADO')).toBe(false);

    expect(puedeActualizarEvento(asistente.rol, 'ELIMINADO')).toBe(false);
  });

  it('ASISTENTE no puede revisar, publicar ni eliminar', () => {
    expect(puedeRevisarEvento(asistente.rol)).toBe(false);

    expect(puedePublicarEvento(asistente.rol)).toBe(false);

    expect(puedeEliminarEvento(asistente.rol)).toBe(false);
  });

  it('ADMINISTRADOR puede revisar, publicar, actualizar y eliminar', () => {
    expect(puedeRevisarEvento(administrador.rol)).toBe(true);

    expect(puedePublicarEvento(administrador.rol)).toBe(true);

    expect(puedeActualizarEvento(administrador.rol, 'BORRADOR')).toBe(true);

    expect(puedeActualizarEvento(administrador.rol, 'PROGRAMADO')).toBe(true);

    expect(puedeEliminarEvento(administrador.rol)).toBe(true);
  });

  it('VISITANTE no obtiene privilegios de gestion de eventos', () => {
    expect(puedeCrearEvento(visitante.rol)).toBe(false);

    expect(puedeActualizarEvento(visitante.rol, 'BORRADOR')).toBe(false);

    expect(puedeRevisarEvento(visitante.rol)).toBe(false);

    expect(puedePublicarEvento(visitante.rol)).toBe(false);

    expect(puedeEliminarEvento(visitante.rol)).toBe(false);
  });

  it('ningun rol obtiene administracion de recursos ajenos por identidad', () => {
    const identidades: IdentidadAcceso[] = [visitante, asistente, administrador];

    for (const identidad of identidades) {
      expect(puedeGestionarRecursoPropio(identidad, identidad.id)).toBe(true);

      expect(puedeGestionarRecursoPropio(identidad, identidad.id + 1)).toBe(false);
    }
  });

  it('ADMINISTRADOR no hereda automaticamente la creacion reservada al ASISTENTE', () => {
    const roles: RolAutorizado[] = ['VISITANTE', 'ASISTENTE', 'ADMINISTRADOR'];

    const autorizados = roles.filter((rol) => puedeCrearEvento(rol));

    expect(autorizados).toEqual(['ASISTENTE']);
  });
});
