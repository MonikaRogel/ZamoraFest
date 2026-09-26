import {
  hash as hashPassword,
} from 'bcryptjs';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  app,
} from '../../src/app.js';
import {
  eventoCache,
} from '../../src/infrastructure/cache/evento-cache.js';
import {
  prisma,
} from '../../src/infrastructure/database/prisma.js';
import {
  authService,
} from '../../src/modules/auth/auth.service.js';

const TEST_SOURCE_PREFIX =
  'T052_';

const TEST_EMAIL_PREFIX =
  't052.';

const ASISTENTE_EMAIL =
  't052.asistente@zamorafest.test';

const OTRO_ASISTENTE_EMAIL =
  't052.otro.asistente@zamorafest.test';

const ADMIN_EMAIL =
  't052.administrador@zamorafest.test';

const ASISTENTE_PASSWORD =
  'AsistenteT052';

const OTRO_ASISTENTE_PASSWORD =
  'OtroAsistenteT052';

const ADMIN_PASSWORD =
  'AdministradorT052';

interface SupportContext {
  lugarId:
    number;

  asistenteId:
    number;

  otroAsistenteId:
    number;

  administradorId:
    number;

  asistenteToken:
    string;

  administradorToken:
    string;
}

let support:
  SupportContext;

async function confirmTestDatabase():
  Promise<void> {
  const databases =
    await prisma
      .$queryRaw<
        Array<{
          databaseName:
            string;
        }>
      >`
        SELECT current_database() AS "databaseName"
      `;

  expect(
    databases[0]
      ?.databaseName,
  ).toBe(
    'zamorafest_test',
  );
}

async function cleanT052Data():
  Promise<void> {
  const eventos =
    await prisma.evento
      .findMany({
        where: {
          fuenteInformacion: {
            startsWith:
              TEST_SOURCE_PREFIX,
          },
        },
        select: {
          id:
            true,
        },
      });

  const eventoIds =
    eventos.map(
      (
        evento,
      ) =>
        evento.id,
    );

  if (
    eventoIds.length >
    0
  ) {
    await prisma.imagenEvento
      .deleteMany({
        where: {
          idEvento: {
            in:
              eventoIds,
          },
        },
      });

    await prisma.recordatorio
      .deleteMany({
        where: {
          idEvento: {
            in:
              eventoIds,
          },
        },
      });

    await prisma.usuarioEventoFavorito
      .deleteMany({
        where: {
          idEvento: {
            in:
              eventoIds,
          },
        },
      });

    await prisma.eventoCategoria
      .deleteMany({
        where: {
          idEvento: {
            in:
              eventoIds,
          },
        },
      });

    await prisma.programacionEvento
      .deleteMany({
        where: {
          idEvento: {
            in:
              eventoIds,
          },
        },
      });

    await prisma.evento
      .deleteMany({
        where: {
          id: {
            in:
              eventoIds,
          },
        },
      });
  }

  const usuarios =
    await prisma.usuario
      .findMany({
        where: {
          correo: {
            startsWith:
              TEST_EMAIL_PREFIX,
          },
        },
        select: {
          id:
            true,
        },
      });

  const usuarioIds =
    usuarios.map(
      (
        usuario,
      ) =>
        usuario.id,
    );

  if (
    usuarioIds.length >
    0
  ) {
    await prisma.refreshToken
      .deleteMany({
        where: {
          usuarioId: {
            in:
              usuarioIds,
          },
        },
      });

    await prisma.usuario
      .deleteMany({
        where: {
          id: {
            in:
              usuarioIds,
          },
        },
      });
  }

  await eventoCache
    .invalidate();
}

