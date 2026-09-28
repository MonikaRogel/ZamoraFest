import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { eventoInstantToDatabaseDate } from '../eventos/evento.datetime.js';

export interface CreateImagenRepositoryInput {
  idEvento: number;
  idProgramacion?: number | null;
  idUsuarioSubida: number;
  urlImagen: string;
  tipoImagen: 'AFICHE' | 'FOTOGRAFIA' | 'OTRA';
  descripcion?: string | null;
  esPrincipal: boolean;
  fechaSubida: Date;
}

const imagenSelect = {
  id: true,
  idEvento: true,
  idProgramacion: true,
  idUsuarioSubida: true,
  urlImagen: true,
  tipoImagen: true,
  descripcion: true,
  esPrincipal: true,
  fechaSubida: true,
  estado: true,
  programacion: {
    select: {
      id: true,
      idEvento: true,
      tituloActividad: true,
      fechaHoraInicio: true,
      fechaHoraFin: true,
      estado: true,
    },
  },
  usuarioSubida: {
    select: {
      id: true,
      nombreCompleto: true,
      rol: {
        select: {
          nombre: true,
        },
      },
    },
  },
} satisfies Prisma.ImagenEventoSelect;

export const imagenRepository = {
  findActiveProgramacionForEvent(idEvento: number, idProgramacion: number) {
    return prisma.programacionEvento.findFirst({
      where: {
        id: idProgramacion,
        idEvento,
        estado: true,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: {
        id: true,
        idEvento: true,
      },
    });
  },

  findActivePrincipalByEvent(idEvento: number) {
    return prisma.imagenEvento.findFirst({
      where: {
        idEvento,
        esPrincipal: true,
        estado: true,
      },
      select: {
        id: true,
        idEvento: true,
      },
    });
  },

  listByEvent(idEvento: number) {
    return prisma.imagenEvento.findMany({
      where: {
        idEvento,
        estado: true,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: imagenSelect,
      orderBy: [
        {
          esPrincipal: 'desc',
        },
        {
          fechaSubida: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });
  },

  findByIdForEvent(idEvento: number, idImagen: number) {
    return prisma.imagenEvento.findFirst({
      where: {
        id: idImagen,
        idEvento,
        estado: true,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: imagenSelect,
    });
  },

  create(input: CreateImagenRepositoryInput) {
    const data: Prisma.ImagenEventoUncheckedCreateInput = {
      idEvento: input.idEvento,
      idUsuarioSubida: input.idUsuarioSubida,
      urlImagen: input.urlImagen,
      tipoImagen: input.tipoImagen,
      esPrincipal: input.esPrincipal,
      fechaSubida: input.fechaSubida,
      estado: true,
    };

    if (input.idProgramacion !== undefined) {
      data.idProgramacion = input.idProgramacion;
    }

    if (input.descripcion !== undefined) {
      data.descripcion = input.descripcion;
    }

    return prisma.$transaction(async (transaction) => {
      const imagen = await transaction.imagenEvento.create({
        data,
        select: imagenSelect,
      });

      await transaction.evento.update({
        where: {
          id: input.idEvento,
        },
        data: {
          fechaActualizacion: eventoInstantToDatabaseDate(new Date()),
        },
      });

      return imagen;
    });
  },

  deactivate(idEvento: number, idImagen: number) {
    return prisma.$transaction(async (transaction) => {
      const result = await transaction.imagenEvento.updateMany({
        where: {
          id: idImagen,
          idEvento,
          estado: true,
        },
        data: {
          estado: false,
        },
      });

      if (result.count > 0) {
        await transaction.evento.update({
          where: {
            id: idEvento,
          },
          data: {
            fechaActualizacion: eventoInstantToDatabaseDate(new Date()),
          },
        });
      }

      return result;
    });
  },
};
