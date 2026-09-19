import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import { ApplicationStateProvider } from '../state/ApplicationStateContext';
import type { AuthSession } from '../types/api';
import LoginPage from './LoginPage';

vi.mock('../services/api/zamorafest-api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    readonly status: number | null;

    constructor(message: string, status: number | null = null) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
  zamoraFestApi: {
    login: vi.fn(),
  },
}));

function renderLoginPage() {
  return render(
    <ApplicationStateProvider>
      <LoginPage />
    </ApplicationStateProvider>,
  );
}

function completeForm(container: HTMLElement) {
  const inputs = container.querySelectorAll('ion-input');
  const form = container.querySelector('form');

  expect(inputs).toHaveLength(2);
  expect(form).not.toBeNull();

  fireEvent(
    inputs.item(0),
    new CustomEvent('ionInput', {
      bubbles: true,
      detail: {
        value: 'usuario@zamorafest.ec',
      },
    }),
  );

  fireEvent(
    inputs.item(1),
    new CustomEvent('ionInput', {
      bubbles: true,
      detail: {
        value: 'ClaveDemo123',
      },
    }),
  );

  return form!;
}

describe('seguridad y errores de LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un mensaje genérico para credenciales inválidas 401', async () => {
    vi.mocked(zamoraFestApi.login).mockRejectedValueOnce(
      new ApiRequestError(
        'Detalle técnico del backend',
        401,
      ),
    );

    const { container } = renderLoginPage();
    const form = completeForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByText(
        'El correo o la contraseña son incorrectos.',
      ),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain(
      'Detalle técnico del backend',
    );
  });

  it('traduce HTTP 400 a un mensaje de corrección', async () => {
    vi.mocked(zamoraFestApi.login).mockRejectedValueOnce(
      new ApiRequestError(
        'VALIDATION_ERROR',
        400,
      ),
    );

    const { container } = renderLoginPage();
    const form = completeForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByText(
        'Revise los datos ingresados e intente nuevamente.',
      ),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain(
      'VALIDATION_ERROR',
    );
  });

  it('traduce HTTP 422 a un mensaje de corrección', async () => {
    vi.mocked(zamoraFestApi.login).mockRejectedValueOnce(
      new ApiRequestError(
        'VALIDATION_ERROR',
        422,
      ),
    );

    const { container } = renderLoginPage();
    const form = completeForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByText(
        'Revise los datos ingresados e intente nuevamente.',
      ),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain(
      'VALIDATION_ERROR',
    );
  });

  it('traduce un fallo de conexión sin exponer detalles técnicos', async () => {
    vi.mocked(zamoraFestApi.login).mockRejectedValueOnce(
      new ApiRequestError(
        'ECONNREFUSED 127.0.0.1',
        null,
      ),
    );

    const { container } = renderLoginPage();
    const form = completeForm(container);

    fireEvent.submit(form);

    expect(
      await screen.findByText(
        'No se pudo conectar con ZamoraFest. Verifique la conexión e intente nuevamente.',
      ),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain(
      'ECONNREFUSED',
    );
  });

  it('bloquea dos envíos consecutivos mientras existe una solicitud activa', async () => {
    let resolveLogin!: (session: AuthSession) => void;

    const pendingLogin = new Promise<AuthSession>((resolve) => {
      resolveLogin = resolve;
    });

    vi.mocked(zamoraFestApi.login).mockReturnValueOnce(
      pendingLogin,
    );

    const { container } = renderLoginPage();
    const form = completeForm(container);

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(zamoraFestApi.login).toHaveBeenCalledTimes(1);

    resolveLogin({
      accessToken: 'token-acceso-secreto',
      refreshToken: 'token-refresh-secreto',
      tokenType: 'Bearer',
      expiresIn: 900,
      usuario: {
        id: 7,
        nombre: 'Usuario Demo',
        email: 'usuario@zamorafest.ec',
        rol: 'VISITANTE',
      },
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Acceso confirmado',
      }),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain(
      'token-acceso-secreto',
    );

    expect(container.textContent).not.toContain(
      'token-refresh-secreto',
    );
  });
});
