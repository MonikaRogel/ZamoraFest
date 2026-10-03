import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
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

import {
  EventRepositoryError,
} from '../features/events/event-repository';
import type {
  EventFormData,
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import type {
  OwnEventRepository,
} from '../features/events/remote-own-event-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
  Evento,
} from '../types/api';
import EditEventPage from './EditEventPage';

const assistantSession:
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
      7,
    nombre:
      'Asistente Demo',
    email:
      'asistente@zamorafest.ec',
    rol:
      'ASISTENTE',
  },
};

const ownEvent:
  Evento = {
  id:
    101,
  titulo:
    'Festival propio',
  descripcion:
    'Borrador administrado por el asistente.',
  fechaInicio:
    '2026-10-20T18:00:00.000',
  fechaFin:
    '2026-10-20T22:00:00.000',
  costoReferencial:
    0,
  estadoEvento:
    'BORRADOR',
  estadoRevision:
    'PENDIENTE',
  fuenteInformacion:
    'Direccion de Cultura',
  fechaCreacion:
    '2026-09-25T20:00:00.000',
  fechaActualizacion:
    null,
  fechaRevision:
    null,
  lugar: {
    id:
      1,
    nombre:
      'Parque Central',
    tipoLugar:
      'PARQUE',
    direccionReferencial:
      'Centro de Zamora',
    referencia:
      null,
    latitud:
      null,
    longitud:
      null,
    sector: {
      id:
        1,
      nombre:
        'Cabecera parroquial',
      tipoSector:
        'CABECERA_PARROQUIAL',
      parroquia: {
        id:
          1,
        nombre:
          'Zamora',
        codigoDpa:
          '190150',
        canton: {
          id:
            1,
          nombre:
            'Zamora',
          codigoDpa:
            '1901',
          provincia: {
            id:
              1,
            nombre:
              'Zamora Chinchipe',
            codigoDpa:
              '19',
          },
        },
      },
    },
  },
  usuarioCreador: {
    id:
      7,
    nombreCompleto:
      'Asistente Demo',
    rol: {
      id:
        2,
      nombre:
        'ASISTENTE',
    },
  },
  usuarioRevisor:
    null,
  categorias: [
    {
      id:
        1,
      nombre:
        'Festividades',
      descripcion:
        null,
    },
  ],
};

const formData:
  EventFormData = {
  categorias:
    ownEvent.categorias,
  lugares: [
    ownEvent.lugar,
  ],
};

function SeedAssistantSession() {
  const {
    login,
  } =
    useApplicationState();

  const history =
    useHistory();

  return (
    <button
      type="button"
      onClick={() => {
        login(
          assistantSession,
        );

        history.push(
          '/gestion/eventos/101/editar',
        );
      }}
    >
      Iniciar asistente de prueba
    </button>
  );
}

function renderPage(
  eventRepository:
    OwnEventRepository,
  formDataRepository:
    EventFormDataRepository,
) {
  render(
    <ApplicationStateProvider>
      <MemoryRouter
        initialEntries={[
          '/seed',
        ]}
      >
        <Route
          exact
          path="/seed"
        >
          <SeedAssistantSession />
        </Route>

        <Route
          exact
          path="/gestion/eventos/:id/editar"
        >
          <EditEventPage
            eventRepository={
              eventRepository
            }
            formDataRepository={
              formDataRepository
            }
          />
        </Route>
      </MemoryRouter>
    </ApplicationStateProvider>,
  );

  fireEvent.click(
    screen.getByRole(
      'button',
      {
        name:
          'Iniciar asistente de prueba',
      },
    ),
  );
}

function createEventRepository(
  event:
    Evento = ownEvent,
): OwnEventRepository {
  return {
    listOwnEventPage:
      vi.fn(),

    getOwnEventById:
      vi.fn(
        async () =>
          event,
      ),

    updateOwnEvent:
      vi.fn(
        async () =>
          event,
      ),
  };
}

function createFormDataRepository():
  EventFormDataRepository {
  return {
    load:
      vi.fn(
        async () =>
          formData,
      ),
  };
}

