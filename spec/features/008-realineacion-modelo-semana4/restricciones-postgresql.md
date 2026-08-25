# Restricciones físicas PostgreSQL — realineación Semana 4 (008)

## 1. Propósito

Este documento define las restricciones físicas que deben existir en PostgreSQL para complementar el modelo Prisma de ZamoraFest.

No sustituye `schema.prisma`. Prisma continúa representando modelos, relaciones, PK, FK, restricciones `UNIQUE` e índices que puede expresar de forma segura. Las reglas aquí identificadas como SQL manual se incorporarán posteriormente a la migración correctiva y se validarán primero en un entorno controlado.

No se ejecutará ninguna sentencia de este documento directamente sobre `zamorafest_dev` antes de la revisión de `migration.sql` y de la prueba de reconstrucción prevista en la Fase 3.

---

## 2. Convención de nombres

Las restricciones administradas manualmente por PostgreSQL utilizarán nombres explícitos y deterministas:

- `*_chk` para `CHECK`;
- `*_key` para unicidad;
- `*_idx` para índices no únicos;
- `*_fkey` para claves foráneas cuando sea necesario fijar manualmente su nombre.

Los nombres se mantendrán estables para permitir pruebas automatizadas e inspección mediante catálogos PostgreSQL.

---

## 3. T017 — CHECK de dominios controlados

### 3.1 `sector.tipo_sector`

Nombre:

```text
sector_tipo_sector_chk
```

Definición prevista:

```sql
CHECK (
  tipo_sector IN (
    'BARRIO',
    'COMUNIDAD',
    'RECINTO',
    'CIUDADELA',
    'CABECERA_PARROQUIAL',
    'OTRO'
  )
)
```

`CABECERA_PARROQUIAL` permite representar el caso documentado en Semana 4 cuando no existe un sector más específico disponible.

### 3.2 `lugar.tipo_lugar`

Nombre:

```text
lugar_tipo_lugar_chk
```

Definición prevista:

```sql
CHECK (
  tipo_lugar IN (
    'PARQUE',
    'COLISEO',
    'BALNEARIO',
    'CANCHA',
    'RECINTO_FERIAL',
    'CASA_COMUNAL',
    'OTRO'
  )
)
```

### 3.3 `evento.estado_evento`

Nombre:

```text
evento_estado_evento_chk
```

Definición prevista:

```sql
CHECK (
  estado_evento IN (
    'BORRADOR',
    'PROGRAMADO',
    'CANCELADO',
    'FINALIZADO',
    'ELIMINADO'
  )
)
```

La publicación pública requiere además `estado_revision = 'APROBADO'`; esa condición conjunta pertenece a la lógica de consulta y autorización, no a este `CHECK` individual.

### 3.4 `evento.estado_revision`

Nombre:

```text
evento_estado_revision_chk
```

Definición prevista:

```sql
CHECK (
  estado_revision IN (
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO'
  )
)
```

### 3.5 `imagen_evento.tipo_imagen`

Nombre:

```text
imagen_evento_tipo_imagen_chk
```

Definición prevista:

```sql
CHECK (
  tipo_imagen IN (
    'AFICHE',
    'FOTOGRAFIA',
    'OTRA'
  )
)
```

`PRINCIPAL` no se utiliza como tipo porque esa condición ya está representada por `es_principal`.

---

## 4. T018 — CHECK numéricos y temporales

### 4.1 Política de coordenadas

Las entidades territoriales con coordenadas son:

- `canton`;
- `parroquia`;
- `sector`;
- `lugar`.

Para cada una se aplicarán tres reglas:

1. latitud nula o entre -90 y 90;
2. longitud nula o entre -180 y 180;
3. latitud y longitud deben estar ambas informadas o ambas nulas.

Esto evita almacenar una coordenada parcial que no represente un punto geográfico utilizable.

### 4.2 `canton`

```sql
CONSTRAINT canton_latitud_rango_chk
CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90)
```

```sql
CONSTRAINT canton_longitud_rango_chk
CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180)
```

```sql
CONSTRAINT canton_coordenadas_par_chk
CHECK (
  (latitud IS NULL AND longitud IS NULL)
  OR
  (latitud IS NOT NULL AND longitud IS NOT NULL)
)
```

### 4.3 `parroquia`

```sql
CONSTRAINT parroquia_latitud_rango_chk
CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90)
```

```sql
CONSTRAINT parroquia_longitud_rango_chk
CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180)
```

```sql
CONSTRAINT parroquia_coordenadas_par_chk
CHECK (
  (latitud IS NULL AND longitud IS NULL)
  OR
  (latitud IS NOT NULL AND longitud IS NOT NULL)
)
```

### 4.4 `sector`

