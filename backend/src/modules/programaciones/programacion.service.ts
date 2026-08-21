import { AppError } from '../../common/errors/app-error.js';
import { eventoCache } from '../../infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  puedeActualizarEvento,
  puedeGestionarRecursoPropio,
  type EstadoEventoAutorizacion,
} from '../auth/authorization.policy.js';
import {
  databaseDateToEventoLocalDateTime,
  eventoLocalDateTimeToDatabaseDate,
} from '../eventos/evento.datetime.js';
import { eventoRepository } from '../eventos/evento.repository.js';
import {
  programacionRepository,
  type CreateProgramacionRepositoryInput,
  type UpdateProgramacionRepositoryInput,
} from './programacion.repository.js';
import type { CreateProgramacionInput, UpdateProgramacionInput } from './programacion.schemas.js';

type EventoRecord = NonNullable<Awaited<ReturnType<typeof eventoRepository.findById>>>;

type ProgramacionRecord = NonNullable<
  Awaited<ReturnType<typeof programacionRepository.findByIdForEvent>>
>;

function serializeProgramacion(programacion: ProgramacionRecord) {
  return {
    id: programacion.id,
    eventoId: programacion.idEvento,
    lugarId: programacion.idLugar,
    tituloActividad: programacion.tituloActividad,
    descripcion: programacion.descripcion,
    fechaHoraInicio: databaseDateToEventoLocalDateTime(programacion.fechaHoraInicio),
    fechaHoraFin:
      programacion.fechaHoraFin === null
        ? null
        : databaseDateToEventoLocalDateTime(programacion.fechaHoraFin),
    artistaInvitado: programacion.artistaInvitado,
    orden: programacion.orden,
    estado: programacion.estado,
    lugar: programacion.lugar,
  };
}

function toEstadoEventoAutorizacion(value: string): EstadoEventoAutorizacion {
  switch (value) {
    case 'BORRADOR':
    case 'PROGRAMADO':
    case 'CANCELADO':
    case 'FINALIZADO':
    case 'ELIMINADO':
      return value;

    default:
      throw new AppError(
        500,
        'INVALID_EVENT_STATE',
        'El evento contiene un estado funcional no reconocido.',
      );
  }
}

async function getEventoForManagement(idEvento: number): Promise<EventoRecord> {
  const evento = await eventoRepository.findById(idEvento, 'basic');

  if (!evento || evento.estadoEvento === 'ELIMINADO') {
    throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento no existe.');
  }

  return evento;
}

function ensureCanManage(identidad: IdentidadAcceso, evento: EventoRecord): void {
  const estado = toEstadoEventoAutorizacion(evento.estadoEvento);

  if (!puedeActualizarEvento(identidad.rol, estado)) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'No tiene permisos para administrar la programación de este evento.',
    );
  }

  if (
    identidad.rol === 'ASISTENTE' &&
    !puedeGestionarRecursoPropio(identidad, evento.usuarioCreador.id)
  ) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'El asistente solo puede administrar la programación de sus propios borradores.',
    );
  }
}

function ensureDateRange(fechaInicio: Date, fechaFin: Date | null): void {
  if (fechaFin !== null && fechaFin.getTime() < fechaInicio.getTime()) {
    throw new AppError(
      400,
      'INVALID_PROGRAM_SCHEDULE_RANGE',
      'La fecha-hora de fin no puede ser anterior a la fecha-hora de inicio.',
    );
  }
}

async function ensureActiveLugar(lugarId: number): Promise<void> {
  const lugar = await programacionRepository.findActiveLugar(lugarId);

  if (!lugar) {
    throw new AppError(404, 'LUGAR_NOT_FOUND', 'El lugar no existe o no está activo.');
  }
}

async function getProgramacionOrThrow(
  idEvento: number,
  idProgramacion: number,
): Promise<ProgramacionRecord> {
  const programacion = await programacionRepository.findByIdForEvent(idEvento, idProgramacion);

  if (!programacion) {
    throw new AppError(
      404,
      'PROGRAMACION_NOT_FOUND',
      'La programación no existe para el evento indicado.',
    );
  }

  return programacion;
}

