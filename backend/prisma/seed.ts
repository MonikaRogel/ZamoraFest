import { prisma } from '../src/infrastructure/database/prisma.js';

const cantones: Array<{ id: string; nombre: string }> = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    nombre: 'Centinela del Cóndor',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    nombre: 'Chinchipe',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    nombre: 'El Pangui',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    nombre: 'Nangaritza',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    nombre: 'Palanda',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    nombre: 'Paquisha',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000007',
    nombre: 'Yacuambi',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000008',
    nombre: 'Yantzaza',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000009',
    nombre: 'Zamora',
  },
];

const lugar = {
  id: 'b0000000-0000-4000-8000-000000000001',
  nombre: 'Parque Lineal de Zamora',
  direccion: 'Zamora, Zamora Chinchipe',
  cantonId: 'a0000000-0000-4000-8000-000000000009',
};

const categorias: Array<{
  id: string;
  nombre: string;
  descripcion: string;
}> = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    nombre: 'Cultura',
    descripcion: 'Eventos culturales y tradicionales.',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    nombre: 'Música',
    descripcion: 'Conciertos y presentaciones musicales.',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    nombre: 'Gastronomía',
    descripcion: 'Ferias y muestras gastronómicas.',
  },
];

async function seed(): Promise<void> {
  await prisma.$transaction(
    cantones.map((canton) =>
      prisma.canton.upsert({
        where: {
          id: canton.id,
        },
        update: {
          nombre: canton.nombre,
          eliminadoEn: null,
        },
        create: canton,
      }),
    ),
  );

  await prisma.lugar.upsert({
    where: {
      id: lugar.id,
    },
    update: {
      nombre: lugar.nombre,
      direccion: lugar.direccion,
      cantonId: lugar.cantonId,
      eliminadoEn: null,
    },
    create: lugar,
  });

  await prisma.$transaction(
    categorias.map((categoria) =>
      prisma.categoria.upsert({
        where: {
          id: categoria.id,
        },
        update: {
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          eliminadoEn: null,
        },
        create: categoria,
      }),
    ),
  );

  const [totalCantones, totalLugares, totalCategorias] = await Promise.all([
    prisma.canton.count({
      where: {
        id: {
          in: cantones.map((canton) => canton.id),
        },
        eliminadoEn: null,
      },
    }),
    prisma.lugar.count({
      where: {
        id: lugar.id,
        eliminadoEn: null,
      },
    }),
    prisma.categoria.count({
      where: {
        id: {
          in: categorias.map((categoria) => categoria.id),
        },
        eliminadoEn: null,
      },
    }),
  ]);

  if (
    totalCantones !== cantones.length ||
    totalLugares !== 1 ||
    totalCategorias !== categorias.length
  ) {
    throw new Error('No se cargaron todos los datos iniciales.');
  }

  console.log(
    `Seed completado: ${totalCantones} cantones, ${totalLugares} lugar y ${totalCategorias} categorías activas.`,
  );
}

seed()
  .catch((_error: unknown) => {
    console.error('No se pudo ejecutar el seed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
