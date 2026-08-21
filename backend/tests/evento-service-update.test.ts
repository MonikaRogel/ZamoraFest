import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';

const asistente: IdentidadAcceso = {
  id: 7,
  rol: 'ASISTENTE',
};

const administrador: IdentidadAcceso = {
  id: 1,
  rol: 'ADMINISTRADOR',
};

function buildEvento(
  options: {
    creadorId?: number;
    estadoEvento?: string;
    titulo?: string;
    fechaInicio?: Date;
    fechaFin?: Date | null;
  } = {},
) {
  return {
    id: 100,
    titulo: options.titulo ?? 'Festival Cultural',
    descripcion: 'Evento cultural de prueba.',
    fechaInicio: options.fechaInicio ?? new Date('2026-09-05T09:30:00.000Z'),
    fechaFin:
      options.fechaFin === undefined ? new Date('2026-09-05T18:00:00.000Z') : options.fechaFin,
    costoReferencial: {
      toString: () => '0',
    },
    estadoEvento: options.estadoEvento ?? 'BORRADOR',
    estadoRevision: 'PENDIENTE',
    fuenteInformacion: 'Dirección de Cultura',
    fechaCreacion: new Date('2026-08-20T13:00:00.000Z'),
    fechaActualizacion: null,
    fechaRevision: null,
    lugar: {
      id: 10,
      nombre: 'Parque Central',
      tipoLugar: 'PARQUE',
      direccionReferencial: null,
      referencia: null,
      latitud: null,
      longitud: null,
      sector: {
        id: 5,
        nombre: 'Cabecera parroquial',
        tipoSector: 'CABECERA_PARROQUIAL',
        parroquia: {
          id: 4,
          codigoDpa: '190150',
          nombre: 'Zamora',
          canton: {
            id: 3,
            codigoDpa: '1901',
            nombre: 'Zamora',
            provincia: {
              id: 1,
              codigoDpa: '19',
              nombre: 'Zamora Chinchipe',
            },
          },
        },
      },
    },
    usuarioCreador: {
      id: options.creadorId ?? 7,
      nombreCompleto: 'Asistente de prueba',
      rol: {
        id: 2,
        nombre: 'ASISTENTE',
      },
    },
    usuarioRevisor: null,
    categorias: [
      {
        categoria: {
          id: 20,
          nombre: 'Cultura',
          descripcion: null,
        },
      },
    ],
  } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('T035-C - actualización segura', () => {
  it('permite al asistente modificar su propio borrador', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const updateSpy = vi.spyOn(eventoRepository, 'update').mockResolvedValue(
      buildEvento({
        titulo: 'Festival actualizado',
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    const result = await eventoService.update(100, asistente, {
      titulo: 'Festival actualizado',
    });

    expect(updateSpy).toHaveBeenCalledWith(100, {
      titulo: 'Festival actualizado',
    });

    expect(result.titulo).toBe('Festival actualizado');
  });

  it('impide que un asistente modifique el borrador de otro creador', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        creadorId: 99,
      }),
    );

    const updateSpy = vi.spyOn(eventoRepository, 'update');

    await expect(
      eventoService.update(100, asistente, {
        titulo: 'Cambio no autorizado',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('impide al asistente modificar un evento que ya no es borrador', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
      }),
    );

    const updateSpy = vi.spyOn(eventoRepository, 'update');

    await expect(
      eventoService.update(100, asistente, {
        titulo: 'Cambio no autorizado',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('permite al administrador actualizar un evento no eliminado', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
      }),
    );

    const updateSpy = vi.spyOn(eventoRepository, 'update').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        titulo: 'Evento corregido',
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await eventoService.update(100, administrador, {
      titulo: 'Evento corregido',
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('valida el rango cuando PATCH modifica solo fechaInicio', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const updateSpy = vi.spyOn(eventoRepository, 'update');

    await expect(
      eventoService.update(100, asistente, {
        fechaInicio: '2026-09-05T20:00',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_DATE_RANGE',
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('revalida lugar y categorías cuando cambian', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const lugarSpy = vi.spyOn(eventoRepository, 'findActiveLugar').mockResolvedValue({
      id: 11,
    });

    const categoriasSpy = vi
      .spyOn(eventoRepository, 'findActiveCategoryIds')
      .mockResolvedValue([{ id: 30 }, { id: 31 }]);

    const updateSpy = vi.spyOn(eventoRepository, 'update').mockResolvedValue(buildEvento());

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await eventoService.update(100, asistente, {
      lugarId: 11,
      categoriaIds: [30, 31],
    });

    expect(lugarSpy).toHaveBeenCalledWith(11);

    expect(categoriasSpy).toHaveBeenCalledWith([30, 31]);

    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('trata ELIMINADO como recurso no disponible', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'ELIMINADO',
      }),
    );

    await expect(
      eventoService.update(100, administrador, {
        titulo: 'No debe cambiar',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'EVENTO_NOT_FOUND',
    });
  });
});
