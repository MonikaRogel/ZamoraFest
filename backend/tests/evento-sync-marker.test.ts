import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    evento: {
      create: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    eventoCategoria: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    programacionEvento: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    imagenEvento: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../src/infrastructure/database/prisma.js', () => ({
  prisma: prismaMock,
}));

type TransactionCallback = (transaction: typeof prismaMock) => unknown;

type EventoMutationCall = {
  where?: {
    id?: number;
  };
  data?: {
    fechaActualizacion?: unknown;
  };
};

function isTransactionCallback(value: unknown): value is TransactionCallback {
  return typeof value === 'function';
}

function getEventoMutationCall(
  mockFn: typeof prismaMock.evento.create,
): EventoMutationCall | undefined {
  const call: unknown = mockFn.mock.calls[0]?.[0];

  return call as EventoMutationCall | undefined;
}

import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { imagenRepository } from '../src/modules/imagenes/imagen.repository.js';
import { programacionRepository } from '../src/modules/programaciones/programacion.repository.js';

const EXPECTED_MARKER_ISO = '2026-09-28T16:15:30.456Z';

function expectServerMarker(value: unknown): void {
  expect(value).toBeInstanceOf(Date);
  expect((value as Date).toISOString()).toBe(EXPECTED_MARKER_ISO);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-28T21:15:30.456Z'));

  prismaMock.$transaction.mockImplementation((callback: unknown) => {
    if (!isTransactionCallback(callback)) {
      throw new Error('La prueba esperaba una transacción interactiva.');
    }

    return Promise.resolve(callback(prismaMock));
  });
});

describe('P0-B - fechaActualizacion como marcador de sincronización', () => {
  it('inicializa fechaActualizacion al crear un evento', async () => {
    prismaMock.evento.create.mockResolvedValue({});

    await eventoRepository.create({
      titulo: 'Festival de prueba',
      fechaInicio: new Date('2099-10-01T10:00:00.000Z'),
      fechaFin: new Date('2099-10-01T20:00:00.000Z'),
      costoReferencial: 0,
      lugarId: 10,
      categoriaIds: [20],
      idUsuarioCreador: 7,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    });

    const call = getEventoMutationCall(prismaMock.evento.create);

    expectServerMarker(call?.data?.fechaActualizacion);
  });

  it('mantiene la actualización directa del evento ligada al reloj del servidor', async () => {
    prismaMock.evento.update.mockResolvedValue({});
    prismaMock.evento.findUniqueOrThrow.mockResolvedValue({});

    await eventoRepository.update(100, {
      titulo: 'Título actualizado',
    });

    const call = getEventoMutationCall(prismaMock.evento.update);

    expectServerMarker(call?.data?.fechaActualizacion);
  });

  it('actualiza fechaActualizacion al revisar un evento', async () => {
    prismaMock.evento.update.mockResolvedValue({});

    await eventoRepository.review(100, {
      estadoRevision: 'APROBADO',
      idUsuarioRevisor: 1,
      fechaRevision: new Date('2026-09-28T16:15:30.456Z'),
    });

    const call = getEventoMutationCall(prismaMock.evento.update);

    expectServerMarker(call?.data?.fechaActualizacion);
  });

  it('actualiza fechaActualizacion al publicar un evento', async () => {
    prismaMock.evento.update.mockResolvedValue({});

    await eventoRepository.publish(100);

    const call = getEventoMutationCall(prismaMock.evento.update);

    expectServerMarker(call?.data?.fechaActualizacion);
  });

  it('actualiza fechaActualizacion al eliminar lógicamente un evento', async () => {
    prismaMock.evento.update.mockResolvedValue({});

    await eventoRepository.logicalDelete(100);

    const call = getEventoMutationCall(prismaMock.evento.update);

    expectServerMarker(call?.data?.fechaActualizacion);
  });

  it('crea programación y toca el evento padre dentro de una transacción', async () => {
    prismaMock.programacionEvento.create.mockResolvedValue({ id: 4 });
    prismaMock.evento.update.mockResolvedValue({});

    await programacionRepository.create({
      idEvento: 15,
      tituloActividad: 'Pregón',
      fechaHoraInicio: new Date('2099-10-01T10:00:00.000Z'),
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const touchCall = getEventoMutationCall(prismaMock.evento.update);

    expect(touchCall?.where).toEqual({ id: 15 });
    expectServerMarker(touchCall?.data?.fechaActualizacion);
  });

  it('actualiza programación y toca el evento padre dentro de una transacción', async () => {
    prismaMock.programacionEvento.update.mockResolvedValue({ id: 4, idEvento: 15 });
    prismaMock.evento.update.mockResolvedValue({});

    await programacionRepository.update(4, {
      tituloActividad: 'Cierre',
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const touchCall = getEventoMutationCall(prismaMock.evento.update);

    expect(touchCall?.where).toEqual({ id: 15 });
    expectServerMarker(touchCall?.data?.fechaActualizacion);
  });

  it('desactiva programación y toca el evento padre dentro de una transacción', async () => {
    prismaMock.programacionEvento.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.evento.update.mockResolvedValue({});

    await programacionRepository.deactivate(15, 4);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const touchCall = getEventoMutationCall(prismaMock.evento.update);

    expect(touchCall?.where).toEqual({ id: 15 });
    expectServerMarker(touchCall?.data?.fechaActualizacion);
  });

  it('no toca el evento si la programación no llegó a desactivarse', async () => {
    prismaMock.programacionEvento.updateMany.mockResolvedValue({ count: 0 });

    const result = await programacionRepository.deactivate(15, 4);

    expect(result).toEqual({ count: 0 });
    expect(prismaMock.evento.update).not.toHaveBeenCalled();
  });

  it('crea imagen y toca el evento padre dentro de una transacción', async () => {
    prismaMock.imagenEvento.create.mockResolvedValue({ id: 9 });
    prismaMock.evento.update.mockResolvedValue({});

    await imagenRepository.create({
      idEvento: 15,
      idUsuarioSubida: 20,
      urlImagen: 'https://example.com/afiche.jpg',
      tipoImagen: 'AFICHE',
      esPrincipal: true,
      fechaSubida: new Date('2026-09-28T16:15:30.456Z'),
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const touchCall = getEventoMutationCall(prismaMock.evento.update);

    expect(touchCall?.where).toEqual({ id: 15 });
    expectServerMarker(touchCall?.data?.fechaActualizacion);
  });

  it('desactiva imagen y toca el evento padre dentro de una transacción', async () => {
    prismaMock.imagenEvento.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.evento.update.mockResolvedValue({});

    await imagenRepository.deactivate(15, 9);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const touchCall = getEventoMutationCall(prismaMock.evento.update);

    expect(touchCall?.where).toEqual({ id: 15 });
    expectServerMarker(touchCall?.data?.fechaActualizacion);
  });

  it('no toca el evento si la imagen no llegó a desactivarse', async () => {
    prismaMock.imagenEvento.updateMany.mockResolvedValue({ count: 0 });

    const result = await imagenRepository.deactivate(15, 9);

    expect(result).toEqual({ count: 0 });
    expect(prismaMock.evento.update).not.toHaveBeenCalled();
  });
});
