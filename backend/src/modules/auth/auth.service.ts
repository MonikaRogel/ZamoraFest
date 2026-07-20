import { createHash, randomUUID } from 'node:crypto';

import { compare, hash as hashPassword } from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';

import { AppError } from '../../common/errors/app-error.js';
import { env } from '../../config/env.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { LoginInput, RefreshTokenInput, RegisterInput } from './auth.schemas.js';

export type RolAutorizado = 'ASISTENTE' | 'ADMIN';

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  email: string;
  rol: RolAutorizado;
}

export interface IdentidadAcceso {
  id: string;
  rol: RolAutorizado;
}

interface RespuestaTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: UsuarioAutenticado;
}

interface ParTokens {
  respuesta: RespuestaTokens;
  refreshRegistro: {
    tokenHash: string;
    expiraEn: Date;
  };
}

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;
const JWT_ISSUER = 'zamorafest-backend';
const JWT_AUDIENCE = 'zamorafest-api';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

const usuarioPublicoSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
} as const;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isRolAutorizado(value: unknown): value is RolAutorizado {
  return value === 'ASISTENTE' || value === 'ADMIN';
}

function invalidCredentialsError(): AppError {
  return new AppError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña son incorrectos.');
}

function invalidRefreshTokenError(): AppError {
  return new AppError(
    401,
    'INVALID_REFRESH_TOKEN',
    'El token de renovación no es válido o ha expirado.',
  );
}

async function createTokenPair(usuario: UsuarioAutenticado): Promise<ParTokens> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const accessExpiresAt = issuedAt + ACCESS_TOKEN_SECONDS;
  const refreshExpiresAt = issuedAt + REFRESH_TOKEN_SECONDS;

  const accessToken = await new SignJWT({
    type: 'access',
    rol: usuario.rol,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuario.id)
    .setJti(randomUUID())
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt(issuedAt)
    .setExpirationTime(accessExpiresAt)
    .sign(accessSecret);

  const refreshToken = await new SignJWT({
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuario.id)
    .setJti(randomUUID())
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt(issuedAt)
    .setExpirationTime(refreshExpiresAt)
    .sign(refreshSecret);

  return {
    respuesta: {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_SECONDS,
      usuario,
    },
    refreshRegistro: {
      tokenHash: hashToken(refreshToken),
      expiraEn: new Date(refreshExpiresAt * 1000),
    },
  };
}

async function register(input: RegisterInput): Promise<UsuarioAutenticado> {
  const existingUser = await prisma.usuario.findFirst({
    where: {
      email: input.email,
      eliminadoEn: null,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'El correo electrónico ya está registrado.',
    );
  }

  const passwordHash = await hashPassword(input.password, 12);

  return prisma.usuario.create({
    data: {
      nombre: input.nombre,
      email: input.email,
      passwordHash,
    },
    select: usuarioPublicoSelect,
  });
}

async function login(input: LoginInput): Promise<RespuestaTokens> {
  const usuario = await prisma.usuario.findFirst({
    where: {
      email: input.email,
      eliminadoEn: null,
    },
    select: {
      ...usuarioPublicoSelect,
      passwordHash: true,
    },
  });

  if (!usuario) {
    throw invalidCredentialsError();
  }

  const validPassword = await compare(input.password, usuario.passwordHash);

  if (!validPassword) {
    throw invalidCredentialsError();
  }

  const usuarioAutenticado: UsuarioAutenticado = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };

  const tokenPair = await createTokenPair(usuarioAutenticado);

  await prisma.refreshToken.create({
    data: {
      usuarioId: usuario.id,
      tokenHash: tokenPair.refreshRegistro.tokenHash,
      expiraEn: tokenPair.refreshRegistro.expiraEn,
    },
  });

  return tokenPair.respuesta;
}

async function refresh(input: RefreshTokenInput): Promise<RespuestaTokens> {
  try {
    const verification = await jwtVerify(input.refreshToken, refreshSecret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const { payload } = verification;

    if (
      payload.type !== 'refresh' ||
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      throw invalidRefreshTokenError();
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashToken(input.refreshToken),
      },
      include: {
        usuario: {
          select: {
            ...usuarioPublicoSelect,
            eliminadoEn: true,
          },
        },
      },
    });

    const now = new Date();

    if (
      !storedToken ||
      storedToken.usuarioId !== payload.sub ||
      storedToken.revocadoEn !== null ||
      storedToken.expiraEn <= now ||
      storedToken.usuario.eliminadoEn !== null
    ) {
      throw invalidRefreshTokenError();
    }

    const usuarioAutenticado: UsuarioAutenticado = {
      id: storedToken.usuario.id,
      nombre: storedToken.usuario.nombre,
      email: storedToken.usuario.email,
      rol: storedToken.usuario.rol,
    };

    const newTokenPair = await createTokenPair(usuarioAutenticado);

    await prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revocadoEn: null,
        },
        data: {
          revocadoEn: now,
        },
      });

      if (revoked.count !== 1) {
        throw invalidRefreshTokenError();
      }

      await transaction.refreshToken.create({
        data: {
          usuarioId: storedToken.usuarioId,
          tokenHash: newTokenPair.refreshRegistro.tokenHash,
          expiraEn: newTokenPair.refreshRegistro.expiraEn,
        },
      });
    });

    return newTokenPair.respuesta;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw invalidRefreshTokenError();
  }
}

export async function verifyAccessToken(token: string): Promise<IdentidadAcceso> {
  try {
    const verification = await jwtVerify(token, accessSecret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const { payload } = verification;

    if (
      payload.type !== 'access' ||
      typeof payload.sub !== 'string' ||
      !isRolAutorizado(payload.rol)
    ) {
      throw new Error('Contenido del token inválido.');
    }

    return {
      id: payload.sub,
      rol: payload.rol,
    };
  } catch {
    throw new AppError(
      401,
      'INVALID_ACCESS_TOKEN',
      'El token de acceso no es válido o ha expirado.',
    );
  }
}

export const authService = {
  register,
  login,
  refresh,
};
