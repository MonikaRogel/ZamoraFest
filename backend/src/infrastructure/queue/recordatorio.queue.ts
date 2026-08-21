import { Queue } from 'bullmq';

import { bullMqConnection } from './redis-connection.js';

export const RECORDATORIO_QUEUE_NAME = 'recordatorios';

export interface RecordatorioJobData {
  recordatorioId: number;
}

export const RECORDATORIO_DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: 50,
  removeOnFail: 50,
};

export const recordatorioQueue = new Queue<RecordatorioJobData>(RECORDATORIO_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: RECORDATORIO_DEFAULT_JOB_OPTIONS,
});

recordatorioQueue.on('error', (error: Error) => {
  console.error(`Error en la cola de recordatorios: ${error.message}`);
});

function validateRecordatorioId(recordatorioId: number): void {
  if (!Number.isSafeInteger(recordatorioId) || recordatorioId <= 0) {
    throw new RangeError('recordatorioId debe ser un entero positivo.');
  }
}

export async function enqueueRecordatorio(recordatorioId: number): Promise<void> {
  validateRecordatorioId(recordatorioId);

  await recordatorioQueue.add(
    'procesar-recordatorio',
    {
      recordatorioId,
    },
    {
      jobId: `recordatorio:${recordatorioId}`,
    },
  );
}

export async function closeRecordatorioQueue(): Promise<void> {
  await recordatorioQueue.close();
}
