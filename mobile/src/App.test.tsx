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
      'inicia el flujo académico en la pantalla de login',
      async () => {
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

        const submitButton =
          screen.getByText(
            'Ingresar',
            {
              selector:
                'ion-button',
            },
          );

        expect(
          submitButton,
        ).toHaveAttribute(
          'type',
          'submit',
        );
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
  },
);