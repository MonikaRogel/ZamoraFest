import { describe, expect, it } from 'vitest';

import {
  createRecordatorioSchema,
  recordatorioIdParamsSchema,
} from '../src/modules/recordatorios/recordatorio.schemas.js';

describe('T041-A - schemas de recordatorio', () => {
  it('acepta contrato funcional mínimo con IDs INT', () => {
    expect(
      createRecordatorioSchema.parse({
        eventoId: 15,
        fechaNotificacion: '2026-09-05T08:30',
      }),
    ).toEqual({
      eventoId: 15,
      fechaNotificacion: '2026-09-05T08:30',
    });
  });

  it('acepta programación opcional', () => {
    const result = createRecordatorioSchema.parse({
      eventoId: 15,
      programacionId: 4,
      fechaNotificacion: '2026-09-05T08:30',
    });

    expect(result.programacionId).toBe(4);
  });

  it('acepta programación nula', () => {
    const result = createRecordatorioSchema.parse({
      eventoId: 15,
      programacionId: null,
      fechaNotificacion: '2026-09-05T08:30',
    });

    expect(result.programacionId).toBeNull();
  });

  it('rechaza UUID legado para evento', () => {
    expect(() =>
      createRecordatorioSchema.parse({
        eventoId: '00000000-0000-0000-0000-000000000001',
        fechaNotificacion: '2026-09-05T08:30',
      }),
    ).toThrow();
  });

  it('rechaza fecha local inexistente', () => {
    expect(() =>
      createRecordatorioSchema.parse({
        eventoId: 15,
        fechaNotificacion: '2026-02-30T08:30',
      }),
    ).toThrow();
  });

  it('rechaza timezone en timestamp funcional', () => {
    expect(() =>
      createRecordatorioSchema.parse({
        eventoId: 15,
        fechaNotificacion: '2026-09-05T08:30Z',
      }),
    ).toThrow();
  });

  it('no permite usuario ni activo desde body', () => {
    expect(() =>
      createRecordatorioSchema.parse({
        eventoId: 15,
        fechaNotificacion: '2026-09-05T08:30',
        idUsuario: 999,
        activo: false,
      }),
    ).toThrow();
  });

  it('params convierten id a INT', () => {
    expect(
      recordatorioIdParamsSchema.parse({
        id: '9',
      }),
    ).toEqual({
      id: 9,
    });

    expect(() =>
      recordatorioIdParamsSchema.parse({
        id: '09',
      }),
    ).toThrow();
  });
});
