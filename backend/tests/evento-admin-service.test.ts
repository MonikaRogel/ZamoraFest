import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';
const admin: IdentidadAcceso = { id: 1, rol: 'ADMINISTRADOR' };
const asistente: IdentidadAcceso = { id: 7, rol: 'ASISTENTE' };
afterEach(() => {
  vi.restoreAllMocks();
});
describe('Listado administrativo de eventos', () => {
  it('permite al ADMINISTRADOR consultar con filtros y paginacion', async () => {
    const spy = vi
      .spyOn(eventoRepository, 'listForAdmin')
      .mockResolvedValue({ total: 3, eventos: [] });
    const result = await eventoService.listAdmin(admin, {
      page: 2,
      limit: 20,
      estadoRevision: 'PENDIENTE',
      estadoEvento: 'BORRADOR',
    });
    expect(spy).toHaveBeenCalledWith(2, 20, {
      estadoRevision: 'PENDIENTE',
      estadoEvento: 'BORRADOR',
    });
    expect(result).toEqual({ data: [], meta: { page: 2, limit: 20, total: 3, totalPages: 1 } });
  });
  it('rechaza roles distintos de ADMINISTRADOR', async () => {
    const spy = vi.spyOn(eventoRepository, 'listForAdmin');
    await expect(eventoService.listAdmin(asistente, { page: 1, limit: 20 })).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
