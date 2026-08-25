import { AppError } from '../../common/errors/app-error.js';
import { enqueueRecordatorio } from '../../infrastructure/queue/recordatorio.queue.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import type { CreateRecordatorioInput } from './recordatorio.schemas.js';
import { recordatorioService } from './recordatorio.service.js';

export const recordatorioApplication = {
  async create(identidad: IdentidadAcceso, input: CreateRecordatorioInput) {
    const recordatorio = await recordatorioService.create(identidad, input);

    try {
      await enqueueRecordatorio(recordatorio.id);
    } catch {
      throw new AppError(
        503,
        'QUEUE_UNAVAILABLE',
        'El recordatorio fue registrado, pero no fue posible enviarlo a la cola de procesamiento.',
      );
    }

    return recordatorio;
  },
};
