import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/infrastructure/database/prisma.js';
import { eventoRepository } from '../../src/modules/eventos/evento.repository.js';
import { imagenRepository } from '../../src/modules/imagenes/imagen.repository.js';
import { programacionRepository } from '../../src/modules/programaciones/programacion.repository.js';

const TEST_SOURCE_PREFIX = 'T052_SYNC_';
const BASELINE_MARKER = new Date('2000-01-01T00:00:00.000Z');

interface SupportContext {
  lugarId: number;
  categoriaId: number;
  asistenteId: number;
  administradorId: number;
}

let support: SupportContext;

async function confirmTestDatabase(): Promise<void> {
  const databases = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  expect(databases[0]?.databaseName).toBe('zamorafest_test');
}

async function getSupportContext(): Promise<SupportContext> {
  const [lugar, categoria, asistente, administrador] = await Promise.all([
    prisma.lugar.findFirst({
      where: {
        estado: true,
      },
      select: {
        id: true,
      },
    }),
    prisma.categoria.findFirst({
      where: {
        estado: true,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
      },
    }),
    prisma.usuario.findFirst({
      where: {
        estado: true,
        rol: {
          nombre: 'ASISTENTE',
          estado: true,
        },
      },
      select: {
        id: true,
      },
    }),
    prisma.usuario.findFirst({
      where: {
        estado: true,
        rol: {
          nombre: 'ADMINISTRADOR',
          estado: true,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!lugar || !categoria || !asistente || !administrador) {
    throw new Error('El seed no contiene los datos requeridos por T052.');
  }

  return {
    lugarId: lugar.id,
    categoriaId: categoria.id,
    asistenteId: asistente.id,
    administradorId: administrador.id,
  };
}

async function cleanT052Data(): Promise<void> {
  const eventos = await prisma.evento.findMany({
    where: {
      fuenteInformacion: {
        startsWith: TEST_SOURCE_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  const eventoIds = eventos.map((evento) => evento.id);

  if (eventoIds.length === 0) {
    return;
  }

  await prisma.imagenEvento.deleteMany({
    where: {
      idEvento: {
        in: eventoIds,
      },
    },
  });

  await prisma.programacionEvento.deleteMany({
    where: {
      idEvento: {
        in: eventoIds,
      },
    },
  });

  await prisma.eventoCategoria.deleteMany({
    where: {
      idEvento: {
        in: eventoIds,
      },
    },
  });

  await prisma.evento.deleteMany({
    where: {
      id: {
        in: eventoIds,
      },
    },
  });
}

async function createEvento(label: string) {
  return eventoRepository.create({
    titulo: `Evento T052 ${label}`,
    descripcion: 'Fixture de integración para el marcador de sincronización.',
    fechaInicio: new Date('2099-10-15T18:00:00.000Z'),
    fechaFin: new Date('2099-10-15T22:00:00.000Z'),
    costoReferencial: 0,
    lugarId: support.lugarId,
    categoriaIds: [support.categoriaId],
    fuenteInformacion: `${TEST_SOURCE_PREFIX}${label}`,
    idUsuarioCreador: support.asistenteId,
    estadoEvento: 'BORRADOR',
    estadoRevision: 'PENDIENTE',
  });
}

async function resetMarker(idEvento: number): Promise<void> {
  await prisma.evento.update({
    where: {
      id: idEvento,
    },
    data: {
      fechaActualizacion: BASELINE_MARKER,
    },
  });
}

async function readMarker(idEvento: number): Promise<Date | null> {
  const evento = await prisma.evento.findUniqueOrThrow({
    where: {
      id: idEvento,
    },
    select: {
      fechaActualizacion: true,
    },
  });

  return evento.fechaActualizacion;
}

function expectMarkerAfterBaseline(marker: Date | null): void {
  expect(marker).toBeInstanceOf(Date);

  if (!(marker instanceof Date)) {
    throw new Error('fechaActualizacion debe persistirse como Date.');
  }

  expect(marker.getTime()).toBeGreaterThan(BASELINE_MARKER.getTime());
}

beforeAll(async () => {
  await confirmTestDatabase();
  await cleanT052Data();
  support = await getSupportContext();
});

afterEach(async () => {
  await cleanT052Data();
});

afterAll(async () => {
  await cleanT052Data();
  await prisma.$disconnect();
});

describe('T052 - marcador real de sincronización del agregado Evento', () => {
  it('persiste el marcador en creación, revisión, publicación y eliminación lógica', async () => {
    const evento = await createEvento('EVENTO_CORE');

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    await eventoRepository.review(evento.id, {
      estadoRevision: 'APROBADO',
      idUsuarioRevisor: support.administradorId,
      fechaRevision: new Date('2026-09-28T17:30:00.000Z'),
    });

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);
    await eventoRepository.publish(evento.id);

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);
    await eventoRepository.logicalDelete(evento.id);

    expectMarkerAfterBaseline(await readMarker(evento.id));
  });

  it('toca el evento padre al crear, actualizar y desactivar programación', async () => {
    const evento = await createEvento('PROGRAMACION');

    await resetMarker(evento.id);

    const programacion = await programacionRepository.create({
      idEvento: evento.id,
      idLugar: support.lugarId,
      tituloActividad: 'Apertura',
      fechaHoraInicio: new Date('2099-10-15T18:30:00.000Z'),
      fechaHoraFin: new Date('2099-10-15T19:00:00.000Z'),
    });

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    await programacionRepository.update(programacion.id, {
      tituloActividad: 'Apertura actualizada',
    });

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    const desactivada = await programacionRepository.deactivate(evento.id, programacion.id);

    expect(desactivada.count).toBe(1);
    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    const sinCambio = await programacionRepository.deactivate(evento.id, programacion.id);

    expect(sinCambio.count).toBe(0);
    expect(await readMarker(evento.id)).toEqual(BASELINE_MARKER);
  });

  it('toca el evento padre al crear y desactivar imagen', async () => {
    const evento = await createEvento('IMAGEN');

    await resetMarker(evento.id);

    const imagen = await imagenRepository.create({
      idEvento: evento.id,
      idUsuarioSubida: support.administradorId,
      urlImagen: 'https://example.com/t052-sync.jpg',
      tipoImagen: 'AFICHE',
      esPrincipal: false,
      fechaSubida: new Date('2026-09-28T17:30:00.000Z'),
    });

    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    const desactivada = await imagenRepository.deactivate(evento.id, imagen.id);

    expect(desactivada.count).toBe(1);
    expectMarkerAfterBaseline(await readMarker(evento.id));

    await resetMarker(evento.id);

    const sinCambio = await imagenRepository.deactivate(evento.id, imagen.id);

    expect(sinCambio.count).toBe(0);
    expect(await readMarker(evento.id)).toEqual(BASELINE_MARKER);
  });
});
