import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { imagenRepository } from '../src/modules/imagenes/imagen.repository.js';
import { imagenService } from '../src/modules/imagenes/imagen.service.js';

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

function buildImagen(
  options: {
    idProgramacion?: number | null;
    esPrincipal?: boolean;
  } = {},
) {
  const idProgramacion = options.idProgramacion === undefined ? 4 : options.idProgramacion;

  return {
    id: 9,
    idEvento: 15,
    idProgramacion,
    idUsuarioSubida: 20,
    urlImagen: 'https://example.com/evento.jpg',
    tipoImagen: 'FOTOGRAFIA',
    descripcion: null,
    esPrincipal: options.esPrincipal ?? false,
    fechaSubida: new Date('2026-08-20T20:50:00.000Z'),
    estado: true,
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
    usuarioSubida: {
      id: 20,
      nombreCompleto: 'Asistente de prueba',
      rol: {
        nombre: 'ASISTENTE',
      },
    },
  } as never;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('T040-B - servicio de imágenes', () => {
  it('lista imágenes únicamente después de validar evento público', async () => {
    const eventSpy = vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    const listSpy = vi.spyOn(imagenRepository, 'listByEvent').mockResolvedValue([buildImagen()]);

    const result = await imagenService.listPublic(15);

    expect(eventSpy).toHaveBeenCalledWith(15, 'basic');

    expect(listSpy).toHaveBeenCalledWith(15);

    expect(result).toHaveLength(1);
  });

  it('GET individual exige imagen perteneciente al evento', async () => {
    vi.spyOn(eventoRepository, 'findPublicById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    const findSpy = vi.spyOn(imagenRepository, 'findByIdForEvent').mockResolvedValue(buildImagen());

    const result = await imagenService.getPublic(15, 9);

    expect(findSpy).toHaveBeenCalledWith(15, 9);

    expect(result).toMatchObject({
      id: 9,
      eventoId: 15,
    });
  });

  it('registra usuario autenticado y valida programación del mismo evento', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T01:50:00.000Z'));

    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const programSpy = vi
      .spyOn(imagenRepository, 'findActiveProgramacionForEvent')
      .mockResolvedValue({
        id: 4,
        idEvento: 15,
      });

    const createSpy = vi.spyOn(imagenRepository, 'create').mockResolvedValue(buildImagen());

    const invalidateSpy = vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await imagenService.create(15, asistente, {
      urlImagen: 'https://example.com/evento.jpg',
      tipoImagen: 'FOTOGRAFIA',
      programacionId: 4,
      esPrincipal: false,
    });

    expect(programSpy).toHaveBeenCalledWith(15, 4);

    expect(createSpy).toHaveBeenCalledTimes(1);

    const persisted = createSpy.mock.calls[0]?.[0];

    expect(persisted?.idEvento).toBe(15);

    expect(persisted?.idProgramacion).toBe(4);

    expect(persisted?.idUsuarioSubida).toBe(20);

    expect(persisted?.fechaSubida).toEqual(new Date('2026-08-20T20:50:00.000Z'));

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it('programación nula no requiere validación adicional', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const programSpy = vi.spyOn(imagenRepository, 'findActiveProgramacionForEvent');

    const createSpy = vi.spyOn(imagenRepository, 'create').mockResolvedValue(
      buildImagen({
        idProgramacion: null,
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await imagenService.create(15, asistente, {
      urlImagen: 'https://example.com/afiche.jpg',
      tipoImagen: 'AFICHE',
      programacionId: null,
      esPrincipal: false,
    });

    expect(programSpy).not.toHaveBeenCalled();

    const persisted = createSpy.mock.calls[0]?.[0];

    expect(persisted?.idProgramacion).toBeNull();
  });

  it('rechaza programación que no pertenece al evento', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    vi.spyOn(imagenRepository, 'findActiveProgramacionForEvent').mockResolvedValue(null);

    const createSpy = vi.spyOn(imagenRepository, 'create');

    await expect(
      imagenService.create(15, asistente, {
        urlImagen: 'https://example.com/x.jpg',
        tipoImagen: 'OTRA',
        programacionId: 999,
        esPrincipal: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROGRAMACION_NOT_FOUND',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rechaza segunda imagen principal activa', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const principalSpy = vi
      .spyOn(imagenRepository, 'findActivePrincipalByEvent')
      .mockResolvedValue({
        id: 3,
        idEvento: 15,
      });

    const createSpy = vi.spyOn(imagenRepository, 'create');

    await expect(
      imagenService.create(15, asistente, {
        urlImagen: 'https://example.com/principal.jpg',
        tipoImagen: 'AFICHE',
        esPrincipal: true,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'IMAGE_MAIN_ALREADY_EXISTS',
    });

    expect(principalSpy).toHaveBeenCalledWith(15);

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('permite primera imagen principal cuando no existe otra activa', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const principalSpy = vi
      .spyOn(imagenRepository, 'findActivePrincipalByEvent')
      .mockResolvedValue(null);

    const createSpy = vi.spyOn(imagenRepository, 'create').mockResolvedValue(
      buildImagen({
        idProgramacion: null,
        esPrincipal: true,
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await imagenService.create(15, asistente, {
      urlImagen: 'https://example.com/principal.jpg',
      tipoImagen: 'AFICHE',
      esPrincipal: true,
    });

    expect(principalSpy).toHaveBeenCalledWith(15);

    const persisted = createSpy.mock.calls[0]?.[0];

    expect(persisted?.esPrincipal).toBe(true);

    expect(persisted?.idUsuarioSubida).toBe(20);
  });

  it('imagen no principal no consulta principal existente', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const principalSpy = vi.spyOn(imagenRepository, 'findActivePrincipalByEvent');

    vi.spyOn(imagenRepository, 'create').mockResolvedValue(
      buildImagen({
        idProgramacion: null,
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await imagenService.create(15, asistente, {
      urlImagen: 'https://example.com/secundaria.jpg',
      tipoImagen: 'FOTOGRAFIA',
      esPrincipal: false,
    });

    expect(principalSpy).not.toHaveBeenCalled();
  });

  it('ASISTENTE no administra imágenes de evento ajeno', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        creadorId: 99,
      }),
    );

    const createSpy = vi.spyOn(imagenRepository, 'create');

    await expect(
      imagenService.create(15, asistente, {
        urlImagen: 'https://example.com/x.jpg',
        tipoImagen: 'FOTOGRAFIA',
        esPrincipal: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('DELETE exige imagen perteneciente al evento', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    vi.spyOn(imagenRepository, 'findByIdForEvent').mockResolvedValue(null);

    const deleteSpy = vi.spyOn(imagenRepository, 'deactivate');

    await expect(imagenService.remove(15, 999, asistente)).rejects.toMatchObject({
      statusCode: 404,
      code: 'IMAGEN_NOT_FOUND',
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('ADMINISTRADOR puede desactivar imagen de evento publicado', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        creadorId: 99,
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      }),
    );

    vi.spyOn(imagenRepository, 'findByIdForEvent').mockResolvedValue(buildImagen());

    const deleteSpy = vi.spyOn(imagenRepository, 'deactivate').mockResolvedValue({
      count: 1,
    });

    const invalidateSpy = vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    await imagenService.remove(15, 9, administrador);

    expect(deleteSpy).toHaveBeenCalledWith(15, 9);

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});
