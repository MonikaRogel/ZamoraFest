import { z } from 'zod';

const POSTGRES_INT_MAX = 2_147_483_647;

const entityIdSchema = z
  .number()
  .int('El identificador debe ser un número entero.')
  .min(1, 'El identificador debe ser mayor que cero.')
  .max(POSTGRES_INT_MAX, 'El identificador supera el rango permitido.');

const paramsIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'El identificador debe contener únicamente dígitos y ser mayor que cero.')
  .transform(Number)
  .pipe(z.number().int().max(POSTGRES_INT_MAX, 'El identificador supera el rango permitido.'));

const imageUrlSchema = z
  .string()
  .trim()
  .min(1, 'La URL de la imagen es obligatoria.')
  .max(2048, 'La URL de la imagen no puede superar 2048 caracteres.')
  .url('La URL de la imagen no es válida.')
  .refine((value) => {
    const protocol = new URL(value).protocol;

    return protocol === 'http:' || protocol === 'https:';
  }, 'La URL de la imagen debe usar HTTP o HTTPS.');

export const tipoImagenSchema = z.enum(['AFICHE', 'FOTOGRAFIA', 'OTRA']);

export const createImagenSchema = z
  .object({
    urlImagen: imageUrlSchema,
    tipoImagen: tipoImagenSchema,
    descripcion: z.string().trim().min(1).max(255).nullable().optional(),
    programacionId: entityIdSchema.nullable().optional(),
    esPrincipal: z.boolean().optional().default(false),
  })
  .strict();

export const imagenEventoParamsSchema = z
  .object({
    eventoId: paramsIdSchema,
    imagenId: paramsIdSchema.optional(),
  })
  .strict();

export type CreateImagenInput = z.infer<typeof createImagenSchema>;
