import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import {
  createImagenController,
  deleteImagenController,
  getImagenController,
  listImagenesController,
} from './imagen.controller.js';

export const imagenRouter = Router({
  mergeParams: true,
});

imagenRouter
  .route('/')
  .get(listImagenesController)
  .post(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), createImagenController);

imagenRouter
  .route('/:imagenId')
  .get(getImagenController)
  .delete(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), deleteImagenController);
