import { prisma } from '../src/infrastructure/database/prisma.js';

const cantones = [
  { codigoDpa: '1901', nombre: 'Zamora' },
  { codigoDpa: '1902', nombre: 'Chinchipe' },
  { codigoDpa: '1903', nombre: 'Nangaritza' },
  { codigoDpa: '1904', nombre: 'Yacuambi' },
  { codigoDpa: '1905', nombre: 'Yantzaza' },
  { codigoDpa: '1906', nombre: 'El Pangui' },
  { codigoDpa: '1907', nombre: 'Centinela del Cóndor' },
  { codigoDpa: '1908', nombre: 'Palanda' },
  { codigoDpa: '1909', nombre: 'Paquisha' },
] as const;

const categorias = [
  { nombre: 'Cultura', descripcion: 'Eventos culturales y tradicionales.' },
  { nombre: 'Música', descripcion: 'Conciertos y presentaciones musicales.' },
  { nombre: 'Gastronomía', descripcion: 'Ferias y muestras gastronómicas.' },
] as const;

const roles = [
  {
    nombre: 'ADMINISTRADOR',
    descripcion: 'Administración, revisión y publicación de contenido.',
  },
  {
    nombre: 'ASISTENTE',
    descripcion: 'Creación y gestión operativa de contenido.',
  },
  {
    nombre: 'VISITANTE',
    descripcion: 'Consulta de eventos y gestión de preferencias personales.',
  },
] as const;

async function seed(): Promise<void> {
  const provincia = await prisma.provincia.upsert({
    where: { codigoDpa: '19' },
    update: {
      nombre: 'Zamora Chinchipe',
      estado: true,
    },
    create: {
      codigoDpa: '19',
      nombre: 'Zamora Chinchipe',
      estado: true,
    },
  });

  const cantonIds = new Map<string, number>();

  for (const canton of cantones) {
    const cantonGuardado = await prisma.canton.upsert({
      where: { codigoDpa: canton.codigoDpa },
      update: {
        nombre: canton.nombre,
        idProvincia: provincia.id,
        estado: true,
      },
      create: {
        codigoDpa: canton.codigoDpa,
        nombre: canton.nombre,
        idProvincia: provincia.id,
        estado: true,
      },
    });

    cantonIds.set(canton.codigoDpa, cantonGuardado.id);
  }

  const idCantonZamora = cantonIds.get('1901');

  if (idCantonZamora === undefined) {
    throw new Error('No se pudo resolver el cantón Zamora.');
  }

  const parroquiaZamora = await prisma.parroquia.upsert({
    where: { codigoDpa: '190150' },
    update: {
      nombre: 'Zamora',
      idCanton: idCantonZamora,
      estado: true,
    },
    create: {
      codigoDpa: '190150',
      nombre: 'Zamora',
      idCanton: idCantonZamora,
      estado: true,
    },
  });

  const sectorCabecera = await prisma.sector.upsert({
    where: {
      idParroquia_nombre: {
        idParroquia: parroquiaZamora.id,
        nombre: 'Cabecera parroquial',
      },
    },
    update: {
      tipoSector: 'CABECERA_PARROQUIAL',
      estado: true,
    },
    create: {
      idParroquia: parroquiaZamora.id,
      nombre: 'Cabecera parroquial',
      tipoSector: 'CABECERA_PARROQUIAL',
      estado: true,
    },
  });

  const lugar = await prisma.lugar.upsert({
    where: {
      idSector_nombre: {
        idSector: sectorCabecera.id,
        nombre: 'Parque Lineal de Zamora',
      },
    },
    update: {
      tipoLugar: 'PARQUE',
      direccionReferencial: 'Zamora, Zamora Chinchipe',
      estado: true,
    },
    create: {
      idSector: sectorCabecera.id,
      nombre: 'Parque Lineal de Zamora',
      tipoLugar: 'PARQUE',
      direccionReferencial: 'Zamora, Zamora Chinchipe',
      estado: true,
    },
  });

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: categoria.nombre },
      update: {
        descripcion: categoria.descripcion,
        estado: true,
      },
      create: {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: true,
      },
    });
  }

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {
        descripcion: rol.descripcion,
        estado: true,
      },
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        estado: true,
      },
    });
  }

  const [
    totalProvincias,
    totalCantones,
    totalParroquias,
    totalSectores,
    totalLugares,
    totalCategorias,
    totalRoles,
  ] = await Promise.all([
    prisma.provincia.count({
      where: {
        codigoDpa: '19',
        estado: true,
      },
    }),
    prisma.canton.count({
      where: {
        codigoDpa: {
          in: cantones.map((canton) => canton.codigoDpa),
        },
        idProvincia: provincia.id,
        estado: true,
      },
    }),
    prisma.parroquia.count({
      where: {
        codigoDpa: '190150',
        idCanton: idCantonZamora,
        estado: true,
      },
    }),
    prisma.sector.count({
      where: {
        idParroquia: parroquiaZamora.id,
        nombre: 'Cabecera parroquial',
        tipoSector: 'CABECERA_PARROQUIAL',
        estado: true,
      },
    }),
    prisma.lugar.count({
      where: {
        id: lugar.id,
        idSector: sectorCabecera.id,
        estado: true,
      },
    }),
    prisma.categoria.count({
      where: {
        nombre: {
          in: categorias.map((categoria) => categoria.nombre),
        },
        estado: true,
      },
    }),
    prisma.rol.count({
      where: {
        nombre: {
          in: roles.map((rol) => rol.nombre),
        },
        estado: true,
      },
    }),
  ]);

  if (
    totalProvincias !== 1 ||
    totalCantones !== cantones.length ||
    totalParroquias !== 1 ||
    totalSectores !== 1 ||
    totalLugares !== 1 ||
    totalCategorias !== categorias.length ||
    totalRoles !== roles.length
  ) {
    throw new Error('El seed territorial y de catálogos no quedó completo.');
  }

  console.log('Seed T027 completado:');
  console.log(`- ${totalProvincias} provincia`);
  console.log(`- ${totalCantones} cantones`);
  console.log(`- ${totalParroquias} parroquia de referencia`);
  console.log(`- ${totalSectores} sector`);
  console.log(`- ${totalLugares} lugar`);
  console.log(`- ${totalCategorias} categorías`);
  console.log(`- ${totalRoles} roles`);
}

seed()
  .catch((error: unknown) => {
    console.error('No se pudo ejecutar el seed T027.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
