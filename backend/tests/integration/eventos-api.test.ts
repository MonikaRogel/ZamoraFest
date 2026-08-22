import { hash as hashPassword } from 'bcryptjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../src/app.js';
import { eventoCache } from '../../src/infrastructure/cache/evento-cache.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { authService } from '../../src/modules/auth/auth.service.js';

const TEST_SOURCE_PREFIX = 'T051_';
const TEST_EMAIL_PREFIX = 't051.';

const ASISTENTE_EMAIL = 't051.asistente@zamorafest.test';
const ADMIN_EMAIL = 't051.administrador@zamorafest.test';

const ASISTENTE_PASSWORD = 'AsistenteT051';
const ADMIN_PASSWORD = 'AdministradorT051';

interface SupportContext {
  lugarId: number;
  categoriaIds: number[];
  asistenteId: number;
  administradorId: number;
  asistenteToken: string;
  administradorToken: string;
}

const eventoResponseSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    titulo: z.string(),
    estadoEvento: z.enum(['BORRADOR', 'PROGRAMADO', 'CANCELADO', 'FINALIZADO', 'ELIMINADO']),
    estadoRevision: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']),
    costoReferencial: z.number(),
    fechaRevision: z.string().nullable(),
    usuarioRevisor: z
      .object({
        id: z.number().int().positive(),
      })
      .nullable(),
  }),
});

const listadoResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      titulo: z.string(),
      estadoEvento: z.string(),
      estadoRevision: z.string(),
    }),
  ),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

let support: SupportContext;

async function confirmTestDatabase(): Promise<void> {
  const databases = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  expect(databases[0]?.databaseName).toBe('zamorafest_test');
}

