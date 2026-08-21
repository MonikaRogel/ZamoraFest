import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { recordatorioRepository } from '../src/modules/recordatorios/recordatorio.repository.js';
import { recordatorioService } from '../src/modules/recordatorios/recordatorio.service.js';

const visitante: IdentidadAcceso = {
  id: 20,
  rol: 'VISITANTE',
};

function buildEventoPublico() {
  return {
    id: 15,
    estadoEvento: 'PROGRAMADO',
    estadoRevision: 'APROBADO',
  } as never;
}

function buildRecordatorio(
  options: {
    idUsuario?: number;
    idProgramacion?: number | null;
    activo?: boolean;
  } = {},
) {
  const idProgramacion = options.idProgramacion === undefined ? 4 : options.idProgramacion;

  return {
    id: 9,
    idUsuario: options.idUsuario ?? 20,
    idEvento: 15,
    idProgramacion,
    fechaNotificacion: new Date('2026-09-05T08:30:00.000Z'),
    activo: options.activo ?? true,
    fechaCreacion: new Date('2026-08-20T21:10:00.000Z'),
    evento: {
      id: 15,
      titulo: 'Festival cultural',
      fechaInicio: new Date('2026-09-05T09:30:00.000Z'),
      fechaFin: null,
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
    },
    programacion:
      idProgramacion === null
        ? null
        : {
            id: idProgramacion,
            idEvento: 15,
            tituloActividad: 'Pregón cultural',
            fechaHoraInicio: new Date('2026-09-05T09:30:00.000Z'),
            fechaHoraFin: null,
            estado: true,
          },
  } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('T041-B - servicio funcional de recordatorios', () => {
  it('crea recordatorio para evento público con usuario autenticado', async () => {
    const eventSpy = vi
      .spyOn(eventoRepository, 'findPublicById')
      .mockResolvedValue(buildEventoPublico());

    const createSpy = vi.spyOn(recordatorioRepository, 'create').mockResolvedValue(
      buildRecordatorio({
        idProgramacion: null,
      }),
    );

    const result = await recordatorioService.create(visitante, {
      eventoId: 15,
      fechaNotificacion: '2026-09-05T08:30',
    });

    expect(eventSpy).toHaveBeenCalledWith(15, 'basic');

    expect(createSpy).toHaveBeenCalledTimes(1);

    const persisted = createSpy.mock.calls[0]?.[0];

    expect(persisted?.idUsuario).toBe(20);

    expect(persisted?.idEvento).toBe(15);

    expect(persisted?.fechaNotificacion).toEqual(new Date('2026-09-05T08:30:00.000Z'));

    expect(result).toMatchObject({
      id: 9,
      eventoId: 15,
      activo: true,
    });
  });

  it('rechaza evento que no sea público', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(null);

    const createSpy = vi.spyOn(recordatorioRepository, 'create');

    await expect(
      recordatorioService.create(visitante, {
        eventoId: 999,
        fechaNotificacion: '2026-09-05T08:30',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'EVENTO_NOT_FOUND',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('valida programación opcional contra el mismo evento', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(buildEventoPublico());

    const programSpy = vi
      .spyOn(recordatorioRepository, 'findActiveProgramacionForEvent')
      .mockResolvedValue({
        id: 4,
        idEvento: 15,
      });

    const createSpy = vi
      .spyOn(recordatorioRepository, 'create')
      .mockResolvedValue(buildRecordatorio());

    await recordatorioService.create(visitante, {
      eventoId: 15,
      programacionId: 4,
      fechaNotificacion: '2026-09-05T08:30',
    });

    expect(programSpy).toHaveBeenCalledWith(15, 4);

    expect(createSpy.mock.calls[0]?.[0]?.idProgramacion).toBe(4);
  });

  it('rechaza programación ajena o inactiva', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(buildEventoPublico());

    vi.spyOn(recordatorioRepository, 'findActiveProgramacionForEvent').mockResolvedValue(null);

    const createSpy = vi.spyOn(recordatorioRepository, 'create');

    await expect(
      recordatorioService.create(visitante, {
        eventoId: 15,
        programacionId: 999,
        fechaNotificacion: '2026-09-05T08:30',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROGRAMACION_NOT_FOUND',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('programación nula no dispara validación de programación', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(buildEventoPublico());

    const programSpy = vi.spyOn(recordatorioRepository, 'findActiveProgramacionForEvent');

    const createSpy = vi.spyOn(recordatorioRepository, 'create').mockResolvedValue(
      buildRecordatorio({
        idProgramacion: null,
      }),
    );

    await recordatorioService.create(visitante, {
      eventoId: 15,
      programacionId: null,
      fechaNotificacion: '2026-09-05T08:30',
    });

    expect(programSpy).not.toHaveBeenCalled();

    expect(createSpy.mock.calls[0]?.[0]?.idProgramacion).toBeNull();
  });

  it('lista solo recordatorios propios', async () => {
    const listSpy = vi
      .spyOn(recordatorioRepository, 'listByUser')
      .mockResolvedValue([buildRecordatorio()]);

    const result = await recordatorioService.listOwn(visitante);

    expect(listSpy).toHaveBeenCalledWith(20);

    expect(result).toHaveLength(1);
  });

  it('GET exige propiedad del usuario', async () => {
    const findSpy = vi
      .spyOn(recordatorioRepository, 'findByIdForUser')
      .mockResolvedValue(buildRecordatorio());

    const result = await recordatorioService.getOwn(visitante, 9);

    expect(findSpy).toHaveBeenCalledWith(9, 20);

    expect(result.id).toBe(9);
  });

  it('GET no expone recordatorio de otro usuario', async () => {
    vi.spyOn(recordatorioRepository, 'findByIdForUser').mockResolvedValue(null);

    await expect(recordatorioService.getOwn(visitante, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: 'RECORDATORIO_NOT_FOUND',
    });
  });

  it('desactiva únicamente recordatorio propio activo', async () => {
    vi.spyOn(recordatorioRepository, 'findByIdForUser').mockResolvedValue(buildRecordatorio());

    const deactivateSpy = vi.spyOn(recordatorioRepository, 'deactivateOwn').mockResolvedValue({
      count: 1,
    });

    await recordatorioService.deactivateOwn(visitante, 9);

    expect(deactivateSpy).toHaveBeenCalledWith(9, 20);
  });

  it('rechaza desactivación de recordatorio ajeno', async () => {
    vi.spyOn(recordatorioRepository, 'findByIdForUser').mockResolvedValue(null);

    const deactivateSpy = vi.spyOn(recordatorioRepository, 'deactivateOwn');

    await expect(recordatorioService.deactivateOwn(visitante, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: 'RECORDATORIO_NOT_FOUND',
    });

    expect(deactivateSpy).not.toHaveBeenCalled();
  });

  it('mantiene semántica activo y rechaza doble desactivación', async () => {
    vi.spyOn(recordatorioRepository, 'findByIdForUser').mockResolvedValue(
      buildRecordatorio({
        activo: false,
      }),
    );

    const deactivateSpy = vi.spyOn(recordatorioRepository, 'deactivateOwn');

    await expect(recordatorioService.deactivateOwn(visitante, 9)).rejects.toMatchObject({
      statusCode: 409,
      code: 'RECORDATORIO_ALREADY_INACTIVE',
    });

    expect(deactivateSpy).not.toHaveBeenCalled();
  });
});
