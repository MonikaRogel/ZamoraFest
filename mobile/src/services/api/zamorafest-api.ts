import {
  getApiBaseUrl,
  parseApiBaseUrl,
} from '../../config/env';
import type {
  AuthenticatedUser,
  AuthSession,
  Canton,
  CantonConsulta,
  Categoria,
  CategoriasResponse,
  CreateEventoRequest,
  UpdateEventoRequest,
  Evento,
  EventosResponse,
  HealthResponse,
  LoginRequest,
  Lugar,
  LugarConsulta,
  LugaresResponse,
  PaginationMeta,
  Parroquia,
  ParroquiaConsulta,
  Provincia,
  ProvinciaConsulta,
  Programacion,
  ProgramacionLugar,
  ProgramacionesResponse,
  RegisterRequest,
  RegisteredVisitor,
  RolResumen,
  Sector,
  SectorConsulta,
  UsuarioResumen,
} from '../../types/api';

type Fetcher = typeof fetch;

type ResponseValidator<T> =
  (value: unknown) => value is T;

interface CreateApiOptions {
  readonly baseUrl?: string;
  readonly fetcher?: Fetcher;
}

interface LoginEnvelope {
  readonly data: AuthSession;
}

interface RegisterEnvelope {
  readonly data: RegisteredVisitor;
}

interface EventoEnvelope {
  readonly data: Evento;
}

export interface GetEventosParams {
  readonly page?: number;
  readonly limit?: number;
  readonly cantonId?: number;
  readonly categoriaId?: number;
  readonly fechaDesde?: string;
  readonly fechaHasta?: string;
}

export interface GetOwnEventosParams {
  readonly page?: number;
  readonly limit?: number;
}

export interface GetAdminEventosParams {
  readonly page?: number;
  readonly limit?: number;
  readonly estadoRevision?:
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO';
  readonly estadoEvento?:
    | 'BORRADOR'
    | 'PROGRAMADO'
    | 'CANCELADO'
    | 'FINALIZADO'
    | 'ELIMINADO';
}

export interface ReviewEventoRequest {
  readonly decision:
    | 'APROBAR'
    | 'RECHAZAR';
}

export interface ZamoraFestApi {
  getHealth(): Promise<HealthResponse>;

  getEventos(
    params?: GetEventosParams,
  ): Promise<EventosResponse>;

  getOwnEventos(
    params:
      GetOwnEventosParams | undefined,
    accessToken: string,
  ): Promise<EventosResponse>;

  getOwnEventoById(
    id: number,
    accessToken: string,
  ): Promise<Evento>;
  getAdminEventos(
    params:
      GetAdminEventosParams | undefined,
    accessToken: string,
  ): Promise<EventosResponse>;

  getAdminEventoById(
    id: number,
    accessToken: string,
  ): Promise<Evento>;

  reviewEvento(
    id: number,
    input: ReviewEventoRequest,
    accessToken: string,
  ): Promise<Evento>;

  publishEvento(
    id: number,
    accessToken: string,
  ): Promise<Evento>;

  getEventoById(
    id: number,
  ): Promise<Evento>;

  getProgramaciones(
    eventoId: number,
  ): Promise<ProgramacionesResponse>;

  getCategorias(): Promise<CategoriasResponse>;

  getLugares(): Promise<LugaresResponse>;

  createEvento(
    input: CreateEventoRequest,
    accessToken: string,
  ): Promise<Evento>;

  updateEvento(
    id: number,
    input: UpdateEventoRequest,
    accessToken: string,
  ): Promise<Evento>;

  deleteEvento(
    id: number,
    accessToken: string,
  ): Promise<void>;

  login(
    input: LoginRequest,
  ): Promise<AuthSession>;

