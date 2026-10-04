import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  listMock,
  findPublicByIdMock,
  listKeyMock,
  detailKeyMock,
  cacheGetMock,
  cacheSetMock,
} = vi.hoisted(() => ({
  listMock: vi.fn(),
  findPublicByIdMock: vi.fn(),
  listKeyMock: vi.fn(),
  detailKeyMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
}));

vi.mock('../src/modules/eventos/evento.repository.js', () => ({
  eventoRepository: {
    list: listMock,
    findPublicById: findPublicByIdMock,
  },
}));

vi.mock('../src/infrastructure/cache/evento-cache.js', () => ({
  eventoCache: {
    listKey: listKeyMock,
    detailKey: detailKeyMock,
    get: cacheGetMock,
    set: cacheSetMock,
    invalidate: vi.fn(),
  },
}));

import { eventoService } from '../src/modules/eventos/evento.service.js';

function buildEvento(fechaFin: Date) {
  return {
    id: 91,
    titulo: 'Evento temporal',
    descripcion: null,
    fechaInicio: new Date('2026-08-20T18:00:00.000Z'),
    fechaFin,
    costoReferencial: {
      toString: () => '0',
    },
    estadoEvento: 'PROGRAMADO',
    estadoRevision: 'APROBADO',
    fuenteInformacion: null,
    fechaCreacion: new Date('2026-08-20T12:00:00.000Z'),
    fechaActualizacion: null,
    fechaRevision: new Date('2026-08-20T13:00:00.000Z'),
    lugar: {
      id: 10,
      nombre: 'Parque Central',
    },
    usuarioCreador: {
      id: 7,
      nombreCompleto: 'Asistente de prueba',
    },
    usuarioRevisor: {
      id: 1,
      nombreCompleto: 'Administrador de prueba',
    },
    categorias: [],
  };
}

describe('T044-B - vigencia temporal del cache publico de eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T00:00:00.000Z'));

    listKeyMock.mockResolvedValue('eventos:list');
    detailKeyMock.mockResolvedValue('eventos:detail:91');
    cacheGetMock.mockResolvedValue(null);
    cacheSetMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('propaga el rango temporal al caché y lo convierte al contrato de base de datos para el repositorio', async () => {
    listMock.mockResolvedValue({
      total: 0,
      eventos: [],
      earliestFechaFin: null,
    });

    await eventoService.list({
      page: 1,
      limit: 50,
      categoriaId: 19,
      fechaDesde: '2026-10-01T00:00:00.000',
      fechaHasta: '2026-11-01T00:00:00.000',
    });

    expect(listKeyMock).toHaveBeenCalledWith(
      1,
      50,
      undefined,
      19,
      '2026-10-01T00:00:00.000',
      '2026-11-01T00:00:00.000',
    );

    expect(listMock).toHaveBeenCalledWith(1, 50, 'basic', {
      categoriaId: 19,
      fechaDesde: new Date('2026-10-01T00:00:00.000Z'),
      fechaHasta: new Date('2026-11-01T00:00:00.000Z'),
    });
  });

  it('acorta el TTL del listado usando el vencimiento mas proximo de todo el conjunto filtrado', async () => {
    listMock.mockResolvedValue({
      total: 2,
      eventos: [buildEvento(new Date('2026-08-20T21:00:00.000Z'))],
      earliestFechaFin: new Date('2026-08-20T19:00:30.000Z'),
    });

    await eventoService.list({
      page: 1,
      limit: 10,
    });

    expect(cacheSetMock).toHaveBeenCalledWith('eventos:list', expect.any(Object), 30);
  });

  it('acorta el TTL del detalle segun la fecha de finalizacion del evento', async () => {
    findPublicByIdMock.mockResolvedValue(
      buildEvento(new Date('2026-08-20T19:00:20.000Z')),
    );

    await eventoService.getById(91);

    expect(cacheSetMock).toHaveBeenCalledWith('eventos:detail:91', expect.any(Object), 20);
  });

  it('omite el cache cuando queda menos de un segundo de vigencia', async () => {
    findPublicByIdMock.mockResolvedValue(
      buildEvento(new Date('2026-08-20T19:00:00.500Z')),
    );

    const result = await eventoService.getById(91);

    expect(result.cacheStatus).toBe('MISS');
    expect(cacheSetMock).not.toHaveBeenCalled();
  });
});
