-- CreateEnum
CREATE TYPE "estado_recordatorio" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "evento_id" UUID NOT NULL,
    "estado" "estado_recordatorio" NOT NULL DEFAULT 'PENDIENTE',
    "procesado_en" TIMESTAMPTZ(3),
    "error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recordatorios_usuario_estado_idx" ON "recordatorios"("usuario_id", "estado", "eliminado_en");

-- CreateIndex
CREATE INDEX "recordatorios_evento_estado_idx" ON "recordatorios"("evento_id", "estado", "eliminado_en");

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
