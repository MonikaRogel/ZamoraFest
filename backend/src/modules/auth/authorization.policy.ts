import type { IdentidadAcceso, RolAutorizado } from './auth.service.js';

export type EstadoEventoAutorizacion =
  'BORRADOR' | 'PROGRAMADO' | 'CANCELADO' | 'FINALIZADO' | 'ELIMINADO';

export function puedeGestionarRecursoPropio(
  identidad: IdentidadAcceso,
  usuarioPropietarioId: number,
): boolean {
  return identidad.id === usuarioPropietarioId;
}

export function puedeCrearEvento(rol: RolAutorizado): boolean {
  return rol === 'ASISTENTE';
}

export function puedeActualizarEvento(
  rol: RolAutorizado,
  estadoEvento: EstadoEventoAutorizacion,
): boolean {
  if (rol === 'ADMINISTRADOR') {
    return true;
  }

  return rol === 'ASISTENTE' && estadoEvento === 'BORRADOR';
}

export function puedeRevisarEvento(rol: RolAutorizado): boolean {
  return rol === 'ADMINISTRADOR';
}

export function puedePublicarEvento(rol: RolAutorizado): boolean {
  return rol === 'ADMINISTRADOR';
}

export function puedeEliminarEvento(rol: RolAutorizado): boolean {
  return rol === 'ADMINISTRADOR';
}
