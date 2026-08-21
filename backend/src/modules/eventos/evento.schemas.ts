import { z } from 'zod';

const EVENTO_TITULO_MAX = 200;
const FUENTE_INFORMACION_MAX = 500;
const COSTO_REFERENCIAL_MAX = 99_999_999.99;

const fechaHoraLocalPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

function wallClockMillis(value: string): number | null {
  const match = fechaHoraLocalPattern.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');
  const millisecond = Number((match[7] ?? '').padEnd(3, '0') || '0');

  const candidate = new Date(0);

  candidate.setUTCHours(0, 0, 0, 0);
  candidate.setUTCFullYear(year, month - 1, day);
  candidate.setUTCHours(hour, minute, second, millisecond);

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day ||
    candidate.getUTCHours() !== hour ||
    candidate.getUTCMinutes() !== minute ||
    candidate.getUTCSeconds() !== second ||
    candidate.getUTCMilliseconds() !== millisecond
  ) {
    return null;
  }

  return candidate.getTime();
}

const fechaHoraLocalSchema = z
  .string()
  .trim()
  .refine((value) => wallClockMillis(value) !== null, {
    message: 'La fecha y hora debe usar el formato local YYYY-MM-DDTHH:mm[:ss[.SSS]] y ser válida.',
  });

const POSTGRES_INT_MAX = 2_147_483_647;

const entityIdSchema = z
  .number()
  .int('El identificador debe ser un número entero.')
  .min(1, 'El identificador debe ser mayor que cero.')
  .max(POSTGRES_INT_MAX, 'El identificador supera el rango permitido.');
const categoriaIdsSchema = z
  .array(entityIdSchema)
  .min(1, 'Debe seleccionar al menos una categoría.')
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Las categorías no pueden repetirse.',
  });

const costoReferencialSchema = z
  .number()
  .refine(Number.isFinite, 'El costo debe ser un número finito.')
  .min(0, 'El costo referencial no puede ser negativo.')
  .max(COSTO_REFERENCIAL_MAX, 'El costo referencial supera el máximo permitido por DECIMAL(10,2).')
  .refine(
    (value) => {
      const cents = value * 100;

      return Math.abs(Math.round(cents) - cents) < 1e-8;
    },
    {
      message: 'El costo referencial admite como máximo dos decimales.',
    },
  );

const tituloSchema = z
  .string()
  .trim()
  .min(1, 'El título es obligatorio.')
  .max(EVENTO_TITULO_MAX, `El título no puede superar los ${EVENTO_TITULO_MAX} caracteres.`);

const descripcionSchema = z
  .string()
  .trim()
  .min(1, 'La descripción no puede estar vacía cuando se proporciona.');

const fuenteInformacionSchema = z
  .string()
  .trim()
  .min(1, 'La fuente de información no puede estar vacía cuando se proporciona.')
  .max(
    FUENTE_INFORMACION_MAX,
    `La fuente de información no puede superar los ${FUENTE_INFORMACION_MAX} caracteres.`,
  );

function rangoFechasValido(
  fechaInicio: string | undefined,
  fechaFin: string | null | undefined,
): boolean {
  if (fechaInicio === undefined || fechaFin === undefined || fechaFin === null) {
    return true;
  }

  const inicio = wallClockMillis(fechaInicio);

  const fin = wallClockMillis(fechaFin);

  if (inicio === null || fin === null) {
    return true;
  }

  return fin >= inicio;
}

export const createEventoSchema = z
  .object({
    titulo: tituloSchema,
    descripcion: descripcionSchema.nullable().optional(),
    fechaInicio: fechaHoraLocalSchema,
    fechaFin: fechaHoraLocalSchema.nullable().optional(),
    costoReferencial: costoReferencialSchema,
    lugarId: entityIdSchema,
    categoriaIds: categoriaIdsSchema,
    fuenteInformacion: fuenteInformacionSchema.nullable().optional(),
  })
  .strict()
  .superRefine((data, context) => {
    if (!rangoFechasValido(data.fechaInicio, data.fechaFin)) {
      context.addIssue({
        code: 'custom',
        path: ['fechaFin'],
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      });
    }
  });

export const updateEventoSchema = z
  .object({
    titulo: tituloSchema.optional(),
    descripcion: descripcionSchema.nullable().optional(),
    fechaInicio: fechaHoraLocalSchema.optional(),
    fechaFin: fechaHoraLocalSchema.nullable().optional(),
    costoReferencial: costoReferencialSchema.optional(),
    lugarId: entityIdSchema.optional(),
    categoriaIds: categoriaIdsSchema.optional(),
    fuenteInformacion: fuenteInformacionSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar.',
  })
  .superRefine((data, context) => {
    if (!rangoFechasValido(data.fechaInicio, data.fechaFin)) {
      context.addIssue({
        code: 'custom',
        path: ['fechaFin'],
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      });
    }
  });

export const eventoIdParamsSchema = z
  .object({
    id: z
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
export const listEventosQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type CreateEventoInput = z.infer<typeof createEventoSchema>;

export type UpdateEventoInput = z.infer<typeof updateEventoSchema>;

export type ListEventosQuery = z.infer<typeof listEventosQuerySchema>;

export const reviewEventoSchema = z
  .object({
    decision: z.enum(['APROBAR', 'RECHAZAR']),
  })
  .strict();

export type ReviewEventoInput = z.infer<typeof reviewEventoSchema>;
