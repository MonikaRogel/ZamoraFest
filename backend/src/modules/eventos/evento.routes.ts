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
  .post(authenticate, authorizeRoles('ASISTENTE'), createEventoController);

eventoRouter
  .route('/:id')
  .get(getEventoController)
  .patch(authenticate, authorizeRoles('ADMINISTRADOR'), updateEventoController)
  .delete(authenticate, authorizeRoles('ADMINISTRADOR'), deleteEventoController);
