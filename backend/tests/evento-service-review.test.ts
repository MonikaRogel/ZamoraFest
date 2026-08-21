import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventoCache } from '../src/infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';

const administrador: IdentidadAcceso = {
  id: 1,
  rol: 'ADMINISTRADOR',
};

const asistente: IdentidadAcceso = {
  id: 7,
  rol: 'ASISTENTE',
};

function buildEvento(
  options: {
    estadoEvento?: string;
    estadoRevision?: string;
    revisorId?: number | null;
    fechaRevision?: Date | null;
  } = {},
) {
  const revisorId = options.revisorId === undefined ? null : options.revisorId;

  return {
    id: 100,
    titulo: 'Festival Cultural',
    descripcion: 'Evento cultural de prueba.',
    fechaInicio: new Date('2026-09-05T09:30:00.000Z'),
    fechaFin: new Date('2026-09-05T18:00:00.000Z'),
    costoReferencial: {
      toString: () => '0',
    },
    estadoEvento: options.estadoEvento ?? 'BORRADOR',
    estadoRevision: options.estadoRevision ?? 'PENDIENTE',
    fuenteInformacion: 'Dirección de Cultura',
    fechaCreacion: new Date('2026-08-20T13:00:00.000Z'),
    fechaActualizacion: null,
    fechaRevision: options.fechaRevision === undefined ? null : options.fechaRevision,
    lugar: {
      id: 10,
      nombre: 'Parque Central',
      tipoLugar: 'PARQUE',
      direccionReferencial: null,
      referencia: null,
      latitud: null,
      longitud: null,
      sector: {
        id: 5,
        nombre: 'Cabecera parroquial',
        tipoSector: 'CABECERA_PARROQUIAL',
        parroquia: {
          id: 4,
          codigoDpa: '190150',
          nombre: 'Zamora',
          canton: {
            id: 3,
            codigoDpa: '1901',
            nombre: 'Zamora',
            provincia: {
              id: 1,
              codigoDpa: '19',
              nombre: 'Zamora Chinchipe',
            },
          },
        },
      },
    },
    usuarioCreador: {
      id: 7,
      nombreCompleto: 'Asistente de prueba',
      rol: {
        id: 2,
        nombre: 'ASISTENTE',
      },
    },
    usuarioRevisor:
      revisorId === null
        ? null
        : {
            id: revisorId,
            nombreCompleto: 'Administrador',
            rol: {
              id: 1,
              nombre: 'ADMINISTRADOR',
            },
          },
    categorias: [
      {
        categoria: {
          id: 20,
          nombre: 'Cultura',
          descripcion: null,
        },
      },
    ],
  } as never;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('T035-D2 - revisión y publicación', () => {
  it('aprueba sin publicar y registra revisor y fecha', async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-08-21T00:51:12.345Z'));

    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const fechaRevision = new Date('2026-08-20T19:51:12.345Z');

    const reviewSpy = vi.spyOn(eventoRepository, 'review').mockResolvedValue(
      buildEvento({
        estadoRevision: 'APROBADO',
        revisorId: 1,
        fechaRevision,
      }),
    );

    const publishSpy = vi.spyOn(eventoRepository, 'publish');

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    const result = await eventoService.review(100, administrador, {
      decision: 'APROBAR',
    });

    expect(reviewSpy).toHaveBeenCalledWith(100, {
      estadoRevision: 'APROBADO',
      idUsuarioRevisor: 1,
      fechaRevision,
    });

    expect(publishSpy).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      estadoEvento: 'BORRADOR',
      estadoRevision: 'APROBADO',
      usuarioRevisor: {
        id: 1,
      },
      fechaRevision: '2026-08-20T19:51:12.345',
    });
  });

  it('registra rechazo con revisor y fecha', async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-08-21T00:51:12.345Z'));

    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const reviewSpy = vi.spyOn(eventoRepository, 'review').mockResolvedValue(
      buildEvento({
        estadoRevision: 'RECHAZADO',
        revisorId: 1,
        fechaRevision: new Date('2026-08-20T19:51:12.345Z'),
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    const result = await eventoService.review(100, administrador, {
      decision: 'RECHAZAR',
    });

    expect(reviewSpy.mock.calls[0]?.[1]).toMatchObject({
      estadoRevision: 'RECHAZADO',
      idUsuarioRevisor: 1,
    });

    expect(reviewSpy.mock.calls[0]?.[1].fechaRevision.toISOString()).toBe(
      '2026-08-20T19:51:12.345Z',
    );

    expect(result.estadoRevision).toBe('RECHAZADO');
  });

  it('impide revisar a un ASISTENTE', async () => {
    const reviewSpy = vi.spyOn(eventoRepository, 'review');

    await expect(
      eventoService.review(100, asistente, {
        decision: 'APROBAR',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(reviewSpy).not.toHaveBeenCalled();
  });

  it('impide revisar nuevamente un evento ya aprobado', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoRevision: 'APROBADO',
      }),
    );

    const reviewSpy = vi.spyOn(eventoRepository, 'review');

    await expect(
      eventoService.review(100, administrador, {
        decision: 'APROBAR',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'EVENT_ALREADY_APPROVED',
    });

    expect(reviewSpy).not.toHaveBeenCalled();
  });

  it('publica únicamente un BORRADOR previamente APROBADO', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoEvento: 'BORRADOR',
        estadoRevision: 'APROBADO',
        revisorId: 1,
        fechaRevision: new Date('2026-08-20T19:51:12.345Z'),
      }),
    );

    const publishSpy = vi.spyOn(eventoRepository, 'publish').mockResolvedValue(
      buildEvento({
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
        revisorId: 1,
        fechaRevision: new Date('2026-08-20T19:51:12.345Z'),
      }),
    );

    vi.spyOn(eventoCache, 'invalidate').mockResolvedValue();

    const result = await eventoService.publish(100, administrador);

    expect(publishSpy).toHaveBeenCalledWith(100);

    expect(result).toMatchObject({
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
    });
  });

  it('impide publicar un evento PENDIENTE', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoRevision: 'PENDIENTE',
      }),
    );

    const publishSpy = vi.spyOn(eventoRepository, 'publish');

    await expect(eventoService.publish(100, administrador)).rejects.toMatchObject({
      statusCode: 409,
      code: 'EVENT_NOT_APPROVED',
    });

    expect(publishSpy).not.toHaveBeenCalled();
  });

  it('impide publicar un evento RECHAZADO', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(
      buildEvento({
        estadoRevision: 'RECHAZADO',
      }),
    );

    const publishSpy = vi.spyOn(eventoRepository, 'publish');

    await expect(eventoService.publish(100, administrador)).rejects.toMatchObject({
      statusCode: 409,
      code: 'EVENT_NOT_APPROVED',
    });

    expect(publishSpy).not.toHaveBeenCalled();
  });

  it('impide publicar a un ASISTENTE', async () => {
    const publishSpy = vi.spyOn(eventoRepository, 'publish');

    await expect(eventoService.publish(100, asistente)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(publishSpy).not.toHaveBeenCalled();
  });
});
