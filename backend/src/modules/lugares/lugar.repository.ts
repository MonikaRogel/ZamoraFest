import { prisma } from '../../infrastructure/database/prisma.js';

export const lugarRepository = {
  listActive() {
    return prisma.lugar.findMany({
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
  },
};