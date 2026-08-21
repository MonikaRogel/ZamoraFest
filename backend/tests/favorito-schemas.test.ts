import { describe, expect, it } from 'vitest';

import {
  createFavoritoSchema,
  favoritoEventoParamsSchema,
} from '../src/modules/favoritos/favorito.schemas.js';

describe('T038 - schemas de favoritos', () => {
  it('acepta eventoId entero válido', () => {
    expect(
      createFavoritoSchema.parse({
        eventoId: 100,
      }),
    ).toEqual({
      eventoId: 100,
    });
  });

  it('no permite enviar idUsuario desde el cliente', () => {
    expect(() =>
      createFavoritoSchema.parse({
        eventoId: 100,
        idUsuario: 999,
      }),
    ).toThrow();
  });

  it('convierte eventoId del path a INT', () => {
    expect(
      favoritoEventoParamsSchema.parse({
        eventoId: '100',
      }),
    ).toEqual({
      eventoId: 100,
    });
  });

  it('rechaza identificadores inválidos', () => {
    expect(() =>
      createFavoritoSchema.parse({
        eventoId: 0,
      }),
    ).toThrow();

    expect(() =>
      favoritoEventoParamsSchema.parse({
        eventoId: '01',
      }),
    ).toThrow();
  });
});
