import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import {
  createEventoController,
  deleteEventoController,
  getEventoController,
  listEventosController,
  publishEventoController,
  reviewEventoController,
  updateEventoController,
} from './evento.controller.js';

export const eventoRouter = Router();

eventoRouter
  .route('/')
  .get(listEventosController)
  .post(authenticate, authorizeRoles('ASISTENTE'), createEventoController);

eventoRouter.post(
  '/:id/revision',
  authenticate,
  authorizeRoles('ADMINISTRADOR'),
  reviewEventoController,
);

eventoRouter.post(
  '/:id/publicacion',
  authenticate,
  authorizeRoles('ADMINISTRADOR'),
  publishEventoController,
);

eventoRouter
  .route('/:id')
  .get(getEventoController)
  .patch(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), updateEventoController)
  .delete(authenticate, authorizeRoles('ADMINISTRADOR'), deleteEventoController);
