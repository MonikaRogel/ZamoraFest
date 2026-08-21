import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    evento: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { eventoRepository } from '../src/modules/eventos/evento.repository.js';

describe('T036 - repositorio de eliminación lógica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excluye ELIMINADO de findById normal', async () => {
    prismaMock.evento.findFirst.mockResolvedValue(null);

    await eventoRepository.findById(100, 'basic');

    expect(prismaMock.evento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 100,
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      }),
    );
  });

  it('logicalDelete usa UPDATE y nunca DELETE físico', async () => {
    prismaMock.evento.update.mockResolvedValue({
      id: 100,
      estadoEvento: 'ELIMINADO',
    });

    await eventoRepository.logicalDelete(100);

    expect(prismaMock.evento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 100,
        },
        data: {
          estadoEvento: 'ELIMINADO',
        },
      }),
    );

    expect(prismaMock.evento.delete).not.toHaveBeenCalled();
  });
});