```sql
CONSTRAINT sector_latitud_rango_chk
CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90)
```

```sql
CONSTRAINT sector_longitud_rango_chk
CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180)
```

```sql
CONSTRAINT sector_coordenadas_par_chk
CHECK (
  (latitud IS NULL AND longitud IS NULL)
  OR
  (latitud IS NOT NULL AND longitud IS NOT NULL)
)
```

### 4.5 `lugar`

```sql
CONSTRAINT lugar_latitud_rango_chk
CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90)
```

```sql
CONSTRAINT lugar_longitud_rango_chk
CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180)
```

```sql
CONSTRAINT lugar_coordenadas_par_chk
CHECK (
  (latitud IS NULL AND longitud IS NULL)
  OR
  (latitud IS NOT NULL AND longitud IS NOT NULL)
)
```

### 4.6 `evento.costo_referencial`

Nombre:

```text
evento_costo_referencial_no_negativo_chk
```

Definición prevista:

```sql
CHECK (costo_referencial >= 0)
```

El valor `0.00` representa un evento gratuito y es válido.

### 4.7 Fechas de `evento`

Nombre:

```text
evento_fechas_orden_chk
```

Definición prevista:

```sql
CHECK (
  fecha_fin IS NULL
  OR fecha_fin >= fecha_inicio
)
```

### 4.8 Fechas de `programacion_evento`

Nombre:

```text
programacion_evento_fechas_orden_chk
```

Definición prevista:

```sql
CHECK (
  fecha_hora_fin IS NULL
  OR fecha_hora_fin >= fecha_hora_inicio
)
```

---

## 5. T019 — Integridad `evento` / `programacion_evento`

Esta regla ya está representada en `schema.prisma` y fue validada con Prisma 7.8.0.

`programacion_evento` define:

```text
UNIQUE (id_evento, id_programacion)
```

mediante:

```text
programacion_evento_evento_programacion_key
```

`imagen_evento` y `recordatorio` utilizan relaciones compuestas:

```text
(id_evento, id_programacion)
    REFERENCES programacion_evento(id_evento, id_programacion)
```

Cuando `id_programacion` es nulo, la asociación específica a una actividad no existe. Cuando no es nulo, la FK compuesta impide que la programación pertenezca a un evento distinto del declarado en la misma fila.

La migración generada deberá revisarse para confirmar que PostgreSQL materializa ambas FK compuestas y la clave `UNIQUE` correspondiente.

---

## 6. T020 — Imagen principal activa única

Prisma no representa en el modelo actual la condición parcial requerida. PostgreSQL la implementará mediante un índice único parcial.

Nombre:

```text
imagen_evento_principal_activa_key
```

Definición prevista:

```sql
CREATE UNIQUE INDEX "imagen_evento_principal_activa_key"
ON "imagen_evento" ("id_evento")
WHERE "es_principal" = TRUE
  AND "estado" = TRUE;
```

La regla permite múltiples imágenes por evento y permite conservar imágenes principales históricas/inactivas, pero impide que dos imágenes activas del mismo evento estén marcadas simultáneamente como principales.

---

## 7. T021 — Índices expresados en Prisma

Los índices explícitos actualmente definidos en `schema.prisma` son:

### Territorio

```text
canton_id_provincia_idx
parroquia_id_canton_idx
```

No se añade un índice independiente para `sector.id_parroquia` porque `UNIQUE (id_parroquia, nombre)` ya comienza por `id_parroquia`.

No se añade un índice independiente para `lugar.id_sector` porque `UNIQUE (id_sector, nombre)` ya comienza por `id_sector`.

### Usuario y autenticación

```text
usuario_rol_estado_idx
refresh_token_usuario_estado_idx
```

`usuario.correo` y `refresh_token.token_hash` ya poseen índices por sus restricciones `UNIQUE`.

### Evento

```text
evento_lugar_idx
evento_creador_idx
evento_revisor_idx
evento_publicacion_fecha_idx
evento_fecha_inicio_idx
```

### Categorías

```text
evento_categoria_categoria_evento_idx
```

La PK `(id_evento, id_categoria)` cubre consultas cuyo primer criterio es `id_evento`; el índice inverso cubre búsquedas por categoría.

### Programación

```text
programacion_evento_evento_estado_inicio_idx
programacion_evento_lugar_idx
```

La clave `UNIQUE (id_evento, id_programacion)` también genera un índice propio.

### Imágenes

```text
imagen_evento_evento_estado_idx
imagen_evento_evento_programacion_idx
```

El segundo índice apoya la FK compuesta hacia `programacion_evento`.

### Recordatorios

```text
recordatorio_usuario_activo_fecha_idx
recordatorio_evento_programacion_idx
```

