import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('responde con el estado del servicio', async () => {
    const response = await request(app).get('/api/v1/health');
    const responseBody: unknown = response.body;

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(responseBody).toEqual({
      status: 'ok',
      service: 'zamorafest-backend',
    });
  });
});
