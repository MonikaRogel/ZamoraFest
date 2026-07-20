import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import {
  createEventoController,
  deleteEventoController,
  getEventoController,
  listEventosController,
  updateEventoController,
} from './evento.controller.js';

export const eventoRouter = Router();

eventoRouter
  .route('/')
  .get(listEventosController)
  .post(authenticate, authorizeRoles('ADMIN'), createEventoController);

eventoRouter
  .route('/:id')
  .get(getEventoController)
  .patch(authenticate, authorizeRoles('ADMIN'), updateEventoController)
  .delete(authenticate, authorizeRoles('ADMIN'), deleteEventoController);
