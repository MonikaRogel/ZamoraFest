import { AppError } from '../../common/errors/app-error.js';
import { eventoCache } from '../../infrastructure/cache/evento-cache.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  puedeActualizarEvento,
  puedeCrearEvento,
  puedeEliminarEvento,
  puedeGestionarRecursoPropio,
  puedePublicarEvento,
  puedeRevisarEvento,
  type EstadoEventoAutorizacion,
} from '../auth/authorization.policy.js';
import {
  databaseDateToEventoLocalDateTime,
  eventoInstantToDatabaseDate,
  eventoLocalDateTimeToDatabaseDate,
} from './evento.datetime.js';
import {
  eventoRepository,
  type CreateEventoRepositoryInput,
  type ReviewEventoRepositoryInput,
  type UpdateEventoRepositoryInput,
} from './evento.repository.js';
import type {
  CreateEventoInput,
  ListEventosQuery,
  ReviewEventoInput,
  UpdateEventoInput,
} from './evento.schemas.js';

type EventoRecord = NonNullable<Awaited<ReturnType<typeof eventoRepository.findById>>>;

function serializeEvento(evento: EventoRecord) {
  return {
    id: evento.id,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    fechaInicio: databaseDateToEventoLocalDateTime(evento.fechaInicio),
    fechaFin: evento.fechaFin === null ? null : databaseDateToEventoLocalDateTime(evento.fechaFin),
    costoReferencial: Number(evento.costoReferencial.toString()),
    estadoEvento: evento.estadoEvento,
    estadoRevision: evento.estadoRevision,
    fuenteInformacion: evento.fuenteInformacion,
    fechaCreacion: databaseDateToEventoLocalDateTime(evento.fechaCreacion),
    fechaActualizacion:
      evento.fechaActualizacion === null
        ? null
        : databaseDateToEventoLocalDateTime(evento.fechaActualizacion),
    fechaRevision:
      evento.fechaRevision === null
        ? null
        : databaseDateToEventoLocalDateTime(evento.fechaRevision),
    lugar: evento.lugar,
    usuarioCreador: evento.usuarioCreador,
    usuarioRevisor: evento.usuarioRevisor,
    categorias: evento.categorias.map(({ categoria }) => categoria),
  };
}

type EventoPayload = ReturnType<typeof serializeEvento>;

