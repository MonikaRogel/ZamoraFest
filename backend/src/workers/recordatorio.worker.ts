import { Worker } from 'bullmq';

import { prisma } from '../infrastructure/database/prisma.js';
import {
  RECORDATORIO_QUEUE_NAME,
  type RecordatorioJobData,
} from '../infrastructure/queue/recordatorio.queue.js';
import { bullMqConnection } from '../infrastructure/queue/redis-connection.js';

export const recordatorioWorker = new Worker<RecordatorioJobData>(
  RECORDATORIO_QUEUE_NAME,
  async (job) => {
    const { recordatorioId } = job.data;

    try {
      const recordatorio = await prisma.recordatorio.update({
        where: {
          id: recordatorioId,
        },
        data: {
          estado: 'PROCESANDO',
          error: null,
        },
        select: {
          id: true,
          usuario: {
            select: {
              nombre: true,
              email: true,
            },
          },
          evento: {
            select: {
              titulo: true,
            },
          },
        },
      });

      console.log(
        `Procesando recordatorio ${recordatorio.id}: ${recordatorio.usuario.email} → ${recordatorio.evento.titulo}`,
      );

      await prisma.recordatorio.update({
        where: {
          id: recordatorioId,
        },
        data: {
          estado: 'COMPLETADO',
          procesadoEn: new Date(),
          error: null,
        },
      });

      return {
        recordatorioId,
        destinatario: recordatorio.usuario.email,
        evento: recordatorio.evento.titulo,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido al procesar el recordatorio.';

      await prisma.recordatorio.updateMany({
        where: {
          id: recordatorioId,
        },
        data: {
          estado: 'FALLIDO',
          error: message,
        },
      });

      throw error;
    }
  },
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
