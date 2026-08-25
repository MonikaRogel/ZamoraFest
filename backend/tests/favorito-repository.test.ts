import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    usuarioEventoFavorito: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

import { favoritoRepository } from '../src/modules/favoritos/favorito.repository.js';

describe('T038 - repository favoritos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('busca duplicado por PK usuario/evento', async () => {
    prismaMock.usuarioEventoFavorito.findUnique.mockResolvedValue(null);

    await favoritoRepository.findByUserAndEvent(20, 100);

    expect(prismaMock.usuarioEventoFavorito.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          idUsuario_idEvento: {
            idUsuario: 20,
            idEvento: 100,
          },
        },
      }),
    );
  });

  it('crea favorito siempre con usuario autenticado proporcionado por servicio', async () => {
    const fecha = new Date('2026-08-20T20:30:00.000Z');

    prismaMock.usuarioEventoFavorito.create.mockResolvedValue({});

    await favoritoRepository.create({
      idUsuario: 20,
      idEvento: 100,
      fechaAgregado: fecha,
    });

    expect(prismaMock.usuarioEventoFavorito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          idUsuario: 20,
          idEvento: 100,
          fechaAgregado: fecha,
        },
      }),
    );
  });

  it('lista únicamente favoritos del usuario solicitado y excluye eventos eliminados', async () => {
    prismaMock.usuarioEventoFavorito.findMany.mockResolvedValue([]);

    await favoritoRepository.listByUser(20);

    expect(prismaMock.usuarioEventoFavorito.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          idUsuario: 20,
          evento: {
            estadoEvento: {
              not: 'ELIMINADO',
            },
          },
        },
      }),
    );
  });

  it('elimina asociación únicamente por usuario y evento', async () => {
    prismaMock.usuarioEventoFavorito.deleteMany.mockResolvedValue({
      count: 1,
    });

    await favoritoRepository.deleteOwn(20, 100);

    expect(prismaMock.usuarioEventoFavorito.deleteMany).toHaveBeenCalledWith({
      where: {
        idUsuario: 20,
        idEvento: 100,
      },
    });
  });
});
