import { describe, expect, it } from 'vitest';

import {
  createImagenSchema,
  imagenEventoParamsSchema,
} from '../src/modules/imagenes/imagen.schemas.js';

describe('T040-A - schemas de imágenes', () => {
  it('acepta contrato canónico mínimo', () => {
    expect(
      createImagenSchema.parse({
        urlImagen: 'https://example.com/evento.jpg',
        tipoImagen: 'FOTOGRAFIA',
      }),
    ).toEqual({
      urlImagen: 'https://example.com/evento.jpg',
      tipoImagen: 'FOTOGRAFIA',
      esPrincipal: false,
    });
  });

  it('acepta programación opcional nula', () => {
    const result = createImagenSchema.parse({
      urlImagen: 'https://example.com/afiche.jpg',
      tipoImagen: 'AFICHE',
      programacionId: null,
    });

    expect(result.programacionId).toBeNull();
  });

  it('acepta programación y principal', () => {
    const result = createImagenSchema.parse({
      urlImagen: 'https://example.com/principal.jpg',
      tipoImagen: 'AFICHE',
      programacionId: 4,
      esPrincipal: true,
    });

    expect(result).toMatchObject({
      programacionId: 4,
      esPrincipal: true,
    });
  });

  it('acepta solo dominios de tipo imagen', () => {
    expect(() =>
      createImagenSchema.parse({
        urlImagen: 'https://example.com/x.jpg',
        tipoImagen: 'PORTADA',
      }),
    ).toThrow();
  });

  it('rechaza URL que no sea HTTP o HTTPS', () => {
    expect(() =>
      createImagenSchema.parse({
        urlImagen: 'ftp://example.com/x.jpg',
        tipoImagen: 'FOTOGRAFIA',
      }),
    ).toThrow();
  });

  it('no acepta evento ni usuario desde body', () => {
    expect(() =>
      createImagenSchema.parse({
        urlImagen: 'https://example.com/x.jpg',
        tipoImagen: 'FOTOGRAFIA',
        eventoId: 15,
        usuarioId: 999,
      }),
    ).toThrow();
  });

  it('params convierten evento e imagen a INT', () => {
    expect(
      imagenEventoParamsSchema.parse({
        eventoId: '15',
        imagenId: '9',
      }),
    ).toEqual({
      eventoId: 15,
      imagenId: 9,
    });
  });

  it('rechaza identificadores inválidos', () => {
    expect(() =>
      imagenEventoParamsSchema.parse({
        eventoId: '01',
      }),
    ).toThrow();
  });
});
