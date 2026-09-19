import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    lugar: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { lugarRepository } from '../src/modules/lugares/lugar.repository.js';

describe('Semana 11 - repository lugares', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.lugar.findMany.mockResolvedValue([]);
  });

  it('consulta únicamente lugares con jerarquía territorial activa', async () => {
    await lugarRepository.listActive();

    expect(prismaMock.lugar.findMany).toHaveBeenCalledWith({
      where: {
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
      select: {
        id: true,
        nombre: true,
        tipoLugar: true,
        direccionReferencial: true,
        sector: {
          select: {
            id: true,
            nombre: true,
            tipoSector: true,
            parroquia: {
              select: {
                id: true,
                nombre: true,
                canton: {
                  select: {
                    id: true,
                    nombre: true,
                    provincia: {
                      select: {
                        id: true,
                        nombre: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          nombre: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  });

  it('devuelve datos suficientes para identificar el lugar sin alterar el modelo', async () => {
    const lugares = [
      {
        id: 1,
        nombre: 'Parque Central de Zamora',
        tipoLugar: 'PARQUE',
        direccionReferencial: 'Centro de Zamora',
        sector: {
          id: 1,
          nombre: 'Centro',
          tipoSector: 'BARRIO',
          parroquia: {
            id: 1,
            nombre: 'Zamora',
            canton: {
              id: 1,
              nombre: 'Zamora',
              provincia: {
                id: 1,
                nombre: 'Zamora Chinchipe',
              },
            },
          },
        },
      },
    ];

    prismaMock.lugar.findMany.mockResolvedValue(lugares);

    await expect(lugarRepository.listActive()).resolves.toEqual(lugares);
  });
});
