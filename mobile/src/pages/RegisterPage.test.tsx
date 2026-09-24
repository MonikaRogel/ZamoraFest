import {
  fireEvent,
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
import {
  MemoryRouter,
  Route,
  useLocation,
} from 'react-router-dom';

import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import type {
  RegisteredVisitor,
} from '../types/api';
import RegisterPage from './RegisterPage';

vi.mock(
  '../services/api/zamorafest-api',
  () => ({
    ApiRequestError:
      class ApiRequestError
        extends Error {
        readonly status:
          number | null;

        constructor(
          message: string,
          status:
            number | null = null,
        ) {
          super(message);

          this.name =
            'ApiRequestError';

          this.status =
            status;
        }
      },

    zamoraFestApi: {
      register: vi.fn(),
    },
  }),
);

const registeredVisitor:
  RegisteredVisitor = {
    id: 25,
    nombre: 'María Pérez',
    email:
      'maria@ejemplo.com',
    rol: 'VISITANTE',
  };

function LoginDestinationProbe() {
  const location =
    useLocation();

  return (
    <main>
      <h1>
        Login de prueba
      </h1>

      <output data-testid="register-destination">
        {`${location.pathname}${location.search}`}
      </output>
    </main>
  );
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        '/register',
      ]}
    >
      <Route
        exact
        path="/register"
      >
        <RegisterPage />
      </Route>

      <Route
        exact
        path="/login"
      >
        <LoginDestinationProbe />
      </Route>
    </MemoryRouter>,
  );
}

function completeForm(
  container: HTMLElement,
) {
  const inputs =
    container.querySelectorAll(
      'ion-input',
    );

  const form =
    container.querySelector(
      'form',
    );

  expect(inputs).toHaveLength(3);
  expect(form).not.toBeNull();

  fireEvent(
    inputs.item(0),
    new CustomEvent(
      'ionInput',
      {
        bubbles: true,
        detail: {
          value:
            '  María Pérez  ',
        },
      },
    ),
  );

  fireEvent(
    inputs.item(1),
    new CustomEvent(
      'ionInput',
      {
        bubbles: true,
        detail: {
          value:
            '  Maria@Ejemplo.COM  ',
        },
      },
    ),
  );

  fireEvent(
    inputs.item(2),
    new CustomEvent(
      'ionInput',
      {
        bubbles: true,
        detail: {
          value:
            'ClaveDemo123',
        },
      },
    ),
  );

  return form!;
}

