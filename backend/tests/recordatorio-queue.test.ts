import { beforeEach, describe, expect, it, vi } from 'vitest';

const { addMock, closeMock, onMock } = vi.hoisted(() => ({
  addMock: vi.fn(),
  closeMock: vi.fn(),
  onMock: vi.fn(),
}));

vi.mock('bullmq', () => ({
  Queue: class {
    add = addMock;
    close = closeMock;
    on = onMock;
  },
}));

vi.mock('../src/infrastructure/queue/redis-connection.js', () => ({
  bullMqConnection: {
    host: 'mock',
  },
}));

import {
  closeRecordatorioQueue,
  enqueueRecordatorio,
  RECORDATORIO_DEFAULT_JOB_OPTIONS,
  RECORDATORIO_QUEUE_NAME,
} from '../src/infrastructure/queue/recordatorio.queue.js';

describe('T042 - cola BullMQ de recordatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    addMock.mockResolvedValue(undefined);

    closeMock.mockResolvedValue(undefined);
  });

  it('mantiene nombre técnico de la cola', () => {
    expect(RECORDATORIO_QUEUE_NAME).toBe('recordatorios');
  });

  it('mantiene reintentos y backoff en BullMQ', () => {
    expect(RECORDATORIO_DEFAULT_JOB_OPTIONS).toEqual({
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  });

  it('encola recordatorioId como number', async () => {
    await enqueueRecordatorio(9);

    expect(addMock).toHaveBeenCalledWith(
      'procesar-recordatorio',
      {
        recordatorioId: 9,
      },
      {
        jobId: 'recordatorio-9',
      },
    );
  });

  it('rechaza identificador cero', async () => {
    await expect(enqueueRecordatorio(0)).rejects.toBeInstanceOf(RangeError);

    expect(addMock).not.toHaveBeenCalled();
  });

  it('rechaza identificador fraccionario', async () => {
    await expect(enqueueRecordatorio(1.5)).rejects.toBeInstanceOf(RangeError);

    expect(addMock).not.toHaveBeenCalled();
  });

  it('cierra la cola sin persistir estado funcional', async () => {
    await closeRecordatorioQueue();

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
