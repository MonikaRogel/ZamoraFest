import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AsyncStateView from './AsyncStateView';

describe('AsyncStateView', () => {
  it('muestra el estado de carga con información accesible', () => {
    render(<AsyncStateView state="loading" />);

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('heading', {
        name: 'Cargando información',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Espere un momento mientras obtenemos los datos.',
      ),
    ).toBeInTheDocument();
  });

  it('muestra el estado vacío con sus mensajes predeterminados', () => {
    render(<AsyncStateView state="empty" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'No hay información disponible',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'No encontramos contenido para mostrar en este momento.',
      ),
    ).toBeInTheDocument();
  });

  it('muestra el error y ejecuta la acción de reintento', () => {
    const onAction = vi.fn();

    const { container } = render(
      <AsyncStateView
        state="error"
        onAction={onAction}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'No fue posible cargar la información',
      }),
    ).toBeInTheDocument();

    const retryButton = container.querySelector('ion-button');

    expect(retryButton).not.toBeNull();

    fireEvent.click(retryButton!);

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});