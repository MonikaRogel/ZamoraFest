import { eventoCache } from '../../infrastructure/cache/evento-cache.js';
import { categoriaRepository } from './categoria.repository.js';

type CategoriaPayload = Awaited<ReturnType<typeof categoriaRepository.listActive>>;

interface CachedCategoriasResult {
  payload: CategoriaPayload;
  cacheStatus: 'HIT' | 'MISS';
}

export const categoriaService = {
  async listPublic(): Promise<CachedCategoriasResult> {
    const cacheKey = await eventoCache.categoriasKey();

    const cached = await eventoCache.get<CategoriaPayload>(cacheKey);

    if (cached !== null) {
      return {
        payload: cached,
        cacheStatus: 'HIT',
      };
    }

    const categorias = await categoriaRepository.listActive();

    await eventoCache.set(cacheKey, categorias);

    return {
      payload: categorias,
      cacheStatus: 'MISS',
    };
  },
};