export const programacionService = {
  async listPublic(idEvento: number) {
    const evento = await eventoRepository.findPublicById(idEvento, 'basic');

    if (!evento) {
      throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
    }

    const programaciones = await programacionRepository.listByEvent(idEvento);

    return programaciones.map(serializeProgramacion);
  },

  async getPublic(idEvento: number, idProgramacion: number) {
    const evento = await eventoRepository.findPublicById(idEvento, 'basic');

    if (!evento) {
      throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
    }

    const programacion = await getProgramacionOrThrow(idEvento, idProgramacion);

    return serializeProgramacion(programacion);
  },

  async create(idEvento: number, identidad: IdentidadAcceso, input: CreateProgramacionInput) {
    const evento = await getEventoForManagement(idEvento);

    ensureCanManage(identidad, evento);

    if (input.lugarId !== undefined && input.lugarId !== null) {
      await ensureActiveLugar(input.lugarId);
    }

    const fechaHoraInicio = eventoLocalDateTimeToDatabaseDate(input.fechaHoraInicio);

    const fechaHoraFin =
      input.fechaHoraFin === undefined || input.fechaHoraFin === null
        ? null
        : eventoLocalDateTimeToDatabaseDate(input.fechaHoraFin);

    ensureDateRange(fechaHoraInicio, fechaHoraFin);

    const repositoryInput: CreateProgramacionRepositoryInput = {
      idEvento,
      tituloActividad: input.tituloActividad,
      fechaHoraInicio,
    };

    if (input.descripcion !== undefined) {
      repositoryInput.descripcion = input.descripcion;
    }

    if (input.fechaHoraFin !== undefined) {
      repositoryInput.fechaHoraFin = fechaHoraFin;
    }

    if (input.lugarId !== undefined) {
      repositoryInput.idLugar = input.lugarId;
    }

    if (input.artistaInvitado !== undefined) {
      repositoryInput.artistaInvitado = input.artistaInvitado;
    }

    if (input.orden !== undefined) {
      repositoryInput.orden = input.orden;
    }

    const programacion = await programacionRepository.create(repositoryInput);

    await eventoCache.invalidate();

    return serializeProgramacion(programacion);
  },

  async update(
    idEvento: number,
    idProgramacion: number,
    identidad: IdentidadAcceso,
    input: UpdateProgramacionInput,
  ) {
    const evento = await getEventoForManagement(idEvento);

    ensureCanManage(identidad, evento);

    const actual = await getProgramacionOrThrow(idEvento, idProgramacion);

    if (input.lugarId !== undefined && input.lugarId !== null) {
      await ensureActiveLugar(input.lugarId);
    }

    const nextFechaInicio =
      input.fechaHoraInicio === undefined
        ? actual.fechaHoraInicio
        : eventoLocalDateTimeToDatabaseDate(input.fechaHoraInicio);

    const nextFechaFin =
      input.fechaHoraFin === undefined
        ? actual.fechaHoraFin
        : input.fechaHoraFin === null
          ? null
          : eventoLocalDateTimeToDatabaseDate(input.fechaHoraFin);

    ensureDateRange(nextFechaInicio, nextFechaFin);

    const repositoryInput: UpdateProgramacionRepositoryInput = {};

    if (input.tituloActividad !== undefined) {
      repositoryInput.tituloActividad = input.tituloActividad;
    }

    if (input.descripcion !== undefined) {
      repositoryInput.descripcion = input.descripcion;
    }

    if (input.fechaHoraInicio !== undefined) {
      repositoryInput.fechaHoraInicio = nextFechaInicio;
    }

    if (input.fechaHoraFin !== undefined) {
      repositoryInput.fechaHoraFin = nextFechaFin;
    }

    if (input.lugarId !== undefined) {
      repositoryInput.idLugar = input.lugarId;
    }

    if (input.artistaInvitado !== undefined) {
      repositoryInput.artistaInvitado = input.artistaInvitado;
    }

    if (input.orden !== undefined) {
      repositoryInput.orden = input.orden;
    }

    const programacion = await programacionRepository.update(idProgramacion, repositoryInput);

    await eventoCache.invalidate();

    return serializeProgramacion(programacion);
  },

  async remove(
    idEvento: number,
    idProgramacion: number,
    identidad: IdentidadAcceso,
  ): Promise<void> {
    const evento = await getEventoForManagement(idEvento);

    ensureCanManage(identidad, evento);

    await getProgramacionOrThrow(idEvento, idProgramacion);

    const result = await programacionRepository.deactivate(idEvento, idProgramacion);

    if (result.count === 0) {
      throw new AppError(
        404,
        'PROGRAMACION_NOT_FOUND',
        'La programación no existe para el evento indicado.',
      );
    }

    await eventoCache.invalidate();
  },
};
