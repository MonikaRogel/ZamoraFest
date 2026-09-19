import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listPublicMock } = vi.hoisted(() => ({
  listPublicMock: vi.fn(),
}));

vi.mock('../src/modules/lugares/lugar.service.js', () => ({
  lugarService: {
    listPublic: listPublicMock,
  },
}));

import { app } from '../src/app.js';

describe('GET /api/v1/lugares', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listPublicMock.mockResolvedValue([
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
    ]);
  });

  it('permite consultar lugares públicamente sin autenticación', async () => {
    const response = await request(app).get('/api/v1/lugares');

    expect(response.status).toBe(200);

    expect(response.body as unknown).toEqual({
      data: [
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
      ],
    });

    expect(listPublicMock).toHaveBeenCalledTimes(1);
  });
});
