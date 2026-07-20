import { performance } from 'node:perf_hooks';

import request from 'supertest';

import { app } from '../src/app.js';
import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import { prisma } from '../src/infrastructure/database/prisma.js';
import { closeRecordatorioQueue } from '../src/infrastructure/queue/recordatorio.queue.js';

const endpoint = '/api/v1/eventos?page=1&limit=50';
const repetitions = 10;

async function measureRequest(): Promise<{
  durationMs: number;
  cacheStatus: string;
}> {
  const start = performance.now();
  const response = await request(app).get(endpoint);
  const durationMs = performance.now() - start;

  if (response.status !== 200) {
    throw new Error(`La API respondió con estado ${response.status}.`);
  }

  return {
    durationMs,
    cacheStatus: String(response.headers['x-cache'] ?? 'UNKNOWN'),
  };
}

async function measureCache(): Promise<void> {
  await eventoCache.invalidate();

  const missMeasurement = await measureRequest();
  const hitMeasurements: number[] = [];

  for (let index = 0; index < repetitions; index += 1) {
    const measurement = await measureRequest();

    if (measurement.cacheStatus !== 'HIT') {
      throw new Error(`Se esperaba HIT y se recibió ${measurement.cacheStatus}.`);
    }

    hitMeasurements.push(measurement.durationMs);
  }

  const averageHit =
    hitMeasurements.reduce((total, value) => total + value, 0) / hitMeasurements.length;

  const improvement =
    ((missMeasurement.durationMs - averageHit) / missMeasurement.durationMs) * 100;

  console.table([
    {
      escenario: 'Antes: consulta sin caché',
      estado: missMeasurement.cacheStatus,
      milisegundos: missMeasurement.durationMs.toFixed(2),
    },
    {
      escenario: 'Después: caché promedio',
      estado: 'HIT',
      milisegundos: averageHit.toFixed(2),
    },
  ]);

  console.log(`Reducción aproximada: ${improvement.toFixed(2)} %.`);
}

measureCache()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Error desconocido.';

    console.error(`No se completó la medición: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await eventoCache.close();
    await closeRecordatorioQueue();
    await prisma.$disconnect();
  });
