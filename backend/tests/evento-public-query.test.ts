import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    evento: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { listEventosQuerySchema } from '../src/modules/eventos/evento.schemas.js';

function prepareListMocks(): void {
  prismaMock.evento.count.mockReturnValue(Promise.resolve(0));

  prismaMock.evento.findMany.mockReturnValue(Promise.resolve([]));

  prismaMock.$transaction.mockImplementation(async (operations: unknown) => {
    if (!Array.isArray(operations)) {
      throw new Error('Se esperaba una transacción por lote.');
    }

    return Promise.all(operations);
  });
}

function firstFindManyArgs(): unknown {
  return prismaMock.evento.findMany.mock.calls[0]?.[0] as unknown;
}

function firstCountArgs(): unknown {
  return prismaMock.evento.count.mock.calls[0]?.[0] as unknown;
}

describe('T037 - consultas públicas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('acepta paginación y filtros cantonId/categoriaId desde query string', () => {
    const result = listEventosQuerySchema.parse({
      page: '2',
      limit: '5',
      cantonId: '3',
      categoriaId: '9',
    });

    expect(result).toEqual({
      page: 2,
      limit: 5,
      cantonId: 3,
      categoriaId: 9,
    });
  });

  it('rechaza identificadores de filtro fuera del rango INT', () => {
    expect(() =>
      listEventosQuerySchema.parse({
        cantonId: '0',
      }),
    ).toThrow();

    expect(() =>
      listEventosQuerySchema.parse({
        categoriaId: '2147483648',
      }),
    ).toThrow();
  });

  it('filtra siempre por PROGRAMADO + APROBADO', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const findArgs = firstFindManyArgs();

    const countArgs = firstCountArgs();

    expect(findArgs).toHaveProperty('where.estadoEvento', 'PROGRAMADO');

    expect(findArgs).toHaveProperty('where.estadoRevision', 'APROBADO');

    expect(countArgs).toHaveProperty('where.estadoEvento', 'PROGRAMADO');

    expect(countArgs).toHaveProperty('where.estadoRevision', 'APROBADO');
  });

  it('aplica cantonId y categoriaId además de la regla pública', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic', {
      cantonId: 3,
      categoriaId: 9,
    });

    const args = firstFindManyArgs();

    expect(args).toHaveProperty('where.AND.0.estadoEvento', 'PROGRAMADO');

    expect(args).toHaveProperty('where.AND.0.estadoRevision', 'APROBADO');

    expect(args).toHaveProperty('where.AND.1.lugar.sector.parroquia.canton.id', 3);

    expect(args).toHaveProperty('where.AND.2.categorias.some.idCategoria', 9);

    expect(args).toHaveProperty('where.AND.2.categorias.some.categoria.estado', true);
  });

  it('mantiene paginación mediante skip y take', async () => {
    prepareListMocks();

    await eventoRepository.list(3, 5, 'basic', {
      cantonId: 3,
    });

    const args = firstFindManyArgs();

    expect(args).toHaveProperty('skip', 10);

    expect(args).toHaveProperty('take', 5);
  });

  it('mantiene selección basic de campos canónicos sin cargar colecciones detailed', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const args = firstFindManyArgs();

    expect(args).toHaveProperty('select.id', true);

    expect(args).toHaveProperty('select.titulo', true);

    expect(args).toHaveProperty('select.fechaInicio', true);

    expect(args).toHaveProperty('select.costoReferencial', true);

    expect(args).toHaveProperty(
      'select.lugar.select.sector.select.parroquia.select.canton.select.id',
      true,
    );

    expect(args).toHaveProperty('select.usuarioCreador.select.id', true);

    expect(args).toHaveProperty('select.usuarioRevisor.select.id', true);

    expect(args).toHaveProperty('select.categorias.select.categoria.select.id', true);

    expect(args).not.toHaveProperty('select.programaciones');

    expect(args).not.toHaveProperty('select.imagenes');
  });
});
