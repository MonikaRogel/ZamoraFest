import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  createProgramacionSchema,
  programacionEventoParamsSchema,
  updateProgramacionSchema,
} from './programacion.schemas.js';
import { programacionService } from './programacion.service.js';

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

export const listProgramacionesController: RequestHandler = async (request, response) => {
  const { eventoId } = programacionEventoParamsSchema.parse(request.params);

  const programaciones = await programacionService.listPublic(eventoId);

  response.status(200).json({
    data: programaciones,
  });
};

export const getProgramacionController: RequestHandler = async (request, response) => {
  const { eventoId, programacionId } = programacionEventoParamsSchema.parse(request.params);

  if (programacionId === undefined) {
    throw new AppError(
      400,
      'PROGRAMACION_ID_REQUIRED',
      'Se requiere el identificador de la programación.',
    );
  }

  const programacion = await programacionService.getPublic(eventoId, programacionId);

  response.status(200).json({
    data: programacion,
  });
};

export const createProgramacionController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId } = programacionEventoParamsSchema.parse(request.params);

  const input = createProgramacionSchema.parse(request.body as unknown);

  const programacion = await programacionService.create(eventoId, identidad, input);

  response.status(201).json({
    data: programacion,
  });
};

export const updateProgramacionController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId, programacionId } = programacionEventoParamsSchema.parse(request.params);

  if (programacionId === undefined) {
    throw new AppError(
      400,
      'PROGRAMACION_ID_REQUIRED',
      'Se requiere el identificador de la programación.',
    );
  }

  const input = updateProgramacionSchema.parse(request.body as unknown);

  const programacion = await programacionService.update(eventoId, programacionId, identidad, input);

  response.status(200).json({
    data: programacion,
  });
};

export const deleteProgramacionController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { eventoId, programacionId } = programacionEventoParamsSchema.parse(request.params);

  if (programacionId === undefined) {
    throw new AppError(
      400,
      'PROGRAMACION_ID_REQUIRED',
      'Se requiere el identificador de la programación.',
    );
  }

  await programacionService.remove(eventoId, programacionId, identidad);

  response.status(204).send();
};
