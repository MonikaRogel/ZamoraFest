import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ScreenHeader from './ScreenHeader';

describe('ScreenHeader', () => {
  it('muestra el contenido principal del encabezado', () => {
    render(
      <ScreenHeader
        title="Explorar eventos"
        eyebrow="Agenda cultural y festiva"
        description="Descubre actividades de Zamora Chinchipe."
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Explorar eventos',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Agenda cultural y festiva'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Descubre actividades de Zamora Chinchipe.',
      ),
    ).toBeInTheDocument();
  });

  it('renderiza y permite utilizar contenido delegado en actions', () => {
    const onAction = vi.fn();

    render(
      <ScreenHeader
        title="Eventos"
        actions={
          <button type="button" onClick={onAction}>
            Actualizar
          </button>
        }
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Actualizar' }),
    );

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});