describe(
  'RegisterPage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      'registra un visitante y vuelve al login con confirmación',
      async () => {
        vi.mocked(
          zamoraFestApi.register,
        ).mockResolvedValueOnce(
          registeredVisitor,
        );

        const {
          container,
        } = renderPage();

        const form =
          completeForm(
            container,
          );

        fireEvent.submit(
          form,
        );

        expect(
          zamoraFestApi.register,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          zamoraFestApi.register,
        ).toHaveBeenCalledWith({
          nombre:
            'María Pérez',
          email:
            'maria@ejemplo.com',
          password:
            'ClaveDemo123',
        });

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Login de prueba',
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByTestId(
            'register-destination',
          ),
        ).toHaveTextContent(
          '/login?registered=1',
        );
      },
    );

    it(
      'mantiene visible que el autorregistro crea únicamente visitantes',
      () => {
        renderPage();

        expect(
          screen.getByText(
            /únicamente una cuenta de visitante/i,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'incluye control para mostrar u ocultar la contraseña',
      () => {
        const {
          container,
        } = renderPage();

        expect(
          container.querySelector(
            'ion-input-password-toggle',
          ),
        ).not.toBeNull();
      },
    );

    it(
      'impide enviar datos inválidos al backend',
      () => {
        const {
          container,
        } = renderPage();

        const inputs =
          container.querySelectorAll(
            'ion-input',
          );

        const form =
          container.querySelector(
            'form',
          );

        expect(form).not.toBeNull();

        fireEvent(
          inputs.item(0),
          new CustomEvent(
            'ionInput',
            {
              bubbles: true,
              detail: {
                value: 'A',
              },
            },
          ),
        );

        fireEvent(
          inputs.item(1),
          new CustomEvent(
            'ionInput',
            {
              bubbles: true,
              detail: {
                value:
                  'correo-invalido',
              },
            },
          ),
        );

        fireEvent(
          inputs.item(2),
          new CustomEvent(
            'ionInput',
            {
              bubbles: true,
              detail: {
                value:
                  '1234567',
              },
            },
          ),
        );

        fireEvent.submit(
          form!,
        );

        expect(
          zamoraFestApi.register,
        ).not.toHaveBeenCalled();

        expect(
          screen.getByText(
            'El nombre debe tener al menos 2 caracteres.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ingrese un correo electrónico válido.',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'La contraseña debe tener al menos 8 caracteres.',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'muestra un mensaje comprensible cuando el correo ya existe',
      async () => {
        vi.mocked(
          zamoraFestApi.register,
        ).mockRejectedValueOnce(
          new ApiRequestError(
            'EMAIL_ALREADY_REGISTERED',
            409,
          ),
        );

        const {
          container,
        } = renderPage();

        const form =
          completeForm(
            container,
          );

        fireEvent.submit(
          form,
        );

        expect(
          await screen.findByText(
            'El correo electrónico ya está registrado.',
          ),
        ).toBeInTheDocument();

        expect(
          container.textContent,
        ).not.toContain(
          'EMAIL_ALREADY_REGISTERED',
        );
      },
    );

    it(
      'traduce HTTP 422 a un mensaje de corrección',
      async () => {
        vi.mocked(
          zamoraFestApi.register,
        ).mockRejectedValueOnce(
          new ApiRequestError(
            'VALIDATION_ERROR',
            422,
          ),
        );

        const {
          container,
        } = renderPage();

        const form =
          completeForm(
            container,
          );

        fireEvent.submit(
          form,
        );

        expect(
          await screen.findByText(
            'Revise los datos ingresados e intente nuevamente.',
          ),
        ).toBeInTheDocument();

        expect(
          container.textContent,
        ).not.toContain(
          'VALIDATION_ERROR',
        );
      },
    );

    it(
      'oculta detalles técnicos ante un fallo de conexión',
      async () => {
        vi.mocked(
          zamoraFestApi.register,
        ).mockRejectedValueOnce(
          new ApiRequestError(
            'ECONNREFUSED 127.0.0.1',
            null,
          ),
        );

        const {
          container,
        } = renderPage();

        const form =
          completeForm(
            container,
          );

        fireEvent.submit(
          form,
        );

        expect(
          await screen.findByText(
            'No se pudo conectar con ZamoraFest. Verifique la conexión e intente nuevamente.',
          ),
        ).toBeInTheDocument();

        expect(
          container.textContent,
        ).not.toContain(
          'ECONNREFUSED',
        );
      },
    );

    it(
      'bloquea envíos duplicados mientras existe una solicitud activa',
      async () => {
        let resolveRegister!:
          (
            visitor:
              RegisteredVisitor,
          ) => void;

        const pendingRegister =
          new Promise<
            RegisteredVisitor
          >((resolve) => {
            resolveRegister =
              resolve;
          });

        vi.mocked(
          zamoraFestApi.register,
        ).mockReturnValueOnce(
          pendingRegister,
        );

        const {
          container,
        } = renderPage();

        const form =
          completeForm(
            container,
          );

        fireEvent.submit(
          form,
        );

        fireEvent.submit(
          form,
        );

        expect(
          zamoraFestApi.register,
        ).toHaveBeenCalledTimes(
          1,
        );

        resolveRegister(
          registeredVisitor,
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Login de prueba',
            },
          ),
        ).toBeInTheDocument();
      },
    );
  },
);
