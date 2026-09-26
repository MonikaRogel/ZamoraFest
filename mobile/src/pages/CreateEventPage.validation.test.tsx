import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  useEffect,
  useRef,
} from 'react';
import {
  MemoryRouter,
} from 'react-router-dom';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  EventCreateRepository,
} from '../features/events/event-create-repository';
import type {
  EventFormData,
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import type {
  EventDraft,
} from '../state/application-state';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
} from '../types/api';
import CreateEventPage from './CreateEventPage';

const session:
  AuthSession = {
    accessToken:
      'access-asistente',

    refreshToken:
      'refresh-asistente',

    tokenType:
      'Bearer',

    expiresIn:
      900,

    usuario: {
      id:
        10,

      nombre:
        'Asistente Demo',

      email:
        'asistente@zamorafest.test',

      rol:
        'ASISTENTE',
    },
  };

const formData:
  EventFormData = {
    categorias: [
      {
        id:
          41,

        nombre:
          'Cultura comunitaria',

        descripcion:
          null,
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

interface StateBootstrapProps {
  readonly draft?:
    Partial<EventDraft>;
}

function StateBootstrap({
  draft,
}: StateBootstrapProps) {
  const {
    login,
    updateEventDraft,
  } =
    useApplicationState();

  const initialized =
    useRef(
      false,
    );

  useEffect(
    () => {
      if (
        initialized.current
      ) {
        return;
      }

      initialized.current =
        true;

      login(
        session,
      );

      if (
        draft !==
        undefined
      ) {
        updateEventDraft(
          draft,
        );
      }
    },
    [
      draft,
      login,
      updateEventDraft,
    ],
  );

  return null;
}

function renderPage(
  draft?:
    Partial<EventDraft>,
) {
  const repository:
    EventFormDataRepository = {
    load:
      vi.fn(
        async () =>
          formData,
      ),
  };

  const create =
    vi.fn<
      EventCreateRepository['create']
    >(
      async () => {
        throw new Error(
          'La creación no debe ejecutarse con un formulario inválido.',
        );
      },
    );

  const creationRepository:
    EventCreateRepository = {
    create,
  };

  render(
    <ApplicationStateProvider>
      <MemoryRouter>
        <StateBootstrap
          draft={
            draft
          }
        />

        <CreateEventPage
          repository={
            repository
          }
          creationRepository={
            creationRepository
          }
        />
      </MemoryRouter>
    </ApplicationStateProvider>,
  );

  return {
    create,
  };
}

async function submitForm() {
  const button =
    await screen
      .findByLabelText(
        'Guardar borrador',
      );

  const form =
    button.closest(
      'form',
    );

  if (
    form ===
    null
  ) {
    throw new Error(
      'No se encontró el formulario de creación.',
    );
  }

  await act(
    async () => {
      fireEvent.submit(
        form,
      );

      await Promise.resolve();
    },
  );
}

describe(
  'CreateEventPage - validación móvil',
  () => {
    it(
      'valida el título al abandonar el campo',
      async () => {
        renderPage();

        const title =
          await screen
            .findByLabelText(
              'Título',
            );

        fireEvent.blur(
          title,
        );

        expect(
          await screen.findByText(
            'Ingrese el título del evento.',
          ),
        ).toBeInTheDocument();

        expect(
          title,
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );

        expect(
          title,
        ).toHaveAttribute(
          'aria-describedby',
          'event-title-error',
        );
      },
    );

    it(
      'valida el costo al abandonar el campo',
      async () => {
        renderPage({
          costoReferencial:
            '5.555',
        });

        const cost =
          await screen
            .findByLabelText(
              'Costo referencial',
            );

        fireEvent.blur(
          cost,
        );

        expect(
          await screen.findByText(
            'El costo referencial admite como máximo dos decimales.',
          ),
        ).toBeInTheDocument();

        expect(
          cost,
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );
      },
    );

    it(
      'exige fecha final al abandonar el campo',
      async () => {
        renderPage({
          fechaInicio:
            '2026-09-25T18:00',
          fechaFin:
            '',
        });

        const endDate =
          await screen
            .findByLabelText(
              'Fecha y hora de fin',
            );

        fireEvent.blur(
          endDate,
        );

        expect(
          await screen.findByText(
            'Ingrese la fecha y hora de fin.',
          ),
        ).toBeInTheDocument();

        expect(
          endDate,
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );

        expect(
          endDate,
        ).toHaveAttribute(
          'aria-describedby',
          'event-end-error',
        );
      },
    );

    it(
      'valida que la fecha final sea posterior a la fecha inicial',
      async () => {
        renderPage({
          fechaInicio:
            '2026-09-25T18:00',

          fechaFin:
            '2026-09-25T17:59',
        });

        const endDate =
          await screen
            .findByLabelText(
              'Fecha y hora de fin',
            );

        fireEvent.blur(
          endDate,
        );

        expect(
          await screen.findByText(
            'La fecha de fin debe ser posterior a la fecha de inicio.',
          ),
        ).toBeInTheDocument();

        expect(
          endDate,
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );
      },
    );

    it(
      'ejecuta validación completa al enviar y no llama al repositorio cuando el formulario es inválido',
      async () => {
        const {
          create,
        } =
          renderPage();

        await submitForm();

        expect(
          create,
        ).not.toHaveBeenCalled();

        expect(
          screen.getByText(
            'Ingrese el título del evento.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ingrese la fecha y hora de inicio.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ingrese la fecha y hora de fin.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ingrese el costo referencial.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Seleccione un lugar válido.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Seleccione al menos una categoría.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            'Título',
          ),
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );

        expect(
          screen.getByLabelText(
            'Fecha y hora de fin',
          ),
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );

        expect(
          screen.getByLabelText(
            'Lugar del evento',
          ),
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );

        expect(
          screen.getByRole(
            'group',
            {
              name:
                'Categorías del evento',
            },
          ),
        ).toHaveAttribute(
          'aria-invalid',
          'true',
        );
      },
    );
  },
);