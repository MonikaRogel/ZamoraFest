import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { programacionRepository } from '../src/modules/programaciones/programacion.repository.js';
import { programacionService } from '../src/modules/programaciones/programacion.service.js';

const asistente: IdentidadAcceso = {
  id: 20,
  rol: 'ASISTENTE',
};

const administrador: IdentidadAcceso = {
  id: 1,
  rol: 'ADMINISTRADOR',
};

function buildEvento(
  options: {
    creadorId?: number;
    estadoEvento?: string;
    estadoRevision?: string;
  } = {},
) {
  return {
    id: 15,
    estadoEvento: options.estadoEvento ?? 'BORRADOR',
    estadoRevision: options.estadoRevision ?? 'PENDIENTE',
    usuarioCreador: {
      id: options.creadorId ?? 20,
    },
  } as never;
}

function buildProgramacion() {
  return {
    id: 4,
    idEvento: 15,
    idLugar: 7,
    tituloActividad: 'Pregón cultural',
    descripcion: null,
    fechaHoraInicio: new Date('2026-09-05T09:30:00.000Z'),
    fechaHoraFin: new Date('2026-09-05T11:00:00.000Z'),
    artistaInvitado: null,
    orden: 1,
    estado: true,
    lugar: {
      id: 7,
      nombre: 'Parque Central',
    },
  } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('T039-B - servicio de programación', () => {
  it('lista programación solo después de validar evento público', async () => {
    const eventSpy = vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    const listSpy = vi
      .spyOn(programacionRepository, 'listByEvent')
      .mockResolvedValue([buildProgramacion()]);

    const result = await programacionService.listPublic(15);

    expect(eventSpy).toHaveBeenCalledWith(15, 'basic');

    expect(listSpy).toHaveBeenCalledWith(15);

    expect(result).toHaveLength(1);
  });

  it('GET individual exige programación perteneciente al evento', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    const findSpy = vi
      .spyOn(programacionRepository, 'findByIdForEvent')
      .mockResolvedValue(buildProgramacion());

    const result = await programacionService.getPublic(15, 4);

    expect(findSpy).toHaveBeenCalledWith(15, 4);

    expect(result).toMatchObject({
      id: 4,
      eventoId: 15,
    });
  });

  it('ASISTENTE crea programación de su propio BORRADOR y valida lugar activo', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const lugarSpy = vi.spyOn(programacionRepository, 'findActiveLugar').mockResolvedValue({
      id: 7,
    });

    const createSpy = vi
      .spyOn(programacionRepository, 'create')
      .mockResolvedValue(buildProgramacion());

    await programacionService.create(15, asistente, {
      tituloActividad: 'Pregón cultural',
      fechaHoraInicio: '2026-09-05T09:30',
      fechaHoraFin: '2026-09-05T11:00',
      lugarId: 7,
    });

    expect(lugarSpy).toHaveBeenCalledWith(7);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        idEvento: 15,
        idLugar: 7,
        tituloActividad: 'Pregón cultural',
        fechaHoraInicio: new Date('2026-09-05T09:30:00.000Z'),
        fechaHoraFin: new Date('2026-09-05T11:00:00.000Z'),
      }),
    );
  });

  it('lugar null usa lugar principal y no consulta lugar alterno', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const lugarSpy = vi.spyOn(programacionRepository, 'findActiveLugar');

    const createSpy = vi
      .spyOn(programacionRepository, 'create')
      .mockResolvedValue(buildProgramacion());

    await programacionService.create(15, asistente, {
      tituloActividad: 'Actividad',
      fechaHoraInicio: '2026-09-05T10:00',
      lugarId: null,
    });

    expect(lugarSpy).not.toHaveBeenCalled();

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        idEvento: 15,
        idLugar: null,
      }),
    );
  });

  it('rechaza lugar alterno inexistente o inactivo', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    vi.spyOn(programacionRepository, 'findActiveLugar').mockResolvedValue(null);

    const createSpy = vi.spyOn(programacionRepository, 'create');

    await expect(
      programacionService.create(15, asistente, {
        tituloActividad: 'Actividad',
        fechaHoraInicio: '2026-09-05T10:00',
        lugarId: 999,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'LUGAR_NOT_FOUND',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rechaza fin anterior al inicio', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const createSpy = vi.spyOn(programacionRepository, 'create');

    await expect(
      programacionService.create(15, asistente, {
        tituloActividad: 'Actividad',
        fechaHoraInicio: '2026-09-05T12:00',
        fechaHoraFin: '2026-09-05T11:00',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_PROGRAM_SCHEDULE_RANGE',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('ASISTENTE no administra programación de evento ajeno', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        creadorId: 99,
      }),
    );

    const createSpy = vi.spyOn(programacionRepository, 'create');

    await expect(
      programacionService.create(15, asistente, {
        tituloActividad: 'Actividad',
        fechaHoraInicio: '2026-09-05T10:00',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('update exige programación perteneciente al evento y valida fechas combinadas', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const findSpy = vi
      .spyOn(programacionRepository, 'findByIdForEvent')
      .mockResolvedValue(buildProgramacion());

    const updateSpy = vi
      .spyOn(programacionRepository, 'update')
      .mockResolvedValue(buildProgramacion());

    await programacionService.update(15, 4, asistente, {
      fechaHoraFin: '2026-09-05T12:00',
    });

    expect(findSpy).toHaveBeenCalledWith(15, 4);

    expect(updateSpy).toHaveBeenCalledWith(4, {
      fechaHoraFin: new Date('2026-09-05T12:00:00.000Z'),
    });
  });

  it('update rechaza programación que no pertenece al evento', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    vi.spyOn(programacionRepository, 'findByIdForEvent').mockResolvedValue(null);

    const updateSpy = vi.spyOn(programacionRepository, 'update');

    await expect(
      programacionService.update(15, 999, asistente, {
        tituloActividad: 'Cambio',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROGRAMACION_NOT_FOUND',
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('DELETE desactiva solo programación perteneciente al evento', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    vi.spyOn(programacionRepository, 'findByIdForEvent').mockResolvedValue(buildProgramacion());

    const deleteSpy = vi.spyOn(programacionRepository, 'deactivate').mockResolvedValue({
      count: 1,
    });

    await programacionService.remove(15, 4, asistente);

    expect(deleteSpy).toHaveBeenCalledWith(15, 4);
  });

  it('ADMINISTRADOR puede administrar programación sin ser creador', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        creadorId: 99,
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    vi.spyOn(programacionRepository, 'findByIdForEvent').mockResolvedValue(buildProgramacion());

    const deleteSpy = vi.spyOn(programacionRepository, 'deactivate').mockResolvedValue({
      count: 1,
    });

    await programacionService.remove(15, 4, administrador);

    expect(deleteSpy).toHaveBeenCalledWith(15, 4);
  });
});
