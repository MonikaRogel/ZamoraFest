import { Router } from 'express';

import {
  createEventoController,
  deleteEventoController,
  getEventoController,
  listEventosController,
  updateEventoController,
} from './evento.controller.js';

export const eventoRouter = Router();

eventoRouter.route('/').get(listEventosController).post(createEventoController);

eventoRouter
  .route('/:id')
  .get(getEventoController)
  .patch(updateEventoController)
  .delete(deleteEventoController);
