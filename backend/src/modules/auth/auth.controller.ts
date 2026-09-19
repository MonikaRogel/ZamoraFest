import type { RequestHandler } from 'express';

import { parseRequestBody } from '../../common/validation/request-body.js';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schemas.js';
import { authService } from './auth.service.js';

export const registerController: RequestHandler = async (request, response) => {
  const input = parseRequestBody(registerSchema, request.body);
  const usuario = await authService.register(input);

  response.status(201).json({
    data: usuario,
  });
};

export const loginController: RequestHandler = async (request, response) => {
  const input = parseRequestBody(loginSchema, request.body);
  const session = await authService.login(input);

  response.status(200).json({
    data: session,
  });
};

export const refreshController: RequestHandler = async (request, response) => {
  const input = parseRequestBody(refreshTokenSchema, request.body);
  const session = await authService.refresh(input);

  response.status(200).json({
    data: session,
  });
};
