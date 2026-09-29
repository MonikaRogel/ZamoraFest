import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verifyAccessTokenMock,
  listAdminMock,
  getAdminByIdMock,
} = vi.hoisted(() => ({
  verifyAccessTokenMock: vi.fn(),
  listAdminMock: vi.fn(),
  getAdminByIdMock: vi.fn(),
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
    listAdmin: listAdminMock,
    getAdminById: getAdminByIdMock,
  },
}));

import { app } from '../src/app.js';

describe('Rutas HTTP administrativas de eventos', () => {
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

    listAdminMock.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    getAdminByIdMock.mockResolvedValue({
      id: 100,
      titulo: 'Festival Cultural',
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    });
  });

  it('rechaza el listado administrativo sin autenticación', async () => {
    const response = await request(app).get('/api/v1/eventos/admin');

    expect(response.status).toBe(401);
    expect(listAdminMock).not.toHaveBeenCalled();
  });

  it('rechaza el listado administrativo para ASISTENTE', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/admin')
      .set('Authorization', 'Bearer asistente-token');

    expect(response.status).toBe(403);
    expect(listAdminMock).not.toHaveBeenCalled();
  });

  it('permite al ADMINISTRADOR consultar el listado administrativo', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/admin')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(listAdminMock).toHaveBeenCalledWith(
      {
        id: 1,
        rol: 'ADMINISTRADOR',
      },
      {
        page: 1,
        limit: 20,
      },
    );
  });

  it('enruta /admin/:id al detalle administrativo y no al detalle público', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/admin/100')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(getAdminByIdMock).toHaveBeenCalledWith(
      {
        id: 1,
        rol: 'ADMINISTRADOR',
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

  it('rechaza el detalle administrativo para ASISTENTE', async () => {
    const response = await request(app)
      .get('/api/v1/eventos/admin/100')
      .set('Authorization', 'Bearer asistente-token');

    expect(response.status).toBe(403);
    expect(getAdminByIdMock).not.toHaveBeenCalled();
  });
});
