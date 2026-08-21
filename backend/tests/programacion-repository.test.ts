import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    lugar: {
      findFirst: vi.fn(),
    },
    programacionEvento: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { programacionRepository } from '../src/modules/programaciones/programacion.repository.js';

describe('T039-A - repository de programación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida lugar activo dentro de jerarquía activa', async () => {
    prismaMock.lugar.findFirst.mockResolvedValue(null);

    await programacionRepository.findActiveLugar(7);

    expect(prismaMock.lugar.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 7,
          estado: true,
          sector: {
            estado: true,
            parroquia: {
              estado: true,
              canton: {
                estado: true,
                provincia: {
                  estado: true,
                },
              },
            },
          },
        },
      }),
    );
  });

  it('lista solo programaciones activas del evento', async () => {
    prismaMock.programacionEvento.findMany.mockResolvedValue([]);

    await programacionRepository.listByEvent(15);

    expect(prismaMock.programacionEvento.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          idEvento: 15,
          estado: true,
          evento: {
            estadoEvento: {
              not: 'ELIMINADO',
            },
          },
        },
      }),
    );
  });

  it('findById exige pertenencia al evento', async () => {
    prismaMock.programacionEvento.findFirst.mockResolvedValue(null);

    await programacionRepository.findByIdForEvent(15, 4);

    expect(prismaMock.programacionEvento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 4,
          idEvento: 15,
          estado: true,
          evento: {
            estadoEvento: {
              not: 'ELIMINADO',
            },
          },
        },
      }),
    );
  });

  it('create conecta programación con evento', async () => {
    const fecha = new Date('2026-09-05T09:30:00.000Z');

    prismaMock.programacionEvento.create.mockResolvedValue({});

    await programacionRepository.create({
      idEvento: 15,
      tituloActividad: 'Pregón',
      fechaHoraInicio: fecha,
    });

    expect(prismaMock.programacionEvento.create).toHaveBeenCalledTimes(1);

    const createCall = prismaMock.programacionEvento.create.mock.calls[0]?.[0] as
      | {
          data?: {
            evento?: {
              connect?: {
                id?: number;
              };
            };
            tituloActividad?: string;
            fechaHoraInicio?: Date;
            estado?: boolean;
          };
        }
      | undefined;

    expect(createCall?.data?.evento?.connect?.id).toBe(15);
    expect(createCall?.data?.tituloActividad).toBe('Pregón');
    expect(createCall?.data?.fechaHoraInicio).toBe(fecha);
    expect(createCall?.data?.estado).toBe(true);
  });

  it('create permite lugar nulo usando lugar principal funcionalmente', async () => {
    prismaMock.programacionEvento.create.mockResolvedValue({});

    await programacionRepository.create({
      idEvento: 15,
      idLugar: null,
      tituloActividad: 'Actividad',
      fechaHoraInicio: new Date('2026-09-05T10:00:00.000Z'),
    });

    const createCall = prismaMock.programacionEvento.create.mock.calls[0]?.[0] as
      | {
          data?: {
            lugar?: unknown;
          };
        }
      | undefined;

    expect(createCall?.data).not.toHaveProperty('lugar.connect');
  });

  it('update permite desconectar lugar opcional', async () => {
    prismaMock.programacionEvento.update.mockResolvedValue({});

    await programacionRepository.update(4, {
      idLugar: null,
    });

    expect(prismaMock.programacionEvento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 4,
        },
        data: {
          lugar: {
            disconnect: true,
          },
        },
      }),
    );
  });

  it('DELETE lógico desactiva por evento y programación', async () => {
    prismaMock.programacionEvento.updateMany.mockResolvedValue({
      count: 1,
    });

    await programacionRepository.deactivate(15, 4);

    expect(prismaMock.programacionEvento.updateMany).toHaveBeenCalledWith({
      where: {
        id: 4,
        idEvento: 15,
        estado: true,
      },
      data: {
        estado: false,
      },
    });
  });
});