async function cleanT051Data(): Promise<void> {
  const eventos = await prisma.evento.findMany({
    where: {
      fuenteInformacion: {
        startsWith: TEST_SOURCE_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  const eventoIds = eventos.map((evento) => evento.id);

  if (eventoIds.length > 0) {
    await prisma.imagenEvento.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.recordatorio.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.usuarioEventoFavorito.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.eventoCategoria.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.programacionEvento.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.evento.deleteMany({
      where: {
        id: {
          in: eventoIds,
        },
      },
    });
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      correo: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  const usuarioIds = usuarios.map((usuario) => usuario.id);

  if (usuarioIds.length > 0) {
    await prisma.refreshToken.deleteMany({
      where: {
        usuarioId: {
          in: usuarioIds,
        },
      },
    });

    await prisma.usuario.deleteMany({
      where: {
        id: {
          in: usuarioIds,
        },
      },
    });
  }

  await eventoCache.invalidate();
}

async function createSupportData(): Promise<SupportContext> {
  const [lugar, categorias, rolAsistente, rolAdministrador] = await Promise.all([
    prisma.lugar.findFirst({
      where: {
        estado: true,
      },
      select: {
        id: true,
      },
    }),

    prisma.categoria.findMany({
      where: {
        estado: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: 2,
      select: {
        id: true,
      },
    }),

    prisma.rol.findUnique({
      where: {
        nombre: 'ASISTENTE',
      },
      select: {
        id: true,
        estado: true,
      },
    }),

    prisma.rol.findUnique({
      where: {
        nombre: 'ADMINISTRADOR',
      },
      select: {
        id: true,
        estado: true,
      },
    }),
  ]);

  if (!lugar) {
    throw new Error('El seed no contiene un lugar activo.');
  }

  if (categorias.length < 2) {
    throw new Error('El seed no contiene al menos dos categorías activas.');
  }

  if (!rolAsistente?.estado) {
    throw new Error('El rol ASISTENTE no está disponible.');
  }

  if (!rolAdministrador?.estado) {
    throw new Error('El rol ADMINISTRADOR no está disponible.');
  }

  const [asistenteHash, administradorHash] = await Promise.all([
    hashPassword(ASISTENTE_PASSWORD, 4),
    hashPassword(ADMIN_PASSWORD, 4),
  ]);

  const asistente = await prisma.usuario.create({
    data: {
      idRol: rolAsistente.id,
      nombreCompleto: 'Asistente T051',
      correo: ASISTENTE_EMAIL,
      contrasenaHash: asistenteHash,
      estado: true,
    },
  });

  const administrador = await prisma.usuario.create({
    data: {
      idRol: rolAdministrador.id,
      nombreCompleto: 'Administrador T051',
      correo: ADMIN_EMAIL,
      contrasenaHash: administradorHash,
      estado: true,
    },
  });

  const [asistenteSession, administradorSession] = await Promise.all([
    authService.login({
      email: ASISTENTE_EMAIL,
      password: ASISTENTE_PASSWORD,
    }),

    authService.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  ]);

  return {
    lugarId: lugar.id,
    categoriaIds: categorias.map((categoria) => categoria.id),
    asistenteId: asistente.id,
    administradorId: administrador.id,
    asistenteToken: asistenteSession.accessToken,
    administradorToken: administradorSession.accessToken,
  };
}

function eventoPayload(label: string) {
  return {
    titulo: `Evento T051 ${label}`,
    descripcion: `Evento de integración para ${label}.`,
    fechaInicio: '2026-10-15T18:00:00',
    fechaFin: '2026-10-15T22:00:00',
    costoReferencial: 0,
    lugarId: support.lugarId,
    categoriaIds: support.categoriaIds,
    fuenteInformacion: `${TEST_SOURCE_PREFIX}${label}`,
  };
}

async function createEvento(label: string) {
  const response = await request(app)
    .post('/api/v1/eventos')
    .set('Authorization', `Bearer ${support.asistenteToken}`)
    .send(eventoPayload(label));

  expect(response.status).toBe(201);

  const evento = eventoResponseSchema.parse(response.body as unknown).data;

  expect(evento.estadoEvento).toBe('BORRADOR');
  expect(evento.estadoRevision).toBe('PENDIENTE');

  return evento;
}

async function approveEvento(eventoId: number) {
  const response = await request(app)
    .post(`/api/v1/eventos/${eventoId}/revision`)
    .set('Authorization', `Bearer ${support.administradorToken}`)
    .send({
      decision: 'APROBAR',
    });

  expect(response.status).toBe(200);

  return eventoResponseSchema.parse(response.body as unknown).data;
}

async function publishEvento(eventoId: number) {
  const response = await request(app)
    .post(`/api/v1/eventos/${eventoId}/publicacion`)
    .set('Authorization', `Bearer ${support.administradorToken}`);

  expect(response.status).toBe(200);

  return eventoResponseSchema.parse(response.body as unknown).data;
}

beforeAll(async () => {
  await confirmTestDatabase();
});

beforeEach(async () => {
  await cleanT051Data();
  support = await createSupportData();
});

afterEach(async () => {
  await cleanT051Data();
});

afterAll(async () => {
  await cleanT051Data();
  await eventoCache.close();
  await prisma.$disconnect();
});

describe('T051 - CRUD canónico de eventos', () => {
  it('crea un evento como BORRADOR y PENDIENTE mediante ASISTENTE', async () => {
    const payload = eventoPayload('CREACION');

    const response = await request(app)
      .post('/api/v1/eventos')
      .set('Authorization', `Bearer ${support.asistenteToken}`)
      .send(payload);

    expect(response.status).toBe(201);

    const evento = eventoResponseSchema.parse(response.body as unknown).data;

    expect(evento).toMatchObject({
      titulo: payload.titulo,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
      costoReferencial: 0,
    });

    const persistido = await prisma.evento.findUniqueOrThrow({
      where: {
        id: evento.id,
      },
    });

    expect(persistido.idUsuarioCreador).toBe(support.asistenteId);
    expect(persistido.estadoEvento).toBe('BORRADOR');
    expect(persistido.estadoRevision).toBe('PENDIENTE');

    const categorias = await prisma.eventoCategoria.count({
      where: {
        idEvento: evento.id,
      },
    });

    expect(categorias).toBe(support.categoriaIds.length);
  });

  it('actualiza un borrador propio mediante ASISTENTE', async () => {
    const evento = await createEvento('ACTUALIZACION');

    const response = await request(app)
      .patch(`/api/v1/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${support.asistenteToken}`)
      .send({
        titulo: 'Evento T051 actualizado',
        costoReferencial: 12.5,
      });

    expect(response.status).toBe(200);

    const actualizado = eventoResponseSchema.parse(response.body as unknown).data;

    expect(actualizado).toMatchObject({
      id: evento.id,
      titulo: 'Evento T051 actualizado',
      costoReferencial: 12.5,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    });

    const persistido = await prisma.evento.findUniqueOrThrow({
      where: {
        id: evento.id,
      },
    });

    expect(persistido.titulo).toBe('Evento T051 actualizado');
    expect(Number(persistido.costoReferencial.toString())).toBe(12.5);
    expect(persistido.fechaActualizacion).toBeInstanceOf(Date);
  });

  it('aprueba un evento pendiente mediante ADMINISTRADOR', async () => {
    const evento = await createEvento('REVISION');

    const aprobado = await approveEvento(evento.id);

    expect(aprobado.estadoEvento).toBe('BORRADOR');
    expect(aprobado.estadoRevision).toBe('APROBADO');
    expect(aprobado.usuarioRevisor?.id).toBe(support.administradorId);
    expect(aprobado.fechaRevision).not.toBeNull();

    const persistido = await prisma.evento.findUniqueOrThrow({
      where: {
        id: evento.id,
      },
    });

    expect(persistido.estadoEvento).toBe('BORRADOR');
    expect(persistido.estadoRevision).toBe('APROBADO');
    expect(persistido.idUsuarioRevisor).toBe(support.administradorId);
    expect(persistido.fechaRevision).toBeInstanceOf(Date);
  });

  it('publica únicamente un evento previamente aprobado', async () => {
    const evento = await createEvento('PUBLICACION');

    await approveEvento(evento.id);

    const publicado = await publishEvento(evento.id);

    expect(publicado.estadoEvento).toBe('PROGRAMADO');
    expect(publicado.estadoRevision).toBe('APROBADO');

    const persistido = await prisma.evento.findUniqueOrThrow({
      where: {
        id: evento.id,
      },
    });

    expect(persistido.estadoEvento).toBe('PROGRAMADO');
    expect(persistido.estadoRevision).toBe('APROBADO');
  });

  it('realiza eliminación lógica y conserva físicamente el evento', async () => {
    const evento = await createEvento('ELIMINACION');

    await approveEvento(evento.id);
    await publishEvento(evento.id);

    const publicBefore = await request(app).get(`/api/v1/eventos/${evento.id}`);

    expect(publicBefore.status).toBe(200);

    const response = await request(app)
      .delete(`/api/v1/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${support.administradorToken}`);

    expect(response.status).toBe(204);

    const persistido = await prisma.evento.findUnique({
      where: {
        id: evento.id,
      },
    });

    expect(persistido).not.toBeNull();
    expect(persistido?.estadoEvento).toBe('ELIMINADO');

    const publicAfter = await request(app).get(`/api/v1/eventos/${evento.id}`);

    expect(publicAfter.status).toBe(404);
  });

  it('expone públicamente solo eventos PROGRAMADO y APROBADO', async () => {
    const borrador = await createEvento('PUBLICO_BORRADOR');
    const publicable = await createEvento('PUBLICO_PROGRAMADO');

    await approveEvento(publicable.id);
    await publishEvento(publicable.id);

    const listResponse = await request(app).get('/api/v1/eventos?page=1&limit=50');

    expect(listResponse.status).toBe(200);

    const listado = listadoResponseSchema.parse(listResponse.body as unknown);

    const ids = listado.data.map((evento) => evento.id);

    expect(ids).toContain(publicable.id);
    expect(ids).not.toContain(borrador.id);

    const publicadoListado = listado.data.find((evento) => evento.id === publicable.id);

    expect(publicadoListado).toMatchObject({
      estadoEvento: 'PROGRAMADO',
      estadoRevision: 'APROBADO',
    });

    const publicableDetail = await request(app).get(`/api/v1/eventos/${publicable.id}`);

    expect(publicableDetail.status).toBe(200);

    expect(publicableDetail.body as unknown).toMatchObject({
      data: {
        id: publicable.id,
        estadoEvento: 'PROGRAMADO',
        estadoRevision: 'APROBADO',
      },
    });

    const draftDetail = await request(app).get(`/api/v1/eventos/${borrador.id}`);

    expect(draftDetail.status).toBe(404);
  });
});
