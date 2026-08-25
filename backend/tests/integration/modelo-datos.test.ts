import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/infrastructure/database/prisma.js';

const TEST_PREFIX = 'T048_';

interface SeedContext {
  lugarId: number;
  asistenteId: number;
  administradorId: number;
  visitanteId: number;
}

async function confirmTestDatabase(): Promise<void> {
  const databases = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  expect(databases[0]?.databaseName).toBe('zamorafest_test');
}

async function getSeedContext(): Promise<SeedContext> {
  const [lugar, asistente, administrador, visitante] = await Promise.all([
    prisma.lugar.findFirst({
      where: {
        nombre: 'Parque Lineal de Zamora',
        estado: true,
      },
      select: {
        id: true,
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

    prisma.usuario.findFirst({
      where: {
        estado: true,
        rol: {
          nombre: 'VISITANTE',
          estado: true,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!lugar || !asistente || !administrador || !visitante) {
    throw new Error(
      'El seed de pruebas no contiene lugar y usuarios canónicos requeridos por T048.',
    );
  }

  return {
    lugarId: lugar.id,
    asistenteId: asistente.id,
    administradorId: administrador.id,
    visitanteId: visitante.id,
  };
}

async function createEventoFixture(label: string) {
  const context = await getSeedContext();
  const suffix = randomUUID();
  const inicio = new Date('2026-09-10T19:00:00.000Z');
  const fin = new Date('2026-09-10T22:00:00.000Z');

  const evento = await prisma.evento.create({
    data: {
      titulo: `${TEST_PREFIX}${label}_${suffix}`,
      descripcion: 'Evento creado exclusivamente por la prueba T048.',
      fechaInicio: inicio,
      fechaFin: fin,
      costoReferencial: '0.00',
      idLugar: context.lugarId,
      idUsuarioCreador: context.asistenteId,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
      fuenteInformacion: `${TEST_PREFIX}${label}_${suffix}`,
    },
  });

  return {
    evento,
    context,
    inicio,
    fin,
  };
}

async function cleanT048Data(): Promise<void> {
  const eventos = await prisma.evento.findMany({
    where: {
      fuenteInformacion: {
        startsWith: TEST_PREFIX,
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

  await prisma.categoria.deleteMany({
    where: {
      nombre: {
        startsWith: TEST_PREFIX,
      },
    },
  });
}

beforeAll(async () => {
  await confirmTestDatabase();
  await cleanT048Data();
});

afterEach(async () => {
  await cleanT048Data();
});

afterAll(async () => {
  await cleanT048Data();
  await prisma.$disconnect();
});

describe('T048 - modelo canónico Semana 4', () => {
  it('valida PK enteras y claves foráneas del modelo', async () => {
    const primaryKeys = await prisma.$queryRaw<
      Array<{ tableName: string; constraintName: string }>
    >`
      SELECT
        table_name AS "tableName",
        constraint_name AS "constraintName"
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND constraint_type = 'PRIMARY KEY'
    `;

    const expectedPrimaryKeys = new Map([
      ['provincia', 'provincia_pkey'],
      ['canton', 'canton_pkey'],
      ['parroquia', 'parroquia_pkey'],
      ['sector', 'sector_pkey'],
      ['lugar', 'lugar_pkey'],
      ['rol', 'rol_pkey'],
      ['usuario', 'usuario_pkey'],
      ['categoria', 'categoria_pkey'],
      ['evento', 'evento_pkey'],
      ['evento_categoria', 'evento_categoria_pkey'],
      ['programacion_evento', 'programacion_evento_pkey'],
      ['imagen_evento', 'imagen_evento_pkey'],
      ['recordatorio', 'recordatorio_pkey'],
      ['usuario_evento_favorito', 'usuario_evento_favorito_pkey'],
    ]);

    for (const [tableName, constraintName] of expectedPrimaryKeys) {
      expect(primaryKeys).toContainEqual({
        tableName,
        constraintName,
      });
    }

    const foreignKeys = await prisma.$queryRaw<Array<{ constraintName: string }>>`
      SELECT constraint_name AS "constraintName"
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
    `;

    const foreignKeyNames = new Set(foreignKeys.map((foreignKey) => foreignKey.constraintName));

    const expectedForeignKeys = [
      'canton_id_provincia_fkey',
      'parroquia_id_canton_fkey',
      'sector_id_parroquia_fkey',
      'lugar_id_sector_fkey',
      'usuario_id_rol_fkey',
      'evento_id_lugar_fkey',
      'evento_id_usuario_creador_fkey',
      'evento_id_usuario_revisor_fkey',
      'evento_categoria_id_evento_fkey',
      'evento_categoria_id_categoria_fkey',
      'programacion_evento_id_evento_fkey',
      'programacion_evento_id_lugar_fkey',
      'imagen_evento_id_evento_fkey',
      'imagen_evento_id_evento_id_programacion_fkey',
      'imagen_evento_id_usuario_subida_fkey',
      'recordatorio_id_usuario_fkey',
      'recordatorio_id_evento_fkey',
      'recordatorio_id_evento_id_programacion_fkey',
      'usuario_evento_favorito_id_usuario_fkey',
      'usuario_evento_favorito_id_evento_fkey',
    ];

    for (const constraintName of expectedForeignKeys) {
      expect(foreignKeyNames.has(constraintName)).toBe(true);
    }

    const fixture = await createEventoFixture('PK');

    expect(Number.isInteger(fixture.evento.id)).toBe(true);
    expect(fixture.evento.id).toBeGreaterThan(0);

    await expect(
      prisma.evento.create({
        data: {
          titulo: `${TEST_PREFIX}FK_INVALIDA`,
          fechaInicio: fixture.inicio,
          fechaFin: fixture.fin,
          costoReferencial: '0.00',
          idLugar: 2_147_483_647,
          idUsuarioCreador: fixture.context.asistenteId,
          fuenteInformacion: `${TEST_PREFIX}FK_INVALIDA`,
        },
      }),
    ).rejects.toThrow();
  });

  it('aplica las restricciones de unicidad canónicas', async () => {
    const indexes = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT indexname AS "name"
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;

    const indexNames = new Set(indexes.map((index) => index.name));

    const expectedUniqueIndexes = [
      'provincia_codigo_dpa_key',
      'provincia_nombre_key',
      'canton_codigo_dpa_key',
      'parroquia_codigo_dpa_key',
      'sector_parroquia_nombre_key',
      'lugar_sector_nombre_key',
      'rol_nombre_key',
      'usuario_correo_key',
      'categoria_nombre_key',
      'programacion_evento_evento_programacion_key',
    ];

    for (const indexName of expectedUniqueIndexes) {
      expect(indexNames.has(indexName)).toBe(true);
    }

    const categoriaNombre = `${TEST_PREFIX}CATEGORIA_${randomUUID()}`;

    await prisma.categoria.create({
      data: {
        nombre: categoriaNombre,
      },
    });

    await expect(
      prisma.categoria.create({
        data: {
          nombre: categoriaNombre,
        },
      }),
    ).rejects.toThrow();

    const visitante = await prisma.usuario.findFirstOrThrow({
      where: {
        estado: true,
        rol: {
          nombre: 'VISITANTE',
          estado: true,
        },
      },
      select: {
        idRol: true,
        correo: true,
      },
    });

    await expect(
      prisma.usuario.create({
        data: {
          idRol: visitante.idRol,
          nombreCompleto: 'Usuario duplicado T048',
          correo: visitante.correo,
          contrasenaHash: 'hash-t048',
        },
      }),
    ).rejects.toThrow();

    const sector = await prisma.sector.findFirstOrThrow({
      where: {
        nombre: 'Cabecera parroquial',
        estado: true,
      },
      select: {
        idParroquia: true,
        nombre: true,
        tipoSector: true,
      },
    });

    await expect(
      prisma.sector.create({
        data: {
          idParroquia: sector.idParroquia,
          nombre: sector.nombre,
          tipoSector: sector.tipoSector,
        },
      }),
    ).rejects.toThrow();
  });

  it('aplica los CHECK de dominio, coordenadas, costo y fechas', async () => {
    const checks = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT conname AS "name"
      FROM pg_constraint
      WHERE contype = 'c'
        AND connamespace = (
          SELECT oid
          FROM pg_namespace
          WHERE nspname = 'public'
        )
    `;

    const checkNames = new Set(checks.map((check) => check.name));

    const expectedChecks = [
      'sector_tipo_sector_chk',
      'lugar_tipo_lugar_chk',
      'evento_estado_evento_chk',
      'evento_estado_revision_chk',
      'imagen_evento_tipo_imagen_chk',
      'canton_latitud_rango_chk',
      'canton_longitud_rango_chk',
      'canton_coordenadas_par_chk',
      'parroquia_latitud_rango_chk',
      'parroquia_longitud_rango_chk',
      'parroquia_coordenadas_par_chk',
      'sector_latitud_rango_chk',
      'sector_longitud_rango_chk',
      'sector_coordenadas_par_chk',
      'lugar_latitud_rango_chk',
      'lugar_longitud_rango_chk',
      'lugar_coordenadas_par_chk',
      'evento_costo_referencial_no_negativo_chk',
      'evento_fechas_orden_chk',
      'programacion_evento_fechas_orden_chk',
    ];

    for (const checkName of expectedChecks) {
      expect(checkNames.has(checkName)).toBe(true);
    }

    const sector = await prisma.sector.findFirstOrThrow({
      where: {
        estado: true,
      },
      select: {
        id: true,
        idParroquia: true,
      },
    });

    await expect(
      prisma.sector.create({
        data: {
          idParroquia: sector.idParroquia,
          nombre: `${TEST_PREFIX}SECTOR_CHECK_${randomUUID()}`,
          tipoSector: 'TIPO_INVALIDO',
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.lugar.create({
        data: {
          idSector: sector.id,
          nombre: `${TEST_PREFIX}LUGAR_COORD_${randomUUID()}`,
          tipoLugar: 'OTRO',
          latitud: -4.123456,
        },
      }),
    ).rejects.toThrow();

    const context = await getSeedContext();
    const inicio = new Date('2026-10-20T20:00:00.000Z');
    const finAnterior = new Date('2026-10-20T19:00:00.000Z');

    await expect(
      prisma.evento.create({
        data: {
          titulo: `${TEST_PREFIX}COSTO_NEGATIVO`,
          fechaInicio: inicio,
          costoReferencial: '-0.01',
          idLugar: context.lugarId,
          idUsuarioCreador: context.asistenteId,
          fuenteInformacion: `${TEST_PREFIX}COSTO_NEGATIVO`,
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.evento.create({
        data: {
          titulo: `${TEST_PREFIX}FECHAS_INVALIDAS`,
          fechaInicio: inicio,
          fechaFin: finAnterior,
          costoReferencial: '0.00',
          idLugar: context.lugarId,
          idUsuarioCreador: context.asistenteId,
          fuenteInformacion: `${TEST_PREFIX}FECHAS_INVALIDAS`,
        },
      }),
    ).rejects.toThrow();
  });

  it('conserva la jerarquía provincia canton parroquia sector lugar', async () => {
    const lugar = await prisma.lugar.findFirstOrThrow({
      where: {
        nombre: 'Parque Lineal de Zamora',
        estado: true,
      },
      select: {
        id: true,
        estado: true,
        sector: {
          select: {
            estado: true,
            tipoSector: true,
            parroquia: {
              select: {
                codigoDpa: true,
                estado: true,
                canton: {
                  select: {
                    codigoDpa: true,
                    estado: true,
                    provincia: {
                      select: {
                        codigoDpa: true,
                        nombre: true,
                        estado: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(lugar.estado).toBe(true);
    expect(lugar.sector.estado).toBe(true);
    expect(lugar.sector.tipoSector).toBe('CABECERA_PARROQUIAL');
    expect(lugar.sector.parroquia.codigoDpa).toBe('190150');
    expect(lugar.sector.parroquia.estado).toBe(true);
    expect(lugar.sector.parroquia.canton.codigoDpa).toBe('1901');
    expect(lugar.sector.parroquia.canton.estado).toBe(true);
    expect(lugar.sector.parroquia.canton.provincia.codigoDpa).toBe('19');
    expect(lugar.sector.parroquia.canton.provincia.nombre).toBe('Zamora Chinchipe');
    expect(lugar.sector.parroquia.canton.provincia.estado).toBe(true);
  });

  it('conserva roles y usuarios canónicos relacionados', async () => {
    const roles = await prisma.rol.findMany({
      where: {
        nombre: {
          in: ['ADMINISTRADOR', 'ASISTENTE', 'VISITANTE'],
        },
        estado: true,
      },
      select: {
        nombre: true,
        usuarios: {
          where: {
            estado: true,
          },
          select: {
            id: true,
            correo: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    expect(roles.map((rol) => rol.nombre)).toEqual(['ADMINISTRADOR', 'ASISTENTE', 'VISITANTE']);

    for (const rol of roles) {
      expect(rol.usuarios.length).toBeGreaterThanOrEqual(1);

      for (const usuario of rol.usuarios) {
        expect(Number.isInteger(usuario.id)).toBe(true);
        expect(usuario.id).toBeGreaterThan(0);
        expect(usuario.correo).toContain('@');
      }
    }
  });

  it('rechaza programación perteneciente a otro evento en imagen y recordatorio', async () => {
    const fixtureA = await createEventoFixture('CRUZADO_A');
    const fixtureB = await createEventoFixture('CRUZADO_B');

    const programacionA = await prisma.programacionEvento.create({
      data: {
        idEvento: fixtureA.evento.id,
        idLugar: fixtureA.context.lugarId,
        tituloActividad: `${TEST_PREFIX}PROGRAMACION_A`,
        fechaHoraInicio: fixtureA.inicio,
        fechaHoraFin: fixtureA.fin,
        estado: true,
      },
    });

    await expect(
      prisma.imagenEvento.create({
        data: {
          idEvento: fixtureB.evento.id,
          idProgramacion: programacionA.id,
          idUsuarioSubida: fixtureA.context.administradorId,
          urlImagen: 'https://example.com/t048-cruzada.jpg',
          tipoImagen: 'FOTOGRAFIA',
          estado: true,
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.recordatorio.create({
        data: {
          idUsuario: fixtureA.context.visitanteId,
          idEvento: fixtureB.evento.id,
          idProgramacion: programacionA.id,
          fechaNotificacion: new Date('2026-09-10T18:00:00.000Z'),
          activo: true,
        },
      }),
    ).rejects.toThrow();
  });

  it('impide favoritos duplicados mediante la PK compuesta', async () => {
    const fixture = await createEventoFixture('FAVORITO');

    const favorito = {
      idUsuario: fixture.context.visitanteId,
      idEvento: fixture.evento.id,
    };

    await prisma.usuarioEventoFavorito.create({
      data: favorito,
    });

    await expect(
      prisma.usuarioEventoFavorito.create({
        data: favorito,
      }),
    ).rejects.toThrow();
  });

  it('permite una sola imagen principal activa por evento', async () => {
    const fixture = await createEventoFixture('IMAGEN_PRINCIPAL');

    const primera = await prisma.imagenEvento.create({
      data: {
        idEvento: fixture.evento.id,
        idUsuarioSubida: fixture.context.administradorId,
        urlImagen: 'https://example.com/t048-principal-1.jpg',
        tipoImagen: 'AFICHE',
        esPrincipal: true,
        estado: true,
      },
    });

    await expect(
      prisma.imagenEvento.create({
        data: {
          idEvento: fixture.evento.id,
          idUsuarioSubida: fixture.context.administradorId,
          urlImagen: 'https://example.com/t048-principal-2.jpg',
          tipoImagen: 'FOTOGRAFIA',
          esPrincipal: true,
          estado: true,
        },
      }),
    ).rejects.toThrow();

    await prisma.imagenEvento.update({
      where: {
        id: primera.id,
      },
      data: {
        estado: false,
      },
    });

    const reemplazo = await prisma.imagenEvento.create({
      data: {
        idEvento: fixture.evento.id,
        idUsuarioSubida: fixture.context.administradorId,
        urlImagen: 'https://example.com/t048-principal-reemplazo.jpg',
        tipoImagen: 'FOTOGRAFIA',
        esPrincipal: true,
        estado: true,
      },
    });

    expect(reemplazo.esPrincipal).toBe(true);
    expect(reemplazo.estado).toBe(true);
  });
});
