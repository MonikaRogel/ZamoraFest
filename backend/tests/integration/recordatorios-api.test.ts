import { hash as hashPassword } from 'bcryptjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import {
  closeRecordatorioQueue,
  recordatorioQueue,
} from '../../src/infrastructure/queue/recordatorio.queue.js';
import { authService } from '../../src/modules/auth/auth.service.js';

const TEST_SOURCE_PREFIX = 'T052_';
const TEST_EMAIL_PREFIX = 't052.';
const VISITANTE_EMAIL = 't052.visitante@zamorafest.test';
const VISITANTE_PASSWORD = 'VisitanteT052';

interface SupportContext {
  visitanteId: number;
  accessToken: string;
  eventoAId: number;
  eventoBId: number;
  programacionAId: number;
}

const recordatorioResponseSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    eventoId: z.number().int().positive(),
    programacionId: z.number().int().positive().nullable(),
    fechaNotificacion: z.string(),
    activo: z.boolean(),
  }),
});

const recordatoriosListSchema = z.object({
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      eventoId: z.number().int().positive(),
      programacionId: z.number().int().positive().nullable(),
      activo: z.boolean(),
    }),
  ),
});

let support: SupportContext;
const queuedRecordatorioIds = new Set<number>();

async function confirmTestDatabase(): Promise<void> {
  const databases = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  expect(databases[0]?.databaseName).toBe('zamorafest_test');
}

async function removeQueuedJobs(): Promise<void> {
  for (const recordatorioId of queuedRecordatorioIds) {
    const job = await recordatorioQueue.getJob(`recordatorio-${recordatorioId}`);

    if (job) {
      await job.remove();
    }
  }

  queuedRecordatorioIds.clear();
}

