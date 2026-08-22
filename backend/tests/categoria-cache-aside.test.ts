import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listActiveMock, categoriasKeyMock, cacheGetMock, cacheSetMock } = vi.hoisted(() => ({
  listActiveMock: vi.fn(),
  categoriasKeyMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
}));

vi.mock('../src/modules/categorias/categoria.repository.js', () => ({
  categoriaRepository: {
    listActive: listActiveMock,
  },
}));

vi.mock('../src/infrastructure/cache/evento-cache.js', () => ({
  eventoCache: {
    categoriasKey: categoriasKeyMock,
    get: cacheGetMock,
    set: cacheSetMock,
  },
}));

import { categoriaService } from '../src/modules/categorias/categoria.service.js';

const categorias = [
  {
    id: 3,
    nombre: 'Cultural',
    descripcion: 'Eventos culturales',
  },
];

describe('T045-A - cache-aside categorias', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    categoriasKeyMock.mockResolvedValue('eventos:v7:public:categorias');

    listActiveMock.mockResolvedValue(categorias);

    cacheSetMock.mockResolvedValue(undefined);
  });

  it('HIT evita consulta a PostgreSQL', async () => {
    cacheGetMock.mockResolvedValue(categorias);

    const result = await categoriaService.listPublic();

    expect(result).toEqual({
      payload: categorias,
      cacheStatus: 'HIT',
    });

    expect(listActiveMock).not.toHaveBeenCalled();

    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it('MISS consulta PostgreSQL', async () => {
    cacheGetMock.mockResolvedValue(null);

    const result = await categoriaService.listPublic();

    expect(listActiveMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      payload: categorias,
      cacheStatus: 'MISS',
    });
  });

  it('MISS almacena resultado en cache', async () => {
    cacheGetMock.mockResolvedValue(null);

    await categoriaService.listPublic();

    expect(cacheSetMock).toHaveBeenCalledWith('eventos:v7:public:categorias', categorias);
  });

  it('utiliza clave publica versionada de categorias', async () => {
    cacheGetMock.mockResolvedValue(categorias);

    await categoriaService.listPublic();

    expect(categoriasKeyMock).toHaveBeenCalledTimes(1);

    expect(cacheGetMock).toHaveBeenCalledWith('eventos:v7:public:categorias');
  });
});
