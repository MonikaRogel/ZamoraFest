import { prisma } from '../src/infrastructure/database/prisma.js';

type EstadoDemo = 'BORRADOR' | 'PROGRAMADO';
type RevisionDemo = 'PENDIENTE' | 'APROBADO';

interface EventoDemo {
  clave: string;
  titulo: string;
  descripcion: string;
  categoria: 'Cultura' | 'Música' | 'Gastronomía';
  fechaInicio: Date;
  fechaFin: Date;
  costoReferencial: string;
  estadoEvento: EstadoDemo;
  estadoRevision: RevisionDemo;
  programacion: boolean;
}

const PUBLICADOS = 12;
const BORRADORES = 3;
const TOTAL_EVENTOS = PUBLICADOS + BORRADORES;

const eventosDemo: EventoDemo[] = Array.from({ length: TOTAL_EVENTOS }, (_value, index) => {
  const numero = index + 1;
  const esPublicado = numero <= PUBLICADOS;
  const inicio = new Date(Date.UTC(2026, 8, 5 + index * 7, 19, 0, 0));
  const fin = new Date(inicio.getTime() + 3 * 60 * 60 * 1000);
  const categorias = ['Cultura', 'Música', 'Gastronomía'] as const;
  const categoria = categorias[index % categorias.length];

  if (!categoria) {
    throw new Error(`No se pudo resolver la categoría del evento ${numero}.`);
  }

  return {
    clave: `ZAMORAFEST_DEMO_T029_${String(numero).padStart(2, '0')}`,
    titulo: esPublicado
      ? `Evento cultural de demostración ${String(numero).padStart(2, '0')}`
      : `Borrador cultural de demostración ${String(numero).padStart(2, '0')}`,
    descripcion: esPublicado
      ? 'Evento programado y aprobado para pruebas de consulta, relaciones y optimización.'
      : 'Evento en borrador y pendiente de revisión para pruebas del flujo editorial.',
    categoria,
    fechaInicio: inicio,
    fechaFin: fin,
    costoReferencial: numero % 4 === 0 ? '5.00' : '0.00',
    estadoEvento: esPublicado ? 'PROGRAMADO' : 'BORRADOR',
    estadoRevision: esPublicado ? 'APROBADO' : 'PENDIENTE',
    programacion: esPublicado,
  };
});

