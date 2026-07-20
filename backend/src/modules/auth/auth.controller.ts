import type { RequestHandler } from 'express';

import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schemas.js';
import { authService } from './auth.service.js';

export const registerController: RequestHandler = async (request, response) => {
  const input = registerSchema.parse(request.body as unknown);
  const usuario = await authService.register(input);

  response.status(201).json({
    data: usuario,
  });
};

export const loginController: RequestHandler = async (request, response) => {
  const input = loginSchema.parse(request.body as unknown);
  const session = await authService.login(input);

  response.status(200).json({
    data: session,
  });
};

export const refreshController: RequestHandler = async (request, response) => {
  const input = refreshTokenSchema.parse(request.body as unknown);
  const session = await authService.refresh(input);

  response.status(200).json({
    data: session,
  });
};
