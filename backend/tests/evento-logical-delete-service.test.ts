import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';

const administrador: IdentidadAcceso = {
  id: 1,
  rol: 'ADMINISTRADOR',
};

const asistente: IdentidadAcceso = {
  id: 7,
  rol: 'ASISTENTE',
};

const visitante: IdentidadAcceso = {
  id: 20,
  rol: 'VISITANTE',
};

function eventoDisponible() {
  return {
    id: 100,
    estadoEvento: 'BORRADOR',
  } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('T036 - servicio de eliminación lógica', () => {
  it('ADMINISTRADOR elimina lógicamente e invalida caché', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(eventoDisponible());

    const deleteSpy = vi.spyOn(eventoRepository, 'logicalDelete').mockResolvedValue({
      id: 100,
      estadoEvento: 'ELIMINADO',
    } as never);

    const invalidateSpy = vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await eventoService.remove(100, administrador);

    expect(deleteSpy).toHaveBeenCalledWith(100);

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it('ASISTENTE no puede eliminar eventos', async () => {
    const findSpy = vi.spyOn(eventoRepository, 'findById');

    const deleteSpy = vi.spyOn(eventoRepository, 'logicalDelete');

    await expect(eventoService.remove(100, asistente)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(findSpy).not.toHaveBeenCalled();

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('VISITANTE no puede eliminar eventos', async () => {
    const findSpy = vi.spyOn(eventoRepository, 'findById');

    const deleteSpy = vi.spyOn(eventoRepository, 'logicalDelete');

    await expect(eventoService.remove(100, visitante)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(findSpy).not.toHaveBeenCalled();

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('no vuelve a eliminar un evento inexistente o eliminado', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(null);

    const deleteSpy = vi.spyOn(eventoRepository, 'logicalDelete');

    await expect(eventoService.remove(100, administrador)).rejects.toMatchObject({
      statusCode: 404,
      code: 'EVENTO_NOT_FOUND',
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
