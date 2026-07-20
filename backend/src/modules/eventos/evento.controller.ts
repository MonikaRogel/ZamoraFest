import type { RequestHandler } from 'express';

import {
  createEventoSchema,
  eventoIdParamsSchema,
  listEventosQuerySchema,
  updateEventoSchema,
} from './evento.schemas.js';
import { eventoService } from './evento.service.js';

export const createEventoController: RequestHandler = async (request, response) => {
  const input = createEventoSchema.parse(request.body as unknown);
  const evento = await eventoService.create(input);

  response.status(201).json({
    data: evento,
  });
};

export const listEventosController: RequestHandler = async (request, response) => {
  const query = listEventosQuerySchema.parse(request.query);
  const result = await eventoService.list(query);

  response.status(200).json(result);
};

export const getEventoController: RequestHandler = async (request, response) => {
  const { id } = eventoIdParamsSchema.parse(request.params);
  const evento = await eventoService.getById(id);

  response.status(200).json({
    data: evento,
  });
};

export const updateEventoController: RequestHandler = async (request, response) => {
  const { id } = eventoIdParamsSchema.parse(request.params);
  const input = updateEventoSchema.parse(request.body as unknown);
  const evento = await eventoService.update(id, input);

  response.status(200).json({
    data: evento,
  });
};

export const deleteEventoController: RequestHandler = async (request, response) => {
  const { id } = eventoIdParamsSchema.parse(request.params);
  await eventoService.remove(id);

  response.status(204).send();
};
