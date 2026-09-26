/*
  Regla de dominio:
  - Todo evento debe tener fecha de finalización.
  - La fecha de finalización debe ser estrictamente posterior
    a la fecha de inicio.
  - La migración no inventa ni corrige fechas automáticamente.
*/

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "evento"
        WHERE "fecha_fin" IS NULL
           OR "fecha_fin" <= "fecha_inicio"
    ) THEN
        RAISE EXCEPTION
            'No se puede aplicar la migración: existen eventos sin fecha_fin o con fecha_fin <= fecha_inicio.';
    END IF;
END
$$;

ALTER TABLE "evento"
DROP CONSTRAINT IF EXISTS "evento_fechas_orden_chk";

ALTER TABLE "evento"
ALTER COLUMN "fecha_fin" SET NOT NULL;

ALTER TABLE "evento"
ADD CONSTRAINT "evento_fechas_orden_chk"
CHECK ("fecha_fin" > "fecha_inicio");