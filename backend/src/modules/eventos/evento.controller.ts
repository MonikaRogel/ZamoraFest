import type { Request, RequestHandler } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import { parseRequestBody } from '../../common/validation/request-body.js';
import type { IdentidadAcceso } from '../auth/auth.service.js';
import {
  createEventoSchema,
  eventoIdParamsSchema,
  listEventosQuerySchema,
  listOwnEventosQuerySchema,
  reviewEventoSchema,
  updateEventoSchema,
} from './evento.schemas.js';
import { eventoService } from './evento.service.js';

interface AuthenticatedRequest extends Request {
  auth?: IdentidadAcceso;
}

function requireIdentity(request: Request): IdentidadAcceso {
  const identity = (request as AuthenticatedRequest).auth;

  if (!identity) {
    throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere autenticación.');
  }

  return identity;
}

export const createEventoController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const input = parseRequestBody(createEventoSchema, request.body);

  const evento = await eventoService.create(identity, input);

  response.status(201).json({
    data: evento,
  });
};

export const listEventosController: RequestHandler = async (request, response) => {
  const query = listEventosQuerySchema.parse(request.query);

  const result = await eventoService.list(query);

  response.setHeader('X-Cache', result.cacheStatus);

  response.status(200).json(result.payload);
};

export const listOwnEventosController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const query = listOwnEventosQuerySchema.parse(request.query);

  const result = await eventoService.listOwn(identity, query);

  response.status(200).json(result);
};

export const getEventoController: RequestHandler = async (request, response) => {
  const { id } = eventoIdParamsSchema.parse(request.params);

  const result = await eventoService.getById(id);

  response.setHeader('X-Cache', result.cacheStatus);

  response.status(200).json({
    data: result.payload,
  });
};

export const updateEventoController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const { id } = eventoIdParamsSchema.parse(request.params);

  const input = parseRequestBody(updateEventoSchema, request.body);

  const evento = await eventoService.update(id, identity, input);

  response.status(200).json({
    data: evento,
  });
};

export const reviewEventoController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const { id } = eventoIdParamsSchema.parse(request.params);

  const input = parseRequestBody(reviewEventoSchema, request.body);

  const evento = await eventoService.review(id, identity, input);

  response.status(200).json({
    data: evento,
  });
};

export const publishEventoController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const { id } = eventoIdParamsSchema.parse(request.params);

  const evento = await eventoService.publish(id, identity);

  response.status(200).json({
    data: evento,
  });
};

export const deleteEventoController: RequestHandler = async (request, response) => {
  const identity = requireIdentity(request);

  const { id } = eventoIdParamsSchema.parse(request.params);

  await eventoService.remove(id, identity);

  response.status(204).send();
};
