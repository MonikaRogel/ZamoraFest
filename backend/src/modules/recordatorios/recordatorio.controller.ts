import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import { createRecordatorioSchema } from './recordatorio.schemas.js';
import { recordatorioService } from './recordatorio.service.js';

interface AuthenticatedRequest extends Request {
  auth?: IdentidadAcceso;
}

export const createRecordatorioController: RequestHandler = async (request, response) => {
  const identity = (request as AuthenticatedRequest).auth;

  if (!identity) {
    throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere autenticación.');
  }

  const input = createRecordatorioSchema.parse(request.body as unknown);
  const recordatorio = await recordatorioService.create(identity.id, input);

  response.status(202).json({
    data: recordatorio,
  });
};
