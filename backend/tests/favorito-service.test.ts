import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { favoritoRepository } from '../src/modules/favoritos/favorito.repository.js';
import { favoritoService } from '../src/modules/favoritos/favorito.service.js';

const visitante: IdentidadAcceso = {
  id: 20,
  rol: 'VISITANTE',
};

function buildFavorito() {
  return {
    idUsuario: 20,
    idEvento: 100,
    fechaAgregado: new Date('2026-08-20T20:30:00.000Z'),
    evento: {
      id: 100,
      titulo: 'Festival Cultural',
      fechaInicio: new Date('2026-09-05T09:30:00.000Z'),
      fechaFin: new Date('2026-09-05T18:00:00.000Z'),
      costoReferencial: {
        toString: () => '0',
      },
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
      lugar: {
        id: 10,
        nombre: 'Parque Central',
        sector: {
          parroquia: {
            canton: {
              id: 3,
              nombre: 'Zamora',
            },
          },
        },
      },
      categorias: [
        {
          categoria: {
            id: 5,
            nombre: 'Cultura',
          },
        },
      ],
    },
  } as never;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('T038 - servicio de favoritos', () => {
  it('VISITANTE crea favorito usando su identidad JWT', async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-08-21T01:30:00.000Z'));

    const findEventSpy = vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue({
      id: 100,
    } as never);

    const findFavoriteSpy = vi
      .spyOn(favoritoRepository, 'findByUserAndEvent')
      .mockResolvedValue(null);

    const createSpy = vi.spyOn(favoritoRepository, 'create').mockResolvedValue(buildFavorito());

    const result = await favoritoService.create(visitante, {
      eventoId: 100,
    });

    expect(findEventSpy).toHaveBeenCalledWith(100, 'basic');

    expect(findFavoriteSpy).toHaveBeenCalledWith(20, 100);

    expect(createSpy).toHaveBeenCalledWith({
      idUsuario: 20,
      idEvento: 100,
      fechaAgregado: new Date('2026-08-20T20:30:00.000Z'),
    });

    expect(result).toMatchObject({
      eventoId: 100,
      evento: {
        id: 100,
        titulo: 'Festival Cultural',
      },
    });
  });

  it('impide favorito duplicado', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue({
      id: 100,
    } as never);

    vi.spyOn(favoritoRepository, 'findByUserAndEvent').mockResolvedValue({
      idUsuario: 20,
      idEvento: 100,
    });

    const createSpy = vi.spyOn(favoritoRepository, 'create');

    await expect(
      favoritoService.create(visitante, {
        eventoId: 100,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'FAVORITE_ALREADY_EXISTS',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('no permite marcar como favorito un evento no público', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(null);

    const findFavoriteSpy = vi.spyOn(favoritoRepository, 'findByUserAndEvent');

    const createSpy = vi.spyOn(favoritoRepository, 'create');

    await expect(
      favoritoService.create(visitante, {
        eventoId: 100,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'FAVORITE_EVENT_NOT_AVAILABLE',
    });

    expect(findFavoriteSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('lista solamente favoritos propios', async () => {
    const listSpy = vi.spyOn(favoritoRepository, 'listByUser').mockResolvedValue([buildFavorito()]);

    const result = await favoritoService.list(visitante);

    expect(listSpy).toHaveBeenCalledWith(20);

    expect(result).toHaveLength(1);

    expect(result[0]).toMatchObject({
      eventoId: 100,
    });
  });

  it('elimina únicamente favorito propio', async () => {
    const deleteSpy = vi.spyOn(favoritoRepository, 'deleteOwn').mockResolvedValue({
      count: 1,
    });

    await favoritoService.remove(visitante, 100);

    expect(deleteSpy).toHaveBeenCalledWith(20, 100);
  });

  it('responde 404 cuando el favorito propio no existe', async () => {
    vi.spyOn(favoritoRepository, 'deleteOwn').mockResolvedValue({
      count: 0,
    });

    await expect(favoritoService.remove(visitante, 100)).rejects.toMatchObject({
      statusCode: 404,
      code: 'FAVORITE_NOT_FOUND',
    });
  });
});
