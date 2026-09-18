import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EventCard from './EventCard';

describe('EventCard', () => {
  it('muestra la información principal del evento', () => {
    render(
      <EventCard
        title="Festival de la Chonta"
        description="Encuentro cultural y gastronómico."
        dateLabel="20 de septiembre de 2026"
        locationLabel="Parque Central de Zamora"
        categoryLabels={['Cultura', 'Gastronomía']}
        costLabel="Gratuito"
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Festival de la Chonta',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Encuentro cultural y gastronómico.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('20 de septiembre de 2026'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Parque Central de Zamora'),
    ).toBeInTheDocument();

    expect(screen.getByText('Cultura')).toBeInTheDocument();
    expect(screen.getByText('Gastronomía')).toBeInTheDocument();
    expect(screen.getByText('Gratuito')).toBeInTheDocument();
  });

  it('ejecuta la acción cuando se pulsa Ver detalles', () => {
    const onAction = vi.fn();

    const { container } = render(
      <EventCard
        title="Feria Provincial"
        dateLabel="25 de septiembre de 2026"
        locationLabel="Zamora"
        onAction={onAction}
      />,
    );

    const actionButton = container.querySelector('ion-button');

    expect(actionButton).not.toBeNull();
    expect(actionButton).toHaveAttribute(
      'aria-label',
      'Ver detalles: Feria Provincial',
    );

    fireEvent.click(actionButton!);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omite elementos opcionales cuando no se proporcionan', () => {
    const { container } = render(
      <EventCard
        title="Encuentro Cultural"
        dateLabel="30 de septiembre de 2026"
        locationLabel="Yantzaza"
      />,
    );

    expect(container.querySelector('ion-button')).toBeNull();
    expect(
      screen.queryByLabelText('Categorías del evento'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Costo')).not.toBeInTheDocument();
  });
});