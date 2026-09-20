import {
  renderHook,
  waitFor,
} from '@testing-library/react';
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
} from './event-form-data-repository';
import {
  useEventFormData,
} from './use-event-form-data';

const formData:
  EventFormData = {
    categorias: [
      {
        id: 1,
        nombre:
          'Cultura',
        descripcion:
          null,
      },
    ],

    lugares: [
      {
        id: 1,
        nombre:
          'Parque Central',
        tipoLugar:
          'PARQUE',
        direccionReferencial:
          'Centro de Zamora',
        sector: {
          id: 1,
          nombre:
            'Centro',
          tipoSector:
            'BARRIO',
          parroquia: {
            id: 1,
            nombre:
              'Zamora',
            canton: {
              id: 1,
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

describe(
  'useEventFormData',
  () => {
    it(
      'inicia en estado loading mientras espera los datos',
      () => {
        const load =
          vi.fn(
            () =>
              new Promise<EventFormData>(
                () =>
                  undefined,
              ),
          );

        const repository:
          EventFormDataRepository = {
            load,
          };

        const {
          result,
        } =
          renderHook(
            () =>
              useEventFormData(
                repository,
              ),
          );

        expect(
          result.current.state,
        ).toEqual({
          status:
            'loading',
        });

        expect(
          load,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      'representa success con categorías y lugares reales',
      async () => {
        const load =
          vi.fn(
            async () =>
              formData,
          );

        const repository:
          EventFormDataRepository = {
            load,
          };

        const {
          result,
        } =
          renderHook(
            () =>
              useEventFormData(
                repository,
              ),
          );

        await waitFor(
          () => {
            expect(
              result
                .current
                .state
                .status,
            ).toBe(
              'success',
            );
          },
        );

        expect(
          result.current.state,
        ).toEqual({
          status:
            'success',
          data:
            formData,
        });
      },
    );

    it(
      'representa un error comprensible ante fallo de conexión',
      async () => {
        const load =
          vi.fn(
            async () => {
              throw new EventFormDataRepositoryError(
                'connection',
                'Network error',
                null,
              );
            },
          );

        const repository:
          EventFormDataRepository = {
            load,
          };

        const {
          result,
        } =
          renderHook(
            () =>
              useEventFormData(
                repository,
              ),
          );

        await waitFor(
          () => {
            expect(
              result
                .current
                .state
                .status,
            ).toBe(
              'error',
            );
          },
        );

        expect(
          result.current.state,
        ).toEqual({
          status:
            'error',
          error:
            'No fue posible conectarse con ZamoraFest. Revise su conexión e intente nuevamente.',
        });
      },
    );
  },
);