  register(
    input: RegisterRequest,
  ): Promise<RegisteredVisitor>;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

interface ApiRequestErrorOptions
  extends ErrorOptions {
  readonly body?:
    ApiErrorResponse | null;
}

export class ApiRequestError
  extends Error {
  readonly status:
    number | null;

  readonly body:
    ApiErrorResponse | null;

  constructor(
    message: string,
    status:
      number | null = null,
    options?:
      ApiRequestErrorOptions,
  ) {
    super(
      message,
      options,
    );

    this.name =
      'ApiRequestError';

    this.status =
      status;

    this.body =
      options?.body ??
      null;
  }
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function isApiErrorResponse(
  value: unknown,
): value is ApiErrorResponse {
  if (
    !isRecord(
      value,
    ) ||
    !isRecord(
      value.error,
    )
  ) {
    return false;
  }

  return (
    typeof value
      .error
      .code ===
      'string' &&
    typeof value
      .error
      .message ===
      'string'
  );
}

async function readApiErrorResponse(
  response: Response,
): Promise<ApiErrorResponse | null> {
  try {
    const payload:
      unknown =
      await response
        .json();

    return isApiErrorResponse(
      payload,
    )
      ? payload
      : null;
  } catch {
    return null;
  }
}

function isString(
  value: unknown,
): value is string {
  return (
    typeof value ===
    'string'
  );
}

function isNullableString(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    isString(value)
  );
}

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
  );
}

function isInteger(
  value: unknown,
): value is number {
  return (
    isFiniteNumber(
      value,
    ) &&
    Number.isInteger(
      value,
    )
  );
}

function isEntityId(
  value: unknown,
): value is number {
  return (
    isInteger(
      value,
    ) &&
    value > 0 &&
    value <=
      2_147_483_647
  );
}

function isNullableNumber(
  value: unknown,
): value is number | null {
  return (
    value === null ||
    isFiniteNumber(
      value,
    )
  );
}

function isProvincia(
  value: unknown,
): value is Provincia {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.codigoDpa,
    )
  );
}

function isCanton(
  value: unknown,
): value is Canton {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.codigoDpa,
    ) &&
    isProvincia(
      value.provincia,
    )
  );
}

function isParroquia(
  value: unknown,
): value is Parroquia {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.codigoDpa,
    ) &&
    isCanton(
      value.canton,
    )
  );
}

function isSector(
  value: unknown,
): value is Sector {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.tipoSector,
    ) &&
    isParroquia(
      value.parroquia,
    )
  );
}

function isLugar(
  value: unknown,
): value is Lugar {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.tipoLugar,
    ) &&
    isString(
      value
        .direccionReferencial,
    ) &&
    isNullableString(
      value.referencia,
    ) &&
    isNullableNumber(
      value.latitud,
    ) &&
    isNullableNumber(
      value.longitud,
    ) &&
    isSector(
      value.sector,
    )
  );
}

function isProvinciaConsulta(
  value: unknown,
): value is ProvinciaConsulta {
  return (
    isRecord(value) &&
    isEntityId(
      value.id,
    ) &&
    isString(
      value.nombre,
    )
  );
}

