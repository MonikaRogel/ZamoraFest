import { z } from 'zod';

const POSTGRES_INT_MAX = 2_147_483_647;

const entityIdSchema = z
  .number()
  .int('El identificador debe ser un número entero.')
  .min(1, 'El identificador debe ser mayor que cero.')
  .max(POSTGRES_INT_MAX, 'El identificador supera el rango permitido.');

export const createFavoritoSchema = z
  .object({
    eventoId: entityIdSchema,
  })
  .strict();

export const favoritoEventoParamsSchema = z
  .object({
    eventoId: z
      .string()
      .regex(
        /^[1-9]\d*$/,
        'El identificador del evento debe contener únicamente dígitos y ser mayor que cero.',
      )
      .transform(Number)
      .pipe(
        z
          .number()
          .int()
          .max(POSTGRES_INT_MAX, 'El identificador del evento supera el rango permitido.'),
      ),
  })
  .strict();

export type CreateFavoritoInput = z.infer<typeof createFavoritoSchema>;
