import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../common/errors/app-error.js';
import { env } from '../config/env.js';

interface JsonParseError extends SyntaxError {
  status?: unknown;
  type?: unknown;
}

function isMalformedJsonError(error: unknown): error is JsonParseError {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  const candidate = error as JsonParseError;

  return candidate.status === 400 && candidate.type === 'entity.parse.failed';
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      404,
      'ROUTE_NOT_FOUND',
      `No existe la ruta ${request.method} ${request.originalUrl}.`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (isMalformedJsonError(error)) {
    response.status(400).json({
      error: {
        code: 'MALFORMED_JSON',
        message: 'El cuerpo JSON de la solicitud está malformado.',
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'La solicitud contiene datos inválidos.',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error);
  }

  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error interno.',
    },
  });
};
