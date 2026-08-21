import { z } from 'zod';

const POSTGRES_INT_MAX = 2_147_483_647;

const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

function isValidLocalDateTime(value: string): boolean {
  const match = localDateTimePattern.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');
  const millisecond = Number((match[7] ?? '').padEnd(3, '0') || '0');

  const date = new Date(0);

  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, millisecond);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second &&
    date.getUTCMilliseconds() === millisecond
  );
}

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

const localDateTimeSchema = z
  .string()
  .refine(
    isValidLocalDateTime,
    'La fecha-hora debe ser local, válida y usar formato YYYY-MM-DDTHH:mm con segundos/milisegundos opcionales.',
  );

export const createRecordatorioSchema = z
  .object({
    eventoId: entityIdSchema,
    programacionId: entityIdSchema.nullable().optional(),
    fechaNotificacion: localDateTimeSchema,
  })
  .strict();

export const recordatorioIdParamsSchema = z
  .object({
    id: paramsIdSchema,
  })
  .strict();

export type CreateRecordatorioInput = z.infer<typeof createRecordatorioSchema>;
