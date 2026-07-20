import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/infrastructure/database/prisma.js';

const seededCantonIds = [
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000007',
  'a0000000-0000-4000-8000-000000000008',
  'a0000000-0000-4000-8000-000000000009',
];

let testDatabaseConfirmed = false;

async function cleanTestData(): Promise<void> {
  await prisma.imagenEvento.deleteMany();
  await prisma.programacionEvento.deleteMany();
  await prisma.eventoCategoria.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.lugar.deleteMany();
  await prisma.canton.deleteMany({
    where: {
      id: {
        notIn: seededCantonIds,
      },
    },
  });
}

async function createEventFixture() {
  const suffix = randomUUID();

  const canton = await prisma.canton.create({
    data: {
      nombre: `Cantón de prueba ${suffix}`,
    },
  });

  const lugar = await prisma.lugar.create({
    data: {
      nombre: `Lugar de prueba ${suffix}`,
      cantonId: canton.id,
    },
  });

  const evento = await prisma.evento.create({
    data: {
      titulo: `Evento de prueba ${suffix}`,
      descripcion: 'Evento utilizado únicamente por una prueba automatizada.',
      lugarId: lugar.id,
    },
  });

  return {
    canton,
    lugar,
    evento,
  };
}

beforeAll(async () => {
  const result = await prisma.$queryRaw<Array<{ baseDatos: string }>>`
    SELECT current_database() AS "baseDatos"
  `;

  testDatabaseConfirmed = result[0]?.baseDatos === 'zamorafest_test';

  expect(testDatabaseConfirmed).toBe(true);

  await cleanTestData();
});

afterEach(async () => {
  if (testDatabaseConfirmed) {
    await cleanTestData();
  }
});

afterAll(async () => {
  if (testDatabaseConfirmed) {
    await cleanTestData();
  }

  await prisma.$disconnect();
});

