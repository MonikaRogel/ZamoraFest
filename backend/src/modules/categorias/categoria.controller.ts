import type { RequestHandler } from 'express';

import { categoriaService } from './categoria.service.js';

export const listCategoriasController: RequestHandler = async (_request, response) => {
  const result = await categoriaService.listPublic();

  response.setHeader('X-Cache', result.cacheStatus);

  response.status(200).json({
    data: result.payload,
  });
};