async function cleanT052Data(): Promise<void> {
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
    await prisma.recordatorio.deleteMany({
      where: {
        idEvento: {
          in: eventoIds,
        },
      },
    });

    await prisma.imagenEvento.deleteMany({
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

    await prisma.programacionEvento.deleteMany({
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
}

async function createSupportData(): Promise<SupportContext> {
  const [lugar, categoria, rolVisitante, usuarioAsistente, usuarioAdministrador] =
    await Promise.all([
      prisma.lugar.findFirst({
        where: {
          estado: true,
        },
        select: {
          id: true,
        },
      }),

      prisma.categoria.findFirst({
        where: {
          estado: true,
        },
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
        },
      }),

      prisma.rol.findUnique({
        where: {
          nombre: 'VISITANTE',
        },
        select: {
          id: true,
          estado: true,
        },
      }),

      prisma.usuario.findFirst({
        where: {
          estado: true,
          rol: {
            nombre: 'ASISTENTE',
            estado: true,
          },
        },
        select: {
          id: true,
        },
      }),

      prisma.usuario.findFirst({
        where: {
          estado: true,
          rol: {
            nombre: 'ADMINISTRADOR',
            estado: true,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

  if (!lugar) {
    throw new Error('El seed no contiene lugar activo.');
  }

  if (!categoria) {
    throw new Error('El seed no contiene categoría activa.');
  }

  if (!rolVisitante?.estado) {
    throw new Error('El rol VISITANTE no está disponible.');
  }

  if (!usuarioAsistente) {
    throw new Error('El seed no contiene ASISTENTE activo.');
  }

  if (!usuarioAdministrador) {
    throw new Error('El seed no contiene ADMINISTRADOR activo.');
  }

  const visitante = await prisma.usuario.create({
    data: {
      idRol: rolVisitante.id,
      nombreCompleto: 'Visitante T052',
      correo: VISITANTE_EMAIL,
      contrasenaHash: await hashPassword(VISITANTE_PASSWORD, 4),
      estado: true,
    },
  });

  const session = await authService.login({
    email: VISITANTE_EMAIL,
    password: VISITANTE_PASSWORD,
  });

  const eventoBase = {
    descripcion: 'Evento público para integración T052.',
    fechaInicio: new Date('2026-11-15T18:00:00.000Z'),
    fechaFin: new Date('2026-11-15T22:00:00.000Z'),
    costoReferencial: 0,
    idLugar: lugar.id,
    idUsuarioCreador: usuarioAsistente.id,
    idUsuarioRevisor: usuarioAdministrador.id,
    estadoEvento: 'PROGRAMADO',
    estadoRevision: 'APROBADO',
    fechaRevision: new Date('2026-11-01T10:00:00.000Z'),
  } as const;

  const eventoA = await prisma.evento.create({
    data: {
      ...eventoBase,
      titulo: 'Evento T052 A',
      fuenteInformacion: `${TEST_SOURCE_PREFIX}EVENTO_A`,
      categorias: {
        create: {
          idCategoria: categoria.id,
        },
      },
    },
  });

  const eventoB = await prisma.evento.create({
    data: {
      ...eventoBase,
      titulo: 'Evento T052 B',
      fuenteInformacion: `${TEST_SOURCE_PREFIX}EVENTO_B`,
      categorias: {
        create: {
          idCategoria: categoria.id,
        },
      },
    },
  });

  const programacionA = await prisma.programacionEvento.create({
    data: {
      idEvento: eventoA.id,
      idLugar: lugar.id,
      tituloActividad: 'Programación T052 A',
      fechaHoraInicio: new Date('2026-11-15T19:00:00.000Z'),
      fechaHoraFin: new Date('2026-11-15T20:00:00.000Z'),
      estado: true,
    },
  });

  return {
    visitanteId: visitante.id,
    accessToken: session.accessToken,
    eventoAId: eventoA.id,
    eventoBId: eventoB.id,
    programacionAId: programacionA.id,
  };
}

beforeAll(async () => {
  await confirmTestDatabase();
});

beforeEach(async () => {
  await removeQueuedJobs();
  await cleanT052Data();
  support = await createSupportData();
});

afterEach(async () => {
  await removeQueuedJobs();
  await cleanT052Data();
});

afterAll(async () => {
  await removeQueuedJobs();
  await cleanT052Data();
  await closeRecordatorioQueue();
  await prisma.$disconnect();
});

describe('T052 - integración canónica de recordatorios', () => {
  it('crea, encola, consulta y desactiva un recordatorio válido con ID entero', async () => {
    const createResponse = await request(app)
      .post('/api/v1/recordatorios')
      .set('Authorization', `Bearer ${support.accessToken}`)
      .send({
        eventoId: support.eventoAId,
        programacionId: support.programacionAId,
        fechaNotificacion: '2026-11-15T17:30:00',
      });

    expect(createResponse.status).toBe(201);

    const recordatorio = recordatorioResponseSchema.parse(createResponse.body as unknown).data;

    queuedRecordatorioIds.add(recordatorio.id);

    expect(recordatorio).toMatchObject({
      eventoId: support.eventoAId,
      programacionId: support.programacionAId,
      activo: true,
    });

    expect(Number.isSafeInteger(recordatorio.id)).toBe(true);

    const persistido = await prisma.recordatorio.findUniqueOrThrow({
      where: {
        id: recordatorio.id,
      },
    });

    expect(persistido.id).toBe(recordatorio.id);
    expect(persistido.idUsuario).toBe(support.visitanteId);
    expect(persistido.idEvento).toBe(support.eventoAId);
    expect(persistido.idProgramacion).toBe(support.programacionAId);
    expect(persistido.activo).toBe(true);

    const job = await recordatorioQueue.getJob(`recordatorio-${recordatorio.id}`);

    expect(job).not.toBeUndefined();
    expect(job?.data).toEqual({
      recordatorioId: recordatorio.id,
    });

    expect(typeof job?.data.recordatorioId).toBe('number');
    expect(Number.isSafeInteger(job?.data.recordatorioId)).toBe(true);

    const listResponse = await request(app)
      .get('/api/v1/recordatorios')
      .set('Authorization', `Bearer ${support.accessToken}`);

    expect(listResponse.status).toBe(200);

    const listado = recordatoriosListSchema.parse(listResponse.body as unknown).data;

    expect(listado.some((item) => item.id === recordatorio.id)).toBe(true);

    const getResponse = await request(app)
      .get(`/api/v1/recordatorios/${recordatorio.id}`)
      .set('Authorization', `Bearer ${support.accessToken}`);

    expect(getResponse.status).toBe(200);

    expect(getResponse.body as unknown).toMatchObject({
      data: {
        id: recordatorio.id,
        eventoId: support.eventoAId,
        programacionId: support.programacionAId,
        activo: true,
      },
    });

    const deleteResponse = await request(app)
      .delete(`/api/v1/recordatorios/${recordatorio.id}`)
      .set('Authorization', `Bearer ${support.accessToken}`);

    expect(deleteResponse.status).toBe(204);

    const desactivado = await prisma.recordatorio.findUniqueOrThrow({
      where: {
        id: recordatorio.id,
      },
    });

    expect(desactivado.activo).toBe(false);
  });

  it('rechaza programación activa perteneciente a otro evento', async () => {
    const beforeCount = await prisma.recordatorio.count({
      where: {
        idUsuario: support.visitanteId,
      },
    });

    expect(beforeCount).toBe(0);

    const response = await request(app)
      .post('/api/v1/recordatorios')
      .set('Authorization', `Bearer ${support.accessToken}`)
      .send({
        eventoId: support.eventoBId,
        programacionId: support.programacionAId,
        fechaNotificacion: '2026-11-15T17:30:00',
      });

    expect(response.status).toBe(404);

    expect(response.body as unknown).toMatchObject({
      error: {
        code: 'PROGRAMACION_NOT_FOUND',
      },
    });

    const afterCount = await prisma.recordatorio.count({
      where: {
        idUsuario: support.visitanteId,
      },
    });

    expect(afterCount).toBe(0);
  });
});
