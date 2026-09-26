import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  IdentidadAcceso,
} from '../src/modules/auth/auth.service.js';
import {
  eventoRepository,
} from '../src/modules/eventos/evento.repository.js';
import {
  eventoService,
} from '../src/modules/eventos/evento.service.js';

const asistente:
  IdentidadAcceso = {
    id: 7,
    rol:
      'ASISTENTE',
  };

const administrador:
  IdentidadAcceso = {
    id: 1,
    rol:
      'ADMINISTRADOR',
  };

afterEach(
  () => {
    vi.restoreAllMocks();
  },
);

describe(
  'Listado de eventos propios del ASISTENTE',
  () => {
    it(
      'consulta únicamente los eventos del usuario autenticado y devuelve metadatos de paginación',
      async () => {
        const listSpy =
          vi.spyOn(
            eventoRepository,
            'listByCreator',
          )
            .mockResolvedValue({
              total:
                25,
              eventos:
                [],
            });

        const result =
          await eventoService
            .listOwn(
              asistente,
              {
                page:
                  2,
                limit:
                  20,
              },
            );

        expect(
          listSpy,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          listSpy,
        ).toHaveBeenCalledWith(
          7,
          2,
          20,
        );

        expect(
          result,
        ).toEqual({
          data:
            [],
          meta: {
            page:
              2,
            limit:
              20,
            total:
              25,
            totalPages:
              2,
          },
        });
      },
    );

    it(
      'rechaza la consulta de eventos propios para un rol distinto de ASISTENTE',
      async () => {
        const listSpy =
          vi.spyOn(
            eventoRepository,
            'listByCreator',
          );

        await expect(
          eventoService
            .listOwn(
              administrador,
              {
                page:
                  1,
                limit:
                  20,
              },
            ),
        ).rejects.toMatchObject({
          statusCode:
            403,
          code:
            'FORBIDDEN',
        });

        expect(
          listSpy,
        ).not.toHaveBeenCalled();
      },
    );
  },
);