import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';

export interface CreateRecordatorioRepositoryInput {
  idUsuario: number;
  idEvento: number;
  idProgramacion?: number | null;
  fechaNotificacion: Date;
}

const recordatorioSelect = {
  id: true,
  idUsuario: true,
  idEvento: true,
  idProgramacion: true,
  fechaNotificacion: true,
  activo: true,
  fechaCreacion: true,
  evento: {
    select: {
      id: true,
      titulo: true,
      fechaInicio: true,
      fechaFin: true,
      estadoEvento: true,
      estadoRevision: true,
    },
  },
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
} satisfies Prisma.RecordatorioSelect;

export const recordatorioRepository = {
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

  create(input: CreateRecordatorioRepositoryInput) {
    const data: Prisma.RecordatorioUncheckedCreateInput = {
      idUsuario: input.idUsuario,
      idEvento: input.idEvento,
      fechaNotificacion: input.fechaNotificacion,
      activo: true,
    };

    if (input.idProgramacion !== undefined) {
      data.idProgramacion = input.idProgramacion;
    }

    return prisma.recordatorio.create({
      data,
      select: recordatorioSelect,
    });
  },

  listByUser(idUsuario: number) {
    return prisma.recordatorio.findMany({
      where: {
        idUsuario,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: recordatorioSelect,
      orderBy: [
        {
          activo: 'desc',
        },
        {
          fechaNotificacion: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  },

  findByIdForUser(idRecordatorio: number, idUsuario: number) {
    return prisma.recordatorio.findFirst({
      where: {
        id: idRecordatorio,
        idUsuario,
        evento: {
          estadoEvento: {
            not: 'ELIMINADO',
          },
        },
      },
      select: recordatorioSelect,
    });
  },

  deactivateOwn(idRecordatorio: number, idUsuario: number) {
    return prisma.recordatorio.updateMany({
      where: {
        id: idRecordatorio,
        idUsuario,
        activo: true,
      },
      data: {
        activo: false,
      },
    });
  },
};
