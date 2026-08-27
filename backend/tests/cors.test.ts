import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app.js';

describe('CORS', () => {
  it.each(['https://localhost', 'http://localhost:8100'])(
    'autoriza el origen de desarrollo %s',
    async (origin) => {
      const response = await request(app)
        .options('/api/v1/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(origin);
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-credentials']).toBeUndefined();
      expect(response.headers.vary).toContain('Origin');
    },
  );

  it('no autoriza un origen que no está configurado', async () => {
    const response = await request(app)
      .options('/api/v1/health')
      .set('Origin', 'https://origen-no-autorizado.example')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('permite clientes sin cabecera Origin', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
