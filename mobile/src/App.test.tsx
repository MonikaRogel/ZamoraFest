import {
  render,
  screen,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import App from './App';

vi.mock(
  './services/api/zamorafest-api',
  () => ({
    ApiRequestError:
      class ApiRequestError
        extends Error {},

    zamoraFestApi: {
      login:
        vi.fn(),

      register:
        vi.fn(
          async () => ({
            id: 11,
            nombre:
              'Visitante Demo',
            email:
              'visitante@zamorafest.ec',
            rol:
              'VISITANTE',
          }),
        ),

      getHealth:
        vi.fn(
          async () => ({
            status:
              'ok',
            service:
              'zamorafest-backend',
          }),
        ),

      getEventos:
        vi.fn(
          async () => ({
            data: [
              {
                id: 1,
                titulo:
                  'Evento de prueba',
                descripcion:
                  'Evento público de demostración.',
                fechaInicio:
                  '2026-09-26T19:00:00.000Z',
                fechaFin:
                  '2026-09-26T22:00:00.000Z',
                costoReferencial:
                  0,
                estadoEvento:
                  'PROGRAMADO',
                estadoRevision:
                  'APROBADO',
                fuenteInformacion:
                  null,
                fechaCreacion:
                  '2026-09-01T12:00:00.000Z',
                fechaActualizacion:
                  '2026-09-01T12:00:00.000Z',
                fechaRevision:
                  null,
                lugar: {
                  id: 1,
                  nombre:
                    'Parque Central de Zamora',
                  tipoLugar:
                    'PARQUE',
                  direccionReferencial:
                    'Centro de Zamora',
                  referencia:
                    null,
                  latitud:
                    -4.069,
                  longitud:
                    -78.956,
                  sector: {
                    id: 1,
                    nombre:
                      'Centro',
                    tipoSector:
                      'URBANO',
                    parroquia: {
                      id: 1,
                      nombre:
                        'Zamora',
                      codigoDpa:
                        '190101',
                      canton: {
                        id: 1,
                        nombre:
                          'Zamora',
                        codigoDpa:
                          '1901',
                        provincia: {
                          id: 1,
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
                  id: 1,
                  nombreCompleto:
                    'Gestor Cultural',
                  rol: {
                    id: 2,
                    nombre:
                      'ASISTENTE',
                  },
                },
                usuarioRevisor:
                  null,
                categorias: [
                  {
                    id: 1,
                    nombre:
                      'Cultura',
                    descripcion:
                      null,
                  },
                ],
              },
            ],

            meta: {
              page: 1,
              limit: 5,
              total: 1,
              totalPages: 1,
            },
          }),
        ),

      getCategorias:
        vi.fn(
          async () => ({
            data: [],
          }),
        ),

      getLugares:
        vi.fn(
          async () => ({
            data: [],
          }),
        ),
    },
  }),
);

describe(
  'App',
  () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        '',
        '/',
      );
    });

    it(
      'inicia ZamoraFest en la agenda pública con acceso visible al login',
      async () => {
        render(
          <App />,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Descubre Zamora Chinchipe',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Iniciar sesión',
            {
              selector:
                'ion-button',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Evento de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'expone el registro de visitante como ruta pública',
      async () => {
        window.history.pushState(
          {},
          '',
          '/register',
        );

        render(
          <App />,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Crear cuenta',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /únicamente una cuenta de visitante/i,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'conserva la pantalla de verificación del entorno',
      async () => {
        window.history.pushState(
          {},
          '',
          '/environment',
        );

        render(
          <App />,
        );

        expect(
          await screen.findByText(
            'Verificada',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Evento de prueba',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'protege la ruta de gestión cuando no existe sesión',
      async () => {
        window.history.pushState(
          {},
          '',
          '/gestion',
        );

        render(
          <App />,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Iniciar sesión',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Gestión de ZamoraFest',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'protege la ruta real de creación cuando no existe sesión',
      async () => {
        window.history.pushState(
          {},
          '',
          '/gestion/eventos/nuevo',
        );

        render(
          <App />,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Iniciar sesión',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Crear nuevo evento',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );
  },
);
