import { performance } from 'node:perf_hooks';

import request from 'supertest';

import { app } from '../src/app.js';
import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import { prisma } from '../src/infrastructure/database/prisma.js';
import { closeRecordatorioQueue } from '../src/infrastructure/queue/recordatorio.queue.js';

const endpoint = '/api/v1/eventos?page=1&limit=50';
const repetitions = 10;

interface Measurement {
  durationMs: number;
  cacheStatus: string;
  totalPublicEvents: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractTotalPublicEvents(body: unknown): number {
  if (!isRecord(body)) {
    throw new Error('La respuesta no contiene un cuerpo JSON válido.');
  }

  const meta = body['meta'];

  if (!isRecord(meta)) {
    throw new Error('La respuesta no contiene meta.');
  }

  const total = meta['total'];

  if (!Number.isSafeInteger(total) || (total as number) < 0) {
    throw new Error('La respuesta no contiene meta.total válido.');
  }

  return total as number;
}

async function measureRequest(): Promise<Measurement> {
  const start = performance.now();

  const response = await request(app).get(endpoint);

  const durationMs = performance.now() - start;

  if (response.status !== 200) {
    throw new Error(`La API respondió con estado ${response.status}.`);
  }

  const body = response.body as unknown;

  return {
    durationMs,
    cacheStatus: String(response.headers['x-cache'] ?? 'UNKNOWN'),
    totalPublicEvents: extractTotalPublicEvents(body),
  };
}

async function measureCache(): Promise<void> {
  console.log('=== MEDICION T047 - MODELO CANONICO SEMANA 4 ===');
  console.log(`Fecha UTC: ${new Date().toISOString()}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Plataforma: ${process.platform}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log('Carga del listado: basic');
  console.log('Concurrencia: secuencial');
  console.log(`Repeticiones HIT: ${repetitions}`);

  await eventoCache.invalidate();

  const missMeasurement = await measureRequest();

  if (missMeasurement.cacheStatus !== 'MISS') {
    throw new Error(`La primera solicitud debía ser MISS y fue ${missMeasurement.cacheStatus}.`);
  }

  const hitMeasurements: number[] = [];

  for (let index = 0; index < repetitions; index += 1) {
    const measurement = await measureRequest();

    if (measurement.cacheStatus !== 'HIT') {
      throw new Error(
        `Se esperaba HIT en repetición ${index + 1} y se recibió ${measurement.cacheStatus}.`,
      );
    }

    if (measurement.totalPublicEvents !== missMeasurement.totalPublicEvents) {
      throw new Error(
        'El total público cambió durante la medición; las condiciones no fueron estables.',
      );
    }

    hitMeasurements.push(measurement.durationMs);
  }

  const averageHit =
    hitMeasurements.reduce((total, value) => total + value, 0) / hitMeasurements.length;

  const minimumHit = Math.min(...hitMeasurements);
  const maximumHit = Math.max(...hitMeasurements);

  const reduction = ((missMeasurement.durationMs - averageHit) / missMeasurement.durationMs) * 100;

  console.log(`Eventos públicos devueltos: ${missMeasurement.totalPublicEvents}`);

  console.log(
    `HIT individuales (ms): ${hitMeasurements.map((value) => value.toFixed(2)).join(', ')}`,
  );

  console.table([
    {
      escenario: 'MISS actual',
      fuente: 'PostgreSQL + escritura Redis',
      estado: missMeasurement.cacheStatus,
      milisegundos: missMeasurement.durationMs.toFixed(2),
    },
    {
      escenario: 'HIT actual promedio',
      fuente: 'Redis',
      estado: 'HIT',
      milisegundos: averageHit.toFixed(2),
    },
    {
      escenario: 'HIT mínimo',
      fuente: 'Redis',
      estado: 'HIT',
      milisegundos: minimumHit.toFixed(2),
    },
    {
      escenario: 'HIT máximo',
      fuente: 'Redis',
      estado: 'HIT',
      milisegundos: maximumHit.toFixed(2),
    },
  ]);

  console.log(`Reducción observada MISS vs HIT promedio: ${reduction.toFixed(2)} %.`);

  console.log(
    'Nota: esta medición compara MISS y HIT del modelo actual; no representa por sí sola una comparación equivalente con la línea base histórica.',
  );
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