describe(
  'EditEventPage',
  () => {
    it(
      'carga el evento propio y conserva las fechas locales del dominio',
      async () => {
        const eventRepository =
          createEventRepository();

        const formDataRepository =
          createFormDataRepository();

        renderPage(
          eventRepository,
          formDataRepository,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Editar evento',
            },
          ),
        ).toBeInTheDocument();

        expect(
          eventRepository
            .getOwnEventById,
        ).toHaveBeenCalledWith(
          101,
          'access-asistente',
        );

        expect(
          formDataRepository
            .load,
        ).toHaveBeenCalled();

        expect(
          screen.getByLabelText(
            'Titulo',
          ),
        ).toHaveValue(
          'Festival propio',
        );

        expect(
          screen.getByLabelText(
            'Fecha y hora de inicio',
          ),
        ).toHaveValue(
          '2026-10-20T18:00',
        );

        expect(
          screen.getByLabelText(
            'Fecha y hora de fin',
          ),
        ).toHaveValue(
          '2026-10-20T22:00',
        );
      },
    );

    it(
      'no ofrece formulario cuando el borrador ya fue aprobado',
      async () => {
        const eventRepository =
          createEventRepository({
            ...ownEvent,
            estadoRevision:
              'APROBADO',
          });

        renderPage(
          eventRepository,
          createFormDataRepository(),
        );

        expect(
          await screen.findByText(
            'Este evento ya no puede editarse.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            'Titulo',
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'actualiza el borrador propio usando el access token',
      async () => {
        const eventRepository =
          createEventRepository();

        renderPage(
          eventRepository,
          createFormDataRepository(),
        );

        const titleInput =
          await screen.findByLabelText(
            'Titulo',
          );

        fireEvent.change(
          titleInput,
          {
            target: {
              value:
                'Festival propio actualizado',
            },
          },
        );

        const saveButton =
          screen.getByText(
            'Guardar cambios',
          );

        const form =
          saveButton.closest(
            'form',
          );

        if (
          form ===
          null
        ) {
          throw new Error(
            'No se encontro el formulario de edicion.',
          );
        }

        await act(
          async () => {
            fireEvent.submit(
              form,
            );

            await Promise.resolve();
            await Promise.resolve();
          },
        );

        await waitFor(
          () => {
            expect(
              eventRepository
                .updateOwnEvent,
            ).toHaveBeenCalledWith(
              101,
              {
                titulo:
                  'Festival propio actualizado',
                descripcion:
                  'Borrador administrado por el asistente.',
                fechaInicio:
                  '2026-10-20T18:00:00.000',
                fechaFin:
                  '2026-10-20T22:00:00.000',
                costoReferencial:
                  0,
                lugarId:
                  1,
                categoriaIds: [
                  1,
                ],
                fuenteInformacion:
                  'Direccion de Cultura',
              },
              'access-asistente',
            );
          },
        );
      },
    );

    it(
      'edita todos los campos permitidos del borrador',
      async () => {
        const eventRepository =
          createEventRepository();

        const editableFormData:
          EventFormData = {
          categorias: [
            ...ownEvent.categorias,
            {
              id: 2,
              nombre: 'Cultura comunitaria',
              descripcion: null,
            },
          ],
          lugares: [
            ownEvent.lugar,
            {
              ...ownEvent.lugar,
              id: 2,
              nombre: 'Casa de la Cultura',
            },
          ],
        };

        const formDataRepository:
          EventFormDataRepository = {
          load:
            vi.fn(
              async () =>
                editableFormData,
            ),
        };

        renderPage(
          eventRepository,
          formDataRepository,
        );

        fireEvent.change(
          await screen.findByLabelText(
            'Titulo',
          ),
          {
            target: {
              value:
                'Festival integral actualizado',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            /Descripci/,
          ),
          {
            target: {
              value:
                'Descripcion actualizada.',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            'Fecha y hora de inicio',
          ),
          {
            target: {
              value:
                '2026-10-21T19:00',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            'Fecha y hora de fin',
          ),
          {
            target: {
              value:
                '2026-10-21T23:00',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            'Costo referencial',
          ),
          {
            target: {
              value:
                '12.50',
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
                '2',
            },
          },
        );

        fireEvent.click(
          screen.getByLabelText(
            'Festividades',
          ),
        );

        fireEvent.click(
          screen.getByLabelText(
            'Cultura comunitaria',
          ),
        );

        fireEvent.change(
          screen.getByLabelText(
            /Fuente de informaci/,
          ),
          {
            target: {
              value:
                'Agenda cultural cantonal',
            },
          },
        );

        const saveButton =
          screen.getByText(
            'Guardar cambios',
          );

        const form =
          saveButton.closest(
            'form',
          );

        if (form === null) {
          throw new Error(
            'No se encontro el formulario de edicion.',
          );
        }

        await act(
          async () => {
            fireEvent.submit(
              form,
            );

            await Promise.resolve();
            await Promise.resolve();
          },
        );

        await waitFor(
          () => {
            expect(
              eventRepository
                .updateOwnEvent,
            ).toHaveBeenCalledWith(
              101,
              {
                titulo:
                  'Festival integral actualizado',
                descripcion:
                  'Descripcion actualizada.',
                fechaInicio:
                  '2026-10-21T19:00',
                fechaFin:
                  '2026-10-21T23:00',
                costoReferencial:
                  12.5,
                lugarId:
                  2,
                categoriaIds: [
                  2,
                ],
                fuenteInformacion:
                  'Agenda cultural cantonal',
              },
              'access-asistente',
            );
          },
        );
      },
    );

    it(
      'muestra el error de autorizacion cuando la actualizacion responde 403',
      async () => {
        const eventRepository =
          createEventRepository();

        vi.mocked(
          eventRepository
            .updateOwnEvent,
        ).mockRejectedValueOnce(
          new EventRepositoryError(
            'request',
            'Forbidden',
            403,
          ),
        );

        renderPage(
          eventRepository,
          createFormDataRepository(),
        );

        await screen.findByLabelText(
          'Titulo',
        );

        const saveButton =
          screen.getByText(
            'Guardar cambios',
          );

        const form =
          saveButton.closest(
            'form',
          );

        if (form === null) {
          throw new Error(
            'No se encontro el formulario de edicion.',
          );
        }

        await act(
          async () => {
            fireEvent.submit(
              form,
            );

            await Promise.resolve();
            await Promise.resolve();
          },
        );

        expect(
          await screen.findByText(
            /no tiene autorizaci/,
          ),
        ).toBeInTheDocument();
      },
    );
  },
);
