import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import {
  createProgramacionController,
  deleteProgramacionController,
  getProgramacionController,
  listProgramacionesController,
  updateProgramacionController,
} from './programacion.controller.js';

export const programacionRouter = Router({
  mergeParams: true,
});

programacionRouter
  .route('/')
  .get(listProgramacionesController)
  .post(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), createProgramacionController);

programacionRouter
  .route('/:programacionId')
  .get(getProgramacionController)
  .patch(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), updateProgramacionController)
  .delete(authenticate, authorizeRoles('ASISTENTE', 'ADMINISTRADOR'), deleteProgramacionController);
