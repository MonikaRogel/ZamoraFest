import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import {
  createRecordatorioController,
  deactivateRecordatorioController,
  getRecordatorioController,
  listRecordatoriosController,
} from './recordatorio.controller.js';

export const recordatorioRouter = Router();

recordatorioRouter.use(authenticate);

recordatorioRouter.route('/').get(listRecordatoriosController).post(createRecordatorioController);

recordatorioRouter
  .route('/:id')
  .get(getRecordatorioController)
  .delete(deactivateRecordatorioController);
