import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  listOwnEventosQuerySchema,
} from '../src/modules/eventos/evento.schemas.js';

describe(
  'Contrato HTTP de Mis eventos',
  () => {
    it(
      'aplica paginación predeterminada',
      () => {
        const result =
          listOwnEventosQuerySchema
            .parse({});

        expect(
          result,
        ).toEqual({
          page:
            1,
          limit:
            20,
        });
      },
    );

    it(
      'convierte page y limit desde query string',
      () => {
        const result =
          listOwnEventosQuerySchema
            .parse({
              page:
                '2',
              limit:
                '15',
            });

        expect(
          result,
        ).toEqual({
          page:
            2,
          limit:
            15,
        });
      },
    );

    it(
      'rechaza páginas menores que uno',
      () => {
        expect(
          () =>
            listOwnEventosQuerySchema
              .parse({
                page:
                  '0',
              }),
        ).toThrow();
      },
    );

    it(
      'rechaza límites superiores a cincuenta',
      () => {
        expect(
          () =>
            listOwnEventosQuerySchema
              .parse({
                limit:
                  '51',
              }),
        ).toThrow();
      },
    );

    it(
      'rechaza filtros propios del listado público',
      () => {
        expect(
          () =>
            listOwnEventosQuerySchema
              .parse({
                cantonId:
                  '1',
              }),
        ).toThrow();

        expect(
          () =>
            listOwnEventosQuerySchema
              .parse({
                categoriaId:
                  '2',
              }),
        ).toThrow();
      },
    );
  },
);