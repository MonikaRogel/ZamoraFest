import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
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

import {
  EventCreateRepositoryError,
  type EventCreateRepository,
} from '../features/events/event-create-repository';
import type {
  EventFormData,
  EventFormDataRepository,
} from '../features/events/event-form-data-repository';
import {
  ApplicationStateProvider,
  useApplicationState,
} from '../state/ApplicationStateContext';
import type {
  AuthSession,
  Evento,
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

const createdEvent:
  Evento = {
    id:
      501,

    titulo:
      'Festival Amazónico',

    descripcion:
      'Encuentro cultural.',

    fechaInicio:
      '2026-09-25T18:00:00.000',

    fechaFin:
      '2026-09-25T22:00:00.000',

    costoReferencial:
      5.5,

    estadoEvento:
      'BORRADOR',

    estadoRevision:
      'PENDIENTE',

    fuenteInformacion:
      null,

    fechaCreacion:
      '2026-09-19T20:00:00.000',

    fechaActualizacion:
      null,

    fechaRevision:
      null,

    lugar: {
      id:
        73,

      nombre:
        'Casa Cultural Zamora',

      tipoLugar:
        'CENTRO_CULTURAL',

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

          codigoDpa:
            '190150',

          canton: {
            id:
              12,

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
        10,

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
          41,

        nombre:
          'Cultura comunitaria',

        descripcion:
          null,
      },
    ],
  };

function StateBootstrap() {
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

      updateEventDraft({
        titulo:
          'Festival Amazónico',

        descripcion:
          'Encuentro cultural.',

        fechaInicio:
          '2026-09-25T18:00',

        fechaFin:
          '2026-09-25T22:00',

        costoReferencial:
          '5.50',

        lugarId:
          73,

        categoriaIds: [
          41,
        ],

        fuenteInformacion:
          '',
      });
    },
    [
      login,
      updateEventDraft,
    ],
  );

  return null;
}

function renderPage(
  creationRepository:
    EventCreateRepository,
) {
  const repository:
    EventFormDataRepository = {
    load:
      vi.fn(
        async () =>
          formData,
      ),
  };

  return render(
    <ApplicationStateProvider>
      <MemoryRouter>
        <StateBootstrap />

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
      await Promise.resolve();
    },
  );
}

describe(
  'CreateEventPage - creación remota',
  () => {
    it(
      'envía el borrador al repositorio utilizando el access token de la sesión',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () =>
              createdEvent,
          );

        renderPage({
          create,
        });

        await submitForm();

        await waitFor(
          () => {
            expect(
              create,
            ).toHaveBeenCalledWith(
              {
                titulo:
                  'Festival Amazónico',

                descripcion:
                  'Encuentro cultural.',

                fechaInicio:
                  '2026-09-25T18:00',

                fechaFin:
                  '2026-09-25T22:00',

                costoReferencial:
                  5.5,

                lugarId:
                  73,

                categoriaIds: [
                  41,
                ],

                fuenteInformacion:
                  null,
              },

              'access-asistente',
            );
          },
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Borrador guardado',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'status',
          ),
        ).toHaveTextContent(
          'Festival Amazónico',
        );

        expect(
          screen.getByRole(
            'status',
          ),
        ).toHaveTextContent(
          '501',
        );
      },
    );

    it(
      'representa el estado loading mientras la creación está pendiente',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            () =>
              new Promise<
                Evento
              >(
                () => {
                  // Mantiene la creación pendiente para comprobar loading.
                },
              ),
          );

        const {
          container,
        } =
          renderPage({
            create,
          });

        await submitForm();

        expect(
          create,
        ).toHaveBeenCalledTimes(
          1,
        );

        const loadingLabel =
          screen.getByText(
            'Guardando borrador...',
          );

        expect(
          loadingLabel,
        ).toBeInTheDocument();

        const loadingButton =
          loadingLabel.closest(
            'ion-button',
          );

        expect(
          loadingButton,
        ).not.toBeNull();

        expect(
          loadingButton
            ?.querySelector(
              'ion-spinner',
            ),
        ).not.toBeNull();

        expect(
          container.querySelector(
            'ion-spinner[name="crescent"]',
          ),
        ).not.toBeNull();
      },
    );

    it(
      'representa un error remoto sin eliminar el formulario',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () => {
              throw new EventCreateRepositoryError(
                'request',
                'Solicitud rechazada.',
                422,
              );
            },
          );

        renderPage({
          create,
        });

        await submitForm();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'No pudimos crear el evento',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'No fue posible crear el evento. Revise los datos e intente nuevamente.',
        );

        expect(
          screen.getByLabelText(
            'Título',
          ),
        ).toHaveValue(
          'Festival Amazónico',
        );
      },
    );

    it(
      'asocia errores 422 del backend con campos y conserva errores desconocidos como mensaje general',
      async () => {
        const create =
          vi.fn<
            EventCreateRepository['create']
          >(
            async () => {
              throw new EventCreateRepositoryError(
                'request',
                'Solicitud rechazada.',
                422,
                {
                  code:
                    'VALIDATION_ERROR',

                  details: [
                    {
                      path:
                        'titulo',

                      message:
                        'El título fue rechazado por el servidor.',
                    },

                    {
                      path:
                        'categoriaIds.0',

                      message:
                        'La categoría fue rechazada por el servidor.',
                    },

                    {
                      path:
                        'estadoEvento',

                      message:
                        'El estado del evento no puede enviarse desde el formulario.',
                    },
                  ],
                },
              );
            },
          );

        renderPage({
          create,
        });

        await submitForm();

        expect(
          await screen.findByText(
            'El título fue rechazado por el servidor.',
          ),
        ).toBeInTheDocument();

        expect(
          await screen.findByText(
            'La categoría fue rechazada por el servidor.',
          ),
        ).toBeInTheDocument();

        expect(
          await screen.findByText(
            'El estado del evento no puede enviarse desde el formulario.',
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

        expect(
          screen.getByLabelText(
            'Título',
          ),
        ).toHaveValue(
          'Festival Amazónico',
        );

        expect(
          create,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );
  },
);