import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  EventCreateRepositoryError,
} from './event-create-repository';
import {
  mapEventCreateServerValidation,
} from './event-create-server-validation';

describe(
  'mapEventCreateServerValidation',
  () => {
    it(
      'asocia rutas directas del backend con los campos del formulario',
      () => {
        const error =
          new EventCreateRepositoryError(
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
                    'Título rechazado por el servidor.',
                },

                {
                  path:
                    'fechaInicio',

                  message:
                    'Fecha de inicio inválida.',
                },
              ],
            },
          );

        expect(
          mapEventCreateServerValidation(
            error,
          ),
        ).toEqual({
          handled:
            true,

          fieldErrors: {
            titulo:
              'Título rechazado por el servidor.',

            fechaInicio:
              'Fecha de inicio inválida.',
          },
        });
      },
    );

    it(
      'asocia una ruta indexada de categoriaIds con el campo de categorías',
      () => {
        const error =
          new EventCreateRepositoryError(
            'request',
            'Solicitud rechazada.',
            422,
            {
              code:
                'VALIDATION_ERROR',

              details: [
                {
                  path:
                    'categoriaIds.0',

                  message:
                    'La categoría seleccionada no es válida.',
                },
              ],
            },
          );

        expect(
          mapEventCreateServerValidation(
            error,
          ),
        ).toEqual({
          handled:
            true,

          fieldErrors: {
            categoriaIds:
              'La categoría seleccionada no es válida.',
          },
        });
      },
    );

    it(
      'convierte rutas desconocidas en un error general',
      () => {
        const error =
          new EventCreateRepositoryError(
            'request',
            'Solicitud rechazada.',
            422,
            {
              code:
                'VALIDATION_ERROR',

              details: [
                {
                  path:
                    'estadoEvento',

                  message:
                    'El estado recibido no es válido.',
                },
              ],
            },
          );

        expect(
          mapEventCreateServerValidation(
            error,
          ),
        ).toEqual({
          handled:
            true,

          fieldErrors:
            {},

          generalError:
            'El estado recibido no es válido.',
        });
      },
    );

    it(
      'ignora errores que no sean 422 VALIDATION_ERROR',
      () => {
        const error =
          new EventCreateRepositoryError(
            'request',
            'Forbidden.',
            403,
            {
              code:
                'FORBIDDEN',
            },
          );

        expect(
          mapEventCreateServerValidation(
            error,
          ),
        ).toEqual({
          handled:
            false,

          fieldErrors:
            {},
        });
      },
    );
  },
);