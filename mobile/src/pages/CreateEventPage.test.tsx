import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  MemoryRouter,
} from 'react-router-dom';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  EventFormDataRepositoryError,
  type EventFormData,
  type EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import CreateEventPage from './CreateEventPage';

const formData:
  EventFormData = {
    categorias: [
      {
        id: 41,
        nombre:
          'Cultura comunitaria',
        descripcion:
          'Actividades culturales.',
      },
      {
        id: 87,
        nombre:
          'Gastronomía local',
        descripcion:
          null,
      },
    ],
    lugares: [
      {
        id: 73,
        nombre:
          'Casa Cultural Zamora',
        tipoLugar:
          'CENTRO_CULTURAL',
        direccionReferencial:
          'Centro de Zamora',
        sector: {
          id: 31,
          nombre:
            'Centro',
          tipoSector:
            'BARRIO',
          parroquia: {
            id: 22,
            nombre:
              'Zamora',
            canton: {
              id: 12,
              nombre:
                'Zamora',
              provincia: {
                id: 1,
                nombre:
                  'Zamora Chinchipe',
              },
            },
          },
        },
      },
    ],
  };

function DraftProbe() {
  const {
    eventDraft,
  } =
    useApplicationState();

  return (
    <div>
      <output data-testid="draft-title">
        {eventDraft.titulo}
      </output>

      <output data-testid="draft-place">
        {eventDraft.lugarId ??
          ''}
      </output>

      <output data-testid="draft-categories">
        {eventDraft
          .categoriaIds
          .join(',')}
      </output>

      <output data-testid="draft-cost">
        {eventDraft.costoReferencial}
      </output>
    </div>
  );
}

function renderPage(
  repository:
    EventFormDataRepository,
) {
  return render(
    <ApplicationStateProvider>
      <MemoryRouter>
        <CreateEventPage
          repository={
            repository
          }
        />

        <DraftProbe />
      </MemoryRouter>
    </ApplicationStateProvider>,
  );
}

