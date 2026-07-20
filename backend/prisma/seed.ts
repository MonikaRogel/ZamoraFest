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

  const identifiers = cantones.map((canton) => canton.id);

  const total = await prisma.canton.count({
    where: {
      id: {
        in: identifiers,
      },
      eliminadoEn: null,
    },
  });

  if (total !== cantones.length) {
    throw new Error('No se cargaron todos los cantones iniciales.');
  }

  console.log(`Seed completado: ${total} cantones activos.`);
}

seed()
  .catch((_error: unknown) => {
    console.error('No se pudo ejecutar el seed de cantones.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
