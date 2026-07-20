import { AppError } from '../../common/errors/app-error.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { enqueueRecordatorio } from '../../infrastructure/queue/recordatorio.queue.js';
import type { CreateRecordatorioInput } from './recordatorio.schemas.js';

export const recordatorioService = {
  async create(usuarioId: string, input: CreateRecordatorioInput) {
    const evento = await prisma.evento.findFirst({
      where: {
        id: input.eventoId,
        estado: 'PUBLICADO',
        eliminadoEn: null,
      },
      select: {
        id: true,
      },
    });

    if (!evento) {
      throw new AppError(
        404,
        'EVENTO_NOT_FOUND',
        'El evento publicado no existe o está eliminado.',
      );
    }

    const recordatorio = await prisma.recordatorio.create({
      data: {
        usuarioId,
        eventoId: evento.id,
      },
      select: {
        id: true,
        usuarioId: true,
        eventoId: true,
        estado: true,
        createdAt: true,
      },
    });

    try {
      await enqueueRecordatorio(recordatorio.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No fue posible conectar con la cola.';

      await prisma.recordatorio.update({
        where: {
          id: recordatorio.id,
        },
        data: {
          estado: 'FALLIDO',
          error: message,
        },
      });

      throw new AppError(503, 'QUEUE_UNAVAILABLE', 'No fue posible programar el recordatorio.');
    }

    return {
      ...recordatorio,
      createdAt: recordatorio.createdAt.toISOString(),
    };
  },
};
