import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FilterChip from './FilterChip';

describe('FilterChip', () => {
  it('muestra el estado no seleccionado por defecto', () => {
    render(
      <FilterChip
        label="Cultura"
        onClick={() => undefined}
      />,
    );

    const chip = screen.getByRole('button', {
      name: 'Cultura',
    });

    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(chip).not.toBeDisabled();
  });

  it('muestra el estado seleccionado y ejecuta la acción', () => {
    const onClick = vi.fn();

    render(
      <FilterChip
        label="Gastronomía"
        selected
        onClick={onClick}
      />,
    );

    const chip = screen.getByRole('button', {
      name: 'Gastronomía',
    });

    expect(chip).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(chip);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('impide la interacción cuando está deshabilitado', () => {
    const onClick = vi.fn();

    render(
      <FilterChip
        label="Fecha"
        disabled
        onClick={onClick}
      />,
    );

    const chip = screen.getByRole('button', {
      name: 'Fecha',
    });

    expect(chip).toBeDisabled();

    fireEvent.click(chip);

    expect(onClick).not.toHaveBeenCalled();
  });
});