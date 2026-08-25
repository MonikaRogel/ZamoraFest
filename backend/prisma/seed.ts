import { compare, hash as hashPassword } from 'bcryptjs';

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

type RolSeed = (typeof roles)[number]['nombre'];

interface UsuarioSeed {
  rol: RolSeed;
  nombreCompleto: string;
  correo: string;
  password: string;
}

const BCRYPT_ROUNDS = 12;

function requireCredential(name: string): string {
  const value = process.env[name];

  if (!value || value.length === 0) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

function resolveSeedUsers(): UsuarioSeed[] {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const variables = [
    'SEED_ADMIN_EMAIL',
    'SEED_ADMIN_PASSWORD',
    'SEED_ASISTENTE_EMAIL',
    'SEED_ASISTENTE_PASSWORD',
    'SEED_VISITANTE_EMAIL',
    'SEED_VISITANTE_PASSWORD',
  ] as const;

  const configured = variables.filter((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.length > 0;
  });

  if (nodeEnv !== 'test' && configured.length === 0) {
    return [];
  }

  if (configured.length !== variables.length) {
    throw new Error(
      `Configuración incompleta de usuarios seed: ${configured.length}/${variables.length} variables definidas.`,
    );
  }

  const suffix = nodeEnv === 'test' ? 'de prueba' : 'de desarrollo';

  const usuarios: UsuarioSeed[] = [
    {
      rol: 'ADMINISTRADOR',
      nombreCompleto: `Administrador ${suffix}`,
      correo: requireCredential('SEED_ADMIN_EMAIL').trim().toLowerCase(),
      password: requireCredential('SEED_ADMIN_PASSWORD'),
    },
    {
      rol: 'ASISTENTE',
      nombreCompleto: `Asistente ${suffix}`,
      correo: requireCredential('SEED_ASISTENTE_EMAIL').trim().toLowerCase(),
      password: requireCredential('SEED_ASISTENTE_PASSWORD'),
    },
    {
      rol: 'VISITANTE',
      nombreCompleto: `Visitante ${suffix}`,
      correo: requireCredential('SEED_VISITANTE_EMAIL').trim().toLowerCase(),
      password: requireCredential('SEED_VISITANTE_PASSWORD'),
    },
  ];

  const correos = new Set(usuarios.map((usuario) => usuario.correo));

  if (correos.size !== usuarios.length) {
    throw new Error('Los correos configurados para usuarios seed deben ser distintos.');
  }

  for (const usuario of usuarios) {
    if (usuario.password.length < 8 || usuario.password.length > 72) {
      throw new Error(
        `La contraseña local de ${usuario.rol} debe tener entre 8 y 72 caracteres.`,
      );
    }

    if (!usuario.correo.includes('@')) {
      throw new Error(`El correo local de ${usuario.rol} no es válido.`);
    }
  }

  return usuarios;
}

async function upsertSeedUser(usuario: UsuarioSeed, idRol: number): Promise<void> {
  const existente = await prisma.usuario.findUnique({
    where: {
      correo: usuario.correo,
    },
    select: {
      contrasenaHash: true,
    },
  });

  if (!existente) {
    const contrasenaHash = await hashPassword(usuario.password, BCRYPT_ROUNDS);

    await prisma.usuario.create({
      data: {
        idRol,
        nombreCompleto: usuario.nombreCompleto,
        correo: usuario.correo,
        contrasenaHash,
        estado: true,
      },
    });

    return;
  }

  const passwordCoincide = await compare(usuario.password, existente.contrasenaHash);

  await prisma.usuario.update({
    where: {
      correo: usuario.correo,
    },
    data: {
      idRol,
      nombreCompleto: usuario.nombreCompleto,
      estado: true,
      ...(passwordCoincide
        ? {}
        : {
            contrasenaHash: await hashPassword(usuario.password, BCRYPT_ROUNDS),
          }),
    },
  });
}

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

  const roleIds = new Map<RolSeed, number>();

  for (const rol of roles) {
    const rolGuardado = await prisma.rol.upsert({
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

    roleIds.set(rol.nombre, rolGuardado.id);
  }

  const usuariosSeed = resolveSeedUsers();

  for (const usuario of usuariosSeed) {
    const idRol = roleIds.get(usuario.rol);

    if (idRol === undefined) {
      throw new Error(`No se pudo resolver el rol ${usuario.rol}.`);
    }

    await upsertSeedUser(usuario, idRol);
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

  if (usuariosSeed.length > 0) {
    const usuariosGuardados = await prisma.usuario.findMany({
      where: {
        correo: {
          in: usuariosSeed.map((usuario) => usuario.correo),
        },
        estado: true,
      },
      select: {
        correo: true,
        rol: {
          select: {
            nombre: true,
            estado: true,
          },
        },
      },
    });

    if (usuariosGuardados.length !== usuariosSeed.length) {
      throw new Error('No se cargaron todos los usuarios seed.');
    }

    for (const usuarioEsperado of usuariosSeed) {
      const usuarioGuardado = usuariosGuardados.find(
        (usuario) => usuario.correo === usuarioEsperado.correo,
      );

      if (
        !usuarioGuardado ||
        usuarioGuardado.rol.nombre !== usuarioEsperado.rol ||
        !usuarioGuardado.rol.estado
      ) {
        throw new Error(
          `La relación usuario → rol no es válida para ${usuarioEsperado.rol}.`,
        );
      }
    }
  }

  console.log('Seed completado:');
  console.log(`- ${totalProvincias} provincia`);
  console.log(`- ${totalCantones} cantones`);
  console.log(`- ${totalParroquias} parroquia de referencia`);
  console.log(`- ${totalSectores} sector`);
  console.log(`- ${totalLugares} lugar`);
  console.log(`- ${totalCategorias} categorías`);
  console.log(`- ${totalRoles} roles`);
  console.log(`- ${usuariosSeed.length} usuarios de entorno`);
}

seed()
  .catch((error: unknown) => {
    console.error('No se pudo ejecutar el seed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });