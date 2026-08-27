import { getApiBaseUrl, parseApiBaseUrl } from '../../config/env';
import type {
  Canton,
  Categoria,
  Evento,
  EventosResponse,
  HealthResponse,
  Lugar,
  PaginationMeta,
  Parroquia,
  Provincia,
  RolResumen,
  Sector,
  UsuarioResumen,
} from '../../types/api';

type Fetcher = typeof fetch;
type ResponseValidator<T> = (value: unknown) => value is T;

interface CreateApiOptions {
  readonly baseUrl?: string;
  readonly fetcher?: Fetcher;
}

export interface ZamoraFestApi {
  getHealth(): Promise<HealthResponse>;
  getEventos(): Promise<EventosResponse>;
}

export class ApiRequestError extends Error {
  readonly status: number | null;

  constructor(
    message: string,
    status: number | null = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isProvincia(value: unknown): value is Provincia {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isString(value.codigoDpa)
  );
}

function isCanton(value: unknown): value is Canton {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isString(value.codigoDpa) &&
    isProvincia(value.provincia)
  );
}

function isParroquia(value: unknown): value is Parroquia {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isString(value.codigoDpa) &&
    isCanton(value.canton)
  );
}

function isSector(value: unknown): value is Sector {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isString(value.tipoSector) &&
    isParroquia(value.parroquia)
  );
}

function isLugar(value: unknown): value is Lugar {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isString(value.tipoLugar) &&
    isString(value.direccionReferencial) &&
    isNullableString(value.referencia) &&
    isNullableNumber(value.latitud) &&
    isNullableNumber(value.longitud) &&
    isSector(value.sector)
  );
}

function isRolResumen(value: unknown): value is RolResumen {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre)
  );
}

function isUsuarioResumen(value: unknown): value is UsuarioResumen {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombreCompleto) &&
    isRolResumen(value.rol)
  );
}

function isNullableUsuario(
  value: unknown,
): value is UsuarioResumen | null {
  return value === null || isUsuarioResumen(value);
}

function isCategoria(value: unknown): value is Categoria {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.nombre) &&
    isNullableString(value.descripcion)
  );
}

function isEvento(value: unknown): value is Evento {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isString(value.titulo) &&
    isString(value.descripcion) &&
    isString(value.fechaInicio) &&
    isNullableString(value.fechaFin) &&
    isFiniteNumber(value.costoReferencial) &&
    isString(value.estadoEvento) &&
    isString(value.estadoRevision) &&
    isNullableString(value.fuenteInformacion) &&
    isString(value.fechaCreacion) &&
    isString(value.fechaActualizacion) &&
    isNullableString(value.fechaRevision) &&
    isLugar(value.lugar) &&
    isUsuarioResumen(value.usuarioCreador) &&
    isNullableUsuario(value.usuarioRevisor) &&
    Array.isArray(value.categorias) &&
    value.categorias.every(isCategoria)
  );
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
  return (
    isRecord(value) &&
    isInteger(value.page) &&
    isInteger(value.limit) &&
    isInteger(value.total) &&
    isInteger(value.totalPages)
  );
}

function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    isRecord(value) &&
    value.status === 'ok' &&
    value.service === 'zamorafest-backend'
  );
}

function isEventosResponse(value: unknown): value is EventosResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isEvento) &&
    isPaginationMeta(value.meta)
  );
}

async function requestJson<T>(
  url: URL,
  validator: ResponseValidator<T>,
  fetcher: Fetcher,
): Promise<T> {
  let response: Response;

  try {
    response = await fetcher(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (cause) {
    throw new ApiRequestError(
      'No se pudo establecer conexión con la API.',
      null,
      { cause },
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(
      `La API respondió con el estado HTTP ${response.status}.`,
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (cause) {
    throw new ApiRequestError(
      'La API devolvió una respuesta que no contiene JSON válido.',
      response.status,
      { cause },
    );
  }

  if (!validator(payload)) {
    throw new ApiRequestError(
      'La API devolvió una respuesta incompatible con el contrato esperado.',
      response.status,
    );
  }

  return payload;
}

export function createZamoraFestApi(
  options: CreateApiOptions = {},
): ZamoraFestApi {
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);

  function resolveBaseUrl(): string {
    return options.baseUrl === undefined
      ? getApiBaseUrl()
      : parseApiBaseUrl(options.baseUrl);
  }

  return {
    getHealth() {
      const url = new URL('/api/v1/health', resolveBaseUrl());

      return requestJson(url, isHealthResponse, fetcher);
    },

    getEventos() {
      const url = new URL('/api/v1/eventos', resolveBaseUrl());

      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '5');

      return requestJson(url, isEventosResponse, fetcher);
    },
  };
}

export const zamoraFestApi: ZamoraFestApi = {
  getHealth() {
    return createZamoraFestApi().getHealth();
  },

  getEventos() {
    return createZamoraFestApi().getEventos();
  },
};
