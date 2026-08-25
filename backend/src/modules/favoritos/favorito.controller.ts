import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import { createFavoritoSchema, favoritoEventoParamsSchema } from './favorito.schemas.js';
import { favoritoService } from './favorito.service.js';

interface AuthenticatedRequest extends Request {
  auth?: IdentidadAcceso;
}

function requireIdentity(request: Request): IdentidadAcceso {
  const identidad = (request as AuthenticatedRequest).auth;

  if (!identidad) {
    throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere autenticación.');
  }

  return identidad;
}

export const createFavoritoController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const input = createFavoritoSchema.parse(request.body as unknown);

  const favorito = await favoritoService.create(identidad, input);

  response.status(201).json({
    data: favorito,
  });
};

export const listFavoritosController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const favoritos = await favoritoService.list(identidad);

  response.status(200).json({
    data: favoritos,
  });
};

export const deleteFavoritoController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId } = favoritoEventoParamsSchema.parse(request.params);

  await favoritoService.remove(identidad, eventoId);

  response.status(204).send();
};
