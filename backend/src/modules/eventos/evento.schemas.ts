import { z } from 'zod';

const estadoEventoSchema = z.enum(['BORRADOR', 'PUBLICADO']);

const categoriaIdsSchema = z
  .array(z.string().uuid('Cada categoría debe tener un UUID válido.'))
  .min(1, 'Debe seleccionar al menos una categoría.')
  .max(20, 'No puede seleccionar más de 20 categorías.')
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Las categorías no pueden repetirse.',
  });

export const createEventoSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(200, 'El título no puede superar los 200 caracteres.'),
    descripcion: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres.'),
    lugarId: z.string().uuid('El lugar debe tener un UUID válido.'),
    categoriaIds: categoriaIdsSchema,
    estado: estadoEventoSchema.default('BORRADOR'),
  })
  .strict();

export const updateEventoSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(200, 'El título no puede superar los 200 caracteres.')
      .optional(),
    descripcion: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres.')
      .optional(),
    lugarId: z.string().uuid('El lugar debe tener un UUID válido.').optional(),
    categoriaIds: categoriaIdsSchema.optional(),
    estado: estadoEventoSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar.',
  });

export const eventoIdParamsSchema = z
  .object({
    id: z.string().uuid('El identificador del evento no es válido.'),
  })
  .strict();

export const listEventosQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type CreateEventoInput = z.infer<typeof createEventoSchema>;
export type UpdateEventoInput = z.infer<typeof updateEventoSchema>;
export type ListEventosQuery = z.infer<typeof listEventosQuerySchema>;
