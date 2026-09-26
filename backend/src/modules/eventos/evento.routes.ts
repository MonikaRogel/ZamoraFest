import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { imagenRouter } from '../imagenes/imagen.routes.js';
import { programacionRouter } from '../programaciones/programacion.routes.js';
import {
  createEventoController,
  deleteEventoController,
  getEventoController,
  listEventosController,
  listOwnEventosController,
  publishEventoController,
  reviewEventoController,
  updateEventoController,
} from './evento.controller.js';

export const eventoRouter = Router();

eventoRouter
  .route('/')
  .get(listEventosController)
  .post(authenticate, authorizeRoles('ASISTENTE'), createEventoController);

eventoRouter.get('/mios', authenticate, authorizeRoles('ASISTENTE'), listOwnEventosController);

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

eventoRouter.use('/:eventoId/programaciones', programacionRouter);
eventoRouter.use('/:eventoId/imagenes', imagenRouter);

eventoRouter
  .route('/:id')
  .get(getEventoController)
  .patch(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), updateEventoController)
  .delete(authenticate, authorizeRoles('ADMINISTRADOR'), deleteEventoController);
