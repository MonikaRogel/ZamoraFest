import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { zamoraFestApi } from '../services/api/zamorafest-api';
import LoginPage from './LoginPage';

vi.mock('../services/api/zamorafest-api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    readonly status = null;
  },
  zamoraFestApi: {
    login: vi.fn(),
  },
}));

describe('LoginPage', () => {
  it('muestra el usuario seguro después de un login exitoso', async () => {
    vi.mocked(zamoraFestApi.login).mockResolvedValueOnce({
      id: 7,
      nombre: 'Usuario Demo',
      email: 'demo@zamorafest.ec',
      rol: 'VISITANTE',
    });

    const { container } = render(<LoginPage />);

    const inputs = container.querySelectorAll('ion-input');
    const emailInput = inputs.item(0);
    const passwordInput = inputs.item(1);
    const form = container.querySelector('form');

    expect(inputs).toHaveLength(2);
    expect(form).not.toBeNull();

    fireEvent(
      emailInput,
      new CustomEvent('ionInput', {
        bubbles: true,
        detail: { value: '  DEMO@ZAMORAFEST.EC  ' },
      }),
    );

    fireEvent(
      passwordInput,
      new CustomEvent('ionInput', {
        bubbles: true,
        detail: { value: 'ClaveDemo123' },
      }),
    );

    fireEvent.submit(form!);

    expect(
      await screen.findByRole('heading', {
        name: 'Acceso confirmado',
      }),
    ).toBeInTheDocument();

    expect(zamoraFestApi.login).toHaveBeenCalledTimes(1);
    expect(zamoraFestApi.login).toHaveBeenCalledWith({
      email: 'demo@zamorafest.ec',
      password: 'ClaveDemo123',
    });

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Usuario Demo')).toBeInTheDocument();
    expect(screen.getByText('demo@zamorafest.ec')).toBeInTheDocument();
    expect(screen.getByText('VISITANTE')).toBeInTheDocument();

    expect(container.textContent).not.toContain('accessToken');
    expect(container.textContent).not.toContain('refreshToken');
  });
});
