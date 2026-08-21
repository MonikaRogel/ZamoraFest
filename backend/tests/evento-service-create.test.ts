import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';
import type { CreateEventoInput } from '../src/modules/eventos/evento.schemas.js';

const asistente: IdentidadAcceso = {
  id: 7,
  rol: 'ASISTENTE',
};

const inputValido = {
  titulo: 'Festival Cultural',
  descripcion: 'Evento cultural de prueba.',
  fechaInicio: '2026-09-05T09:30',
  fechaFin: '2026-09-05T18:00',
  costoReferencial: 0,
  lugarId: 10,
  categoriaIds: [20, 21],
  fuenteInformacion: 'Dirección de Cultura',
} satisfies CreateEventoInput;

function buildEventoCreado(): Awaited<ReturnType<typeof eventoRepository.create>> {
  return {
    id: 100,
    titulo: inputValido.titulo,
    descripcion: inputValido.descripcion,
    fechaInicio: new Date('2026-09-05T09:30:00.000Z'),
    fechaFin: new Date('2026-09-05T18:00:00.000Z'),
    costoReferencial: {
      toString: () => '0',
    },
    estadoEvento: 'BORRADOR',
    estadoRevision: 'PENDIENTE',
    fuenteInformacion: inputValido.fuenteInformacion,
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
      id: 7,
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
      {
        categoria: {
          id: 21,
          nombre: 'Música',
          descripcion: null,
        },
      },
    ],
  } as unknown as Awaited<ReturnType<typeof eventoRepository.create>>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('T035 - creación canónica de eventos', () => {
  it('crea BORRADOR/PENDIENTE y asocia el creador autenticado', async () => {
    vi.spyOn(eventoRepository, 'findActiveLugar').mockResolvedValue({
      id: 10,
    });

    vi.spyOn(eventoRepository, 'findActiveCategoryIds').mockResolvedValue([{ id: 20 }, { id: 21 }]);

    const createSpy = vi.spyOn(eventoRepository, 'create').mockResolvedValue(buildEventoCreado());

    const invalidateSpy = vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    const result = await eventoService.create(asistente, inputValido);

    expect(createSpy).toHaveBeenCalledTimes(1);

    const persisted = createSpy.mock.calls[0]?.[0];

    expect(persisted).toBeDefined();

    expect(persisted?.idUsuarioCreador).toBe(7);

    expect(persisted?.estadoEvento).toBe('BORRADOR');

    expect(persisted?.estadoRevision).toBe('PENDIENTE');

    expect(persisted?.fechaInicio.toISOString()).toBe('2026-09-05T09:30:00.000Z');

    expect(persisted?.fechaFin?.toISOString()).toBe('2026-09-05T18:00:00.000Z');

    expect(result).toMatchObject({
      id: 100,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
      usuarioCreador: {
        id: 7,
      },
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it('rechaza creación por un rol distinto de ASISTENTE', async () => {
    const administrador: IdentidadAcceso = {
      id: 1,
      rol: 'ADMINISTRADOR',
    };

    const createSpy = vi.spyOn(eventoRepository, 'create');

    await expect(eventoService.create(administrador, inputValido)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rechaza un lugar inexistente o inactivo', async () => {
    vi.spyOn(eventoRepository, 'findActiveLugar').mockResolvedValue(null);

    const createSpy = vi.spyOn(eventoRepository, 'create');

    await expect(eventoService.create(asistente, inputValido)).rejects.toMatchObject({
      statusCode: 404,
      code: 'LUGAR_NOT_FOUND',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rechaza categorías inexistentes o inactivas', async () => {
    vi.spyOn(eventoRepository, 'findActiveLugar').mockResolvedValue({
      id: 10,
    });

    vi.spyOn(eventoRepository, 'findActiveCategoryIds').mockResolvedValue([{ id: 20 }]);

    const createSpy = vi.spyOn(eventoRepository, 'create');

    await expect(eventoService.create(asistente, inputValido)).rejects.toMatchObject({
      statusCode: 404,
      code: 'CATEGORIES_NOT_FOUND',
      details: {
        categoriaIds: [21],
      },
    });

    expect(createSpy).not.toHaveBeenCalled();
  });
});
