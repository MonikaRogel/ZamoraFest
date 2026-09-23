import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  useHistory,
} from 'react-router-dom';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  EventFormData,
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import {
  ApplicationStateProvider,
} from '../state/ApplicationStateContext';
import CreateEventPage from './CreateEventPage';

const formData:
  EventFormData = {
    categorias: [
      {
        id:
          41,

        nombre:
          'Cultura comunitaria',

        descripcion:
          'Actividades culturales.',
      },
    ],

    lugares: [
      {
        id:
          73,

        nombre:
          'Casa Cultural Zamora',

        tipoLugar:
          'CENTRO_CULTURAL',

        direccionReferencial:
          'Centro de Zamora',

        sector: {
          id:
            31,

          nombre:
            'Centro',

          tipoSector:
            'BARRIO',

          parroquia: {
            id:
              22,

            nombre:
              'Zamora',

            canton: {
              id:
                12,

              nombre:
                'Zamora',

              provincia: {
                id:
                  1,

                nombre:
                  'Zamora Chinchipe',
              },
            },
          },
        },
      },
    ],
  };

function ManagementProbe() {
  const history =
    useHistory();

  return (
    <main>
      <h1>
        Gestión de prueba
      </h1>

      <button
        type="button"
        onClick={() => {
          history.push(
            '/gestion/eventos/nuevo',
          );
        }}
      >
        Regresar al formulario
      </button>
    </main>
  );
}

function renderNavigationFlow(
  repository:
    EventFormDataRepository,
) {
  return render(
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[
          '/gestion/eventos/nuevo',
        ]}
      >
        <Route
          exact
          path="/gestion/eventos/nuevo"
        >
          <CreateEventPage
            repository={
              repository
            }
          />
        </Route>

        <Route
          exact
          path="/gestion"
        >
          <ManagementProbe />
        </Route>
      </MemoryRouter>
    </ApplicationStateProvider>,
  );
}

describe(
  'CreateEventPage - preservación del borrador',
  () => {
    it(
      'conserva los datos al navegar a gestión y regresar al formulario',
      async () => {
        const load =
          vi.fn<
            EventFormDataRepository['load']
          >(
            async () =>
              formData,
          );

        renderNavigationFlow({
          load,
        });

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Información principal',
            },
          ),
        ).toBeInTheDocument();

        fireEvent.change(
          screen.getByLabelText(
            'Título',
          ),
          {
            target: {
              value:
                'Festival pendiente',
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
          screen.getByLabelText(
            'Título',
          ),
        ).toHaveValue(
          'Festival pendiente',
        );

        expect(
          screen.getByLabelText(
            'Lugar del evento',
          ),
        ).toHaveValue(
          '73',
        );

        expect(
          screen.getByRole(
            'checkbox',
            {
              name:
                'Cultura comunitaria',
            },
          ),
        ).toBeChecked();

        fireEvent.click(
          screen.getByText(
            'Volver',
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
                'Gestión de prueba',
            },
          ),
        ).toBeInTheDocument();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                'Regresar al formulario',
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
          screen.getByLabelText(
            'Título',
          ),
        ).toHaveValue(
          'Festival pendiente',
        );

        expect(
          screen.getByLabelText(
            'Lugar del evento',
          ),
        ).toHaveValue(
          '73',
        );

        expect(
          screen.getByRole(
            'checkbox',
            {
              name:
                'Cultura comunitaria',
            },
          ),
        ).toBeChecked();

        expect(
          load,
        ).toHaveBeenCalledTimes(
          2,
        );
      },
    );
  },
);