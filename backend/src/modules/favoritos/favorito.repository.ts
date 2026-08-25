import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';

export interface CreateFavoritoRepositoryInput {
  idUsuario: number;
  idEvento: number;
  fechaAgregado: Date;
}

const favoritoEventoSelect = {
  id: true,
  titulo: true,
  fechaInicio: true,
  fechaFin: true,
  costoReferencial: true,
  estadoEvento: true,
  estadoRevision: true,
  lugar: {
    select: {
      id: true,
      nombre: true,
      sector: {
        select: {
          parroquia: {
            select: {
              canton: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
  },
  categorias: {
    where: {
      categoria: {
        estado: true,
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

const favoritoSelect = {
  idUsuario: true,
  idEvento: true,
  fechaAgregado: true,
  evento: {
    select: favoritoEventoSelect,
  },
} satisfies Prisma.UsuarioEventoFavoritoSelect;

export const favoritoRepository = {
  findByUserAndEvent(idUsuario: number, idEvento: number) {
    return prisma.usuarioEventoFavorito.findUnique({
      where: {
        idUsuario_idEvento: {
          idUsuario,
          idEvento,
        },
      },
      select: {
        idUsuario: true,
        idEvento: true,
      },
    });
  },

  create(input: CreateFavoritoRepositoryInput) {
    return prisma.usuarioEventoFavorito.create({
      data: {
        idUsuario: input.idUsuario,
        idEvento: input.idEvento,
        fechaAgregado: input.fechaAgregado,
      },
      select: favoritoSelect,
    });
  },

  listByUser(idUsuario: number) {
    return prisma.usuarioEventoFavorito.findMany({
      where: {
        idUsuario,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: favoritoSelect,
      orderBy: [
        {
          fechaAgregado: 'desc',
        },
        {
          idEvento: 'asc',
        },
      ],
    });
  },

  deleteOwn(idUsuario: number, idEvento: number) {
    return prisma.usuarioEventoFavorito.deleteMany({
      where: {
        idUsuario,
        idEvento,
      },
    });
  },
};
