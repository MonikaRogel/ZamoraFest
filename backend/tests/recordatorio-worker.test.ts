import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, workerOnMock, workerCloseMock } = vi.hoisted(() => ({
  prismaMock: {
    recordatorio: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
  workerOnMock: vi.fn(),
  workerCloseMock: vi.fn(),
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

vi.mock('../src/infrastructure/queue/redis-connection.js', () => ({
  bullMqConnection: {
    host: 'mock',
  },
}));

vi.mock('../src/infrastructure/queue/recordatorio.queue.js', () => ({
  RECORDATORIO_QUEUE_NAME: 'recordatorios',
}));
vi.mock('bullmq', () => ({
  Worker: class {
    on = workerOnMock;
    close = workerCloseMock;
  },
}));

import { processRecordatorioJob } from '../src/workers/recordatorio.worker.js';

function buildRecordatorio(
  options: {
    activo?: boolean;
    usuarioEstado?: boolean;
    estadoEvento?: string;
    estadoRevision?: string;
    programacion?: boolean;
    programacionEstado?: boolean;
    programacionEventoId?: number;
  } = {},
) {
  const withProgramacion = options.programacion ?? true;

  return {
    id: 9,
    activo: options.activo ?? true,
    fechaNotificacion: new Date('2026-09-05T08:30:00.000Z'),
    usuario: {
      id: 20,
      nombreCompleto: 'Usuario de prueba',
      correo: 'usuario@zamorafest.test',
      estado: options.usuarioEstado ?? true,
    },
    evento: {
      id: 15,
      titulo: 'Festival cultural',
      estadoEvento: options.estadoEvento ?? 'PROGRAMADO',
      estadoRevision: options.estadoRevision ?? 'APROBADO',
    },
    programacion: withProgramacion
      ? {
          id: 4,
          idEvento: options.programacionEventoId ?? 15,
          tituloActividad: 'Pregón cultural',
          estado: options.programacionEstado ?? true,
        }
      : null,
  };
}

describe('T043-A - worker de recordatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    workerCloseMock.mockResolvedValue(undefined);

    prismaMock.$disconnect.mockResolvedValue(undefined);

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('recupera recordatorio por identificador INT y carga relaciones', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(buildRecordatorio());

    const result = await processRecordatorioJob({
      recordatorioId: 9,
    });

    expect(prismaMock.recordatorio.findUnique).toHaveBeenCalledTimes(1);

    const call = prismaMock.recordatorio.findUnique.mock.calls[0]?.[0] as
      | {
          where?: {
            id?: number;
          };
          select?: {
            activo?: boolean;
            usuario?: unknown;
            evento?: unknown;
            programacion?: unknown;
          };
        }
      | undefined;

    expect(call?.where?.id).toBe(9);

    expect(call?.select?.activo).toBe(true);

    expect(call?.select?.usuario).toBeDefined();

    expect(call?.select?.evento).toBeDefined();

    expect(call?.select?.programacion).toBeDefined();

    expect(result).toEqual({
      recordatorioId: 9,
      processed: true,
      destinatario: 'usuario@zamorafest.test',
      evento: 'Festival cultural',
      programacion: 'Pregón cultural',
    });
  });

  it('omite recordatorio inexistente sin alterar PostgreSQL', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(null);

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'NOT_FOUND',
    });
  });

  it('comprueba activo antes de procesar', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        activo: false,
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'INACTIVE',
    });
  });

  it('omite recordatorio de usuario inactivo', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        usuarioEstado: false,
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'USER_INACTIVE',
    });
  });

  it('omite recordatorio si evento dejó de ser público', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        estadoRevision: 'PENDIENTE',
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'EVENT_NOT_PUBLIC',
    });
  });

  it('omite programación inactiva', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        programacionEstado: false,
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'PROGRAMACION_INACTIVE',
    });
  });

  it('defiende coherencia evento-programación', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        programacionEventoId: 99,
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: false,
      reason: 'PROGRAMACION_EVENT_MISMATCH',
    });
  });

  it('procesa recordatorio sin programación', async () => {
    prismaMock.recordatorio.findUnique.mockResolvedValue(
      buildRecordatorio({
        programacion: false,
      }),
    );

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).resolves.toEqual({
      recordatorioId: 9,
      processed: true,
      destinatario: 'usuario@zamorafest.test',
      evento: 'Festival cultural',
      programacion: null,
    });
  });

  it('propaga errores técnicos para que BullMQ gestione reintentos', async () => {
    prismaMock.recordatorio.findUnique.mockRejectedValue(new Error('database unavailable'));

    await expect(
      processRecordatorioJob({
        recordatorioId: 9,
      }),
    ).rejects.toThrow('database unavailable');
  });

  it('rechaza identificador inválido antes de consultar la base', async () => {
    await expect(
      processRecordatorioJob({
        recordatorioId: 0,
      }),
    ).rejects.toBeInstanceOf(RangeError);

    expect(prismaMock.recordatorio.findUnique).not.toHaveBeenCalled();
  });
});
