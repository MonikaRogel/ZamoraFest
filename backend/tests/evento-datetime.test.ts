import { describe, expect, it } from 'vitest';

import {
  databaseDateToEventoLocalDateTime,
  EVENTO_TIME_ZONE,
  eventoLocalDateTimeToDatabaseDate,
} from '../src/modules/eventos/evento.datetime.js';

describe('T035-A - contrato temporal de eventos', () => {
  it('documenta America/Guayaquil como zona del dominio', () => {
    expect(EVENTO_TIME_ZONE).toBe('America/Guayaquil');
  });

  it('conserva el reloj local sin aplicar el timezone del sistema operativo', () => {
    const result = eventoLocalDateTimeToDatabaseDate('2026-09-05T09:30');

    expect(result.toISOString()).toBe('2026-09-05T09:30:00.000Z');
  });

  it('conserva segundos y milisegundos', () => {
    const result = eventoLocalDateTimeToDatabaseDate('2026-09-05T09:30:45.123');

    expect(result.toISOString()).toBe('2026-09-05T09:30:45.123Z');
  });

  it('rechaza una fecha de calendario inexistente', () => {
    expect(() => eventoLocalDateTimeToDatabaseDate('2026-02-30T10:00')).toThrow(RangeError);
  });

  it('rechaza offset o zona embebida', () => {
    expect(() => eventoLocalDateTimeToDatabaseDate('2026-09-05T09:30:00-05:00')).toThrow(
      RangeError,
    );

    expect(() => eventoLocalDateTimeToDatabaseDate('2026-09-05T14:30:00Z')).toThrow(RangeError);
  });

  it('serializa el timestamp sin Z ni offset', () => {
    const value = new Date('2026-09-05T09:30:45.123Z');

    expect(databaseDateToEventoLocalDateTime(value)).toBe('2026-09-05T09:30:45.123');
  });

  it('mantiene round-trip del reloj local', () => {
    const input = '2026-12-31T23:59:58.007';

    const stored = eventoLocalDateTimeToDatabaseDate(input);

    const output = databaseDateToEventoLocalDateTime(stored);

    expect(output).toBe(input);
  });
});