function isCantonConsulta(
  value: unknown,
): value is CantonConsulta {
  return (
    isRecord(value) &&
    isEntityId(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isProvinciaConsulta(
      value.provincia,
    )
  );
}

function isParroquiaConsulta(
  value: unknown,
): value is ParroquiaConsulta {
  return (
    isRecord(value) &&
    isEntityId(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isCantonConsulta(
      value.canton,
    )
  );
}

function isSectorConsulta(
  value: unknown,
): value is SectorConsulta {
  return (
    isRecord(value) &&
    isEntityId(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.tipoSector,
    ) &&
    isParroquiaConsulta(
      value.parroquia,
    )
  );
}

function isLugarConsulta(
  value: unknown,
): value is LugarConsulta {
  return (
    isRecord(value) &&
    isEntityId(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isString(
      value.tipoLugar,
    ) &&
    isNullableString(
      value
        .direccionReferencial,
    ) &&
    isSectorConsulta(
      value.sector,
    )
  );
}

function isProgramacionLugar(
  value: unknown,
): value is ProgramacionLugar {
  if (
    !isRecord(value) ||
    !isEntityId(value.id) ||
    !isString(value.nombre) ||
    !isNullableString(value.direccionReferencial) ||
    !isRecord(value.sector) ||
    !isString(value.sector.nombre) ||
    !isRecord(value.sector.parroquia) ||
    !isString(value.sector.parroquia.nombre) ||
    !isRecord(value.sector.parroquia.canton)
  ) {
    return false;
  }

  return (
    isEntityId(
      value.sector.parroquia.canton.id,
    ) &&
    isString(
      value.sector.parroquia.canton.nombre,
    )
  );
}

function isProgramacion(
  value: unknown,
): value is Programacion {
  return (
    isRecord(value) &&
    isEntityId(value.id) &&
    isEntityId(value.eventoId) &&
    (
      value.lugarId === null ||
      isEntityId(value.lugarId)
    ) &&
    isString(value.tituloActividad) &&
    isNullableString(value.descripcion) &&
    isString(value.fechaHoraInicio) &&
    isNullableString(value.fechaHoraFin) &&
    isNullableString(value.artistaInvitado) &&
    (
      value.orden === null ||
      isInteger(value.orden)
    ) &&
    typeof value.estado === 'boolean' &&
    (
      value.lugar === null ||
      isProgramacionLugar(value.lugar)
    )
  );
}

function isProgramacionesResponse(
  value: unknown,
): value is ProgramacionesResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isProgramacion)
  );
}
function isRolResumen(
  value: unknown,
): value is RolResumen {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    )
  );
}

function isUsuarioResumen(
  value: unknown,
): value is UsuarioResumen {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombreCompleto,
    ) &&
    isRolResumen(
      value.rol,
    )
  );
}

function isNullableUsuario(
  value: unknown,
): value is
  | UsuarioResumen
  | null {
  return (
    value === null ||
    isUsuarioResumen(
      value,
    )
  );
}

function isCategoria(
  value: unknown,
): value is Categoria {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.nombre,
    ) &&
    isNullableString(
      value.descripcion,
    )
  );
}

function isCategoriasResponse(
  value: unknown,
): value is CategoriasResponse {
  return (
    isRecord(value) &&
    Array.isArray(
      value.data,
    ) &&
    value.data.every(
      (category) =>
        isCategoria(
          category,
        ) &&
        isEntityId(
          category.id,
        ),
    )
  );
}

function isLugaresResponse(
  value: unknown,
): value is LugaresResponse {
  return (
    isRecord(value) &&
    Array.isArray(
      value.data,
    ) &&
    value.data.every(
      isLugarConsulta,
    )
  );
}

function isEvento(
  value: unknown,
): value is Evento {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    isString(
      value.titulo,
    ) &&
    isNullableString(
      value.descripcion,
    ) &&
    isString(
      value.fechaInicio,
    ) &&
    isString(
      value.fechaFin,
    ) &&
    isFiniteNumber(
      value
        .costoReferencial,
    ) &&
    isString(
      value.estadoEvento,
    ) &&
    isString(
      value.estadoRevision,
    ) &&
    isNullableString(
      value
        .fuenteInformacion,
    ) &&
    isString(
      value.fechaCreacion,
    ) &&
    isNullableString(
      value
        .fechaActualizacion,
    ) &&
    isNullableString(
      value.fechaRevision,
    ) &&
    isLugar(
      value.lugar,
    ) &&
    isUsuarioResumen(
      value.usuarioCreador,
    ) &&
    isNullableUsuario(
      value.usuarioRevisor,
    ) &&
    Array.isArray(
      value.categorias,
    ) &&
    value.categorias.every(
      isCategoria,
    )
  );
}

function isPaginationMeta(
  value: unknown,
): value is PaginationMeta {
  return (
    isRecord(value) &&
    isInteger(
      value.page,
    ) &&
    isInteger(
      value.limit,
    ) &&
    isInteger(
      value.total,
    ) &&
    isInteger(
      value.totalPages,
    )
  );
}

function isHealthResponse(
  value: unknown,
): value is HealthResponse {
  return (
    isRecord(value) &&
    value.status ===
      'ok' &&
    value.service ===
      'zamorafest-backend'
  );
}

function isAuthRole(
  value: unknown,
): value is
  AuthenticatedUser['rol'] {
  return (
    value ===
      'VISITANTE' ||
    value ===
      'ASISTENTE' ||
    value ===
      'ADMINISTRADOR'
  );
}

function isAuthenticatedUser(
  value: unknown,
): value is AuthenticatedUser {
  return (
    isRecord(value) &&
    isInteger(
      value.id,
    ) &&
    value.id > 0 &&
    isString(
      value.nombre,
    ) &&
    value.nombre.length >
      0 &&
    isString(
      value.email,
    ) &&
    value.email.length >
      0 &&
    isAuthRole(
      value.rol,
    )
  );
}

function isRegisteredVisitor(
  value: unknown,
): value is RegisteredVisitor {
  return (
    isAuthenticatedUser(
      value,
    ) &&
    value.rol ===
      'VISITANTE'
  );
}

function isLoginEnvelope(
  value: unknown,
): value is LoginEnvelope {
  if (
    !isRecord(value) ||
    !isRecord(
      value.data,
    )
  ) {
    return false;
  }

  const data =
    value.data;

  return (
    isString(
      data.accessToken,
    ) &&
    data.accessToken.length >
      0 &&
    isString(
      data.refreshToken,
    ) &&
    data.refreshToken.length >
      0 &&
    data.tokenType ===
      'Bearer' &&
    isInteger(
      data.expiresIn,
    ) &&
    data.expiresIn >
      0 &&
    isAuthenticatedUser(
      data.usuario,
    )
  );
}

function isRegisterEnvelope(
  value: unknown,
): value is RegisterEnvelope {
  return (
    isRecord(value) &&
    isRegisteredVisitor(
      value.data,
    )
  );
}

function isEventosResponse(
  value: unknown,
): value is EventosResponse {
  return (
    isRecord(value) &&
    Array.isArray(
      value.data,
    ) &&
    value.data.every(
      isEvento,
    ) &&
    isPaginationMeta(
      value.meta,
    )
  );
}

function isEventoEnvelope(
  value: unknown,
): value is EventoEnvelope {
  return (
    isRecord(value) &&
    isEvento(
      value.data,
    )
  );
}

async function requestJson<T>(
  url: URL,
  validator:
    ResponseValidator<T>,
  fetcher: Fetcher,
  init: RequestInit = {
    method: 'GET',
    headers: {
      Accept:
        'application/json',
    },
  },
): Promise<T> {
  let response:
    Response;

  try {
    response =
      await fetcher(
        url,
        init,
      );
  } catch (cause) {
    throw new ApiRequestError(
      'No se pudo establecer conexión con la API.',
      null,
      {
        cause,
      },
    );
  }

  if (
    !response.ok
  ) {
    const body =
      await readApiErrorResponse(
        response,
      );

    throw new ApiRequestError(
      `La API respondió con el estado HTTP ${response.status}.`,
      response.status,
      {
        body,
      },
    );
  }

  let payload:
    unknown;

  try {
    payload =
      await response
        .json();
  } catch (cause) {
    throw new ApiRequestError(
      'La API devolvió una respuesta que no contiene JSON válido.',
      response.status,
      {
        cause,
      },
    );
  }

  if (
    !validator(
      payload,
    )
  ) {
    throw new ApiRequestError(
      'La API devolvió una respuesta incompatible con el contrato esperado.',
      response.status,
    );
  }

  return payload;
}

