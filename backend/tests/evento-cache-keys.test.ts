import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, onMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  onMock: vi.fn(),
}));

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    isReady: true,
    isOpen: false,
    on: onMock,
    get: getMock,
    connect: vi.fn(),
    set: vi.fn(),
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
});
