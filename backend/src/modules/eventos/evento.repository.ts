import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { eventoInstantToDatabaseDate } from './evento.datetime.js';

export type EventoDetailLevel = 'basic' | 'detailed';

export interface PublicEventoFilters {
  cantonId?: number;
  categoriaId?: number;
}

export interface CreateEventoRepositoryInput {
  titulo: string;
  descripcion?: string | null;
  fechaInicio: Date;
  fechaFin?: Date | null;
  costoReferencial: number;
  lugarId: number;
  categoriaIds: number[];
  fuenteInformacion?: string | null;
  idUsuarioCreador: number;
  estadoEvento: 'BORRADOR';
  estadoRevision: 'PENDIENTE';
}

export interface UpdateEventoRepositoryInput {
  titulo?: string;
  descripcion?: string | null;
  fechaInicio?: Date;
  fechaFin?: Date | null;
  costoReferencial?: number;
  lugarId?: number;
  categoriaIds?: number[];
  fuenteInformacion?: string | null;
}

export interface ReviewEventoRepositoryInput {
  estadoRevision: 'APROBADO' | 'RECHAZADO';
  idUsuarioRevisor: number;
  fechaRevision: Date;
}

const usuarioResumenSelect = {
  id: true,
  nombreCompleto: true,
  rol: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.UsuarioSelect;

const lugarJerarquiaSelect = {
  id: true,
  nombre: true,
  tipoLugar: true,
  direccionReferencial: true,
  referencia: true,
  latitud: true,
  longitud: true,
  sector: {
    select: {
      id: true,
      nombre: true,
      tipoSector: true,
      parroquia: {
        select: {
          id: true,
          codigoDpa: true,
          nombre: true,
          canton: {
            select: {
              id: true,
              codigoDpa: true,
              nombre: true,
              provincia: {
                select: {
                  id: true,
                  codigoDpa: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.LugarSelect;

const lugarProgramacionSelect = {
  id: true,
  nombre: true,
  tipoLugar: true,
  direccionReferencial: true,
} satisfies Prisma.LugarSelect;

const categoriaResumenSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} satisfies Prisma.CategoriaSelect;

const programacionSelect = {
  id: true,
  idLugar: true,
  tituloActividad: true,
  descripcion: true,
  fechaHoraInicio: true,
  fechaHoraFin: true,
  artistaInvitado: true,
  orden: true,
  estado: true,
  lugar: {
    select: lugarProgramacionSelect,
  },
} satisfies Prisma.ProgramacionEventoSelect;

const imagenSelect = {
  id: true,
  idProgramacion: true,
  urlImagen: true,
  tipoImagen: true,
  descripcion: true,
  esPrincipal: true,
  fechaSubida: true,
} satisfies Prisma.ImagenEventoSelect;

const eventoBasicSelect = {
  id: true,
  titulo: true,
  descripcion: true,
  fechaInicio: true,
  fechaFin: true,
  costoReferencial: true,
  estadoEvento: true,
  estadoRevision: true,
  fuenteInformacion: true,
  fechaCreacion: true,
  fechaActualizacion: true,
  fechaRevision: true,
  lugar: {
    select: lugarJerarquiaSelect,
  },
  usuarioCreador: {
    select: usuarioResumenSelect,
  },
  usuarioRevisor: {
    select: usuarioResumenSelect,
  },
  categorias: {
    where: {
      categoria: {
        estado: true,
      },
    },
    select: {
      categoria: {
        select: categoriaResumenSelect,
      },
    },
  },
} satisfies Prisma.EventoSelect;

const eventoDetailedSelect = {
  ...eventoBasicSelect,
  programaciones: {
    where: {
      estado: true,
    },
    orderBy: [
      {
        orden: 'asc',
      },
      {
        fechaHoraInicio: 'asc',
      },
    ],
    select: programacionSelect,
  },
  imagenes: {
    where: {
      estado: true,
    },
    orderBy: [
      {
        esPrincipal: 'desc',
      },
      {
        fechaSubida: 'asc',
      },
    ],
    select: imagenSelect,
  },
} satisfies Prisma.EventoSelect;

const activeLugarWhere = {
  estado: true,
  sector: {
    estado: true,
    parroquia: {
      estado: true,
      canton: {
        estado: true,
        provincia: {
          estado: true,
        },
      },
    },
  },
} satisfies Prisma.LugarWhereInput;

const publicEventoWhere = {
  estadoEvento: 'PROGRAMADO',
  estadoRevision: 'APROBADO',
  lugar: activeLugarWhere,
  categorias: {
    some: {
      categoria: {
        estado: true,
      },
    },
  },
} satisfies Prisma.EventoWhereInput;

function buildPublicEventoWhere(filters: PublicEventoFilters): Prisma.EventoWhereInput {
  const conditions: Prisma.EventoWhereInput[] = [publicEventoWhere];

  if (filters.cantonId !== undefined) {
    conditions.push({
      lugar: {
        sector: {
          parroquia: {
            canton: {
              id: filters.cantonId,
            },
          },
        },
      },
    });
  }

  if (filters.categoriaId !== undefined) {
    conditions.push({
      categorias: {
        some: {
          idCategoria: filters.categoriaId,
          categoria: {
            estado: true,
          },
        },
      },
    });
  }

  if (conditions.length === 1) {
    return publicEventoWhere;
  }

  return {
    AND: conditions,
  };
}

export const eventoRepository = {
  findActiveLugar(lugarId: number) {
    return prisma.lugar.findFirst({
      where: {
        id: lugarId,
        ...activeLugarWhere,
      },
      select: {
        id: true,
      },
    });
  },

  findActiveCategoryIds(categoriaIds: number[]) {
    return prisma.categoria.findMany({
      where: {
        id: {
          in: categoriaIds,
        },
        estado: true,
      },
      select: {
        id: true,
      },
    });
  },

  create(input: CreateEventoRepositoryInput) {
    return prisma.evento.create({
      data: {
        titulo: input.titulo,
        descripcion: input.descripcion ?? null,
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin ?? null,
        costoReferencial: input.costoReferencial,
        fuenteInformacion: input.fuenteInformacion ?? null,
        lugar: {
          connect: {
            id: input.lugarId,
          },
        },
        usuarioCreador: {
          connect: {
            id: input.idUsuarioCreador,
          },
        },
        estadoEvento: input.estadoEvento,
        estadoRevision: input.estadoRevision,
        categorias: {
          create: input.categoriaIds.map((idCategoria) => ({
            categoria: {
              connect: {
                id: idCategoria,
              },
            },
          })),
        },
      },
      select: eventoBasicSelect,
    });
  },

  async list(
    page: number,
    limit: number,
    detailLevel: EventoDetailLevel = 'basic',
    filters: PublicEventoFilters = {},
  ) {
    const skip = (page - 1) * limit;
    const where = buildPublicEventoWhere(filters);

    if (detailLevel === 'detailed') {
      const [total, eventos] = await prisma.$transaction([
        prisma.evento.count({
          where,
        }),
        prisma.evento.findMany({
          where,
          select: eventoDetailedSelect,
          orderBy: [
            {
              fechaInicio: 'asc',
            },
            {
              id: 'asc',
            },
          ],
          skip,
          take: limit,
        }),
      ]);

      return {
        total,
        eventos,
      };
    }

    const [total, eventos] = await prisma.$transaction([
      prisma.evento.count({
        where,
      }),
      prisma.evento.findMany({
        where,
        select: eventoBasicSelect,
        orderBy: [
          {
            fechaInicio: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      eventos,
    };
  },

  findPublicById(id: number, detailLevel: EventoDetailLevel = 'detailed') {
    if (detailLevel === 'detailed') {
      return prisma.evento.findFirst({
        where: {
          ...publicEventoWhere,
          id,
        },
        select: eventoDetailedSelect,
      });
    }

    return prisma.evento.findFirst({
      where: {
        ...publicEventoWhere,
        id,
      },
      select: eventoBasicSelect,
    });
  },

  findById(id: number, detailLevel: EventoDetailLevel = 'basic') {
    const where = {
      id,
      estadoEvento: {
        not: 'ELIMINADO',
      },
    } satisfies Prisma.EventoWhereInput;

    if (detailLevel === 'detailed') {
      return prisma.evento.findFirst({
        where,
        select: eventoDetailedSelect,
      });
    }

    return prisma.evento.findFirst({
      where,
      select: eventoBasicSelect,
    });
  },

  update(id: number, input: UpdateEventoRepositoryInput) {
    return prisma.$transaction(async (transaction) => {
      const data: Prisma.EventoUpdateInput = {
        fechaActualizacion: eventoInstantToDatabaseDate(new Date()),
      };

      if (input.titulo !== undefined) {
        data.titulo = input.titulo;
      }

      if (input.descripcion !== undefined) {
        data.descripcion = input.descripcion;
      }

      if (input.fechaInicio !== undefined) {
        data.fechaInicio = input.fechaInicio;
      }

      if (input.fechaFin !== undefined) {
        data.fechaFin = input.fechaFin;
      }

      if (input.costoReferencial !== undefined) {
        data.costoReferencial = input.costoReferencial;
      }

      if (input.fuenteInformacion !== undefined) {
        data.fuenteInformacion = input.fuenteInformacion;
      }

      if (input.lugarId !== undefined) {
        data.lugar = {
          connect: {
            id: input.lugarId,
          },
        };
      }

      if (Object.keys(data).length > 0) {
        await transaction.evento.update({
          where: {
            id,
          },
          data,
        });
      }

      if (input.categoriaIds !== undefined) {
        await transaction.eventoCategoria.deleteMany({
          where: {
            idEvento: id,
          },
        });

        await transaction.eventoCategoria.createMany({
          data: input.categoriaIds.map((idCategoria) => ({
            idEvento: id,
            idCategoria,
          })),
        });
      }

      return transaction.evento.findUniqueOrThrow({
        where: {
          id,
        },
        select: eventoBasicSelect,
      });
    });
  },

  logicalDelete(id: number) {
    return prisma.evento.update({
      where: {
        id,
      },
      data: {
        estadoEvento: 'ELIMINADO',
      },
      select: eventoBasicSelect,
    });
  },

  review(id: number, input: ReviewEventoRepositoryInput) {
    return prisma.evento.update({
      where: {
        id,
      },
      data: {
        estadoRevision: input.estadoRevision,
        usuarioRevisor: {
          connect: {
            id: input.idUsuarioRevisor,
          },
        },
        fechaRevision: input.fechaRevision,
      },
      select: eventoBasicSelect,
    });
  },

  publish(id: number) {
    return prisma.evento.update({
      where: {
        id,
      },
      data: {
        estadoEvento: 'PROGRAMADO',
      },
      select: eventoBasicSelect,
    });
  },
};
