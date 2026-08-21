export const EVENTO_TIME_ZONE = 'America/Guayaquil';

const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

/**
 * Convierte la fecha-hora local validada del dominio a un Date usado
 * únicamente como portador para PostgreSQL TIMESTAMP WITHOUT TIME ZONE.
 *
 * Se utilizan componentes UTC deliberadamente para conservar el valor
 * de reloj local sin aplicar la zona horaria del sistema operativo.
 */
export function eventoLocalDateTimeToDatabaseDate(value: string): Date {
  const match = localDateTimePattern.exec(value);

  if (!match) {
    throw new RangeError('La fecha-hora del evento no tiene el formato local esperado.');
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

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second ||
    date.getUTCMilliseconds() !== millisecond
  ) {
    throw new RangeError('La fecha-hora del evento no representa una fecha válida.');
  }

  return date;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/**
 * Serializa un TIMESTAMP WITHOUT TIME ZONE sin introducir un sufijo
 * Z ni un desplazamiento horario.
 */
export function databaseDateToEventoLocalDateTime(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError('La fecha almacenada del evento no es válida.');
  }

  const year = pad(value.getUTCFullYear(), 4);
  const month = pad(value.getUTCMonth() + 1);
  const day = pad(value.getUTCDate());
  const hour = pad(value.getUTCHours());
  const minute = pad(value.getUTCMinutes());
  const second = pad(value.getUTCSeconds());
  const millisecond = pad(value.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day}` + `T${hour}:${minute}:${second}` + `.${millisecond}`;
}

function requiredDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
): number {
  const part = parts.find((candidate) => candidate.type === type);

  if (!part) {
    throw new Error(`No se pudo obtener el componente temporal ${type}.`);
  }

  return Number(part.value);
}

export function eventoInstantToDatabaseDate(instant: Date = new Date()): Date {
  if (Number.isNaN(instant.getTime())) {
    throw new Error('El instante proporcionado no es válido.');
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENTO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);

  const year = requiredDateTimePart(parts, 'year');
  const month = requiredDateTimePart(parts, 'month');
  const day = requiredDateTimePart(parts, 'day');
  const hour = requiredDateTimePart(parts, 'hour');
  const minute = requiredDateTimePart(parts, 'minute');
  const second = requiredDateTimePart(parts, 'second');

  const carrier = new Date(0);

  carrier.setUTCHours(0, 0, 0, 0);
  carrier.setUTCFullYear(year, month - 1, day);
  carrier.setUTCHours(hour, minute, second, instant.getUTCMilliseconds());

  return carrier;
}
