import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, onMock, setMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  onMock: vi.fn(),
  setMock: vi.fn(),
}));

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    isReady: true,
    isOpen: false,
    on: onMock,
    get: getMock,
    connect: vi.fn(),
    set: setMock,
    incr: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock('../src/config/env.js', () => ({
  env: {
    REDIS_URL: 'redis://mock:6379',
  },
}));

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';

describe('T044 - claves canonicas de cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMock.mockResolvedValue('7');
  });

  it('genera listado publico sin filtros', async () => {
    await expect(eventoCache.listKey(1, 10)).resolves.toBe(
      'eventos:v7:public:list:page=1:limit=10:cantonId=all:categoriaId=all',
    );
  });

  it('segmenta listado por IDs enteros', async () => {
    await expect(eventoCache.listKey(2, 20, 3, 8)).resolves.toBe(
      'eventos:v7:public:list:page=2:limit=20:cantonId=3:categoriaId=8',
    );
  });

  it('segmenta listado por rango temporal', async () => {
    const octubreKey = await eventoCache.listKey(
      1,
      50,
      undefined,
      undefined,
      '2026-10-01T00:00:00.000',
      '2026-11-01T00:00:00.000',
    );

    const noviembreKey = await eventoCache.listKey(
      1,
      50,
      undefined,
      undefined,
      '2026-11-01T00:00:00.000',
      '2026-12-01T00:00:00.000',
    );

    expect(octubreKey).toBe(
      'eventos:v7:public:list:page=1:limit=50:cantonId=all:categoriaId=all:' +
        'fechaDesde=2026-10-01T00:00:00.000:' +
        'fechaHasta=2026-11-01T00:00:00.000',
    );

    expect(noviembreKey).toBe(
      'eventos:v7:public:list:page=1:limit=50:cantonId=all:categoriaId=all:' +
        'fechaDesde=2026-11-01T00:00:00.000:' +
        'fechaHasta=2026-12-01T00:00:00.000',
    );

    expect(octubreKey).not.toBe(noviembreKey);
  });

  it('genera detalle con ID entero', async () => {
    await expect(eventoCache.detailKey(15)).resolves.toBe('eventos:v7:public:detail:id=15');
  });

  it('rechaza ID cero en detalle', async () => {
    await expect(eventoCache.detailKey(0)).rejects.toBeInstanceOf(RangeError);
  });

  it('rechaza ID fraccionario de canton', async () => {
    await expect(eventoCache.listKey(1, 10, 1.5)).rejects.toBeInstanceOf(RangeError);
  });

  it('rechaza contrato UUID/string en runtime', async () => {
    await expect(eventoCache.detailKey('uuid-legacy' as unknown as number)).rejects.toBeInstanceOf(
      RangeError,
    );
  });

  it('permite acortar el TTL de una entrada sin alterar el valor cacheado', async () => {
    await eventoCache.set('eventos:test', { ok: true }, 15);

    expect(setMock).toHaveBeenCalledWith('eventos:test', JSON.stringify({ ok: true }), {
      EX: 15,
    });
  });

  it('no permite ampliar el TTL por encima del máximo de 60 segundos', async () => {
    await eventoCache.set('eventos:test', { ok: true }, 120);

    expect(setMock).toHaveBeenCalledWith('eventos:test', JSON.stringify({ ok: true }), {
      EX: 60,
    });
  });
});
