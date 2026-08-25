import { describe, expect, it } from 'vitest';

import {
  EVENTO_TIME_ZONE,
  eventoInstantToDatabaseDate,
} from '../src/modules/eventos/evento.datetime.js';
import { reviewEventoSchema } from '../src/modules/eventos/evento.schemas.js';

describe('T035-D1 - contratos de revisión', () => {
  it('acepta APROBAR y RECHAZAR', () => {
    expect(
      reviewEventoSchema.parse({
        decision: 'APROBAR',
      }),
    ).toEqual({
      decision: 'APROBAR',
    });

    expect(
      reviewEventoSchema.parse({
        decision: 'RECHAZAR',
      }),
    ).toEqual({
      decision: 'RECHAZAR',
    });
  });

  it('rechaza decisiones fuera del dominio', () => {
    expect(() =>
      reviewEventoSchema.parse({
        decision: 'PENDIENTE',
      }),
    ).toThrow();
  });

  it('rechaza campos arbitrarios en revisión', () => {
    expect(() =>
      reviewEventoSchema.parse({
        decision: 'APROBAR',
        estadoEvento: 'PROGRAMADO',
      }),
    ).toThrow();
  });

  it('genera fecha de revisión con reloj America/Guayaquil', () => {
    expect(EVENTO_TIME_ZONE).toBe('America/Guayaquil');

    const instant = new Date('2026-08-21T00:48:15.123Z');

    expect(eventoInstantToDatabaseDate(instant).toISOString()).toBe('2026-08-20T19:48:15.123Z');
  });
});