describe(
  'CreateEventPage',
  () => {
    it(
      'muestra loading mientras consulta categorías y lugares',
      () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              () =>
                new Promise<
                  EventFormData
                >(
                  () => {
                    // Mantiene la consulta pendiente para comprobar loading.
                  },
                ),
            ),
        };

        renderPage(
          repository,
        );

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Cargando formulario',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'carga los campos y utiliza lugares y categorías reales del repositorio',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                formData,
            ),
        };

        renderPage(
          repository,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Información principal',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Título',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Descripción (opcional)',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Fecha y hora de inicio',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Fecha y hora de fin',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Costo referencial',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Fuente de información (opcional)',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'switch',
            {
              name:
                /Evento gratuito/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'option',
            {
              name:
                'Casa Cultural Zamora — Zamora, Zamora',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'checkbox',
            {
              name:
                'Cultura comunitaria',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'checkbox',
            {
              name:
                'Gastronomía local',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'actualiza el borrador con los identificadores reales seleccionados',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                formData,
            ),
        };

        renderPage(
          repository,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Información principal',
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            'Título',
          ),
          {
            target: {
              value:
                'Festival Amazónico',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            'Lugar del evento',
          ),
          {
            target: {
              value:
                '73',
            },
          },
        );

        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                'Cultura comunitaria',
            },
          ),
        );

        expect(
          screen.getByTestId(
            'draft-title',
          ),
        ).toHaveTextContent(
          'Festival Amazónico',
        );

        expect(
          screen.getByTestId(
            'draft-place',
          ),
        ).toHaveTextContent(
          '73',
        );

        expect(
          screen.getByTestId(
            'draft-categories',
          ),
        ).toHaveTextContent(
          '41',
        );
      },
    );

    it(
      'registra costo cero y bloquea el campo cuando el evento es gratuito',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                formData,
            ),
        };

        renderPage(
          repository,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Información principal',
          },
        );

        const freeSwitch =
          screen.getByRole(
            'switch',
            {
              name:
                /Evento gratuito/i,
            },
          );

        const costInput =
          screen.getByLabelText(
            'Costo referencial',
          ) as HTMLInputElement;

        expect(
          freeSwitch,
        ).not.toBeChecked();

        expect(
          costInput,
        ).not.toBeDisabled();

        fireEvent.click(
          freeSwitch,
        );

        expect(
          freeSwitch,
        ).toBeChecked();

        expect(
          costInput,
        ).toBeDisabled();

        expect(
          costInput.value,
        ).toBe(
          '0',
        );

        expect(
          screen.getByTestId(
            'draft-cost',
          ),
        ).toHaveTextContent(
          '0',
        );
      },
    );

    it(
      'vacía el costo al desactivar gratuito y no recupera un precio anterior',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                formData,
            ),
        };

        renderPage(
          repository,
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Información principal',
          },
        );

        const freeSwitch =
          screen.getByRole(
            'switch',
            {
              name:
                /Evento gratuito/i,
            },
          );

        const costInput =
          screen.getByLabelText(
            'Costo referencial',
          ) as HTMLInputElement;

        fireEvent.change(
          costInput,
          {
            target: {
              value:
                '12.50',
            },
          },
        );

        expect(
          costInput.value,
        ).toBe(
          '12.50',
        );

        fireEvent.click(
          freeSwitch,
        );

        expect(
          costInput.value,
        ).toBe(
          '0',
        );

        expect(
          costInput,
        ).toBeDisabled();

        fireEvent.click(
          freeSwitch,
        );

        expect(
          freeSwitch,
        ).not.toBeChecked();

        expect(
          costInput,
        ).not.toBeDisabled();

        expect(
          costInput.value,
        ).toBe(
          '',
        );

        expect(
          screen.getByTestId(
            'draft-cost',
          ).textContent,
        ).toBe(
          '',
        );
      },
    );

    it(
      'no expone campos controlados por el servidor',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                formData,
            ),
        };

        const {
          container,
        } =
          renderPage(
            repository,
          );

        await screen.findByRole(
          'heading',
          {
            name:
              'Información principal',
          },
        );

        expect(
          container.querySelector(
            '[name="estadoEvento"]',
          ),
        ).toBeNull();

        expect(
          container.querySelector(
            '[name="estadoRevision"]',
          ),
        ).toBeNull();

        expect(
          container.querySelector(
            '[name="usuarioCreador"]',
          ),
        ).toBeNull();

        expect(
          container.querySelector(
            '[name="fechaCreacion"]',
          ),
        ).toBeNull();

        expect(
          container.querySelector(
            '[name="fechaRevision"]',
          ),
        ).toBeNull();
      },
    );

    it(
      'muestra estado vacío si faltan categorías o lugares activos',
      async () => {
        const repository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () => ({
                categorias:
                  [],
                lugares:
                  formData
                    .lugares,
              }),
            ),
        };

        renderPage(
          repository,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Faltan datos para crear eventos',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            'Título',
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'permite reintentar después de un error de datos auxiliares',
      async () => {
        const load =
          vi.fn<
            EventFormDataRepository['load']
          >();

        load
          .mockRejectedValueOnce(
            new EventFormDataRepositoryError(
              'connection',
              'Sin conexión.',
            ),
          )
          .mockResolvedValueOnce(
            formData,
          );

        const repository:
          EventFormDataRepository = {
          load,
        };

        renderPage(
          repository,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No pudimos preparar el formulario',
            },
          ),
        ).toBeInTheDocument();

        fireEvent.click(
          screen.getByText(
            'Reintentar',
            {
              selector:
                'ion-button',
            },
          ),
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Información principal',
            },
          ),
        ).toBeInTheDocument();

        expect(
          load,
        ).toHaveBeenCalledTimes(
          2,
        );
      },
    );
  },
);