async function requestNoContent(
  url: URL,
  fetcher: Fetcher,
  init: RequestInit,
): Promise<void> {
  let response:
    Response;

  try {
    response =
      await fetcher(
        url,
        init,
      );
  } catch (cause) {
    throw new ApiRequestError(
      'No se pudo establecer conexión con la API.',
      null,
      {
        cause,
      },
    );
  }

  if (
    !response.ok
  ) {
    const body =
      await readApiErrorResponse(
        response,
      );

    throw new ApiRequestError(
      `La API respondió con el estado HTTP ${response.status}.`,
      response.status,
      {
        body,
      },
    );
  }

  if (
    response.status !==
    204
  ) {
    throw new ApiRequestError(
      'La API devolvió una respuesta incompatible con el contrato esperado.',
      response.status,
    );
  }
}

export function createZamoraFestApi(
  options:
    CreateApiOptions = {},
): ZamoraFestApi {
  const fetcher =
    options.fetcher ??
    globalThis.fetch.bind(
      globalThis,
    );

  function resolveBaseUrl():
    string {
    return (
      options.baseUrl ===
      undefined
        ? getApiBaseUrl()
        : parseApiBaseUrl(
            options.baseUrl,
          )
    );
  }

  return {
    getHealth() {
      const url =
        new URL(
          '/api/v1/health',
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isHealthResponse,
        fetcher,
      );
    },

    getEventos(
      params:
        GetEventosParams = {},
    ) {
      const url =
        new URL(
          '/api/v1/eventos',
          resolveBaseUrl(),
        );

      const page =
        params.page ??
        1;

      const limit =
        params.limit ??
        5;

      url.searchParams.set(
        'page',
        String(page),
      );

      url.searchParams.set(
        'limit',
        String(limit),
      );

      if (
        params.cantonId !==
        undefined
      ) {
        url.searchParams.set(
          'cantonId',
          String(
            params.cantonId,
          ),
        );
      }

      if (
        params.categoriaId !==
        undefined
      ) {
        url.searchParams.set(
          'categoriaId',
          String(
            params.categoriaId,
          ),
        );
      }

      if (
        params.fechaDesde !==
        undefined
      ) {
        url.searchParams.set(
          'fechaDesde',
          params.fechaDesde,
        );
      }

      if (
        params.fechaHasta !==
        undefined
      ) {
        url.searchParams.set(
          'fechaHasta',
          params.fechaHasta,
        );
      }

      return requestJson(
        url,
        isEventosResponse,
        fetcher,
      );
    },

    getOwnEventos(
      params:
        GetOwnEventosParams | undefined,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          '/api/v1/eventos/mios',
          resolveBaseUrl(),
        );

      const page =
        params?.page ??
        1;

      const limit =
        params?.limit ??
        20;

      url.searchParams.set(
        'page',
        String(page),
      );

      url.searchParams.set(
        'limit',
        String(limit),
      );

      return requestJson(
        url,
        isEventosResponse,
        fetcher,
        {
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );
    },

    getAdminEventos(
      params:
        GetAdminEventosParams | undefined,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          '/api/v1/eventos/admin',
          resolveBaseUrl(),
        );

      const page =
        params?.page ??
        1;

      const limit =
        params?.limit ??
        20;

      url.searchParams.set(
        'page',
        String(page),
      );

      url.searchParams.set(
        'limit',
        String(limit),
      );

      if (
        params?.estadoRevision !==
        undefined
      ) {
        url.searchParams.set(
          'estadoRevision',
          params.estadoRevision,
        );
      }

      if (
        params?.estadoEvento !==
        undefined
      ) {
        url.searchParams.set(
          'estadoEvento',
          params.estadoEvento,
        );
      }

      return requestJson(
        url,
        isEventosResponse,
        fetcher,
        {
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );
    },

    getOwnEventoById(
      id: number,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/mios/${id}`,
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isEventoEnvelope,
        fetcher,
        {
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      ).then(
        (response) =>
          response.data,
      );
    },
    getAdminEventoById(
      id: number,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/admin/${id}`,
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isEventoEnvelope,
        fetcher,
        {
          method:
            'GET',
          headers: {
            Accept:
              'application/json',
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      ).then(
        (response) =>
          response.data,
      );
    },

    async reviewEvento(
      id: number,
      input:
        ReviewEventoRequest,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${id}/revision`,
          resolveBaseUrl(),
        );

      const safeInput:
        ReviewEventoRequest = {
        decision:
          input.decision,
      };

      const response =
        await requestJson(
          url,
          isEventoEnvelope,
          fetcher,
          {
            method:
              'POST',
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${accessToken}`,
            },
            body:
              JSON.stringify(
                safeInput,
              ),
          },
        );

      return (
        response.data
      );
    },

    async publishEvento(
      id: number,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${id}/publicacion`,
          resolveBaseUrl(),
        );

      const response =
        await requestJson(
          url,
          isEventoEnvelope,
          fetcher,
          {
            method:
              'POST',
            headers: {
              Accept:
                'application/json',
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        );

      return (
        response.data
      );
    },

    getEventoById(
      id: number,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${id}`,
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isEventoEnvelope,
        fetcher,
      ).then(
        (response) =>
          response.data,
      );
    },

    getProgramaciones(
      eventoId: number,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${eventoId}/programaciones`,
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isProgramacionesResponse,
        fetcher,
      );
    },
    getCategorias() {
      const url =
        new URL(
          '/api/v1/categorias',
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isCategoriasResponse,
        fetcher,
      );
    },

    getLugares() {
      const url =
        new URL(
          '/api/v1/lugares',
          resolveBaseUrl(),
        );

      return requestJson(
        url,
        isLugaresResponse,
        fetcher,
      );
    },

    async createEvento(
      input:
        CreateEventoRequest,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          '/api/v1/eventos',
          resolveBaseUrl(),
        );

      const safeInput:
        CreateEventoRequest = {
        titulo:
          input.titulo,
        descripcion:
          input.descripcion,
        fechaInicio:
          input.fechaInicio,
        fechaFin:
          input.fechaFin,
        costoReferencial:
          input
            .costoReferencial,
        lugarId:
          input.lugarId,
        categoriaIds:
          input.categoriaIds,
        fuenteInformacion:
          input
            .fuenteInformacion,
      };

      const response =
        await requestJson(
          url,
          isEventoEnvelope,
          fetcher,
          {
            method:
              'POST',
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${accessToken}`,
            },
            body:
              JSON.stringify(
                safeInput,
              ),
          },
        );

      return (
        response.data
      );
    },

    async updateEvento(
      id: number,
      input:
        UpdateEventoRequest,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${id}`,
          resolveBaseUrl(),
        );

      const safeInput:
        UpdateEventoRequest = {
        ...(
          input.titulo ===
          undefined
            ? {}
            : { titulo: input.titulo }
        ),
        ...(
          input.descripcion ===
          undefined
            ? {}
            : { descripcion: input.descripcion }
        ),
        ...(
          input.fechaInicio ===
          undefined
            ? {}
            : { fechaInicio: input.fechaInicio }
        ),
        ...(
          input.fechaFin ===
          undefined
            ? {}
            : { fechaFin: input.fechaFin }
        ),
        ...(
          input.costoReferencial ===
          undefined
            ? {}
            : { costoReferencial: input.costoReferencial }
        ),
        ...(
          input.lugarId ===
          undefined
            ? {}
            : { lugarId: input.lugarId }
        ),
        ...(
          input.categoriaIds ===
          undefined
            ? {}
            : { categoriaIds: input.categoriaIds }
        ),
        ...(
          input.fuenteInformacion ===
          undefined
            ? {}
            : { fuenteInformacion: input.fuenteInformacion }
        ),
      };

      const response =
        await requestJson(
          url,
          isEventoEnvelope,
          fetcher,
          {
            method:
              'PATCH',
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${accessToken}`,
            },
            body:
              JSON.stringify(
                safeInput,
              ),
          },
        );

      return (
        response.data
      );
    },

    async deleteEvento(
      id: number,
      accessToken:
        string,
    ) {
      const url =
        new URL(
          `/api/v1/eventos/${id}`,
          resolveBaseUrl(),
        );

      await requestNoContent(
        url,
        fetcher,
        {
          method:
            'DELETE',
          headers: {
            Accept:
              'application/json',
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );
    },
    async login(
      input:
        LoginRequest,
    ) {
      const url =
        new URL(
          '/api/v1/auth/login',
          resolveBaseUrl(),
        );

      const response =
        await requestJson(
          url,
          isLoginEnvelope,
          fetcher,
          {
            method:
              'POST',
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
            },
            body:
              JSON.stringify(
                input,
              ),
          },
        );

      return (
        response.data
      );
    },

    async register(
      input:
        RegisterRequest,
    ) {
      const url =
        new URL(
          '/api/v1/auth/register',
          resolveBaseUrl(),
        );

      const safeInput:
        RegisterRequest = {
        nombre:
          input.nombre,
        email:
          input.email,
        password:
          input.password,
      };

      const response =
        await requestJson(
          url,
          isRegisterEnvelope,
          fetcher,
          {
            method:
              'POST',
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
            },
            body:
              JSON.stringify(
                safeInput,
              ),
          },
        );

      return (
        response.data
      );
    },
  };
}