interface ListEventosPayload {
  data: EventoPayload[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CachedResult<T> {
  payload: T;
  cacheStatus: 'HIT' | 'MISS';
}

async function ensureActiveLugar(lugarId: number): Promise<void> {
  const lugar = await eventoRepository.findActiveLugar(lugarId);

  if (!lugar) {
    throw new AppError(404, 'LUGAR_NOT_FOUND', 'El lugar no existe o no está activo.');
  }
}

async function ensureActiveCategories(categoriaIds: number[]): Promise<void> {
  const activeCategories = await eventoRepository.findActiveCategoryIds(categoriaIds);

  if (activeCategories.length !== categoriaIds.length) {
    const activeIds = new Set(activeCategories.map(({ id }) => id));

    const missingIds = categoriaIds.filter((id) => !activeIds.has(id));

    throw new AppError(
      404,
      'CATEGORIES_NOT_FOUND',
      'Una o más categorías no existen o no están activas.',
      {
        categoriaIds: missingIds,
      },
    );
  }
}

function ensureCanCreate(identidad: IdentidadAcceso): void {
  if (!puedeCrearEvento(identidad.rol)) {
    throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para crear eventos.');
  }
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

async function getEventoOrThrow(id: number): Promise<EventoRecord> {
  const evento = await eventoRepository.findById(id, 'basic');

  if (!evento || evento.estadoEvento === 'ELIMINADO') {
    throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento no existe.');
  }

  return evento;
}

function ensureCanUpdate(identidad: IdentidadAcceso, evento: EventoRecord): void {
  const estado = toEstadoEventoAutorizacion(evento.estadoEvento);

  if (!puedeActualizarEvento(identidad.rol, estado)) {
    throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para actualizar este evento.');
  }

  if (
    identidad.rol === 'ASISTENTE' &&
    !puedeGestionarRecursoPropio(identidad, evento.usuarioCreador.id)
  ) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'El asistente solo puede actualizar sus propios borradores.',
    );
  }
}

function ensureDateRange(fechaInicio: Date, fechaFin: Date | null): void {
  if (fechaFin !== null && fechaFin.getTime() < fechaInicio.getTime()) {
    throw new AppError(
      400,
      'INVALID_DATE_RANGE',
      'La fecha de fin no puede ser anterior a la fecha de inicio.',
    );
  }
}

function ensureCanReview(identidad: IdentidadAcceso): void {
  if (!puedeRevisarEvento(identidad.rol)) {
    throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para revisar eventos.');
  }
}

function ensureReviewable(evento: EventoRecord): void {
  if (evento.estadoEvento !== 'BORRADOR') {
    throw new AppError(
      409,
      'EVENT_REVIEW_INVALID_STATE',
      'Solo se pueden revisar eventos que permanezcan en BORRADOR.',
    );
  }

  if (evento.estadoRevision !== 'PENDIENTE' && evento.estadoRevision !== 'RECHAZADO') {
    throw new AppError(
      409,
      'EVENT_ALREADY_APPROVED',
      'El evento ya fue aprobado y no admite una nueva revisión en este flujo.',
    );
  }
}

function ensureCanPublish(identidad: IdentidadAcceso): void {
  if (!puedePublicarEvento(identidad.rol)) {
    throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para publicar eventos.');
  }
}

function ensurePublishable(evento: EventoRecord): void {
  if (evento.estadoRevision !== 'APROBADO') {
    throw new AppError(
      409,
      'EVENT_NOT_APPROVED',
      'El evento debe estar APROBADO antes de publicarse.',
    );
  }

  if (evento.estadoEvento !== 'BORRADOR') {
    throw new AppError(
      409,
      'EVENT_PUBLICATION_INVALID_STATE',
      'Solo un evento aprobado que permanezca en BORRADOR puede pasar a PROGRAMADO.',
    );
  }
}

export const eventoService = {
  async create(identidad: IdentidadAcceso, input: CreateEventoInput): Promise<EventoPayload> {
    ensureCanCreate(identidad);

    await ensureActiveLugar(input.lugarId);

    await ensureActiveCategories(input.categoriaIds);

    const repositoryInput: CreateEventoRepositoryInput = {
      titulo: input.titulo,
      fechaInicio: eventoLocalDateTimeToDatabaseDate(input.fechaInicio),
      costoReferencial: input.costoReferencial,
      lugarId: input.lugarId,
      categoriaIds: input.categoriaIds,
      idUsuarioCreador: identidad.id,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    };

    if (input.descripcion !== undefined) {
      repositoryInput.descripcion = input.descripcion;
    }

    if (input.fechaFin !== undefined) {
      repositoryInput.fechaFin =
        input.fechaFin === null ? null : eventoLocalDateTimeToDatabaseDate(input.fechaFin);
    }

    if (input.fuenteInformacion !== undefined) {
      repositoryInput.fuenteInformacion = input.fuenteInformacion;
    }

    const evento = await eventoRepository.create(repositoryInput);

    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async list(query: ListEventosQuery): Promise<CachedResult<ListEventosPayload>> {
    const filters = {
      ...(query.cantonId !== undefined ? { cantonId: query.cantonId } : {}),
      ...(query.categoriaId !== undefined ? { categoriaId: query.categoriaId } : {}),
    };

    const cacheKey = await eventoCache.listKey(
      query.page,
      query.limit,
      query.cantonId,
      query.categoriaId,
    );

    const cachedResult = await eventoCache.get<ListEventosPayload>(cacheKey);

    if (cachedResult !== null) {
      return {
        payload: cachedResult,
        cacheStatus: 'HIT',
      };
    }

    const result = await eventoRepository.list(query.page, query.limit, 'basic', filters);

    const payload: ListEventosPayload = {
      data: result.eventos.map(serializeEvento),
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };

    await eventoCache.set(cacheKey, payload);

    return {
      payload,
      cacheStatus: 'MISS',
    };
  },

  async getById(id: number): Promise<CachedResult<EventoPayload>> {
    const cacheKey = await eventoCache.detailKey(id);

    const cachedEvento = await eventoCache.get<EventoPayload>(cacheKey);

    if (cachedEvento !== null) {
      return {
        payload: cachedEvento,
        cacheStatus: 'HIT',
      };
    }

    const evento = await eventoRepository.findPublicById(id, 'basic');

    if (!evento) {
      throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento público no existe.');
    }

    const payload = serializeEvento(evento);

    await eventoCache.set(cacheKey, payload);

    return {
      payload,
      cacheStatus: 'MISS',
    };
  },

  async update(
    id: number,
    identidad: IdentidadAcceso,
    input: UpdateEventoInput,
  ): Promise<EventoPayload> {
    const actual = await getEventoOrThrow(id);

    ensureCanUpdate(identidad, actual);

    if (input.lugarId !== undefined) {
      await ensureActiveLugar(input.lugarId);
    }

    if (input.categoriaIds !== undefined) {
      await ensureActiveCategories(input.categoriaIds);
    }

    const nextFechaInicio =
      input.fechaInicio === undefined
        ? actual.fechaInicio
        : eventoLocalDateTimeToDatabaseDate(input.fechaInicio);

    const nextFechaFin =
      input.fechaFin === undefined
        ? actual.fechaFin
        : input.fechaFin === null
          ? null
          : eventoLocalDateTimeToDatabaseDate(input.fechaFin);

    ensureDateRange(nextFechaInicio, nextFechaFin);

    const repositoryInput: UpdateEventoRepositoryInput = {};

    if (input.titulo !== undefined) {
      repositoryInput.titulo = input.titulo;
    }

    if (input.descripcion !== undefined) {
      repositoryInput.descripcion = input.descripcion;
    }

    if (input.fechaInicio !== undefined) {
      repositoryInput.fechaInicio = nextFechaInicio;
    }

    if (input.fechaFin !== undefined) {
      repositoryInput.fechaFin = nextFechaFin;
    }

    if (input.costoReferencial !== undefined) {
      repositoryInput.costoReferencial = input.costoReferencial;
    }

    if (input.lugarId !== undefined) {
      repositoryInput.lugarId = input.lugarId;
    }

    if (input.categoriaIds !== undefined) {
      repositoryInput.categoriaIds = input.categoriaIds;
    }

    if (input.fuenteInformacion !== undefined) {
      repositoryInput.fuenteInformacion = input.fuenteInformacion;
    }

    const evento = await eventoRepository.update(id, repositoryInput);

    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async review(
    id: number,
    identidad: IdentidadAcceso,
    input: ReviewEventoInput,
  ): Promise<EventoPayload> {
    ensureCanReview(identidad);

    const actual = await getEventoOrThrow(id);

    ensureReviewable(actual);

    const estadoRevision: ReviewEventoRepositoryInput['estadoRevision'] =
      input.decision === 'APROBAR' ? 'APROBADO' : 'RECHAZADO';

    const evento = await eventoRepository.review(id, {
      estadoRevision,
      idUsuarioRevisor: identidad.id,
      fechaRevision: eventoInstantToDatabaseDate(new Date()),
    });

    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async publish(id: number, identidad: IdentidadAcceso): Promise<EventoPayload> {
    ensureCanPublish(identidad);

    const actual = await getEventoOrThrow(id);

    ensurePublishable(actual);

    const evento = await eventoRepository.publish(id);

    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async remove(id: number, identidad: IdentidadAcceso): Promise<void> {
    if (!puedeEliminarEvento(identidad.rol)) {
      throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para eliminar eventos.');
    }

    await getEventoOrThrow(id);

    await eventoRepository.logicalDelete(id);

    await eventoCache.invalidate();
  },
};
