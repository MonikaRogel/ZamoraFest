import { z } from 'zod';

const emailSchema = z
  .email('El correo electrónico no es válido.')
  .max(254)
  .trim()
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.');

export const registerSchema = z
  .object({
    nombre: z.string().trim().min(2).max(100),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(72),
  })
  .strict();

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
