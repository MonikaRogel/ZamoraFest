import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    lugar: {
      findFirst: vi.fn(),
    },
    categoria: {
      findMany: vi.fn(),
    },
    evento: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    eventoCategoria: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { eventoRepository } from '../src/modules/eventos/evento.repository.js';

function prepareListMocks(): void {
  prismaMock.evento.count.mockReturnValue(Promise.resolve(2));

  prismaMock.evento.findMany.mockReturnValue(Promise.resolve([]));

  prismaMock.$transaction.mockImplementation(async (operations: unknown) => {
    if (!Array.isArray(operations)) {
      throw new Error('La prueba esperaba una transacción por lote.');
    }

    return Promise.all(operations);
  });
}

function firstFindManyArgs(): unknown {
  return prismaMock.evento.findMany.mock.calls[0]?.[0] as unknown;
}

function firstFindFirstArgs(): unknown {
  return prismaMock.evento.findFirst.mock.calls[0]?.[0] as unknown;
}

describe('T034 - repositorio canónico de eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la jerarquía territorial completa desde lugar hasta provincia', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const args: unknown = firstFindManyArgs();

    expect(args).toHaveProperty('select.lugar.select.id', true);

    expect(args).toHaveProperty('select.lugar.select.nombre', true);

    expect(args).toHaveProperty('select.lugar.select.direccionReferencial', true);

    expect(args).toHaveProperty('select.lugar.select.sector.select.nombre', true);

    expect(args).toHaveProperty('select.lugar.select.sector.select.parroquia.select.nombre', true);

    expect(args).toHaveProperty(
      'select.lugar.select.sector.select.parroquia.select.canton.select.nombre',
      true,
    );

    expect(args).toHaveProperty(
      'select.lugar.select.sector.select.parroquia.select.canton.select.provincia.select.nombre',
      true,
    );

    expect(args).toHaveProperty(
      'select.lugar.select.sector.select.parroquia.select.canton.select.provincia.select.codigoDpa',
      true,
    );
  });

  it('consulta creador y revisor con su rol', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const args: unknown = firstFindManyArgs();

    expect(args).toHaveProperty('select.usuarioCreador.select.id', true);

    expect(args).toHaveProperty('select.usuarioCreador.select.nombreCompleto', true);

    expect(args).toHaveProperty('select.usuarioCreador.select.rol.select.nombre', true);

    expect(args).toHaveProperty('select.usuarioRevisor.select.id', true);

    expect(args).toHaveProperty('select.usuarioRevisor.select.nombreCompleto', true);

    expect(args).toHaveProperty('select.usuarioRevisor.select.rol.select.nombre', true);
  });

  it('consulta categorías activas mediante evento_categoria', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const args: unknown = firstFindManyArgs();

    expect(args).toHaveProperty('select.categorias.where.categoria.estado', true);

    expect(args).toHaveProperty('select.categorias.select.categoria.select.id', true);

    expect(args).toHaveProperty('select.categorias.select.categoria.select.nombre', true);

    expect(args).toHaveProperty('select.categorias.select.categoria.select.descripcion', true);
  });

  it('aplica Strategy basic y detailed correctamente', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 10, 'basic');

    const basicArgs: unknown = firstFindManyArgs();

    expect(basicArgs).not.toHaveProperty('select.programaciones');

    expect(basicArgs).not.toHaveProperty('select.imagenes');

    vi.clearAllMocks();
    prepareListMocks();

    await eventoRepository.list(1, 10, 'detailed');

    const detailedArgs: unknown = firstFindManyArgs();

    expect(detailedArgs).toHaveProperty('select.programaciones.where.estado', true);

    expect(detailedArgs).toHaveProperty('select.programaciones.select.id', true);

    expect(detailedArgs).toHaveProperty('select.programaciones.select.tituloActividad', true);

    expect(detailedArgs).toHaveProperty('select.programaciones.select.fechaHoraInicio', true);

    expect(detailedArgs).toHaveProperty('select.programaciones.select.lugar.select.nombre', true);

    expect(detailedArgs).toHaveProperty('select.imagenes.where.estado', true);

    expect(detailedArgs).toHaveProperty('select.imagenes.select.id', true);

    expect(detailedArgs).toHaveProperty('select.imagenes.select.urlImagen', true);

    expect(detailedArgs).toHaveProperty('select.imagenes.select.esPrincipal', true);
  });

  it('evita consultas adicionales por evento en la capa repository', async () => {
    prepareListMocks();

    await eventoRepository.list(1, 20, 'detailed');

    expect(prismaMock.evento.count).toHaveBeenCalledTimes(1);

    expect(prismaMock.evento.findMany).toHaveBeenCalledTimes(1);

    expect(prismaMock.lugar.findFirst).not.toHaveBeenCalled();

    expect(prismaMock.categoria.findMany).not.toHaveBeenCalled();

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('filtra consulta pública por PROGRAMADO/APROBADO y jerarquía activa', async () => {
    prismaMock.evento.findFirst.mockReturnValue(Promise.resolve(null));

    await eventoRepository.findPublicById(7, 'detailed');

    const args: unknown = firstFindFirstArgs();

    expect(args).toHaveProperty('where.id', 7);

    expect(args).toHaveProperty('where.estadoEvento', 'PROGRAMADO');

    expect(args).toHaveProperty('where.estadoRevision', 'APROBADO');

    expect(args).toHaveProperty('where.lugar.estado', true);

    expect(args).toHaveProperty('where.lugar.sector.estado', true);

    expect(args).toHaveProperty('where.lugar.sector.parroquia.estado', true);

    expect(args).toHaveProperty('where.lugar.sector.parroquia.canton.estado', true);

    expect(args).toHaveProperty('where.lugar.sector.parroquia.canton.provincia.estado', true);
  });
});
