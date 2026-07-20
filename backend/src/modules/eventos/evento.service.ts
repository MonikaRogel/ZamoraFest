import { AppError } from '../../common/errors/app-error.js';
import { eventoCache } from '../../infrastructure/cache/evento-cache.js';
import { eventoRepository } from './evento.repository.js';
import type { CreateEventoInput, ListEventosQuery, UpdateEventoInput } from './evento.schemas.js';

type EventoRecord = NonNullable<Awaited<ReturnType<typeof eventoRepository.findPublicById>>>;

function serializeEvento(evento: EventoRecord) {
  return {
    id: evento.id,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    estado: evento.estado,
    lugar: evento.lugar,
    categorias: evento.categorias.map(({ categoria }) => categoria),
    createdAt: evento.createdAt.toISOString(),
    updatedAt: evento.updatedAt.toISOString(),
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

async function ensureActiveLugar(lugarId: string): Promise<void> {
  const lugar = await eventoRepository.findActiveLugar(lugarId);

  if (!lugar) {
    throw new AppError(404, 'LUGAR_NOT_FOUND', 'El lugar no existe o está eliminado.');
  }
}

async function ensureActiveCategories(categoriaIds: string[]): Promise<void> {
  const activeCategories = await eventoRepository.findActiveCategoryIds(categoriaIds);

  if (activeCategories.length !== categoriaIds.length) {
    const activeIds = new Set(activeCategories.map(({ id }) => id));
    const missingIds = categoriaIds.filter((id) => !activeIds.has(id));

    throw new AppError(
      404,
      'CATEGORIES_NOT_FOUND',
      'Una o más categorías no existen o están eliminadas.',
      {
        categoriaIds: missingIds,
      },
    );
  }
}

async function ensureActiveEvento(id: string): Promise<void> {
  const evento = await eventoRepository.findActiveById(id);

  if (!evento) {
    throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento no existe o está eliminado.');
  }
}

export const eventoService = {
  async create(input: CreateEventoInput): Promise<EventoPayload> {
    await ensureActiveLugar(input.lugarId);
    await ensureActiveCategories(input.categoriaIds);

    const evento = await eventoRepository.create(input);
    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async list(query: ListEventosQuery): Promise<CachedResult<ListEventosPayload>> {
    const cacheKey = await eventoCache.listKey(query.page, query.limit);
    const cachedResult = await eventoCache.get<ListEventosPayload>(cacheKey);

    if (cachedResult !== null) {
      return {
        payload: cachedResult,
        cacheStatus: 'HIT',
      };
    }

    const result = await eventoRepository.list(query.page, query.limit);

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

  async getById(id: string): Promise<CachedResult<EventoPayload>> {
    const cacheKey = await eventoCache.detailKey(id);
    const cachedEvento = await eventoCache.get<EventoPayload>(cacheKey);

    if (cachedEvento !== null) {
      return {
        payload: cachedEvento,
        cacheStatus: 'HIT',
      };
    }

    const evento = await eventoRepository.findPublicById(id);

    if (!evento) {
      throw new AppError(
        404,
        'EVENTO_NOT_FOUND',
        'El evento publicado no existe o está eliminado.',
      );
    }

    const payload = serializeEvento(evento);
    await eventoCache.set(cacheKey, payload);

    return {
      payload,
      cacheStatus: 'MISS',
    };
  },

  async update(id: string, input: UpdateEventoInput): Promise<EventoPayload> {
    await ensureActiveEvento(id);

    if (input.lugarId !== undefined) {
      await ensureActiveLugar(input.lugarId);
    }

    if (input.categoriaIds !== undefined) {
      await ensureActiveCategories(input.categoriaIds);
    }

    const evento = await eventoRepository.update(id, input);
    await eventoCache.invalidate();

    return serializeEvento(evento);
  },

  async remove(id: string): Promise<void> {
    await ensureActiveEvento(id);
    await eventoRepository.softDelete(id);
    await eventoCache.invalidate();
  },
};
