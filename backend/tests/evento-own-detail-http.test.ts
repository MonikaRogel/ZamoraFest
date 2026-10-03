import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verifyAccessTokenMock,
  getOwnByIdMock,
} = vi.hoisted(() => ({
  verifyAccessTokenMock: vi.fn(),
  getOwnByIdMock: vi.fn(),
}));

vi.mock('../src/modules/auth/auth.service.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
  },
  verifyAccessToken: verifyAccessTokenMock,
}));

vi.mock('../src/modules/eventos/evento.service.js', () => ({
  eventoService: {
    getOwnById: getOwnByIdMock,
  },
}));

import { app } from '../src/app.js';

describe('Ruta HTTP de detalle de eventos propios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    verifyAccessTokenMock.mockImplementation((token: string) => {
      if (token === 'admin-token') {
        return Promise.resolve({
          id: 1,
          rol: 'ADMINISTRADOR',
        });
      }

      if (token === 'asistente-token') {
        return Promise.resolve({
          id: 7,
          rol: 'ASISTENTE',
        });
      }

      return Promise.reject(new Error('Token de prueba no reconocido.'));
    });

    getOwnByIdMock.mockResolvedValue({
      id: 100,
      titulo: 'Festival Cultural',
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    });
  });

  it('requiere autenticación', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/mios/100');

    expect(response.status).toBe(401);
    expect(getOwnByIdMock).not.toHaveBeenCalled();
  });

  it('rechaza ADMINISTRADOR porque el flujo pertenece al ASISTENTE', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/mios/100')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(403);
    expect(getOwnByIdMock).not.toHaveBeenCalled();
  });

  it('enruta /mios/:id al detalle propio autenticado del ASISTENTE', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/mios/100')
      .set('Authorization', 'Bearer asistente-token');

    expect(response.status).toBe(200);
    expect(getOwnByIdMock).toHaveBeenCalledWith(
      {
        id: 7,
        rol: 'ASISTENTE',
      },
      100,
    );
    expect(response.body as unknown).toEqual({
      data: {
        id: 100,
        titulo: 'Festival Cultural',
        estadoEvento: 'BORRADOR',
        estadoRevision: 'PENDIENTE',
      },
    });
  });
});
