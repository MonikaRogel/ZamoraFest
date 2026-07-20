import 'dotenv/config';

import { z } from 'zod';

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().min(1).optional(),
    TEST_DATABASE_URL: z.string().min(1).optional(),
    JWT_ACCESS_SECRET: z.string().min(64),
    JWT_REFRESH_SECRET: z.string().min(64),
    REDIS_URL: z.string().url().default('redis://127.0.0.1:6379'),
  })
  .superRefine((variables, context) => {
    const requiredVariable = variables.NODE_ENV === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

    if (!variables[requiredVariable]) {
      context.addIssue({
        code: 'custom',
        path: [requiredVariable],
        message: `${requiredVariable} es obligatoria para ${variables.NODE_ENV}.`,
      });
    }

    if (variables.JWT_ACCESS_SECRET === variables.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'Las claves de acceso y renovación deben ser diferentes.',
      });
    }
  });

const validationResult = environmentSchema.safeParse(process.env);

if (!validationResult.success) {
  const invalidVariables = [
    ...new Set(validationResult.error.issues.map((issue) => issue.path.join('.') || 'entorno')),
  ];

  throw new Error(`Variables de entorno inválidas: ${invalidVariables.join(', ')}.`);
}

export const env = validationResult.data;
