import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createServiceMock, enqueueMock } = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  enqueueMock: vi.fn(),
}));

vi.mock('../src/modules/recordatorios/recordatorio.service.js', () => ({
  recordatorioService: {
    create: createServiceMock,
  },
}));

vi.mock('../src/infrastructure/queue/recordatorio.queue.js', () => ({
  enqueueRecordatorio: enqueueMock,
}));

import { recordatorioApplication } from '../src/modules/recordatorios/recordatorio.application.js';

const identidad = {
  id: 20,
  rol: 'VISITANTE',
} as const;

const input = {
  eventoId: 15,
  fechaNotificacion: '2026-09-05T08:30',
};

const recordatorio = {
  id: 9,
  eventoId: 15,
  programacionId: null,
  fechaNotificacion: '2026-09-05T08:30:00.000',
  activo: true,
};

describe('T043-C - integración aplicación y BullMQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createServiceMock.mockResolvedValue(recordatorio);

    enqueueMock.mockResolvedValue(undefined);
  });

  it('encola el ID entero después de crear el recordatorio', async () => {
    const result = await recordatorioApplication.create(identidad, input);

    expect(createServiceMock).toHaveBeenCalledWith(identidad, input);

    expect(enqueueMock).toHaveBeenCalledWith(9);

    expect(result).toBe(recordatorio);
  });

  it('no intenta encolar si falla la creación funcional', async () => {
    createServiceMock.mockRejectedValue(new Error('functional failure'));

    await expect(recordatorioApplication.create(identidad, input)).rejects.toThrow(
      'functional failure',
    );

    expect(enqueueMock).not.toHaveBeenCalled();
  });

  it('reporta indisponibilidad de cola como 503', async () => {
    enqueueMock.mockRejectedValue(new Error('redis unavailable'));

    await expect(recordatorioApplication.create(identidad, input)).rejects.toMatchObject({
      statusCode: 503,
      code: 'QUEUE_UNAVAILABLE',
    });
  });
});
