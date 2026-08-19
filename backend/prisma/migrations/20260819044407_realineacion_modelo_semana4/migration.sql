/*
  Warnings:

  - You are about to drop the `cantones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evento_categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `eventos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imagenes_evento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lugares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programaciones_evento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recordatorios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "evento_categorias" DROP CONSTRAINT "evento_categorias_categoria_id_fkey";

-- DropForeignKey
ALTER TABLE "evento_categorias" DROP CONSTRAINT "evento_categorias_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "eventos" DROP CONSTRAINT "eventos_lugar_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes_evento" DROP CONSTRAINT "imagenes_evento_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "lugares" DROP CONSTRAINT "lugares_canton_id_fkey";

-- DropForeignKey
ALTER TABLE "programaciones_evento" DROP CONSTRAINT "programaciones_evento_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "recordatorios" DROP CONSTRAINT "recordatorios_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "recordatorios" DROP CONSTRAINT "recordatorios_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_usuario_id_fkey";

-- DropTable
DROP TABLE "cantones";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "evento_categorias";

-- DropTable
DROP TABLE "eventos";

-- DropTable
DROP TABLE "imagenes_evento";

-- DropTable
DROP TABLE "lugares";

-- DropTable
DROP TABLE "programaciones_evento";

-- DropTable
DROP TABLE "recordatorios";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "usuarios";

-- DropEnum
DROP TYPE "estado_evento";

-- DropEnum
DROP TYPE "estado_recordatorio";

-- DropEnum
DROP TYPE "rol_usuario";

-- CreateTable
CREATE TABLE "provincia" (
    "id_provincia" SERIAL NOT NULL,
    "codigo_dpa" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "imagen_portada" VARCHAR(2048),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "provincia_pkey" PRIMARY KEY ("id_provincia")
);

-- CreateTable
CREATE TABLE "canton" (
    "id_canton" SERIAL NOT NULL,
    "codigo_dpa" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_provincia" INTEGER NOT NULL,
    "descripcion" TEXT,
    "poblacion_aprox" INTEGER,
    "anio_poblacion" INTEGER,
    "fuente_informacion" VARCHAR(500),
    "fecha_actualizacion" DATE,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "imagen_portada" VARCHAR(2048),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "canton_pkey" PRIMARY KEY ("id_canton")
);

-- CreateTable
CREATE TABLE "parroquia" (
    "id_parroquia" SERIAL NOT NULL,
    "codigo_dpa" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_canton" INTEGER NOT NULL,
    "descripcion" TEXT,
    "poblacion_aprox" INTEGER,
    "anio_poblacion" INTEGER,
    "clima" VARCHAR(100),
    "altitud" INTEGER,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "imagen_portada" VARCHAR(2048),
    "fuente_informacion" VARCHAR(500),
    "fecha_actualizacion" DATE,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "parroquia_pkey" PRIMARY KEY ("id_parroquia")
);

-- CreateTable
CREATE TABLE "sector" (
    "id_sector" SERIAL NOT NULL,
    "id_parroquia" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo_sector" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sector_pkey" PRIMARY KEY ("id_sector")
);

-- CreateTable
CREATE TABLE "lugar" (
    "id_lugar" SERIAL NOT NULL,
    "id_sector" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo_lugar" VARCHAR(30) NOT NULL,
    "direccion_referencial" VARCHAR(255),
    "referencia" TEXT,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lugar_pkey" PRIMARY KEY ("id_lugar")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(254) NOT NULL,
    "contrasena_hash" VARCHAR(100) NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expira_en" TIMESTAMPTZ(3) NOT NULL,
    "revocado_en" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "evento" (
    "id_evento" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "costo_referencial" DECIMAL(10,2) NOT NULL,
    "id_lugar" INTEGER NOT NULL,
    "id_usuario_creador" INTEGER NOT NULL,
    "id_usuario_revisor" INTEGER,
    "estado_evento" VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    "estado_revision" VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    "fuente_informacion" VARCHAR(500),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),
    "fecha_revision" TIMESTAMP(3),

    CONSTRAINT "evento_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "evento_categoria" (
    "id_evento" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "evento_categoria_pkey" PRIMARY KEY ("id_evento","id_categoria")
);

-- CreateTable
CREATE TABLE "programacion_evento" (
    "id_programacion" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_lugar" INTEGER,
    "titulo_actividad" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3),
    "artista_invitado" VARCHAR(200),
    "orden" INTEGER,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "programacion_evento_pkey" PRIMARY KEY ("id_programacion")
);

-- CreateTable
CREATE TABLE "imagen_evento" (
    "id_imagen" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_programacion" INTEGER,
    "id_usuario_subida" INTEGER NOT NULL,
    "url_imagen" VARCHAR(2048) NOT NULL,
    "tipo_imagen" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(255),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "imagen_evento_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "recordatorio" (
    "id_recordatorio" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_programacion" INTEGER,
    "fecha_notificacion" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recordatorio_pkey" PRIMARY KEY ("id_recordatorio")
);

-- CreateTable
CREATE TABLE "usuario_evento_favorito" (
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "fecha_agregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_evento_favorito_pkey" PRIMARY KEY ("id_usuario","id_evento")
);

-- CreateIndex
CREATE UNIQUE INDEX "provincia_codigo_dpa_key" ON "provincia"("codigo_dpa");

-- CreateIndex
CREATE UNIQUE INDEX "provincia_nombre_key" ON "provincia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "canton_codigo_dpa_key" ON "canton"("codigo_dpa");

-- CreateIndex
CREATE INDEX "canton_id_provincia_idx" ON "canton"("id_provincia");

-- CreateIndex
CREATE UNIQUE INDEX "parroquia_codigo_dpa_key" ON "parroquia"("codigo_dpa");

-- CreateIndex
CREATE INDEX "parroquia_id_canton_idx" ON "parroquia"("id_canton");

-- CreateIndex
CREATE UNIQUE INDEX "sector_parroquia_nombre_key" ON "sector"("id_parroquia", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "lugar_sector_nombre_key" ON "lugar"("id_sector", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "usuario_rol_estado_idx" ON "usuario"("id_rol", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_usuario_estado_idx" ON "refresh_token"("usuario_id", "revocado_en", "expira_en");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nombre_key" ON "categoria"("nombre");

-- CreateIndex
CREATE INDEX "evento_lugar_idx" ON "evento"("id_lugar");

-- CreateIndex
CREATE INDEX "evento_creador_idx" ON "evento"("id_usuario_creador");

-- CreateIndex
CREATE INDEX "evento_revisor_idx" ON "evento"("id_usuario_revisor");

-- CreateIndex
CREATE INDEX "evento_publicacion_fecha_idx" ON "evento"("estado_evento", "estado_revision", "fecha_inicio");

-- CreateIndex
CREATE INDEX "evento_fecha_inicio_idx" ON "evento"("fecha_inicio");

-- CreateIndex
CREATE INDEX "evento_categoria_categoria_evento_idx" ON "evento_categoria"("id_categoria", "id_evento");

-- CreateIndex
CREATE INDEX "programacion_evento_evento_estado_inicio_idx" ON "programacion_evento"("id_evento", "estado", "fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "programacion_evento_lugar_idx" ON "programacion_evento"("id_lugar");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_evento_evento_programacion_key" ON "programacion_evento"("id_evento", "id_programacion");

-- CreateIndex
CREATE INDEX "imagen_evento_evento_estado_idx" ON "imagen_evento"("id_evento", "estado");

-- CreateIndex
CREATE INDEX "imagen_evento_evento_programacion_idx" ON "imagen_evento"("id_evento", "id_programacion");

-- CreateIndex
CREATE INDEX "recordatorio_usuario_activo_fecha_idx" ON "recordatorio"("id_usuario", "activo", "fecha_notificacion");

-- CreateIndex
CREATE INDEX "recordatorio_evento_programacion_idx" ON "recordatorio"("id_evento", "id_programacion");

-- CreateIndex
CREATE INDEX "usuario_evento_favorito_evento_usuario_idx" ON "usuario_evento_favorito"("id_evento", "id_usuario");

-- ManualCheckConstraints: T017
ALTER TABLE "sector"
ADD CONSTRAINT "sector_tipo_sector_chk"
CHECK (
    "tipo_sector" IN (
        'BARRIO',
        'COMUNIDAD',
        'RECINTO',
        'CIUDADELA',
        'CABECERA_PARROQUIAL',
        'OTRO'
    )
);

ALTER TABLE "lugar"
ADD CONSTRAINT "lugar_tipo_lugar_chk"
CHECK (
    "tipo_lugar" IN (
        'PARQUE',
        'COLISEO',
        'BALNEARIO',
        'CANCHA',
        'RECINTO_FERIAL',
        'CASA_COMUNAL',
        'OTRO'
    )
);

ALTER TABLE "evento"
ADD CONSTRAINT "evento_estado_evento_chk"
CHECK (
    "estado_evento" IN (
        'BORRADOR',
        'PROGRAMADO',
        'CANCELADO',
        'FINALIZADO',
        'ELIMINADO'
    )
);

ALTER TABLE "evento"
ADD CONSTRAINT "evento_estado_revision_chk"
CHECK (
    "estado_revision" IN (
        'PENDIENTE',
        'APROBADO',
        'RECHAZADO'
    )
);

ALTER TABLE "imagen_evento"
ADD CONSTRAINT "imagen_evento_tipo_imagen_chk"
CHECK (
    "tipo_imagen" IN (
        'AFICHE',
        'FOTOGRAFIA',
        'OTRA'
    )
);

-- ManualCheckConstraints: T018
ALTER TABLE "canton"
ADD CONSTRAINT "canton_latitud_rango_chk"
CHECK ("latitud" IS NULL OR "latitud" BETWEEN -90 AND 90);

ALTER TABLE "canton"
ADD CONSTRAINT "canton_longitud_rango_chk"
CHECK ("longitud" IS NULL OR "longitud" BETWEEN -180 AND 180);

ALTER TABLE "canton"
ADD CONSTRAINT "canton_coordenadas_par_chk"
CHECK (
    ("latitud" IS NULL AND "longitud" IS NULL)
    OR
    ("latitud" IS NOT NULL AND "longitud" IS NOT NULL)
);

ALTER TABLE "parroquia"
ADD CONSTRAINT "parroquia_latitud_rango_chk"
CHECK ("latitud" IS NULL OR "latitud" BETWEEN -90 AND 90);

ALTER TABLE "parroquia"
ADD CONSTRAINT "parroquia_longitud_rango_chk"
CHECK ("longitud" IS NULL OR "longitud" BETWEEN -180 AND 180);

ALTER TABLE "parroquia"
ADD CONSTRAINT "parroquia_coordenadas_par_chk"
CHECK (
    ("latitud" IS NULL AND "longitud" IS NULL)
    OR
    ("latitud" IS NOT NULL AND "longitud" IS NOT NULL)
);

ALTER TABLE "sector"
ADD CONSTRAINT "sector_latitud_rango_chk"
CHECK ("latitud" IS NULL OR "latitud" BETWEEN -90 AND 90);

ALTER TABLE "sector"
ADD CONSTRAINT "sector_longitud_rango_chk"
CHECK ("longitud" IS NULL OR "longitud" BETWEEN -180 AND 180);

ALTER TABLE "sector"
ADD CONSTRAINT "sector_coordenadas_par_chk"
CHECK (
    ("latitud" IS NULL AND "longitud" IS NULL)
    OR
    ("latitud" IS NOT NULL AND "longitud" IS NOT NULL)
);

ALTER TABLE "lugar"
ADD CONSTRAINT "lugar_latitud_rango_chk"
CHECK ("latitud" IS NULL OR "latitud" BETWEEN -90 AND 90);

ALTER TABLE "lugar"
ADD CONSTRAINT "lugar_longitud_rango_chk"
CHECK ("longitud" IS NULL OR "longitud" BETWEEN -180 AND 180);

ALTER TABLE "lugar"
ADD CONSTRAINT "lugar_coordenadas_par_chk"
CHECK (
    ("latitud" IS NULL AND "longitud" IS NULL)
    OR
    ("latitud" IS NOT NULL AND "longitud" IS NOT NULL)
);

ALTER TABLE "evento"
ADD CONSTRAINT "evento_costo_referencial_no_negativo_chk"
CHECK ("costo_referencial" >= 0);

ALTER TABLE "evento"
ADD CONSTRAINT "evento_fechas_orden_chk"
CHECK (
    "fecha_fin" IS NULL
    OR "fecha_fin" >= "fecha_inicio"
);

ALTER TABLE "programacion_evento"
ADD CONSTRAINT "programacion_evento_fechas_orden_chk"
CHECK (
    "fecha_hora_fin" IS NULL
    OR "fecha_hora_fin" >= "fecha_hora_inicio"
);

-- ManualUniquePartialIndex: T020
CREATE UNIQUE INDEX "imagen_evento_principal_activa_key"
ON "imagen_evento" ("id_evento")
WHERE "es_principal" = TRUE
  AND "estado" = TRUE;

-- AddForeignKey
ALTER TABLE "canton" ADD CONSTRAINT "canton_id_provincia_fkey" FOREIGN KEY ("id_provincia") REFERENCES "provincia"("id_provincia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parroquia" ADD CONSTRAINT "parroquia_id_canton_fkey" FOREIGN KEY ("id_canton") REFERENCES "canton"("id_canton") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector" ADD CONSTRAINT "sector_id_parroquia_fkey" FOREIGN KEY ("id_parroquia") REFERENCES "parroquia"("id_parroquia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lugar" ADD CONSTRAINT "lugar_id_sector_fkey" FOREIGN KEY ("id_sector") REFERENCES "sector"("id_sector") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "lugar"("id_lugar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_id_usuario_revisor_fkey" FOREIGN KEY ("id_usuario_revisor") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_categoria" ADD CONSTRAINT "evento_categoria_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_categoria" ADD CONSTRAINT "evento_categoria_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_evento" ADD CONSTRAINT "programacion_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_evento" ADD CONSTRAINT "programacion_evento_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "lugar"("id_lugar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_evento" ADD CONSTRAINT "imagen_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_evento" ADD CONSTRAINT "imagen_evento_id_evento_id_programacion_fkey" FOREIGN KEY ("id_evento", "id_programacion") REFERENCES "programacion_evento"("id_evento", "id_programacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_evento" ADD CONSTRAINT "imagen_evento_id_usuario_subida_fkey" FOREIGN KEY ("id_usuario_subida") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_evento_id_programacion_fkey" FOREIGN KEY ("id_evento", "id_programacion") REFERENCES "programacion_evento"("id_evento", "id_programacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_evento_favorito" ADD CONSTRAINT "usuario_evento_favorito_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_evento_favorito" ADD CONSTRAINT "usuario_evento_favorito_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE CASCADE ON UPDATE CASCADE;
