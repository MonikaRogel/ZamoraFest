import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import {
  createFavoritoController,
  deleteFavoritoController,
  listFavoritosController,
} from './favorito.controller.js';

export const favoritoRouter = Router();

favoritoRouter.use(authenticate);

favoritoRouter.route('/').get(listFavoritosController).post(createFavoritoController);

favoritoRouter.delete('/:eventoId', deleteFavoritoController);
