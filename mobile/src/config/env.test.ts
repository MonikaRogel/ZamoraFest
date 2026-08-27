import { describe, expect, it } from 'vitest';

import { parseApiBaseUrl } from './env';

describe('parseApiBaseUrl', () => {
  it('normaliza un origen HTTP válido', () => {
    expect(
      parseApiBaseUrl('  http://192.168.1.102:3000/  '),
    ).toBe('http://192.168.1.102:3000');
  });

  it('acepta un origen HTTPS válido', () => {
    expect(
      parseApiBaseUrl('https://api.zamorafest.example'),
    ).toBe('https://api.zamorafest.example');
  });

  it('rechaza valores vacíos', () => {
    expect(() => parseApiBaseUrl('   ')).toThrow(
      'VITE_API_BASE_URL es obligatoria.',
    );
  });

  it('rechaza direcciones inválidas', () => {
    expect(() => parseApiBaseUrl('direccion-invalida')).toThrow(
      'VITE_API_BASE_URL debe contener una URL válida.',
    );
  });

  it('rechaza protocolos distintos de HTTP y HTTPS', () => {
    expect(() => parseApiBaseUrl('ftp://localhost:3000')).toThrow(
      'VITE_API_BASE_URL debe utilizar HTTP o HTTPS.',
    );
  });

  it('rechaza credenciales dentro de la dirección', () => {
    expect(() =>
      parseApiBaseUrl('http://usuario:clave@localhost:3000'),
    ).toThrow('VITE_API_BASE_URL no debe incluir credenciales.');
  });

  it.each([
    'http://localhost:3000/api',
    'http://localhost:3000?modo=prueba',
    'http://localhost:3000#seccion',
  ])('rechaza componentes adicionales en %s', (value) => {
    expect(() => parseApiBaseUrl(value)).toThrow(
      'VITE_API_BASE_URL debe contener únicamente el origen de la API.',
    );
  });
});
