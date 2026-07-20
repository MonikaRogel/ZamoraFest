import { Queue } from 'bullmq';

import { bullMqConnection } from './redis-connection.js';

export const RECORDATORIO_QUEUE_NAME = 'recordatorios';

export interface RecordatorioJobData {
  recordatorioId: string;
}

export const recordatorioQueue = new Queue<RecordatorioJobData>(RECORDATORIO_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

recordatorioQueue.on('error', (error: Error) => {
  console.error(`Error en la cola de recordatorios: ${error.message}`);
});

export async function enqueueRecordatorio(recordatorioId: string): Promise<void> {
  await recordatorioQueue.add(
    'procesar-recordatorio',
    {
      recordatorioId,
    },
    {
      jobId: recordatorioId,
    },
  );
}

export async function closeRecordatorioQueue(): Promise<void> {
  await recordatorioQueue.close();
}
