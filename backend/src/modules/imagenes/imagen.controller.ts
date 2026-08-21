import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import { createImagenSchema, imagenEventoParamsSchema } from './imagen.schemas.js';
import { imagenService } from './imagen.service.js';

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

export const listImagenesController: RequestHandler = async (request, response) => {
  const { eventoId } = imagenEventoParamsSchema.parse(request.params);

  const imagenes = await imagenService.listPublic(eventoId);

  response.status(200).json({
    data: imagenes,
  });
};

export const getImagenController: RequestHandler = async (request, response) => {
  const { eventoId, imagenId } = imagenEventoParamsSchema.parse(request.params);

  if (imagenId === undefined) {
    throw new AppError(400, 'IMAGEN_ID_REQUIRED', 'Se requiere el identificador de la imagen.');
  }

  const imagen = await imagenService.getPublic(eventoId, imagenId);

  response.status(200).json({
    data: imagen,
  });
};

export const createImagenController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId } = imagenEventoParamsSchema.parse(request.params);

  const input = createImagenSchema.parse(request.body as unknown);

  const imagen = await imagenService.create(eventoId, identidad, input);

  response.status(201).json({
    data: imagen,
  });
};

export const deleteImagenController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId, imagenId } = imagenEventoParamsSchema.parse(request.params);

  if (imagenId === undefined) {
    throw new AppError(400, 'IMAGEN_ID_REQUIRED', 'Se requiere el identificador de la imagen.');
  }

  await imagenService.remove(eventoId, imagenId, identidad);

  response.status(204).send();
};
