import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const {
  prismaMock,
} = vi.hoisted(
  () => ({
    prismaMock: {
      evento: {
        count:
          vi.fn(),
        findMany:
          vi.fn(),
      },

      $transaction:
        vi.fn(),
    },
  }),
);

vi.mock(
  '../src/infrastructure/database/prisma.js',
  () => ({
    prisma:
      prismaMock,
  }),
);

import {
  eventoRepository,
} from '../src/modules/eventos/evento.repository.js';

function prepareListMocks(): void {
  prismaMock.evento.count
    .mockReturnValue(
      Promise.resolve(
        2,
      ),
    );

  prismaMock.evento.findMany
    .mockReturnValue(
      Promise.resolve(
        [],
      ),
    );

  prismaMock.$transaction
    .mockImplementation(
      async (
        operations:
          unknown,
      ) => {
        if (
          !Array.isArray(
            operations,
          )
        ) {
          throw new Error(
            'La prueba esperaba una transacción por lote.',
          );
        }

        return Promise.all(
          operations,
        );
      },
    );
}

describe(
  'Listado de eventos propios',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();
      },
    );

    it(
      'filtra por creador, excluye eliminados y aplica paginación',
      async () => {
        prepareListMocks();

        const result =
          await eventoRepository
            .listByCreator(
              10,
              2,
              20,
            );

        expect(
          prismaMock
            .evento
            .count,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          prismaMock
            .evento
            .findMany,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          prismaMock
            .$transaction,
        ).toHaveBeenCalledTimes(
          1,
        );

        const countArgs =
          prismaMock
            .evento
            .count
            .mock
            .calls[0]?.[0] as
            | Record<
                string,
                unknown
              >
            | undefined;

        expect(
          countArgs,
        ).toHaveProperty(
          'where.idUsuarioCreador',
          10,
        );

        expect(
          countArgs,
        ).toHaveProperty(
          'where.estadoEvento.not',
          'ELIMINADO',
        );

        const findManyArgs =
          prismaMock
            .evento
            .findMany
            .mock
            .calls[0]?.[0] as
            | Record<
                string,
                unknown
              >
            | undefined;

        expect(
          findManyArgs,
        ).toHaveProperty(
          'where.idUsuarioCreador',
          10,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'where.estadoEvento.not',
          'ELIMINADO',
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'skip',
          20,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'take',
          20,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'orderBy',
          [
            {
              fechaCreacion:
                'desc',
            },
            {
              id:
                'desc',
            },
          ],
        );

        expect(
          result,
        ).toEqual({
          total:
            2,

          eventos:
            [],
        });
      },
    );

    it(
      'mantiene la consulta en nivel basic sin cargar programación ni imágenes',
      async () => {
        prepareListMocks();

        await eventoRepository
          .listByCreator(
            10,
            1,
            10,
          );

        const findManyArgs =
          prismaMock
            .evento
            .findMany
            .mock
            .calls[0]?.[0] as
            | Record<
                string,
                unknown
              >
            | undefined;

        expect(
          findManyArgs,
        ).toHaveProperty(
          'select.id',
          true,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'select.titulo',
          true,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'select.estadoEvento',
          true,
        );

        expect(
          findManyArgs,
        ).toHaveProperty(
          'select.estadoRevision',
          true,
        );

        expect(
          findManyArgs,
        ).not.toHaveProperty(
          'select.programaciones',
        );

        expect(
          findManyArgs,
        ).not.toHaveProperty(
          'select.imagenes',
        );
      },
    );
  },
);