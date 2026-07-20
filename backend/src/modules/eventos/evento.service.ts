import { AppError } from '../../common/errors/app-error.js';
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
    createdAt: evento.createdAt,
    updatedAt: evento.updatedAt,
  };
}

async function ensureActiveLugar(lugarId: string) {
  const lugar = await eventoRepository.findActiveLugar(lugarId);

  if (!lugar) {
    throw new AppError(404, 'LUGAR_NOT_FOUND', 'El lugar no existe o está eliminado.');
  }
}

async function ensureActiveCategories(categoriaIds: string[]) {
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

async function ensureActiveEvento(id: string) {
  const evento = await eventoRepository.findActiveById(id);

  if (!evento) {
    throw new AppError(404, 'EVENTO_NOT_FOUND', 'El evento no existe o está eliminado.');
  }
}

export const eventoService = {
  async create(input: CreateEventoInput) {
    await ensureActiveLugar(input.lugarId);
    await ensureActiveCategories(input.categoriaIds);

    const evento = await eventoRepository.create(input);

    return serializeEvento(evento);
  },

  async list(query: ListEventosQuery) {
    const result = await eventoRepository.list(query.page, query.limit);

    return {
      data: result.eventos.map(serializeEvento),
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getById(id: string) {
    const evento = await eventoRepository.findPublicById(id);

    if (!evento) {
      throw new AppError(
        404,
        'EVENTO_NOT_FOUND',
        'El evento publicado no existe o está eliminado.',
      );
    }

    return serializeEvento(evento);
  },

  async update(id: string, input: UpdateEventoInput) {
    await ensureActiveEvento(id);

    if (input.lugarId !== undefined) {
      await ensureActiveLugar(input.lugarId);
    }

    if (input.categoriaIds !== undefined) {
      await ensureActiveCategories(input.categoriaIds);
    }

    const evento = await eventoRepository.update(id, input);

    return serializeEvento(evento);
  },

  async remove(id: string) {
    await ensureActiveEvento(id);
    await eventoRepository.softDelete(id);
  },
};