async function createSupportData():
  Promise<SupportContext> {
  const [
    lugar,
    rolAsistente,
    rolAdministrador,
  ] =
    await Promise.all([
      prisma.lugar
        .findFirst({
          where: {
            estado:
              true,
          },
          select: {
            id:
              true,
          },
        }),

      prisma.rol
        .findUnique({
          where: {
            nombre:
              'ASISTENTE',
          },
          select: {
            id:
              true,
            estado:
              true,
          },
        }),

      prisma.rol
        .findUnique({
          where: {
            nombre:
              'ADMINISTRADOR',
          },
          select: {
            id:
              true,
            estado:
              true,
          },
        }),
    ]);

  if (
    !lugar
  ) {
    throw new Error(
      'El seed no contiene un lugar activo.',
    );
  }

  if (
    !rolAsistente
      ?.estado
  ) {
    throw new Error(
      'El rol ASISTENTE no está disponible.',
    );
  }

  if (
    !rolAdministrador
      ?.estado
  ) {
    throw new Error(
      'El rol ADMINISTRADOR no está disponible.',
    );
  }

  const [
    asistenteHash,
    otroAsistenteHash,
    administradorHash,
  ] =
    await Promise.all([
      hashPassword(
        ASISTENTE_PASSWORD,
        4,
      ),

      hashPassword(
        OTRO_ASISTENTE_PASSWORD,
        4,
      ),

      hashPassword(
        ADMIN_PASSWORD,
        4,
      ),
    ]);

  const asistente =
    await prisma.usuario
      .create({
        data: {
          idRol:
            rolAsistente.id,
          nombreCompleto:
            'Asistente T052',
          correo:
            ASISTENTE_EMAIL,
          contrasenaHash:
            asistenteHash,
          estado:
            true,
        },
      });

  const otroAsistente =
    await prisma.usuario
      .create({
        data: {
          idRol:
            rolAsistente.id,
          nombreCompleto:
            'Otro Asistente T052',
          correo:
            OTRO_ASISTENTE_EMAIL,
          contrasenaHash:
            otroAsistenteHash,
          estado:
            true,
        },
      });

  const administrador =
    await prisma.usuario
      .create({
        data: {
          idRol:
            rolAdministrador.id,
          nombreCompleto:
            'Administrador T052',
          correo:
            ADMIN_EMAIL,
          contrasenaHash:
            administradorHash,
          estado:
            true,
        },
      });

  const [
    asistenteSession,
    administradorSession,
  ] =
    await Promise.all([
      authService.login({
        email:
          ASISTENTE_EMAIL,
        password:
          ASISTENTE_PASSWORD,
      }),

      authService.login({
        email:
          ADMIN_EMAIL,
        password:
          ADMIN_PASSWORD,
      }),
    ]);

  return {
    lugarId:
      lugar.id,

    asistenteId:
      asistente.id,

    otroAsistenteId:
      otroAsistente.id,

    administradorId:
      administrador.id,

    asistenteToken:
      asistenteSession
        .accessToken,

    administradorToken:
      administradorSession
        .accessToken,
  };
}

async function createEvento(
  label:
    string,
  creatorId:
    number,
  estadoEvento =
    'BORRADOR',
  estadoRevision =
    'PENDIENTE',
) {
  return prisma.evento
    .create({
      data: {
        titulo:
          `Evento T052 ${label}`,

        descripcion:
          `Evento de integración ${label}.`,

        fechaInicio:
          new Date(
            '2026-10-20T18:00:00.000Z',
          ),

        fechaFin:
          new Date(
            '2026-10-20T22:00:00.000Z',
          ),

        costoReferencial:
          0,

        idLugar:
          support.lugarId,

        idUsuarioCreador:
          creatorId,

        estadoEvento,

        estadoRevision,

        fuenteInformacion:
          `${TEST_SOURCE_PREFIX}${label}`,
      },
    });
}

beforeAll(
  async () => {
    await confirmTestDatabase();
  },
);

beforeEach(
  async () => {
    await cleanT052Data();

    support =
      await createSupportData();
  },
);

afterEach(
  async () => {
    await cleanT052Data();
  },
);

afterAll(
  async () => {
    await cleanT052Data();

    await eventoCache
      .close();

    await prisma
      .$disconnect();
  },
);

describe(
  'GET /api/v1/eventos/mios',
  () => {
    it(
      'requiere autenticación',
      async () => {
        const response =
          await request(
            app,
          )
            .get(
              '/api/v1/eventos/mios',
            );

        expect(
          response.status,
        ).toBe(
          401,
        );
      },
    );

    it(
      'rechaza un ADMINISTRADOR porque el flujo pertenece al ASISTENTE',
      async () => {
        const response =
          await request(
            app,
          )
            .get(
              '/api/v1/eventos/mios',
            )
            .set(
              'Authorization',
              `Bearer ${support.administradorToken}`,
            );

        expect(
          response.status,
        ).toBe(
          403,
        );
      },
    );

    it(
      'devuelve únicamente eventos propios no eliminados con paginación',
      async () => {
        const ownFirst =
          await createEvento(
            'PROPIO_1',
            support.asistenteId,
          );

        const ownSecond =
          await createEvento(
            'PROPIO_2',
            support.asistenteId,
            'PROGRAMADO',
            'APROBADO',
          );

        const deleted =
          await createEvento(
            'ELIMINADO',
            support.asistenteId,
            'ELIMINADO',
            'PENDIENTE',
          );

        const foreign =
          await createEvento(
            'AJENO',
            support.otroAsistenteId,
          );

        const response =
          await request(
            app,
          )
            .get(
              '/api/v1/eventos/mios?page=1&limit=20',
            )
            .set(
              'Authorization',
              `Bearer ${support.asistenteToken}`,
            );

        expect(
          response.status,
        ).toBe(
          200,
        );

        expect(
          response.body,
        ).toMatchObject({
          meta: {
            page:
              1,
            limit:
              20,
            total:
              2,
            totalPages:
              1,
          },
        });

        const body =
          response.body as {
            data:
              Array<{
                id:
                  number;
                estadoEvento:
                  string;
                estadoRevision:
                  string;
              }>;
          };

        const ids =
          body.data
            .map(
              (
                evento,
              ) =>
                evento.id,
            );

        expect(
          ids,
        ).toContain(
          ownFirst.id,
        );

        expect(
          ids,
        ).toContain(
          ownSecond.id,
        );

        expect(
          ids,
        ).not.toContain(
          deleted.id,
        );

        expect(
          ids,
        ).not.toContain(
          foreign.id,
        );
      },
    );
  },
);