export const zamoraFestApi:
  ZamoraFestApi = {
  getHealth() {
    return (
      createZamoraFestApi()
        .getHealth()
    );
  },

  getEventos(
    params?:
      GetEventosParams,
  ) {
    return (
      createZamoraFestApi()
        .getEventos(
          params,
        )
    );
  },

  getOwnEventos(
    params:
      GetOwnEventosParams | undefined,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .getOwnEventos(
          params,
          accessToken,
        )
    );
  },

  getAdminEventos(
    params:
      GetAdminEventosParams | undefined,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .getAdminEventos(
          params,
          accessToken,
        )
    );
  },

  getOwnEventoById(
    id: number,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .getOwnEventoById(
          id,
          accessToken,
        )
    );
  },
  getAdminEventoById(
    id: number,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .getAdminEventoById(
          id,
          accessToken,
        )
    );
  },

  reviewEvento(
    id: number,
    input:
      ReviewEventoRequest,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .reviewEvento(
          id,
          input,
          accessToken,
        )
    );
  },

  publishEvento(
    id: number,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .publishEvento(
          id,
          accessToken,
        )
    );
  },

  getEventoById(
    id: number,
  ) {
    return (
      createZamoraFestApi()
        .getEventoById(
          id,
        )
    );
  },

  getProgramaciones(
    eventoId: number,
  ) {
    return (
      createZamoraFestApi()
        .getProgramaciones(
          eventoId,
        )
    );
  },
  getCategorias() {
    return (
      createZamoraFestApi()
        .getCategorias()
    );
  },

  getLugares() {
    return (
      createZamoraFestApi()
        .getLugares()
    );
  },

  createEvento(
    input:
      CreateEventoRequest,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .createEvento(
          input,
          accessToken,
        )
    );
  },

  updateEvento(
    id: number,
    input:
      UpdateEventoRequest,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .updateEvento(
          id,
          input,
          accessToken,
        )
    );
  },

  deleteEvento(
    id: number,
    accessToken:
      string,
  ) {
    return (
      createZamoraFestApi()
        .deleteEvento(
          id,
          accessToken,
        )
    );
  },
  login(
    input:
      LoginRequest,
  ) {
    return (
      createZamoraFestApi()
        .login(
          input,
        )
    );
  },

  register(
    input:
      RegisterRequest,
  ) {
    return (
      createZamoraFestApi()
        .register(
          input,
        )
    );
  },
};
