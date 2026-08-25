import { describe, expect, it } from 'vitest';

import {
  createProgramacionSchema,
  programacionEventoParamsSchema,
  updateProgramacionSchema,
} from '../src/modules/programaciones/programacion.schemas.js';

describe('T039-A - schemas de programación', () => {
  it('acepta contrato canónico mínimo', () => {
    expect(
      createProgramacionSchema.parse({
        tituloActividad: 'Pregón cultural',
        fechaHoraInicio: '2026-09-05T09:30',
      }),
    ).toEqual({
      tituloActividad: 'Pregón cultural',
      fechaHoraInicio: '2026-09-05T09:30',
    });
  });

  it('acepta lugar opcional nulo', () => {
    const result = createProgramacionSchema.parse({
      tituloActividad: 'Actividad central',
      fechaHoraInicio: '2026-09-05T10:00',
      lugarId: null,
    });

    expect(result.lugarId).toBeNull();
  });

  it('acepta campos opcionales canónicos', () => {
    const result = createProgramacionSchema.parse({
      tituloActividad: 'Concierto',
      descripcion: 'Presentación artística',
      fechaHoraInicio: '2026-09-05T20:00',
      fechaHoraFin: '2026-09-05T23:00',
      lugarId: 7,
      artistaInvitado: 'Artista invitado',
      orden: 3,
    });

    expect(result).toMatchObject({
      lugarId: 7,
      orden: 3,
    });
  });

  it('rechaza fecha local inexistente', () => {
    expect(() =>
      createProgramacionSchema.parse({
        tituloActividad: 'Actividad',
        fechaHoraInicio: '2026-02-30T10:00',
      }),
    ).toThrow();
  });

  it('rechaza zona horaria en fecha funcional', () => {
    expect(() =>
      createProgramacionSchema.parse({
        tituloActividad: 'Actividad',
        fechaHoraInicio: '2026-09-05T10:00Z',
      }),
    ).toThrow();
  });

  it('update no permite payload vacío', () => {
    expect(() => updateProgramacionSchema.parse({})).toThrow();
  });

  it('params convierten evento/programación a INT', () => {
    expect(
      programacionEventoParamsSchema.parse({
        eventoId: '15',
        programacionId: '4',
      }),
    ).toEqual({
      eventoId: 15,
      programacionId: 4,
    });
  });

  it('rechaza identificadores inválidos', () => {
    expect(() =>
      programacionEventoParamsSchema.parse({
        eventoId: '01',
      }),
    ).toThrow();
  });
});
