import { prisma } from '../src/infrastructure/database/prisma.js';

const lugarId = 'b0000000-0000-4000-8000-000000000001';

const categoriaIds = [
  'c0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000002',
  'c0000000-0000-4000-8000-000000000003',
];

const eventoIds = Array.from(
  {
    length: 12,
  },
  (_value, index) => `d0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
);

async function prepareDemoData(): Promise<void> {
  for (const [index, eventoId] of eventoIds.entries()) {
    const numero = index + 1;
    const categoriaId = categoriaIds[index % categoriaIds.length];

    if (!categoriaId) {
      throw new Error('No se encontró una categoría para el evento.');
    }

    await prisma.evento.upsert({
      where: {
        id: eventoId,
      },
      update: {
        titulo: `Evento cultural de demostración ${numero}`,
        descripcion: 'Evento publicado para demostrar caché, relaciones y optimización.',
        estado: 'PUBLICADO',
        lugarId,
        eliminadoEn: null,
      },
      create: {
        id: eventoId,
        titulo: `Evento cultural de demostración ${numero}`,
        descripcion: 'Evento publicado para demostrar caché, relaciones y optimización.',
        estado: 'PUBLICADO',
        lugarId,
      },
    });

    await prisma.eventoCategoria.upsert({
      where: {
        eventoId_categoriaId: {
          eventoId,
          categoriaId,
        },
      },
      update: {
        eliminadoEn: null,
      },
      create: {
        eventoId,
        categoriaId,
      },
    });
  }

  const total = await prisma.evento.count({
    where: {
      id: {
        in: eventoIds,
      },
      estado: 'PUBLICADO',
      eliminadoEn: null,
    },
  });

  console.log(`Datos de demostración preparados: ${total} eventos publicados.`);
}

prepareDemoData()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Error desconocido.';

    console.error(`No se prepararon los datos: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
