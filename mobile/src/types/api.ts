export interface HealthResponse {
  readonly status: 'ok';
  readonly service: 'zamorafest-backend';
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface Provincia {
  readonly id: number;
  readonly nombre: string;
  readonly codigoDpa: string;
}

export interface Canton {
  readonly id: number;
  readonly nombre: string;
  readonly codigoDpa: string;
  readonly provincia: Provincia;
}

export interface Parroquia {
  readonly id: number;
  readonly nombre: string;
  readonly codigoDpa: string;
  readonly canton: Canton;
}

export interface Sector {
  readonly id: number;
  readonly nombre: string;
  readonly tipoSector: string;
  readonly parroquia: Parroquia;
}

export interface Lugar {
  readonly id: number;
  readonly nombre: string;
  readonly tipoLugar: string;
  readonly direccionReferencial: string;
  readonly referencia: string | null;
  readonly latitud: number | null;
  readonly longitud: number | null;
  readonly sector: Sector;
}

export interface ProvinciaConsulta {
  readonly id: number;
  readonly nombre: string;
}

export interface CantonConsulta {
  readonly id: number;
  readonly nombre: string;
  readonly provincia: ProvinciaConsulta;
}

export interface ParroquiaConsulta {
  readonly id: number;
  readonly nombre: string;
  readonly canton: CantonConsulta;
}

export interface SectorConsulta {
  readonly id: number;
  readonly nombre: string;
  readonly tipoSector: string;
  readonly parroquia: ParroquiaConsulta;
}

export interface LugarConsulta {
  readonly id: number;
  readonly nombre: string;
  readonly tipoLugar: string;
  readonly direccionReferencial: string | null;
  readonly sector: SectorConsulta;
}

export interface LugaresResponse {
  readonly data: readonly LugarConsulta[];
}

export interface RolResumen {
  readonly id: number;
  readonly nombre: string;
}

export interface UsuarioResumen {
  readonly id: number;
  readonly nombreCompleto: string;
  readonly rol: RolResumen;
}

export interface Categoria {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
}

export interface CategoriasResponse {
  readonly data: readonly Categoria[];
}

export interface Evento {
  readonly id: number;
  readonly titulo: string;
  readonly descripcion: string | null;
  readonly fechaInicio: string;
  readonly fechaFin: string | null;
  readonly costoReferencial: number;
  readonly estadoEvento: string;
  readonly estadoRevision: string;
  readonly fuenteInformacion: string | null;
  readonly fechaCreacion: string;
  readonly fechaActualizacion: string | null;
  readonly fechaRevision: string | null;
  readonly lugar: Lugar;
  readonly usuarioCreador: UsuarioResumen;
  readonly usuarioRevisor: UsuarioResumen | null;
  readonly categorias: readonly Categoria[];
}

export interface EventosResponse {
  readonly data: readonly Evento[];
  readonly meta: PaginationMeta;
}

export type AuthRole =
  | 'VISITANTE'
  | 'ASISTENTE'
  | 'ADMINISTRADOR';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly nombre: string;
  readonly email: string;
  readonly password: string;
}

export interface RegisteredVisitor {
  readonly id: number;
  readonly nombre: string;
  readonly email: string;
  readonly rol: 'VISITANTE';
}

export interface AuthenticatedUser {
  readonly id: number;
  readonly nombre: string;
  readonly email: string;
  readonly rol: AuthRole;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly usuario: AuthenticatedUser;
}