import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';

export interface CreateProgramacionRepositoryInput {
  idEvento: number;
  idLugar?: number | null;
  tituloActividad: string;
  descripcion?: string | null;
  fechaHoraInicio: Date;
  fechaHoraFin?: Date | null;
  artistaInvitado?: string | null;
  orden?: number | null;
}

export interface UpdateProgramacionRepositoryInput {
  idLugar?: number | null;
  tituloActividad?: string;
  descripcion?: string | null;
  fechaHoraInicio?: Date;
  fechaHoraFin?: Date | null;
  artistaInvitado?: string | null;
  orden?: number | null;
}

const programacionSelect = {
  id: true,
  idEvento: true,
  idLugar: true,
  tituloActividad: true,
  descripcion: true,
  fechaHoraInicio: true,
  fechaHoraFin: true,
  artistaInvitado: true,
  orden: true,
  estado: true,
  lugar: {
    select: {
      id: true,
      nombre: true,
      direccionReferencial: true,
      sector: {
        select: {
          nombre: true,
          parroquia: {
            select: {
              nombre: true,
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
} satisfies Prisma.ProgramacionEventoSelect;

export const programacionRepository = {
  findActiveLugar(idLugar: number) {
    return prisma.lugar.findFirst({
      where: {
        id: idLugar,
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
      },
      select: {
        id: true,
      },
    });
  },

  listByEvent(idEvento: number) {
    return prisma.programacionEvento.findMany({
      where: {
        idEvento,
        estado: true,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: programacionSelect,
      orderBy: [
        {
          fechaHoraInicio: 'asc',
        },
        {
          orden: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  },

  findByIdForEvent(idEvento: number, idProgramacion: number) {
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
      select: programacionSelect,
    });
  },

  create(input: CreateProgramacionRepositoryInput) {
    const data: Prisma.ProgramacionEventoCreateInput = {
      evento: {
        connect: {
          id: input.idEvento,
        },
      },
      tituloActividad: input.tituloActividad,
      fechaHoraInicio: input.fechaHoraInicio,
      estado: true,
    };

    if (input.idLugar !== undefined && input.idLugar !== null) {
      data.lugar = {
        connect: {
          id: input.idLugar,
        },
      };
    }

    if (input.descripcion !== undefined) {
      data.descripcion = input.descripcion;
    }

    if (input.fechaHoraFin !== undefined) {
      data.fechaHoraFin = input.fechaHoraFin;
    }

    if (input.artistaInvitado !== undefined) {
      data.artistaInvitado = input.artistaInvitado;
    }

    if (input.orden !== undefined) {
      data.orden = input.orden;
    }

    return prisma.programacionEvento.create({
      data,
      select: programacionSelect,
    });
  },

  update(idProgramacion: number, input: UpdateProgramacionRepositoryInput) {
    const data: Prisma.ProgramacionEventoUpdateInput = {};

    if (input.tituloActividad !== undefined) {
      data.tituloActividad = input.tituloActividad;
    }

    if (input.descripcion !== undefined) {
      data.descripcion = input.descripcion;
    }

    if (input.fechaHoraInicio !== undefined) {
      data.fechaHoraInicio = input.fechaHoraInicio;
    }

    if (input.fechaHoraFin !== undefined) {
      data.fechaHoraFin = input.fechaHoraFin;
    }

    if (input.artistaInvitado !== undefined) {
      data.artistaInvitado = input.artistaInvitado;
    }

    if (input.orden !== undefined) {
      data.orden = input.orden;
    }

    if (input.idLugar !== undefined) {
      data.lugar =
        input.idLugar === null
          ? {
              disconnect: true,
            }
          : {
              connect: {
                id: input.idLugar,
              },
            };
    }

    return prisma.programacionEvento.update({
      where: {
        id: idProgramacion,
      },
      data,
      select: programacionSelect,
    });
  },

  deactivate(idEvento: number, idProgramacion: number) {
    return prisma.programacionEvento.updateMany({
      where: {
        id: idProgramacion,
        idEvento,
        estado: true,
      },
      data: {
        estado: false,
      },
    });
  },
};
