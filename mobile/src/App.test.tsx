import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./services/api/zamorafest-api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
  zamoraFestApi: {
    getHealth: vi.fn(async () => ({
      status: 'ok',
      service: 'zamorafest-backend',
    })),
    getEventos: vi.fn(async () => ({
      data: [
        {
          id: 1,
          titulo: 'Evento de prueba',
        },
      ],
      meta: {
        page: 1,
        limit: 5,
        total: 1,
        totalPages: 1,
      },
    })),
  },
}));

describe('App', () => {
  it('muestra la respuesta verificada sin solicitudes reales', async () => {
    render(<App />);

    expect(
      await screen.findByText('Verificada'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Evento de prueba'),
    ).toBeInTheDocument();
  });
});
