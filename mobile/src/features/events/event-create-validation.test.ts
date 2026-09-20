import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  EventDraft,
} from '../../state/application-state';
import {
  validateEventCreateDraft,
} from './event-create-validation';

const validDraft:
  EventDraft = {
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
      87,
    ],
    fuenteInformacion:
      'GAD Municipal',
  };

function validate(
  changes:
    Partial<EventDraft>,
) {
  return validateEventCreateDraft({
    ...validDraft,
    ...changes,
  });
}

describe(
  'validateEventCreateDraft',
  () => {
    it(
      'normaliza un borrador válido y construye CreateEventoRequest',
      () => {
        const result =
          validate({
            titulo:
              '  Festival Amazónico  ',
            descripcion:
              '  Encuentro cultural.  ',
            fuenteInformacion:
              '  GAD Municipal  ',
          });

        expect(
          result,
        ).toEqual({
          ok: true,
          input: {
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
              87,
            ],
            fuenteInformacion:
              'GAD Municipal',
          },
        });
      },
    );

    it(
      'rechaza título vacío',
      () => {
        const result =
          validate({
            titulo:
              '   ',
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            titulo:
              'Ingrese el título del evento.',
          },
        });
      },
    );

    it(
      'rechaza título mayor a 200 caracteres',
      () => {
        const result =
          validate({
            titulo:
              'a'.repeat(
                201,
              ),
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            titulo:
              'El título no puede superar los 200 caracteres.',
          },
        });
      },
    );

    it(
      'rechaza fecha de inicio vacía o inválida',
      () => {
        expect(
          validate({
            fechaInicio:
              '',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            fechaInicio:
              'Ingrese la fecha y hora de inicio.',
          },
        });

        expect(
          validate({
            fechaInicio:
              '2026-02-31T18:00',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            fechaInicio:
              'Ingrese una fecha y hora de inicio válida.',
          },
        });
      },
    );

    it(
      'acepta fecha final vacía',
      () => {
        const result =
          validate({
            fechaFin:
              '',
          });

        expect(
          result,
        ).toMatchObject({
          ok: true,
          input: {
            fechaFin:
              null,
          },
        });
      },
    );

    it(
      'rechaza fecha final inválida o anterior al inicio',
      () => {
        expect(
          validate({
            fechaFin:
              '2026-02-31T22:00',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            fechaFin:
              'Ingrese una fecha y hora de fin válida.',
          },
        });

        expect(
          validate({
            fechaFin:
              '2026-09-25T17:59',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            fechaFin:
              'La fecha de fin no puede ser anterior a la fecha de inicio.',
          },
        });
      },
    );

    it(
      'rechaza costo vacío, negativo y con más de dos decimales',
      () => {
        expect(
          validate({
            costoReferencial:
              '',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            costoReferencial:
              'Ingrese el costo referencial.',
          },
        });

        expect(
          validate({
            costoReferencial:
              '-1',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            costoReferencial:
              'El costo referencial no puede ser negativo.',
          },
        });

        expect(
          validate({
            costoReferencial:
              '5.555',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            costoReferencial:
              'El costo referencial admite como máximo dos decimales.',
          },
        });
      },
    );

    it(
      'rechaza costo mayor al máximo del backend',
      () => {
        const result =
          validate({
            costoReferencial:
              '100000000',
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            costoReferencial:
              'El costo referencial supera el máximo permitido.',
          },
        });
      },
    );

    it(
      'rechaza lugar inválido',
      () => {
        expect(
          validate({
            lugarId:
              null,
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            lugarId:
              'Seleccione un lugar válido.',
          },
        });

        expect(
          validate({
            lugarId:
              0,
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            lugarId:
              'Seleccione un lugar válido.',
          },
        });
      },
    );

    it(
      'requiere al menos una categoría',
      () => {
        const result =
          validate({
            categoriaIds:
              [],
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            categoriaIds:
              'Seleccione al menos una categoría.',
          },
        });
      },
    );

    it(
      'rechaza categorías duplicadas',
      () => {
        const result =
          validate({
            categoriaIds: [
              41,
              41,
            ],
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            categoriaIds:
              'Las categorías no pueden repetirse.',
          },
        });
      },
    );

    it(
      'rechaza identificadores de categorías inválidos',
      () => {
        const result =
          validate({
            categoriaIds: [
              0,
            ],
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            categoriaIds:
              'Las categorías seleccionadas contienen un identificador inválido.',
          },
        });
      },
    );

    it(
      'acepta descripción y fuente vacías como null',
      () => {
        const result =
          validate({
            descripcion:
              '',
            fuenteInformacion:
              '',
          });

        expect(
          result,
        ).toMatchObject({
          ok: true,
          input: {
            descripcion:
              null,
            fuenteInformacion:
              null,
          },
        });
      },
    );

    it(
      'rechaza fuente mayor a 500 caracteres',
      () => {
        const result =
          validate({
            fuenteInformacion:
              'a'.repeat(
                501,
              ),
          });

        expect(
          result,
        ).toMatchObject({
          ok: false,
          errors: {
            fuenteInformacion:
              'La fuente de información no puede superar los 500 caracteres.',
          },
        });
      },
    );

    it(
      'rechaza descripción o fuente compuestas solo por espacios cuando fueron proporcionadas',
      () => {
        expect(
          validate({
            descripcion:
              '   ',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            descripcion:
              'La descripción no puede contener únicamente espacios.',
          },
        });

        expect(
          validate({
            fuenteInformacion:
              '   ',
          }),
        ).toMatchObject({
          ok: false,
          errors: {
            fuenteInformacion:
              'La fuente de información no puede contener únicamente espacios.',
          },
        });
      },
    );
  },
);
