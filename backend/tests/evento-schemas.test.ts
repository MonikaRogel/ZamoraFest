import { describe, expect, it } from 'vitest';

import {
  createEventoSchema,
  eventoIdParamsSchema,
  updateEventoSchema,
} from '../src/modules/eventos/evento.schemas.js';

const eventoValido = {
  titulo: 'Festival Cultural de Zamora',
  descripcion: 'Encuentro cultural de la provincia.',
  fechaInicio: '2026-09-05T09:00:00',
  fechaFin: '2026-09-05T18:30:00',
  costoReferencial: 0,
  lugarId: 1,
  categoriaIds: [1, 2],
  fuenteInformacion: 'Dirección de Cultura',
};

describe('T033 - createEventoSchema', () => {
  it('acepta el contrato canónico mínimo', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'Festival de Zamora',
      fechaInicio: '2026-09-05T09:00',
      costoReferencial: 0,
      lugarId: 1,
      categoriaIds: [1],
    });

    expect(result.success).toBe(true);
  });

  it('acepta campos opcionales nulos', () => {
    const result = createEventoSchema.safeParse({
      ...eventoValido,
      descripcion: null,
      fechaFin: null,
      fuenteInformacion: null,
    });

    expect(result.success).toBe(true);
  });

  it('rechaza UUID y exige IDs INT positivos', () => {
    const lugarUuid = createEventoSchema.safeParse({
      ...eventoValido,
      lugarId: '550e8400-e29b-41d4-a716-446655440000',
    });

    const categoriaUuid = createEventoSchema.safeParse({
      ...eventoValido,
      categoriaIds: ['550e8400-e29b-41d4-a716-446655440000'],
    });

    const zero = createEventoSchema.safeParse({
      ...eventoValido,
      lugarId: 0,
    });

    expect(lugarUuid.success).toBe(false);

    expect(categoriaUuid.success).toBe(false);

    expect(zero.success).toBe(false);
  });

  it('rechaza categorías duplicadas', () => {
    const result = createEventoSchema.safeParse({
      ...eventoValido,
      categoriaIds: [1, 1],
    });

    expect(result.success).toBe(false);
  });

  it('rechaza fecha inexistente o con zona embebida', () => {
    const invalidCalendar = createEventoSchema.safeParse({
      ...eventoValido,
      fechaInicio: '2026-02-30T10:00:00',
    });

    const withOffset = createEventoSchema.safeParse({
      ...eventoValido,
      fechaInicio: '2026-09-05T09:00:00-05:00',
    });

    expect(invalidCalendar.success).toBe(false);

    expect(withOffset.success).toBe(false);
  });

  it('rechaza fechaFin anterior a fechaInicio', () => {
    const result = createEventoSchema.safeParse({
      ...eventoValido,
      fechaInicio: '2026-09-05T18:00:00',
      fechaFin: '2026-09-05T17:59:59',
    });

    expect(result.success).toBe(false);
  });

  it('acepta fechaFin igual a fechaInicio', () => {
    const result = createEventoSchema.safeParse({
      ...eventoValido,
      fechaInicio: '2026-09-05T18:00:00',
      fechaFin: '2026-09-05T18:00:00',
    });

    expect(result.success).toBe(true);
  });

  it('valida DECIMAL(10,2) no negativo', () => {
    const negative = createEventoSchema.safeParse({
      ...eventoValido,
      costoReferencial: -0.01,
    });

    const decimals = createEventoSchema.safeParse({
      ...eventoValido,
      costoReferencial: 12.345,
    });

    const overflow = createEventoSchema.safeParse({
      ...eventoValido,
      costoReferencial: 100_000_000,
    });

    expect(negative.success).toBe(false);

    expect(decimals.success).toBe(false);

    expect(overflow.success).toBe(false);
  });

  it.each([
    ['idUsuarioCreador', 7],
    ['idUsuarioRevisor', 8],
    ['estadoEvento', 'PROGRAMADO'],
    ['estadoRevision', 'APROBADO'],
    ['fechaRevision', '2026-09-05T12:00:00'],
    ['estado', 'PUBLICADO'],
  ])('rechaza el campo controlado %s', (field, value) => {
    const result = createEventoSchema.safeParse({
      ...eventoValido,
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});

describe('T033 - updateEventoSchema', () => {
  it('acepta actualización parcial de contenido', () => {
    const result = updateEventoSchema.safeParse({
      titulo: 'Nuevo título del evento',
      costoReferencial: 5.5,
      lugarId: 2,
      categoriaIds: [2, 3],
    });

    expect(result.success).toBe(true);
  });

  it('permite limpiar campos opcionales con null', () => {
    const result = updateEventoSchema.safeParse({
      descripcion: null,
      fechaFin: null,
      fuenteInformacion: null,
    });

    expect(result.success).toBe(true);
  });

  it('rechaza body vacío', () => {
    expect(updateEventoSchema.safeParse({}).success).toBe(false);
  });

  it('valida rango cuando ambas fechas vienen en el PATCH', () => {
    const result = updateEventoSchema.safeParse({
      fechaInicio: '2026-10-10T12:00:00',
      fechaFin: '2026-10-10T11:59:59',
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ['idUsuarioCreador', 7],
    ['idUsuarioRevisor', 8],
    ['estadoEvento', 'PROGRAMADO'],
    ['estadoRevision', 'APROBADO'],
    ['fechaRevision', '2026-09-05T12:00:00'],
    ['estado', 'PUBLICADO'],
  ])('no acepta modificación directa del campo %s', (field, value) => {
    const result = updateEventoSchema.safeParse({
      titulo: 'Cambio permitido',
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});

describe('T033 - eventoIdParamsSchema', () => {
  it('convierte el parámetro HTTP entero a number', () => {
    const result = eventoIdParamsSchema.parse({
      id: '42',
    });

    expect(result.id).toBe(42);
  });

  it('rechaza UUID, cero y valores decimales', () => {
    const values = ['550e8400-e29b-41d4-a716-446655440000', '0', '1.5'];

    for (const id of values) {
      expect(
        eventoIdParamsSchema.safeParse({
          id,
        }).success,
      ).toBe(false);
    }
  });
});
describe('T033 - limites PostgreSQL INT', () => {
  it('rechaza IDs de body fuera del rango INTEGER de PostgreSQL', () => {
    const lugarFueraDeRango = createEventoSchema.safeParse({
      ...eventoValido,
      lugarId: 2_147_483_648,
    });

    const categoriaFueraDeRango = createEventoSchema.safeParse({
      ...eventoValido,
      categoriaIds: [2_147_483_648],
    });

    expect(lugarFueraDeRango.success).toBe(false);

    expect(categoriaFueraDeRango.success).toBe(false);
  });

  it('acepta solo representación decimal válida dentro del rango en params', () => {
    const maximo = eventoIdParamsSchema.parse({
      id: '2147483647',
    });

    expect(maximo.id).toBe(2_147_483_647);

    const invalidos = ['2147483648', '1e2', '+42', '-1', ' 42 ', '01'];

    for (const id of invalidos) {
      expect(
        eventoIdParamsSchema.safeParse({
          id,
        }).success,
      ).toBe(false);
    }
  });
});
