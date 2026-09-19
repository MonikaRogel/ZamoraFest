import { ZodError, type ZodType } from 'zod';

import { AppError } from '../errors/app-error.js';

interface ValidationDetail {
  path: string;
  message: string;
}

function getValidationDetails(error: ZodError): ValidationDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function parseRequestBody<T>(schema: ZodType<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new AppError(
        422,
        'VALIDATION_ERROR',
        'La solicitud contiene datos inválidos.',
        getValidationDetails(error),
      );
    }

    throw error;
  }
}