El segundo índice apoya la FK compuesta y, por prefijo izquierdo, también permite búsquedas por `id_evento`.

### Favoritos

```text
usuario_evento_favorito_evento_usuario_idx
```

La PK `(id_usuario, id_evento)` cubre búsquedas cuyo primer criterio es `id_usuario`; el índice inverso cubre búsquedas por evento.

Total de índices explícitos `@@index` en Prisma: **17**.

El índice parcial `imagen_evento_principal_activa_key` no está incluido en esos 17 porque será administrado manualmente mediante SQL PostgreSQL.

---

## 8. T022 — Acciones referenciales

### 8.1 Entidades funcionales

Las relaciones entre entidades principales utilizan:

```text
ON DELETE RESTRICT
ON UPDATE CASCADE
```

Esto aplica a la jerarquía territorial, `rol → usuario`, `usuario → refresh_token`, `lugar → evento`, creador/revisor de evento, programación, imágenes y recordatorios.

La finalidad es impedir borrado físico accidental de registros todavía referenciados. La eliminación funcional se representa mediante los campos `estado`, `activo` o `estado_evento`, según la entidad.

### 8.2 Asociaciones N:M

Las tablas puramente asociativas utilizan `ON DELETE CASCADE`:

- `evento_categoria`;
- `usuario_evento_favorito`.

Estas filas no son la fuente histórica principal del dominio y Semana 4 no les asigna un campo de estado propio.

### 8.3 Prohibición de cascada sobre entidades principales

No se utilizará `ON DELETE CASCADE` para eliminar físicamente:

- territorio;
- roles;
- usuarios;
- eventos;
- programaciones;
- imágenes;
- recordatorios.

---

## 9. Matriz resumida de restricciones SQL manuales

| Código | Objeto | Nombre | Tipo |
|---|---|---|---|
| T017 | `sector.tipo_sector` | `sector_tipo_sector_chk` | CHECK |
| T017 | `lugar.tipo_lugar` | `lugar_tipo_lugar_chk` | CHECK |
| T017 | `evento.estado_evento` | `evento_estado_evento_chk` | CHECK |
| T017 | `evento.estado_revision` | `evento_estado_revision_chk` | CHECK |
| T017 | `imagen_evento.tipo_imagen` | `imagen_evento_tipo_imagen_chk` | CHECK |
| T018 | `canton.latitud` | `canton_latitud_rango_chk` | CHECK |
| T018 | `canton.longitud` | `canton_longitud_rango_chk` | CHECK |
| T018 | coordenadas `canton` | `canton_coordenadas_par_chk` | CHECK |
| T018 | `parroquia.latitud` | `parroquia_latitud_rango_chk` | CHECK |
| T018 | `parroquia.longitud` | `parroquia_longitud_rango_chk` | CHECK |
| T018 | coordenadas `parroquia` | `parroquia_coordenadas_par_chk` | CHECK |
| T018 | `sector.latitud` | `sector_latitud_rango_chk` | CHECK |
| T018 | `sector.longitud` | `sector_longitud_rango_chk` | CHECK |
| T018 | coordenadas `sector` | `sector_coordenadas_par_chk` | CHECK |
| T018 | `lugar.latitud` | `lugar_latitud_rango_chk` | CHECK |
| T018 | `lugar.longitud` | `lugar_longitud_rango_chk` | CHECK |
| T018 | coordenadas `lugar` | `lugar_coordenadas_par_chk` | CHECK |
| T018 | `evento.costo_referencial` | `evento_costo_referencial_no_negativo_chk` | CHECK |
| T018 | fechas `evento` | `evento_fechas_orden_chk` | CHECK |
| T018 | fechas `programacion_evento` | `programacion_evento_fechas_orden_chk` | CHECK |
| T020 | imagen principal activa | `imagen_evento_principal_activa_key` | UNIQUE INDEX parcial |

Total de objetos SQL manuales definidos en esta matriz: **21**.

---

## 10. Validación futura

Después de generar `migration.sql` con `--create-only` se deberá comprobar, antes de aplicarlo:

1. presencia de los 21 objetos SQL manuales definidos aquí;
2. presencia de las dos FK compuestas de `imagen_evento` y `recordatorio`;
3. presencia de `programacion_evento_evento_programacion_key`;
4. presencia de los 17 índices `@@index` de Prisma;
5. ausencia de `CASCADE` en relaciones funcionales principales;
6. ausencia de conversión artificial de los UUID de demostración a los nuevos `INT`;
7. conservación del historial de las tres migraciones previas;
8. reconstrucción controlada conforme al Escenario A.

La comprobación física definitiva se realizará primero en `zamorafest_test` o en una base temporal equivalente antes de aplicar cualquier migración correctiva sobre `zamorafest_dev`.