async function obtenerUsuarioPorRol(
  nombreRol: 'ASISTENTE' | 'ADMINISTRADOR',
): Promise<{ id: number }> {
  const usuarios = await prisma.usuario.findMany({
    where: {
      estado: true,
      rol: {
        nombre: nombreRol,
        estado: true,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (usuarios.length === 0) {
    throw new Error(
      `No existe un usuario activo con rol ${nombreRol}. Ejecute primero el seed T028.`,
    );
  }

  const usuario = usuarios[0];

  if (!usuario) {
    throw new Error(`No se pudo resolver el usuario ${nombreRol}.`);
  }

  return usuario;
}

async function obtenerEventoDemoUnico(clave: string): Promise<{ id: number } | null> {
  const encontrados = await prisma.evento.findMany({
    where: {
      fuenteInformacion: clave,
    },
    select: {
      id: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (encontrados.length > 1) {
    throw new Error(`Se detectaron ${encontrados.length} eventos con la clave demo ${clave}.`);
  }

  return encontrados[0] ?? null;
}

async function prepararDatosDemo(): Promise<void> {
  const [lugar, asistente, administrador, categorias] = await Promise.all([
    prisma.lugar.findFirst({
      where: {
        nombre: 'Parque Lineal de Zamora',
        estado: true,
        sector: {
          nombre: 'Cabecera parroquial',
          estado: true,
          parroquia: {
            codigoDpa: '190150',
            estado: true,
          },
        },
      },
      select: {
        id: true,
      },
    }),
    obtenerUsuarioPorRol('ASISTENTE'),
    obtenerUsuarioPorRol('ADMINISTRADOR'),
    prisma.categoria.findMany({
      where: {
        nombre: {
          in: ['Cultura', 'Música', 'Gastronomía'],
        },
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
      },
    }),
  ]);

  if (!lugar) {
    throw new Error('No existe el lugar de referencia de T027. Ejecute primero el seed.');
  }

  const categoriaIds = new Map(categorias.map((categoria) => [categoria.nombre, categoria.id]));

  if (categoriaIds.size !== 3) {
    throw new Error('No están disponibles las tres categorías requeridas por T029.');
  }

  for (const eventoDemo of eventosDemo) {
    const idCategoria = categoriaIds.get(eventoDemo.categoria);

    if (idCategoria === undefined) {
      throw new Error(`No se pudo resolver la categoría ${eventoDemo.categoria}.`);
    }

    const existente = await obtenerEventoDemoUnico(eventoDemo.clave);

    const dataEvento = {
      titulo: eventoDemo.titulo,
      descripcion: eventoDemo.descripcion,
      fechaInicio: eventoDemo.fechaInicio,
      fechaFin: eventoDemo.fechaFin,
      costoReferencial: eventoDemo.costoReferencial,
      idLugar: lugar.id,
      idUsuarioCreador: asistente.id,
      idUsuarioRevisor: eventoDemo.estadoRevision === 'APROBADO' ? administrador.id : null,
      estadoEvento: eventoDemo.estadoEvento,
      estadoRevision: eventoDemo.estadoRevision,
      fuenteInformacion: eventoDemo.clave,
      fechaActualizacion: new Date(Date.UTC(2026, 7, 19, 18, 0, 0)),
      fechaRevision:
        eventoDemo.estadoRevision === 'APROBADO' ? new Date(Date.UTC(2026, 7, 19, 17, 0, 0)) : null,
    };

    const evento = existente
      ? await prisma.evento.update({
          where: {
            id: existente.id,
          },
          data: dataEvento,
          select: {
            id: true,
          },
        })
      : await prisma.evento.create({
          data: dataEvento,
          select: {
            id: true,
          },
        });

    await prisma.eventoCategoria.upsert({
      where: {
        idEvento_idCategoria: {
          idEvento: evento.id,
          idCategoria,
        },
      },
      update: {},
      create: {
        idEvento: evento.id,
        idCategoria,
      },
    });

    if (eventoDemo.programacion) {
      const tituloActividad = `Actividad principal ${eventoDemo.clave}`;

      const programaciones = await prisma.programacionEvento.findMany({
        where: {
          idEvento: evento.id,
          tituloActividad,
        },
        select: {
          id: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (programaciones.length > 1) {
        throw new Error(`El evento ${eventoDemo.clave} tiene programaciones demo duplicadas.`);
      }

      const dataProgramacion = {
        idEvento: evento.id,
        idLugar: lugar.id,
        tituloActividad,
        descripcion: 'Actividad principal de demostración asociada al evento.',
        fechaHoraInicio: eventoDemo.fechaInicio,
        fechaHoraFin: eventoDemo.fechaFin,
        artistaInvitado: null,
        orden: 1,
        estado: true,
      };

      const programacion = programaciones[0];

      if (programacion) {
        await prisma.programacionEvento.update({
          where: {
            id: programacion.id,
          },
          data: dataProgramacion,
        });
      } else {
        await prisma.programacionEvento.create({
          data: dataProgramacion,
        });
      }
    }
  }

  const claves = eventosDemo.map((evento) => evento.clave);

  const [total, publicados, borradores, categoriasAsociadas, programaciones] = await Promise.all([
    prisma.evento.count({
      where: {
        fuenteInformacion: {
          in: claves,
        },
      },
    }),
    prisma.evento.count({
      where: {
        fuenteInformacion: {
          in: claves,
        },
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
        idUsuarioCreador: asistente.id,
      },
    }),
    prisma.evento.count({
      where: {
        fuenteInformacion: {
          in: claves,
        },
        estadoEvento: 'BORRADOR',
        estadoRevision: 'PENDIENTE',
        idUsuarioCreador: asistente.id,
      },
    }),
    prisma.eventoCategoria.count({
      where: {
        evento: {
          fuenteInformacion: {
            in: claves,
          },
        },
      },
    }),
    prisma.programacionEvento.count({
      where: {
        evento: {
          fuenteInformacion: {
            in: claves,
          },
        },
        estado: true,
      },
    }),
  ]);

  if (
    total !== TOTAL_EVENTOS ||
    publicados !== PUBLICADOS ||
    borradores !== BORRADORES ||
    categoriasAsociadas !== TOTAL_EVENTOS ||
    programaciones !== PUBLICADOS
  ) {
    throw new Error(
      [
        'Los datos T029 no quedaron completos.',
        `eventos=${total}/${TOTAL_EVENTOS}`,
        `publicados=${publicados}/${PUBLICADOS}`,
        `borradores=${borradores}/${BORRADORES}`,
        `categorías=${categoriasAsociadas}/${TOTAL_EVENTOS}`,
        `programaciones=${programaciones}/${PUBLICADOS}`,
      ].join(' '),
    );
  }

  console.log('Datos T029 preparados correctamente:');
  console.log(`- ${total} eventos demo`);
  console.log(`- ${publicados} PROGRAMADO/APROBADO`);
  console.log(`- ${borradores} BORRADOR/PENDIENTE`);
  console.log(`- ${categoriasAsociadas} asociaciones evento-categoría`);
  console.log(`- ${programaciones} programaciones activas`);
  console.log('- creador: ASISTENTE');
  console.log('- revisor de aprobados: ADMINISTRADOR');
}

prepararDatosDemo()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Error desconocido.';

    console.error(`No se prepararon los datos T029: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
