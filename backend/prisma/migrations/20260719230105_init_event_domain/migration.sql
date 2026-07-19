-- CreateEnum
CREATE TYPE "estado_evento" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateTable
CREATE TABLE "cantones" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "cantones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lugares" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(255),
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "canton_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "lugares_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lugares_coordenadas_completas_check"
        CHECK (
            ("latitud" IS NULL AND "longitud" IS NULL)
            OR
            ("latitud" IS NOT NULL AND "longitud" IS NOT NULL)
        ),
    CONSTRAINT "lugares_latitud_rango_check"
        CHECK ("latitud" IS NULL OR "latitud" BETWEEN -90 AND 90),
    CONSTRAINT "lugares_longitud_rango_check"
        CHECK ("longitud" IS NULL OR "longitud" BETWEEN -180 AND 180)
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "estado_evento" NOT NULL DEFAULT 'BORRADOR',
    "lugar_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_categorias" (
    "evento_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "evento_categorias_pkey"
        PRIMARY KEY ("evento_id", "categoria_id")
);

-- CreateTable
CREATE TABLE "programaciones_evento" (
    "id" UUID NOT NULL,
    "evento_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fin" TIMESTAMPTZ(3),
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "programaciones_evento_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "programaciones_evento_fin_posterior_check"
        CHECK ("fin" IS NULL OR "fin" > "inicio")
);

-- CreateTable
CREATE TABLE "imagenes_evento" (
    "id" UUID NOT NULL,
    "evento_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "imagenes_evento_pkey" PRIMARY KEY ("id")
);

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "cantones_nombre_activo_uq"
ON "cantones" ("nombre")
WHERE "eliminado_en" IS NULL;

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "categorias_nombre_activo_uq"
ON "categorias" ("nombre")
WHERE "eliminado_en" IS NULL;

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "imagenes_evento_principal_activa_uq"
ON "imagenes_evento" ("evento_id")
WHERE "es_principal" = TRUE AND "eliminado_en" IS NULL;

-- CreateIndex
CREATE INDEX "lugares_canton_eliminado_idx"
ON "lugares" ("canton_id", "eliminado_en");

-- CreateIndex
CREATE INDEX "eventos_lugar_eliminado_idx"
ON "eventos" ("lugar_id", "eliminado_en");

-- CreateIndex
CREATE INDEX "eventos_estado_eliminado_idx"
ON "eventos" ("estado", "eliminado_en");

-- CreateIndex
CREATE INDEX "evento_categorias_categoria_eliminado_idx"
ON "evento_categorias" ("categoria_id", "eliminado_en");

-- CreateIndex
CREATE INDEX "programaciones_evento_evento_eliminado_idx"
ON "programaciones_evento" ("evento_id", "eliminado_en");

-- CreateIndex
CREATE INDEX "programaciones_evento_inicio_eliminado_idx"
ON "programaciones_evento" ("inicio", "eliminado_en");

-- CreateIndex
CREATE INDEX "imagenes_evento_evento_eliminado_idx"
ON "imagenes_evento" ("evento_id", "eliminado_en");

-- AddForeignKey
ALTER TABLE "lugares"
ADD CONSTRAINT "lugares_canton_id_fkey"
FOREIGN KEY ("canton_id")
REFERENCES "cantones" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos"
ADD CONSTRAINT "eventos_lugar_id_fkey"
FOREIGN KEY ("lugar_id")
REFERENCES "lugares" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_categorias"
ADD CONSTRAINT "evento_categorias_evento_id_fkey"
FOREIGN KEY ("evento_id")
REFERENCES "eventos" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_categorias"
ADD CONSTRAINT "evento_categorias_categoria_id_fkey"
FOREIGN KEY ("categoria_id")
REFERENCES "categorias" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_evento"
ADD CONSTRAINT "programaciones_evento_evento_id_fkey"
FOREIGN KEY ("evento_id")
REFERENCES "eventos" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_evento"
ADD CONSTRAINT "imagenes_evento_evento_id_fkey"
FOREIGN KEY ("evento_id")
REFERENCES "eventos" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
