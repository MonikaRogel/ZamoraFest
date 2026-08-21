import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    programacionEvento: {
      findFirst: vi.fn(),
    },
    imagenEvento: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { imagenRepository } from '../src/modules/imagenes/imagen.repository.js';

describe('T040-A - repository de imágenes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida programación activa perteneciente al evento', async () => {
    prismaMock.programacionEvento.findFirst.mockResolvedValue(null);

    await imagenRepository.findActiveProgramacionForEvent(15, 4);

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

  it('busca principal activa por evento', async () => {
    prismaMock.imagenEvento.findFirst.mockResolvedValue(null);

    await imagenRepository.findActivePrincipalByEvent(15);

    expect(prismaMock.imagenEvento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          idEvento: 15,
          esPrincipal: true,
          estado: true,
        },
      }),
    );
  });

  it('lista solo imágenes activas del evento', async () => {
    prismaMock.imagenEvento.findMany.mockResolvedValue([]);

    await imagenRepository.listByEvent(15);

    expect(prismaMock.imagenEvento.findMany).toHaveBeenCalledWith(
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

  it('findById exige imagen perteneciente al evento', async () => {
    prismaMock.imagenEvento.findFirst.mockResolvedValue(null);

    await imagenRepository.findByIdForEvent(15, 9);

    expect(prismaMock.imagenEvento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 9,
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

  it('create registra evento, usuario, programación y principal', async () => {
    const fecha = new Date('2026-08-21T01:45:00.000Z');

    prismaMock.imagenEvento.create.mockResolvedValue({});

    await imagenRepository.create({
      idEvento: 15,
      idProgramacion: 4,
      idUsuarioSubida: 20,
      urlImagen: 'https://example.com/x.jpg',
      tipoImagen: 'FOTOGRAFIA',
      esPrincipal: true,
      fechaSubida: fecha,
    });

    expect(prismaMock.imagenEvento.create).toHaveBeenCalledTimes(1);

    const createCall = prismaMock.imagenEvento.create.mock.calls[0]?.[0] as
      | {
          data?: {
            idEvento?: number;
            idProgramacion?: number | null;
            idUsuarioSubida?: number;
            urlImagen?: string;
            tipoImagen?: string;
            esPrincipal?: boolean;
            fechaSubida?: Date;
            estado?: boolean;
          };
        }
      | undefined;

    expect(createCall?.data?.idEvento).toBe(15);

    expect(createCall?.data?.idProgramacion).toBe(4);

    expect(createCall?.data?.idUsuarioSubida).toBe(20);

    expect(createCall?.data?.esPrincipal).toBe(true);

    expect(createCall?.data?.estado).toBe(true);
  });

  it('create permite programación nula', async () => {
    prismaMock.imagenEvento.create.mockResolvedValue({});

    await imagenRepository.create({
      idEvento: 15,
      idProgramacion: null,
      idUsuarioSubida: 20,
      urlImagen: 'https://example.com/x.jpg',
      tipoImagen: 'AFICHE',
      esPrincipal: false,
      fechaSubida: new Date('2026-08-21T01:45:00.000Z'),
    });

    const createCall = prismaMock.imagenEvento.create.mock.calls[0]?.[0] as
      | {
          data?: {
            idProgramacion?: number | null;
          };
        }
      | undefined;

    expect(createCall?.data?.idProgramacion).toBeNull();
  });

  it('DELETE lógico desactiva por evento e imagen', async () => {
    prismaMock.imagenEvento.updateMany.mockResolvedValue({
      count: 1,
    });

    await imagenRepository.deactivate(15, 9);

    expect(prismaMock.imagenEvento.updateMany).toHaveBeenCalledWith({
      where: {
        id: 9,
        idEvento: 15,
        estado: true,
      },
      data: {
        estado: false,
      },
    });
  });
});
