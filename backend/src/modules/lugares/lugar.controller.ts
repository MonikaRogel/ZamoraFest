import type { RequestHandler } from 'express';

import { lugarService } from './lugar.service.js';

export const listLugaresController: RequestHandler = async (_request, response) => {
  const lugares = await lugarService.listPublic();

  response.status(200).json({
    data: lugares,
  });
};
