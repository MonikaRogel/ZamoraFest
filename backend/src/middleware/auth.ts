import type { Request, RequestHandler } from 'express';

import { AppError } from '../common/errors/app-error.js';
import {
  type IdentidadAcceso,
  type RolAutorizado,
  verifyAccessToken,
} from '../modules/auth/auth.service.js';

interface AuthenticatedRequest extends Request {
  auth?: IdentidadAcceso;
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authorization = request.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere un token de acceso.'));
    return;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere un token de acceso.'));
    return;
  }

  try {
    (request as AuthenticatedRequest).auth = await verifyAccessToken(token);

    next();
  } catch (error) {
    next(error);
  }
};

export function authorizeRoles(...allowedRoles: RolAutorizado[]): RequestHandler {
  return (request, _response, next) => {
    const identity = (request as AuthenticatedRequest).auth;

    if (!identity) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere autenticación.'));
      return;
    }

    if (!allowedRoles.includes(identity.rol)) {
      next(new AppError(403, 'FORBIDDEN', 'No tiene permisos para realizar esta operación.'));
      return;
    }

    next();
  };
}
