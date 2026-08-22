import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    categoria: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { categoriaRepository } from '../src/modules/categorias/categoria.repository.js';

describe('T045-A - repository categorias', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.categoria.findMany.mockResolvedValue([]);
  });

  it('consulta solo categorias activas', async () => {
    await categoriaRepository.listActive();

    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith({
      where: {
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: [
        {
          nombre: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  });

  it('devuelve campos canonicos', async () => {
    prismaMock.categoria.findMany.mockResolvedValue([
      {
        id: 3,
        nombre: 'Cultural',
        descripcion: 'Eventos culturales',
      },
    ]);

    await expect(categoriaRepository.listActive()).resolves.toEqual([
      {
        id: 3,
        nombre: 'Cultural',
        descripcion: 'Eventos culturales',
      },
    ]);
  });
});
