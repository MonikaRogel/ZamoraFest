import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import { createRecordatorioSchema, recordatorioIdParamsSchema } from './recordatorio.schemas.js';
import { recordatorioService } from './recordatorio.service.js';

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

export const createRecordatorioController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const input = createRecordatorioSchema.parse(request.body as unknown);

  const recordatorio = await recordatorioService.create(identidad, input);

  response.status(201).json({
    data: recordatorio,
  });
};

export const listRecordatoriosController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const recordatorios = await recordatorioService.listOwn(identidad);

  response.status(200).json({
    data: recordatorios,
  });
};

export const getRecordatorioController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { id } = recordatorioIdParamsSchema.parse(request.params);

  const recordatorio = await recordatorioService.getOwn(identidad, id);

  response.status(200).json({
    data: recordatorio,
  });
};

export const deactivateRecordatorioController: RequestHandler = async (request, response) => {
  const identidad = requireIdentity(request);

  const { id } = recordatorioIdParamsSchema.parse(request.params);

  await recordatorioService.deactivateOwn(identidad, id);

  response.status(204).send();
};
