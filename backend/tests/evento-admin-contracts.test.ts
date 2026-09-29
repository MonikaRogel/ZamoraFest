import { describe, expect, it } from 'vitest';
import { listAdminEventosQuerySchema } from '../src/modules/eventos/evento.schemas.js';
describe('Contrato HTTP de administración de eventos', () => {
  it('aplica paginación predeterminada', () => {
    expect(listAdminEventosQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });
  it('acepta filtros canónicos de estado', () => {
    expect(
      listAdminEventosQuerySchema.parse({
        page: '2',
        limit: '10',
        estadoRevision: 'PENDIENTE',
        estadoEvento: 'BORRADOR',
      }),
    ).toEqual({ page: 2, limit: 10, estadoRevision: 'PENDIENTE', estadoEvento: 'BORRADOR' });
  });
  it('acepta estados de revisión existentes', () => {
    for (const estadoRevision of ['PENDIENTE', 'APROBADO', 'RECHAZADO'] as const) {
      expect(listAdminEventosQuerySchema.parse({ estadoRevision }).estadoRevision).toBe(
        estadoRevision,
      );
    }
  });
  it('rechaza estados inventados', () => {
    expect(() => listAdminEventosQuerySchema.parse({ estadoRevision: 'SIN_ENVIAR' })).toThrow();
    expect(() => listAdminEventosQuerySchema.parse({ estadoEvento: 'PUBLICADO' })).toThrow();
  });
  it('mantiene límite máximo de cincuenta', () => {
    expect(() => listAdminEventosQuerySchema.parse({ limit: '51' })).toThrow();
  });
});
