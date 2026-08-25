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
  eventoInstantToDatabaseDate,
} from '../eventos/evento.datetime.js';
import { eventoRepository } from '../eventos/evento.repository.js';
import { imagenRepository, type CreateImagenRepositoryInput } from './imagen.repository.js';
import type { CreateImagenInput } from './imagen.schemas.js';

type EventoRecord = NonNullable<Awaited<ReturnType<typeof eventoRepository.findById>>>;

type ImagenRecord = NonNullable<Awaited<ReturnType<typeof imagenRepository.findByIdForEvent>>>;

function serializeImagen(imagen: ImagenRecord) {
  return {
    id: imagen.id,
    eventoId: imagen.idEvento,
    programacionId: imagen.idProgramacion,
    urlImagen: imagen.urlImagen,
    tipoImagen: imagen.tipoImagen,
    descripcion: imagen.descripcion,
    esPrincipal: imagen.esPrincipal,
    fechaSubida: databaseDateToEventoLocalDateTime(imagen.fechaSubida),
    estado: imagen.estado,
    programacion:
      imagen.programacion === null
        ? null
        : {
            id: imagen.programacion.id,
            eventoId: imagen.programacion.idEvento,
            tituloActividad: imagen.programacion.tituloActividad,
            fechaHoraInicio: databaseDateToEventoLocalDateTime(imagen.programacion.fechaHoraInicio),
            fechaHoraFin:
              imagen.programacion.fechaHoraFin === null
                ? null
                : databaseDateToEventoLocalDateTime(imagen.programacion.fechaHoraFin),
            estado: imagen.programacion.estado,
          },
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
      'No tiene permisos para administrar imágenes de este evento.',
    );
  }

  if (
    identidad.rol === 'ASISTENTE' &&
    !puedeGestionarRecursoPropio(identidad, evento.usuarioCreador.id)
  ) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'El asistente solo puede administrar imágenes de sus propios borradores.',
    );
  }
}

async function ensureProgramacionBelongsToEvent(
  idEvento: number,
  idProgramacion: number,
): Promise<void> {
  const programacion = await imagenRepository.findActiveProgramacionForEvent(
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

async function ensurePrincipalAvailable(idEvento: number): Promise<void> {
  const principal = await imagenRepository.findActivePrincipalByEvent(idEvento);

  if (principal) {
    throw new AppError(
      409,
      'IMAGE_MAIN_ALREADY_EXISTS',
      'El evento ya posee una imagen principal activa.',
    );
  }
}

async function getImagenOrThrow(idEvento: number, idImagen: number): Promise<ImagenRecord> {
  const imagen = await imagenRepository.findByIdForEvent(idEvento, idImagen);

  if (!imagen) {
    throw new AppError(404, 'IMAGEN_NOT_FOUND', 'La imagen no existe para el evento indicado.');
  }

  return imagen;
}

export const imagenService = {
  async listPublic(idEvento: number) {
    const evento = await eventoRepository.findPublicById(idEvento, 'basic');

    if (!evento) {
      throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
    }

    const imagenes = await imagenRepository.listByEvent(idEvento);

    return imagenes.map(serializeImagen);
  },

  async getPublic(idEvento: number, idImagen: number) {
    const evento = await eventoRepository.findPublicById(idEvento, 'basic');

    if (!evento) {
      throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
    }

    const imagen = await getImagenOrThrow(idEvento, idImagen);

    return serializeImagen(imagen);
  },

  async create(idEvento: number, identidad: IdentidadAcceso, input: CreateImagenInput) {
    const evento = await getEventoForManagement(idEvento);

    ensureCanManage(identidad, evento);

    if (input.programacionId !== undefined && input.programacionId !== null) {
      await ensureProgramacionBelongsToEvent(idEvento, input.programacionId);
    }

    if (input.esPrincipal) {
      await ensurePrincipalAvailable(idEvento);
    }

    const repositoryInput: CreateImagenRepositoryInput = {
      idEvento,
      idUsuarioSubida: identidad.id,
      urlImagen: input.urlImagen,
      tipoImagen: input.tipoImagen,
      esPrincipal: input.esPrincipal,
      fechaSubida: eventoInstantToDatabaseDate(new Date()),
    };

    if (input.programacionId !== undefined) {
      repositoryInput.idProgramacion = input.programacionId;
    }

    if (input.descripcion !== undefined) {
      repositoryInput.descripcion = input.descripcion;
    }

    const imagen = await imagenRepository.create(repositoryInput);

    await eventoCache.invalidate();

    return serializeImagen(imagen);
  },

  async remove(idEvento: number, idImagen: number, identidad: IdentidadAcceso): Promise<void> {
    const evento = await getEventoForManagement(idEvento);

    ensureCanManage(identidad, evento);

    await getImagenOrThrow(idEvento, idImagen);

    const result = await imagenRepository.deactivate(idEvento, idImagen);

    if (result.count === 0) {
      throw new AppError(404, 'IMAGEN_NOT_FOUND', 'La imagen no existe para el evento indicado.');
    }

    await eventoCache.invalidate();
  },
};
