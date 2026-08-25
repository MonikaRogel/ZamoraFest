import { Worker } from 'bullmq';

import { prisma } from '../infrastructure/database/prisma.js';
import {
  RECORDATORIO_QUEUE_NAME,
  type RecordatorioJobData,
} from '../infrastructure/queue/recordatorio.queue.js';
import { bullMqConnection } from '../infrastructure/queue/redis-connection.js';

export type RecordatorioSkipReason =
  | 'NOT_FOUND'
  | 'INACTIVE'
  | 'USER_INACTIVE'
  | 'EVENT_NOT_PUBLIC'
  | 'PROGRAMACION_INACTIVE'
  | 'PROGRAMACION_EVENT_MISMATCH';

export type RecordatorioWorkerResult =
  | {
      recordatorioId: number;
      processed: true;
      destinatario: string;
      evento: string;
      programacion: string | null;
    }
  | {
      recordatorioId: number;
      processed: false;
      reason: RecordatorioSkipReason;
    };

function validateRecordatorioId(recordatorioId: number): void {
  if (!Number.isSafeInteger(recordatorioId) || recordatorioId <= 0) {
    throw new RangeError('recordatorioId debe ser un entero positivo.');
  }
}

function skipped(recordatorioId: number, reason: RecordatorioSkipReason): RecordatorioWorkerResult {
  return {
    recordatorioId,
    processed: false,
    reason,
  };
}

export async function processRecordatorioJob(
  data: RecordatorioJobData,
): Promise<RecordatorioWorkerResult> {
  const { recordatorioId } = data;

  validateRecordatorioId(recordatorioId);

  const recordatorio = await prisma.recordatorio.findUnique({
    where: {
      id: recordatorioId,
    },
    select: {
      id: true,
      activo: true,
      fechaNotificacion: true,
      usuario: {
        select: {
          id: true,
          nombreCompleto: true,
          correo: true,
          estado: true,
        },
      },
      evento: {
        select: {
          id: true,
          titulo: true,
          estadoEvento: true,
          estadoRevision: true,
        },
      },
      programacion: {
        select: {
          id: true,
          idEvento: true,
          tituloActividad: true,
          estado: true,
        },
      },
    },
  });

  if (!recordatorio) {
    return skipped(recordatorioId, 'NOT_FOUND');
  }

  if (!recordatorio.activo) {
    return skipped(recordatorioId, 'INACTIVE');
  }

  if (!recordatorio.usuario.estado) {
    return skipped(recordatorioId, 'USER_INACTIVE');
  }

  if (
    recordatorio.evento.estadoEvento !== 'PROGRAMADO' ||
    recordatorio.evento.estadoRevision !== 'APROBADO'
  ) {
    return skipped(recordatorioId, 'EVENT_NOT_PUBLIC');
  }

  if (recordatorio.programacion !== null) {
    if (recordatorio.programacion.idEvento !== recordatorio.evento.id) {
      return skipped(recordatorioId, 'PROGRAMACION_EVENT_MISMATCH');
    }

    if (!recordatorio.programacion.estado) {
      return skipped(recordatorioId, 'PROGRAMACION_INACTIVE');
    }
  }

  console.log(
    [
      `Procesando recordatorio ${recordatorio.id}:`,
      `${recordatorio.usuario.correo} →`,
      recordatorio.evento.titulo,
    ].join(' '),
  );

  return {
    recordatorioId: recordatorio.id,
    processed: true,
    destinatario: recordatorio.usuario.correo,
    evento: recordatorio.evento.titulo,
    programacion: recordatorio.programacion?.tituloActividad ?? null,
  };
}

export const recordatorioWorker = new Worker<RecordatorioJobData, RecordatorioWorkerResult>(
  RECORDATORIO_QUEUE_NAME,
  async (job) => processRecordatorioJob(job.data),
  {
    connection: bullMqConnection,
    concurrency: 2,
  },
);

recordatorioWorker.on('ready', () => {
  console.log('Worker de recordatorios listo.');
});

recordatorioWorker.on('completed', (job) => {
  console.log(`Trabajo ${job.id ?? 'sin identificador'} completado.`);
});

recordatorioWorker.on('failed', (job, error) => {
  console.error(`Trabajo ${job?.id ?? 'sin identificador'} fallido: ${error.message}`);
});

recordatorioWorker.on('error', (error) => {
  console.error(`Error del worker: ${error.message}`);
});

let closing = false;

async function shutdown(signal: string): Promise<void> {
  if (closing) {
    return;
  }

  closing = true;

  console.log(`Cerrando worker por ${signal}...`);

  await recordatorioWorker.close();
  await prisma.$disconnect();
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});
