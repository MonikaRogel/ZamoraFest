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
        vi.fn(),

      getHealth:
        vi.fn(),

      getEventos:
        vi.fn(),

      getOwnEventos:
        vi.fn(),

      getEventoById:
        vi.fn(),

      getCategorias:
        vi.fn(),

      getLugares:
        vi.fn(),

      createEvento:
        vi.fn(),
    },
  }),
);

describe(
  'Ruta real de Mis eventos',
  () => {
    beforeEach(
      () => {
        window.history.pushState(
          {},
          '',
          '/gestion/eventos',
        );
      },
    );

    it(
      'redirige al login cuando no existe una sesión autenticada',
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

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Mis eventos',
            },
          ),
        ).not.toBeInTheDocument();
      },
    );
  },
);