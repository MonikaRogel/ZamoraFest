import { Router } from 'express';

import { listCategoriasController } from './categoria.controller.js';

export const categoriaRouter = Router();

categoriaRouter.get('/', listCategoriasController);
