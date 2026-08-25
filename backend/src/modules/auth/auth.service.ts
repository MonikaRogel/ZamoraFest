import { createHash, randomUUID } from 'node:crypto';

import { compare, hash as hashPassword } from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';

import { AppError } from '../../common/errors/app-error.js';
import { env } from '../../config/env.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { LoginInput, RefreshTokenInput, RegisterInput } from './auth.schemas.js';

export type RolAutorizado = 'VISITANTE' | 'ASISTENTE' | 'ADMINISTRADOR';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  email: string;
  rol: RolAutorizado;
}

export interface IdentidadAcceso {
  id: number;
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

interface UsuarioPersistido {
  id: number;
  nombreCompleto: string;
  correo: string;
  estado: boolean;
  rol: {
    nombre: string;
    estado: boolean;
  };
}

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;
const PASSWORD_HASH_ROUNDS = 12;
const ROL_REGISTRO_PUBLICO: RolAutorizado = 'VISITANTE';
const JWT_ISSUER = 'zamorafest-backend';
const JWT_AUDIENCE = 'zamorafest-api';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

const usuarioPublicoSelect = {
  id: true,
  nombreCompleto: true,
  correo: true,
  estado: true,
  rol: {
    select: {
      nombre: true,
      estado: true,
    },
  },
} as const;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isRolAutorizado(value: unknown): value is RolAutorizado {
  return value === 'VISITANTE' || value === 'ASISTENTE' || value === 'ADMINISTRADOR';
}

function mapUsuarioAutenticado(usuario: UsuarioPersistido): UsuarioAutenticado | null {
  if (!usuario.estado || !usuario.rol.estado || !isRolAutorizado(usuario.rol.nombre)) {
    return null;
  }

  return {
    id: usuario.id,
    nombre: usuario.nombreCompleto,
    email: usuario.correo,
    rol: usuario.rol.nombre,
  };
}

function parseUsuarioId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
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
    .setSubject(String(usuario.id))
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
    .setSubject(String(usuario.id))
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
  const existingUser = await prisma.usuario.findUnique({
    where: {
      correo: input.email,
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

  const rolVisitante = await prisma.rol.findUnique({
    where: {
      nombre: ROL_REGISTRO_PUBLICO,
    },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!rolVisitante?.estado) {
    throw new AppError(
      500,
      'DEFAULT_ROLE_NOT_CONFIGURED',
      'El rol predeterminado para nuevos usuarios no está disponible.',
    );
  }

  const contrasenaHash = await hashPassword(input.password, PASSWORD_HASH_ROUNDS);

  const usuarioCreado = await prisma.usuario.create({
    data: {
      idRol: rolVisitante.id,
      nombreCompleto: input.nombre,
      correo: input.email,
      contrasenaHash,
      estado: true,
    },
    select: usuarioPublicoSelect,
  });

  const usuarioAutenticado = mapUsuarioAutenticado(usuarioCreado);

  if (!usuarioAutenticado) {
    throw new AppError(500, 'INVALID_USER_STATE', 'El usuario fue creado con un estado no válido.');
  }

  return usuarioAutenticado;
}

async function login(input: LoginInput): Promise<RespuestaTokens> {
  const usuario = await prisma.usuario.findUnique({
    where: {
      correo: input.email,
    },
    select: {
      ...usuarioPublicoSelect,
      contrasenaHash: true,
    },
  });

  if (!usuario) {
    throw invalidCredentialsError();
  }

  const usuarioAutenticado = mapUsuarioAutenticado(usuario);

  if (!usuarioAutenticado) {
    throw invalidCredentialsError();
  }

  const validPassword = await compare(input.password, usuario.contrasenaHash);

  if (!validPassword) {
    throw invalidCredentialsError();
  }

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
    const usuarioId = parseUsuarioId(payload.sub);

    if (payload.type !== 'refresh' || usuarioId === null || typeof payload.exp !== 'number') {
      throw invalidRefreshTokenError();
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashToken(input.refreshToken),
      },
      include: {
        usuario: {
          select: usuarioPublicoSelect,
        },
      },
    });

    const now = new Date();

    if (
      !storedToken ||
      storedToken.usuarioId !== usuarioId ||
      storedToken.revocadoEn !== null ||
      storedToken.expiraEn <= now
    ) {
      throw invalidRefreshTokenError();
    }

    const usuarioAutenticado = mapUsuarioAutenticado(storedToken.usuario);

    if (!usuarioAutenticado) {
      throw invalidRefreshTokenError();
    }

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
    const usuarioId = parseUsuarioId(payload.sub);

    if (payload.type !== 'access' || usuarioId === null || !isRolAutorizado(payload.rol)) {
      throw new Error('Contenido del token inválido.');
    }

    return {
      id: usuarioId,
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
