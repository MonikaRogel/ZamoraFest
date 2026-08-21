import { AppError } from '../../common/errors/app-error.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  databaseDateToEventoLocalDateTime,
  eventoInstantToDatabaseDate,
} from '../eventos/evento.datetime.js';
import { eventoRepository } from '../eventos/evento.repository.js';
import { favoritoRepository } from './favorito.repository.js';
import type { CreateFavoritoInput } from './favorito.schemas.js';

type FavoritoRecord = Awaited<ReturnType<typeof favoritoRepository.create>>;

function serializeFavorito(favorito: FavoritoRecord) {
  return {
    eventoId: favorito.idEvento,
    fechaAgregado: databaseDateToEventoLocalDateTime(favorito.fechaAgregado),
    evento: {
      id: favorito.evento.id,
      titulo: favorito.evento.titulo,
      fechaInicio: databaseDateToEventoLocalDateTime(favorito.evento.fechaInicio),
      fechaFin:
        favorito.evento.fechaFin === null
          ? null
          : databaseDateToEventoLocalDateTime(favorito.evento.fechaFin),
      costoReferencial: Number(favorito.evento.costoReferencial.toString()),
      estadoEvento: favorito.evento.estadoEvento,
      estadoRevision: favorito.evento.estadoRevision,
      lugar: favorito.evento.lugar,
      categorias: favorito.evento.categorias.map(({ categoria }) => categoria),
    },
  };
}

export const favoritoService = {
  async create(identidad: IdentidadAcceso, input: CreateFavoritoInput) {
    const evento = await eventoRepository.findPublicById(input.eventoId, 'basic');

    if (!evento) {
      throw new AppError(
        404,
        'FAVORITE_EVENT_NOT_AVAILABLE',
        'El evento no está disponible para marcarlo como favorito.',
      );
    }

    const existing = await favoritoRepository.findByUserAndEvent(identidad.id, input.eventoId);

    if (existing) {
      throw new AppError(409, 'FAVORITE_ALREADY_EXISTS', 'El evento ya se encuentra en favoritos.');
    }

    const favorito = await favoritoRepository.create({
      idUsuario: identidad.id,
      idEvento: input.eventoId,
      fechaAgregado: eventoInstantToDatabaseDate(new Date()),
    });

    return serializeFavorito(favorito);
  },

  async list(identidad: IdentidadAcceso) {
    const favoritos = await favoritoRepository.listByUser(identidad.id);

    return favoritos.map(serializeFavorito);
  },

  async remove(identidad: IdentidadAcceso, eventoId: number): Promise<void> {
    const result = await favoritoRepository.deleteOwn(identidad.id, eventoId);

    if (result.count === 0) {
      throw new AppError(
        404,
        'FAVORITE_NOT_FOUND',
        'El favorito no existe para el usuario autenticado.',
      );
    }
  },
};
