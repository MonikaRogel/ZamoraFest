import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { createRecordatorioController } from './recordatorio.controller.js';

export const recordatorioRouter = Router();

recordatorioRouter.post('/', authenticate, createRecordatorioController);
