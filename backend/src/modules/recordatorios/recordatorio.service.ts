import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  databaseDateToEventoLocalDateTime,
  eventoLocalDateTimeToDatabaseDate,
} from '../eventos/evento.datetime.js';
import { eventoRepository } from '../eventos/evento.repository.js';
import {
  recordatorioRepository,
  type CreateRecordatorioRepositoryInput,
} from './recordatorio.repository.js';
import type { CreateRecordatorioInput } from './recordatorio.schemas.js';

type RecordatorioRecord = NonNullable<
  Awaited<ReturnType<typeof recordatorioRepository.findByIdForUser>>
>;

function serializeRecordatorio(recordatorio: RecordatorioRecord) {
  return {
    id: recordatorio.id,
    eventoId: recordatorio.idEvento,
    programacionId: recordatorio.idProgramacion,
    fechaNotificacion: databaseDateToEventoLocalDateTime(recordatorio.fechaNotificacion),
    activo: recordatorio.activo,
    fechaCreacion: databaseDateToEventoLocalDateTime(recordatorio.fechaCreacion),
    evento: {
      id: recordatorio.evento.id,
      titulo: recordatorio.evento.titulo,
      fechaInicio: databaseDateToEventoLocalDateTime(recordatorio.evento.fechaInicio),
      fechaFin:
        recordatorio.evento.fechaFin === null
          ? null
          : databaseDateToEventoLocalDateTime(recordatorio.evento.fechaFin),
      estadoEvento: recordatorio.evento.estadoEvento,
      estadoRevision: recordatorio.evento.estadoRevision,
    },
    programacion:
      recordatorio.programacion === null
        ? null
        : {
            id: recordatorio.programacion.id,
            eventoId: recordatorio.programacion.idEvento,
            tituloActividad: recordatorio.programacion.tituloActividad,
            fechaHoraInicio: databaseDateToEventoLocalDateTime(
              recordatorio.programacion.fechaHoraInicio,
            ),
            fechaHoraFin:
              recordatorio.programacion.fechaHoraFin === null
                ? null
                : databaseDateToEventoLocalDateTime(recordatorio.programacion.fechaHoraFin),
            estado: recordatorio.programacion.estado,
          },
  };
}

async function ensurePublicEvent(idEvento: number): Promise<void> {
  const evento = await eventoRepository.findPublicById(idEvento, 'basic');

  if (!evento) {
    throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
  }
}

async function ensureProgramacionBelongsToEvent(
  idEvento: number,
  idProgramacion: number,
): Promise<void> {
  const programacion = await recordatorioRepository.findActiveProgramacionForEvent(
    idEvento,
    idProgramacion,
  );

  if (!programacion) {
    throw new AppError(
      404,
      'PROGRAMACION_NOT_FOUND',
      'La programación no existe, está inactiva o no pertenece al evento indicado.',
    );
  }
}

async function getOwnOrThrow(
  idRecordatorio: number,
  idUsuario: number,
): Promise<RecordatorioRecord> {
  const recordatorio = await recordatorioRepository.findByIdForUser(idRecordatorio, idUsuario);

  if (!recordatorio) {
    throw new AppError(
      404,
      'RECORDATORIO_NOT_FOUND',
      'El recordatorio no existe para el usuario autenticado.',
    );
  }

  return recordatorio;
}

export const recordatorioService = {
  async create(identidad: IdentidadAcceso, input: CreateRecordatorioInput) {
    await ensurePublicEvent(input.eventoId);

    if (input.programacionId !== undefined && input.programacionId !== null) {
      await ensureProgramacionBelongsToEvent(input.eventoId, input.programacionId);
    }

    const repositoryInput: CreateRecordatorioRepositoryInput = {
      idUsuario: identidad.id,
      idEvento: input.eventoId,
      fechaNotificacion: eventoLocalDateTimeToDatabaseDate(input.fechaNotificacion),
    };

    if (input.programacionId !== undefined) {
      repositoryInput.idProgramacion = input.programacionId;
    }

    const recordatorio = await recordatorioRepository.create(repositoryInput);

    return serializeRecordatorio(recordatorio);
  },

  async listOwn(identidad: IdentidadAcceso) {
    const recordatorios = await recordatorioRepository.listByUser(identidad.id);

    return recordatorios.map(serializeRecordatorio);
  },

  async getOwn(identidad: IdentidadAcceso, idRecordatorio: number) {
    const recordatorio = await getOwnOrThrow(idRecordatorio, identidad.id);

    return serializeRecordatorio(recordatorio);
  },

  async deactivateOwn(identidad: IdentidadAcceso, idRecordatorio: number): Promise<void> {
    const recordatorio = await getOwnOrThrow(idRecordatorio, identidad.id);

    if (!recordatorio.activo) {
      throw new AppError(
        409,
        'RECORDATORIO_ALREADY_INACTIVE',
        'El recordatorio ya se encuentra inactivo.',
      );
    }

    const result = await recordatorioRepository.deactivateOwn(idRecordatorio, identidad.id);

    if (result.count === 0) {
      throw new AppError(
        404,
        'RECORDATORIO_NOT_FOUND',
        'El recordatorio no existe para el usuario autenticado.',
      );
    }
  },
};
