import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    programacionEvento: {
      findFirst: vi.fn(),
    },
    recordatorio: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { recordatorioRepository } from '../src/modules/recordatorios/recordatorio.repository.js';

describe('T041-A - repository de recordatorio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida programación activa perteneciente al mismo evento', async () => {
    prismaMock.programacionEvento.findFirst.mockResolvedValue(null);

    await recordatorioRepository.findActiveProgramacionForEvent(15, 4);

    const call = prismaMock.programacionEvento.findFirst.mock.calls[0]?.[0] as
      | {
          where?: {
            id?: number;
            idEvento?: number;
            estado?: boolean;
          };
        }
      | undefined;

    expect(call?.where?.id).toBe(4);

    expect(call?.where?.idEvento).toBe(15);

    expect(call?.where?.estado).toBe(true);
  });

  it('crea recordatorio con usuario, evento, fecha y activo true', async () => {
    const fecha = new Date('2026-09-05T08:30:00.000Z');

    prismaMock.recordatorio.create.mockResolvedValue({});

    await recordatorioRepository.create({
      idUsuario: 20,
      idEvento: 15,
      fechaNotificacion: fecha,
    });

    const call = prismaMock.recordatorio.create.mock.calls[0]?.[0] as
      | {
          data?: {
            idUsuario?: number;
            idEvento?: number;
            idProgramacion?: number | null;
            fechaNotificacion?: Date;
            activo?: boolean;
          };
        }
      | undefined;

    expect(call?.data?.idUsuario).toBe(20);

    expect(call?.data?.idEvento).toBe(15);

    expect(call?.data?.fechaNotificacion).toBe(fecha);

    expect(call?.data?.activo).toBe(true);
  });

  it('crea recordatorio asociado a programación opcional', async () => {
    prismaMock.recordatorio.create.mockResolvedValue({});

    await recordatorioRepository.create({
      idUsuario: 20,
      idEvento: 15,
      idProgramacion: 4,
      fechaNotificacion: new Date('2026-09-05T08:30:00.000Z'),
    });

    const call = prismaMock.recordatorio.create.mock.calls[0]?.[0] as
      | {
          data?: {
            idProgramacion?: number | null;
          };
        }
      | undefined;

    expect(call?.data?.idProgramacion).toBe(4);
  });

  it('preserva programación nula', async () => {
    prismaMock.recordatorio.create.mockResolvedValue({});

    await recordatorioRepository.create({
      idUsuario: 20,
      idEvento: 15,
      idProgramacion: null,
      fechaNotificacion: new Date('2026-09-05T08:30:00.000Z'),
    });

    const call = prismaMock.recordatorio.create.mock.calls[0]?.[0] as
      | {
          data?: {
            idProgramacion?: number | null;
          };
        }
      | undefined;

    expect(call?.data?.idProgramacion).toBeNull();
  });

  it('lista únicamente recordatorios del usuario indicado', async () => {
    prismaMock.recordatorio.findMany.mockResolvedValue([]);

    await recordatorioRepository.listByUser(20);

    const call = prismaMock.recordatorio.findMany.mock.calls[0]?.[0] as
      | {
          where?: {
            idUsuario?: number;
          };
        }
      | undefined;

    expect(call?.where?.idUsuario).toBe(20);
  });

  it('busca recordatorio únicamente para su propietario', async () => {
    prismaMock.recordatorio.findFirst.mockResolvedValue(null);

    await recordatorioRepository.findByIdForUser(9, 20);

    const call = prismaMock.recordatorio.findFirst.mock.calls[0]?.[0] as
      | {
          where?: {
            id?: number;
            idUsuario?: number;
          };
        }
      | undefined;

    expect(call?.where?.id).toBe(9);

    expect(call?.where?.idUsuario).toBe(20);
  });

  it('desactiva solo recordatorio activo del propietario', async () => {
    prismaMock.recordatorio.updateMany.mockResolvedValue({
      count: 1,
    });

    await recordatorioRepository.deactivateOwn(9, 20);

    expect(prismaMock.recordatorio.updateMany).toHaveBeenCalledWith({
      where: {
        id: 9,
        idUsuario: 20,
        activo: true,
      },
      data: {
        activo: false,
      },
    });
  });
});
