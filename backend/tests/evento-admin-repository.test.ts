import type { Prisma } from '../src/generated/prisma/client.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    evento: {
      count: vi.fn<(args: Prisma.EventoCountArgs) => Promise<number>>(),
      findMany: vi.fn<(args: Prisma.EventoFindManyArgs) => Promise<unknown[]>>(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({ prisma: prismaMock }));

import { eventoRepository } from '../src/modules/eventos/evento.repository.js';

function isPromiseArray(value: unknown): value is Promise<unknown>[] {
  return Array.isArray(value) && value.every((item) => item instanceof Promise);
}

function prep() {
  prismaMock.evento.count.mockReturnValue(Promise.resolve(3));
  prismaMock.evento.findMany.mockReturnValue(Promise.resolve([]));
  prismaMock.$transaction.mockImplementation((operations: unknown) => {
    if (!isPromiseArray(operations)) {
      throw new Error('Se esperaba transacción por lote.');
    }

    return Promise.all(operations);
  });
}

describe('Repositorio administrativo de eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista no eliminados por defecto con paginación', async () => {
    prep();

    const result = await eventoRepository.listForAdmin(2, 20, {});
    const args = prismaMock.evento.findMany.mock.calls[0]?.[0];

    expect(args).toBeDefined();
    expect(args).toHaveProperty('where.estadoEvento.not', 'ELIMINADO');
    expect(args?.skip).toBe(20);
    expect(args?.take).toBe(20);
    expect(args?.orderBy).toEqual([{ fechaCreacion: 'desc' }, { id: 'desc' }]);
    expect(result).toEqual({ total: 3, eventos: [] });
  });

  it('aplica filtros administrativos de estado', async () => {
    prep();

    await eventoRepository.listForAdmin(1, 10, {
      estadoRevision: 'PENDIENTE',
      estadoEvento: 'BORRADOR',
    });

    const args = prismaMock.evento.findMany.mock.calls[0]?.[0];

    expect(args).toBeDefined();
    expect(args).toHaveProperty('where.estadoRevision', 'PENDIENTE');
    expect(args).toHaveProperty('where.estadoEvento', 'BORRADOR');
    expect(args).toHaveProperty('select.estadoRevision', true);
    expect(args).toHaveProperty('select.estadoEvento', true);
  });
});
