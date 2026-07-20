-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('ASISTENTE', 'ADMIN');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(100) NOT NULL,
    "rol" "rol_usuario" NOT NULL DEFAULT 'ASISTENTE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expira_en" TIMESTAMPTZ(3) NOT NULL,
    "revocado_en" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usuarios_email_eliminado_idx"
ON "usuarios"("email", "eliminado_en");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_activo_unique"
ON "usuarios"("email")
WHERE "eliminado_en" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key"
ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_estado_idx"
ON "refresh_tokens"("usuario_id", "revocado_en", "expira_en");

-- AddForeignKey
ALTER TABLE "refresh_tokens"
ADD CONSTRAINT "refresh_tokens_usuario_id_fkey"
FOREIGN KEY ("usuario_id")
REFERENCES "usuarios"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;