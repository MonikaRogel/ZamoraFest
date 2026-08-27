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

export interface Evento {
  readonly id: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly fechaInicio: string;
  readonly fechaFin: string | null;
  readonly costoReferencial: number;
  readonly estadoEvento: string;
  readonly estadoRevision: string;
  readonly fuenteInformacion: string | null;
  readonly fechaCreacion: string;
  readonly fechaActualizacion: string;
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
