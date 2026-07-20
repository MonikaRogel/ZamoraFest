import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { CreateEventoInput, UpdateEventoInput } from './evento.schemas.js';

const eventoSelect = {
  id: true,
  titulo: true,
  descripcion: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
  lugar: {
    select: {
      id: true,
      nombre: true,
      direccion: true,
      canton: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
  categorias: {
    where: {
      eliminadoEn: null,
      categoria: {
        eliminadoEn: null,
      },
    },
    select: {
      categoria: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
} satisfies Prisma.EventoSelect;

const publicEventoWhere = {
  estado: 'PUBLICADO',
  eliminadoEn: null,
  lugar: {
    eliminadoEn: null,
  },
  categorias: {
    some: {
      eliminadoEn: null,
      categoria: {
        eliminadoEn: null,
      },
    },
  },
} satisfies Prisma.EventoWhereInput;

export const eventoRepository = {
  findActiveLugar(lugarId: string) {
    return prisma.lugar.findFirst({
      where: {
        id: lugarId,
        eliminadoEn: null,
        canton: {
          eliminadoEn: null,
        },
      },
      select: {
        id: true,
      },
    });
  },

  findActiveCategoryIds(categoriaIds: string[]) {
    return prisma.categoria.findMany({
      where: {
        id: {
          in: categoriaIds,
        },
        eliminadoEn: null,
      },
      select: {
        id: true,
      },
    });
  },

  create(input: CreateEventoInput) {
    return prisma.evento.create({
      data: {
        titulo: input.titulo,
        descripcion: input.descripcion,
        estado: input.estado,
        lugarId: input.lugarId,
        categorias: {
          create: input.categoriaIds.map((categoriaId) => ({
            categoriaId,
          })),
        },
      },
      select: eventoSelect,
    });
  },

  async list(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, eventos] = await prisma.$transaction([
      prisma.evento.count({
        where: publicEventoWhere,
      }),
      prisma.evento.findMany({
        where: publicEventoWhere,
        select: eventoSelect,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      eventos,
    };
  },

  findPublicById(id: string) {
    return prisma.evento.findFirst({
      where: {
        ...publicEventoWhere,
        id,
      },
      select: eventoSelect,
    });
  },

  findActiveById(id: string) {
    return prisma.evento.findFirst({
      where: {
        id,
        eliminadoEn: null,
      },
      select: {
        id: true,
      },
    });
  },

  update(id: string, input: UpdateEventoInput) {
    return prisma.$transaction(async (transaction) => {
      const data: Prisma.EventoUpdateInput = {};

      if (input.titulo !== undefined) {
        data.titulo = input.titulo;
      }

      if (input.descripcion !== undefined) {
        data.descripcion = input.descripcion;
      }

      if (input.estado !== undefined) {
        data.estado = input.estado;
      }

      if (input.lugarId !== undefined) {
        data.lugar = {
          connect: {
            id: input.lugarId,
          },
        };
      }

      await transaction.evento.update({
        where: {
          id,
        },
        data,
      });

      if (input.categoriaIds !== undefined) {
        await transaction.eventoCategoria.updateMany({
          where: {
            eventoId: id,
            eliminadoEn: null,
            categoriaId: {
              notIn: input.categoriaIds,
            },
          },
          data: {
            eliminadoEn: new Date(),
          },
        });

        for (const categoriaId of input.categoriaIds) {
          await transaction.eventoCategoria.upsert({
            where: {
              eventoId_categoriaId: {
                eventoId: id,
                categoriaId,
              },
            },
            create: {
              eventoId: id,
              categoriaId,
            },
            update: {
              eliminadoEn: null,
            },
          });
        }
      }

      return transaction.evento.findUniqueOrThrow({
        where: {
          id,
        },
        select: eventoSelect,
      });
    });
  },

  softDelete(id: string) {
    return prisma.$transaction(async (transaction) => {
      const eliminadoEn = new Date();

      await transaction.eventoCategoria.updateMany({
        where: {
          eventoId: id,
          eliminadoEn: null,
        },
        data: {
          eliminadoEn,
        },
      });

      await transaction.programacionEvento.updateMany({
        where: {
          eventoId: id,
          eliminadoEn: null,
        },
        data: {
          eliminadoEn,
        },
      });

      await transaction.imagenEvento.updateMany({
        where: {
          eventoId: id,
          eliminadoEn: null,
        },
        data: {
          eliminadoEn,
        },
      });

      return transaction.evento.update({
        where: {
          id,
        },
        data: {
          eliminadoEn,
        },
        select: {
          id: true,
        },
      });
    });
  },
};
