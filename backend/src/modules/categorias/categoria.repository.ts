import { prisma } from '../../infrastructure/database/prisma.js';

export const categoriaRepository = {
  listActive() {
    return prisma.categoria.findMany({
      where: {
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
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
  },
};
