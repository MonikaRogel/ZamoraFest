import { describe, expect, it } from 'vitest';

import {
  buildLoginRedirect,
  resolvePostLoginDestination,
  sanitizeInternalAppDestination,
  sanitizeProtectedDestination,
} from './route-security';

describe('route-security', () => {
  it('acepta una ruta interna reconocida', () => {
    expect(
      sanitizeInternalAppDestination(
        '/gestion/eventos/nuevo',
      ),
    ).toBe('/gestion/eventos/nuevo');
  });

  it('conserva query y hash de una ruta interna reconocida', () => {
    expect(
      sanitizeInternalAppDestination(
        '/gestion?seccion=eventos#inicio',
      ),
    ).toBe('/gestion?seccion=eventos#inicio');
  });

  it('rechaza una URL externa absoluta', () => {
    expect(
      sanitizeInternalAppDestination(
        'https://malicioso.example/gestion',
      ),
    ).toBeNull();
  });

  it('rechaza una URL externa protocol-relative', () => {
    expect(
      sanitizeInternalAppDestination(
        '//malicioso.example/gestion',
      ),
    ).toBeNull();
  });

  it('rechaza una ruta interna no reconocida', () => {
    expect(
      sanitizeInternalAppDestination(
        '/ruta-inexistente',
      ),
    ).toBeNull();
  });

  it('acepta únicamente destinos protegidos como retorno de login', () => {
    expect(
      sanitizeProtectedDestination(
        '/gestion/eventos/nuevo',
      ),
    ).toBe('/gestion/eventos/nuevo');

    expect(
      sanitizeProtectedDestination('/explore'),
    ).toBeNull();
  });

  it('construye el redirect codificado requerido por el mapa de rutas', () => {
    expect(
      buildLoginRedirect(
        '/gestion/eventos/nuevo',
      ),
    ).toBe(
      '/login?redirect=%2Fgestion%2Feventos%2Fnuevo',
    );
  });

  it('utiliza una ruta pública segura si el retorno es inválido', () => {
    expect(
      resolvePostLoginDestination(
        'https://malicioso.example',
      ),
    ).toBe('/explore');
  });
});
