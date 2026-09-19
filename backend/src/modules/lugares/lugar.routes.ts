import { Router } from 'express';

import { listLugaresController } from './lugar.controller.js';

export const lugarRouter = Router();

lugarRouter.get('/', listLugaresController);