describe('modelo relacional de ZamoraFest', () => {
  it('contiene las diez tablas esperadas', async () => {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> '_prisma_migrations'
      ORDER BY tablename
    `;

    expect(tables.map((table) => table.tablename)).toEqual([
      'cantones',
      'categorias',
      'evento_categorias',
      'eventos',
      'imagenes_evento',
      'lugares',
      'programaciones_evento',
      'recordatorios',
      'refresh_tokens',
      'usuarios',
    ]);
  });

  it('rechaza una clave foránea inexistente', async () => {
    await expect(
      prisma.evento.create({
        data: {
          titulo: 'Evento sin lugar válido',
          descripcion: 'Debe ser rechazado por la base de datos.',
          lugarId: randomUUID(),
        },
      }),
    ).rejects.toThrow();
  });

  it('impide repetir una asociación entre evento y categoría', async () => {
    const { evento } = await createEventFixture();

    const categoria = await prisma.categoria.create({
      data: {
        nombre: `Categoría ${randomUUID()}`,
      },
    });

    const association = {
      eventoId: evento.id,
      categoriaId: categoria.id,
    };

    await prisma.eventoCategoria.create({
      data: association,
    });

    await expect(
      prisma.eventoCategoria.create({
        data: association,
      }),
    ).rejects.toThrow();
  });

  it('aplica los valores predeterminados del modelo', async () => {
    const { evento } = await createEventFixture();

    const imagen = await prisma.imagenEvento.create({
      data: {
        eventoId: evento.id,
        url: 'https://example.com/evento.jpg',
      },
    });

    expect(evento.estado).toBe('BORRADOR');
    expect(evento.eliminadoEn).toBeNull();
    expect(imagen.esPrincipal).toBe(false);
    expect(imagen.eliminadoEn).toBeNull();
  });

  it('rechaza dos imágenes principales activas', async () => {
    const { evento } = await createEventFixture();

    await prisma.imagenEvento.create({
      data: {
        eventoId: evento.id,
        url: 'https://example.com/principal-1.jpg',
        esPrincipal: true,
      },
    });

    await expect(
      prisma.imagenEvento.create({
        data: {
          eventoId: evento.id,
          url: 'https://example.com/principal-2.jpg',
          esPrincipal: true,
        },
      }),
    ).rejects.toThrow();
  });

  it('permite reemplazar una imagen principal eliminada lógicamente', async () => {
    const { evento } = await createEventFixture();

    await prisma.imagenEvento.create({
      data: {
        eventoId: evento.id,
        url: 'https://example.com/principal-eliminada.jpg',
        esPrincipal: true,
        eliminadoEn: new Date(),
      },
    });

    const nuevaPrincipal = await prisma.imagenEvento.create({
      data: {
        eventoId: evento.id,
        url: 'https://example.com/principal-activa.jpg',
        esPrincipal: true,
      },
    });

    expect(nuevaPrincipal.esPrincipal).toBe(true);
    expect(nuevaPrincipal.eliminadoEn).toBeNull();
  });

  it('rechaza coordenadas incompletas', async () => {
    const canton = await prisma.canton.create({
      data: {
        nombre: `Cantón coordenadas ${randomUUID()}`,
      },
    });

    await expect(
      prisma.lugar.create({
        data: {
          nombre: 'Lugar con una sola coordenada',
          cantonId: canton.id,
          latitud: -4.123456,
        },
      }),
    ).rejects.toThrow();
  });

  it('rechaza coordenadas fuera de sus rangos', async () => {
    const canton = await prisma.canton.create({
      data: {
        nombre: `Cantón rangos ${randomUUID()}`,
      },
    });

    await expect(
      prisma.lugar.create({
        data: {
          nombre: 'Lugar con latitud inválida',
          cantonId: canton.id,
          latitud: 91,
          longitud: 0,
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.lugar.create({
        data: {
          nombre: 'Lugar con longitud inválida',
          cantonId: canton.id,
          latitud: 0,
          longitud: 181,
        },
      }),
    ).rejects.toThrow();
  });

  it('rechaza una programación cuyo fin no sea posterior al inicio', async () => {
    const { evento } = await createEventFixture();
    const inicio = new Date('2026-08-01T15:00:00.000Z');

    await expect(
      prisma.programacionEvento.create({
        data: {
          eventoId: evento.id,
          inicio,
          fin: inicio,
          descripcion: 'Horario inválido',
        },
      }),
    ).rejects.toThrow();
  });

  it('restringe el borrado físico de un padre referenciado', async () => {
    const { lugar } = await createEventFixture();

    await expect(
      prisma.lugar.delete({
        where: {
          id: lugar.id,
        },
      }),
    ).rejects.toThrow();
  });

  it('aplica unicidad activa y permite reutilizar nombres eliminados', async () => {
    const cantonName = `Cantón único ${randomUUID()}`;
    const categoryName = `Categoría única ${randomUUID()}`;

    const canton = await prisma.canton.create({
      data: {
        nombre: cantonName,
      },
    });

    await expect(
      prisma.canton.create({
        data: {
          nombre: cantonName,
        },
      }),
    ).rejects.toThrow();

    await prisma.canton.update({
      where: {
        id: canton.id,
      },
      data: {
        eliminadoEn: new Date(),
      },
    });

    await expect(
      prisma.canton.create({
        data: {
          nombre: cantonName,
        },
      }),
    ).resolves.toBeDefined();

    const categoria = await prisma.categoria.create({
      data: {
        nombre: categoryName,
      },
    });

    await expect(
      prisma.categoria.create({
        data: {
          nombre: categoryName,
        },
      }),
    ).rejects.toThrow();

    await prisma.categoria.update({
      where: {
        id: categoria.id,
      },
      data: {
        eliminadoEn: new Date(),
      },
    });

    await expect(
      prisma.categoria.create({
        data: {
          nombre: categoryName,
        },
      }),
    ).resolves.toBeDefined();
  });
});
