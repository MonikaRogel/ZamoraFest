# Plan técnico: realineación del modelo de datos con Semana 4 (008)

## 1. Propósito

Este plan define cómo implementar la especificación `008-realineacion-modelo-semana4` sin alterar el diseño funcional aprobado en Semana 4 y sin descartar las mejoras posteriores que continúan siendo compatibles con dicho diseño.

El orden de implementación será controlado y verificable. Ninguna migración se ejecutará sobre la base de desarrollo antes de revisar el SQL generado, inventariar los datos existentes y disponer de una copia de seguridad.

## 2. Principios de implementación

1. **Semana 4 es el modelo funcional canónico.**
2. **PostgreSQL es la fuente de verdad.** Prisma representa el modelo; no lo sustituye.
3. **Las 14 entidades funcionales conservarán sus nombres conceptuales y relaciones.**
4. **Las claves primarias canónicas serán enteras autogeneradas.**
5. **Los campos definidos como `VARCHAR` con dominio controlado permanecerán como `VARCHAR` y se reforzarán mediante `CHECK`; no se convertirán silenciosamente en enums PostgreSQL.**
6. **La integridad que PostgreSQL pueda garantizar no dependerá únicamente de Zod o de los servicios.**
7. **Redis y BullMQ seguirán siendo infraestructura; no modificarán el dominio.**
8. **Las migraciones históricas se conservarán.** La corrección se añadirá como una migración posterior y trazable.
9. **No se trabajará directamente sobre `main`.**
10. **Cada fase deberá superar su puerta de verificación antes de avanzar.**

## 3. Convenciones físicas PostgreSQL y Prisma

### 3.1 Nombres físicos

Las tablas funcionales utilizarán los nombres definidos en Semana 4:

- `provincia`
- `canton`
- `parroquia`
- `sector`
- `lugar`
- `rol`
- `usuario`
- `categoria`
- `evento`
- `programacion_evento`
- `imagen_evento`
- `recordatorio`
- `evento_categoria`
- `usuario_evento_favorito`

Prisma podrá utilizar nombres de modelos en PascalCase y nombres de campos en camelCase, pero `@map` y `@@map` deberán conservar los nombres físicos canónicos.

La extensión técnica de seguridad utilizará `refresh_token` como tabla separada.

### 3.2 Claves primarias

Las PK canónicas `INT` se implementarán con:

```prisma
Int @id @default(autoincrement())
```

PostgreSQL gestionará la generación del identificador mediante identidad/secuencia según el SQL producido por Prisma.

No se utilizarán UUID en las 14 entidades funcionales.

`refresh_token`, al ser una extensión técnica posterior, podrá mantener UUID como identificador propio; su FK hacia `usuario` deberá cambiar a `INT`.

### 3.3 Tipos de texto propuestos

Las longitudes se establecen como límites de implementación, sin cambiar el significado de los campos de Semana 4.

| Uso | Tipo físico inicial |
|---|---|
| `codigo_dpa` | `VARCHAR(10)` |
| nombres territoriales | `VARCHAR(100)` |
| nombres de sector/lugar | `VARCHAR(150)` |
| `tipo_sector`, `tipo_lugar`, estados y tipos controlados | `VARCHAR(30)` |
| nombre de rol | `VARCHAR(50)` |
| nombre completo de usuario | `VARCHAR(150)` |
| correo | `VARCHAR(254)` |
| hash de contraseña | `VARCHAR(100)` |
| nombre de categoría | `VARCHAR(100)` |
| título de evento | `VARCHAR(200)` |
| fuente de información | `VARCHAR(500)` |
| título de actividad | `VARCHAR(200)` |
| artista invitado | `VARCHAR(200)` |
| URL de imagen o portada | `VARCHAR(2048)` |
| descripción corta de imagen | `VARCHAR(255)` |

Los atributos conceptualmente definidos como `TEXT` permanecerán como `TEXT`.

Antes de generar la migración se comprobará que ninguna longitud contradiga datos reales que deban conservarse.

### 3.4 Coordenadas

`latitud` y `longitud` se implementarán como:

```text
DECIMAL(9,6)
```

con restricciones:

```text
latitud BETWEEN -90 AND 90
longitud BETWEEN -180 AND 180
```

Cuando una entidad permita coordenadas opcionales, se aplicará además la regla de consistencia de pares cuando corresponda: ambas presentes o ambas ausentes.

### 3.5 Valor monetario

`evento.costo_referencial` utilizará:

```text
DECIMAL(10,2)
```

con:

```text
CHECK (costo_referencial >= 0)
```

No se utilizarán `FLOAT` ni `DOUBLE PRECISION` para dinero.

### 3.6 Fechas y horas del dominio

Para mantener correspondencia estricta con Semana 4, los campos conceptualmente definidos como `TIMESTAMP` se implementarán inicialmente como:

```text
TIMESTAMP(3) WITHOUT TIME ZONE
```

En Prisma:

```prisma
@db.Timestamp(3)
```

Los campos definidos como `DATE` permanecerán como `DATE`.

La aplicación operará con la zona horaria del proyecto `America/Guayaquil`. El backend deberá interpretar y validar explícitamente los valores de entrada, evitando depender de la zona horaria implícita del sistema operativo.

Los tiempos técnicos de seguridad de `refresh_token` podrán conservar `TIMESTAMPTZ(3)` porque representan expiraciones absolutas y dicha tabla no pertenece al diseño funcional de Semana 4.

## 4. Dominios controlados

Semana 4 define varios campos `VARCHAR` sujetos a `CHECK`. Para no sustituirlos por enums del ORM, se conservarán como texto y las restricciones se implementarán en el SQL de migración.

### 4.1 `sector.tipo_sector`

Valores iniciales:

- `BARRIO`
- `COMUNIDAD`
- `RECINTO`
- `CIUDADELA`
- `CABECERA_PARROQUIAL`
- `OTRO`

`CABECERA_PARROQUIAL` implementa la regla documentada que permite representar la cabecera cuando no se conoce un sector más específico.

### 4.2 `lugar.tipo_lugar`

Valores iniciales:

- `PARQUE`
- `COLISEO`
- `BALNEARIO`
- `CANCHA`
- `RECINTO_FERIAL`
- `CASA_COMUNAL`
- `OTRO`

`RECINTO_FERIAL` representa el espacio físico y evita confundir el lugar con el evento denominado feria.

### 4.3 `evento.estado_revision`

Valores iniciales:

- `PENDIENTE`
- `APROBADO`
- `RECHAZADO`

`PENDIENTE` y `APROBADO` responden al flujo definido en Semana 4. `RECHAZADO` completa el resultado negativo de una revisión sin obligar a conservarlo incorrectamente como pendiente.

### 4.4 `evento.estado_evento`

Valores iniciales:

- `BORRADOR`
- `PROGRAMADO`
- `CANCELADO`
- `FINALIZADO`
- `ELIMINADO`

`BORRADOR` representa un evento registrado que todavía se encuentra en preparación y permite cumplir la decisión posterior de Semana 7 según la cual el asistente puede actualizar borradores, pero no publicarlos ni eliminarlos.

`PROGRAMADO` es el estado requerido por la regla de publicación de Semana 4. `CANCELADO` y `FINALIZADO` representan estados funcionales diferentes. `ELIMINADO` permite que la operación CRUD de eliminación conserve trazabilidad sin borrar físicamente el evento.

La visibilidad pública exigirá simultáneamente:

```text
estado_evento = 'PROGRAMADO'
estado_revision = 'APROBADO'
```

### 4.5 `imagen_evento.tipo_imagen`

Valores iniciales:

- `AFICHE`
- `FOTOGRAFIA`
- `OTRA`

No se utilizará `PRINCIPAL` como tipo porque esa condición ya está representada por `es_principal`. Tampoco se utilizará `PROGRAMACION` como tipo porque la asociación correspondiente ya existe mediante `id_programacion`.

### 4.6 Roles funcionales de ZamoraFest

La entidad `rol` pertenece al modelo canónico de Semana 4 y se implementará como tabla relacional, no como enum de Prisma.

Los roles operativos definidos posteriormente para la API son:

- `VISITANTE`: puede consultar información pública y, cuando esté autenticado, gestionar únicamente sus propios favoritos y recordatorios.
- `ASISTENTE`: representa al asistente o personal de secretaría; puede registrar eventos y actualizar los que permanezcan en estado `BORRADOR`, pero no puede publicarlos ni eliminarlos.
- `ADMINISTRADOR`: puede revisar, aprobar, publicar, actualizar y eliminar lógicamente eventos.

Estos roles se cargarán como datos controlados mediante el seed.

La tabla `usuario` deberá existir desde esta realineación y cada usuario tendrá exactamente un `id_rol`.

Para pruebas automatizadas existirán usuarios de prueba de los tres roles. Para desarrollo manual, las contraseñas de usuarios iniciales no se almacenarán en el repositorio y se obtendrán mediante variables de entorno.

## 5. Defaults y nulabilidad

Se respetará la nulabilidad definida en Semana 4. Las mejoras de default no convertirán campos opcionales en obligatorios ni viceversa.

Defaults iniciales propuestos:

- campos territoriales `estado`: `true`;
- `rol.estado`: `true`;
- `usuario.estado`: `true`;
- `categoria.estado`: `true`;
- `programacion_evento.estado`: `true`;
- `imagen_evento.es_principal`: `false`;
- `imagen_evento.estado`: `true`;
- `recordatorio.activo`: `true`;
- fechas de creación/registro/subida/agregado: `now()` cuando Semana 4 exige el campo y el valor puede generarse al insertar;
- `evento.estado_revision`: `PENDIENTE`;
- `evento.estado_evento`: `BORRADOR`;

No se establecerá default para `costo_referencial`: el cliente/servicio deberá proporcionar explícitamente el valor, incluyendo `0.00` cuando el evento sea gratuito.

## 6. Integridad referencial

### 6.1 Política general

Las relaciones funcionales usarán:

- `ON DELETE RESTRICT` para impedir borrado físico accidental de registros referenciados;
- `ON UPDATE CASCADE` para mantener integridad si una PK fuese actualizada, aunque la aplicación no utilizará cambios de PK como operación normal.

La eliminación funcional se resolverá mediante los campos de estado correspondientes.

### 6.2 Integridad `evento` / `programacion_evento`

`programacion_evento` tendrá su PK `id_programacion` y además una clave candidata:

```text
UNIQUE (id_evento, id_programacion)
```

`imagen_evento` y `recordatorio` conservarán tanto `id_evento` como `id_programacion` porque así fueron diseñados en Semana 4.

Cuando `id_programacion` no sea nulo, se intentará implementar una FK compuesta:

```text
(id_evento, id_programacion)
    REFERENCES programacion_evento(id_evento, id_programacion)
```

Esto impide que una imagen o recordatorio declare un evento y, simultáneamente, apunte a una programación perteneciente a otro evento.

Antes de fijar el esquema definitivo se comprobará que Prisma 7.8.0 pueda representar esta relación sin perder la FK compuesta. Si Prisma no puede expresarla de forma segura, la restricción se mantendrá mediante SQL de migración y se documentará como restricción física administrada por PostgreSQL.

El servicio realizará además validación previa para proporcionar errores de negocio comprensibles.

### 6.3 Imagen principal

PostgreSQL garantizará como máximo una imagen principal activa por evento mediante un índice único parcial equivalente a:

```sql
CREATE UNIQUE INDEX ...
ON imagen_evento (id_evento)
WHERE es_principal = TRUE AND estado = TRUE;
```

Esta restricción se incorporará manualmente al SQL de migración si Prisma no puede expresarla directamente.

## 7. Política de eliminación funcional

La eliminación no se implementará igual en todas las entidades porque Semana 4 ya define distintos campos de conservación.

| Entidad | Eliminación funcional |
|---|---|
| provincia | `estado = false` |
| canton | `estado = false` |
| parroquia | `estado = false` |
| sector | `estado = false` |
| lugar | `estado = false` |
| rol | `estado = false` |
| usuario | `estado = false` |
| categoria | `estado = false` |
| evento | `estado_evento = 'ELIMINADO'` |
| programacion_evento | `estado = false` |
| imagen_evento | `estado = false` |
| recordatorio | `activo = false` |
| evento_categoria | eliminación física de la asociación permitida |
| usuario_evento_favorito | eliminación física de la asociación permitida al quitar favorito |

Las asociaciones N:M no representan por sí mismas una entidad histórica principal y Semana 4 no les asigna un campo de estado; por ello no se añadirá uno sin necesidad.

## 8. Índices iniciales

No se indexarán indiscriminadamente todas las columnas. Se crearán índices relacionados con filtros, joins y reglas reales.

### Territorio

- `canton(id_provincia)`
- `parroquia(id_canton)`
- `sector(id_parroquia)`
- `lugar(id_sector)`
- índices sobre `estado` combinados con la FK cuando sean útiles para consultas activas

Las restricciones `UNIQUE` sobre códigos DPA y nombres ya generan índices propios.

### Usuario y roles

- `usuario(id_rol, estado)`
- `usuario(correo)` mediante `UNIQUE`

### Eventos

- `evento(id_lugar)`
- `evento(id_usuario_creador)`
- `evento(id_usuario_revisor)`
- índice compuesto para consulta pública:
  `evento(estado_evento, estado_revision, fecha_inicio)`
- índice sobre `fecha_inicio` cuando sea necesario para filtros de rango

### Categorías y programación

- `evento_categoria(id_categoria, id_evento)`
- `programacion_evento(id_evento, estado, fecha_hora_inicio)`
- `programacion_evento(id_lugar)`

### Imágenes, favoritos y recordatorios

- `imagen_evento(id_evento, estado)`
- índice único parcial de imagen principal activa
- `usuario_evento_favorito(id_evento, id_usuario)` además de su PK `(id_usuario, id_evento)`
- `recordatorio(id_usuario, activo, fecha_notificacion)`
- `recordatorio(id_evento)`

### Refresh tokens

Se conservará un índice equivalente a:

```text
(usuario_id, revocado_en, expira_en)
```

adaptando `usuario_id` a `INT`.

## 9. Adaptación de autenticación

La autenticación actual no se eliminará; se adaptará.

Cambios principales:

1. eliminar `RolUsuario` como enum persistido;
2. crear y utilizar la tabla `rol`;
3. cambiar `usuario.id` UUID por `usuario.id_usuario INT`;
4. adaptar JWT para transportar el identificador entero del usuario y el nombre/código de rol requerido para autorización;
5. adaptar `RefreshToken.usuarioId` a entero;
6. mantener hash de contraseña y hash de refresh token;
7. conservar rotación y revocación de refresh tokens;
8. adaptar middleware `authenticate` y `authorizeRoles` a los roles obtenidos desde `rol`.

Roles iniciales previstos para los flujos ya definidos del proyecto:

- `ADMINISTRADOR`
- `ASISTENTE`
- `VISITANTE`

`VISITANTE` permite representar usuarios registrados que utilicen favoritos y recordatorios, aunque la consulta pública de eventos no requiera autenticación.

## 10. Adaptación de `recordatorio` y BullMQ

La tabla funcional `recordatorio` volverá a almacenar:

- usuario;
- evento;
- programación opcional;
- fecha de notificación;
- activo;
- fecha de creación.

Los estados técnicos `PENDIENTE`, `PROCESANDO`, `COMPLETADO` y `FALLIDO` dejarán de formar parte de la entidad funcional.

BullMQ será responsable del estado técnico del job.

El job utilizará como mínimo:

```ts
{ recordatorioId: number }
```

El worker deberá:

1. recuperar el recordatorio activo;
2. comprobar que continúa siendo válido;
3. recuperar usuario, evento y programación cuando corresponda;
4. ejecutar el procesamiento simulado/implementado por la práctica;
5. dejar el estado técnico y los reintentos en BullMQ;
6. no transformar el significado funcional del registro PostgreSQL.

## 11. Adaptación del CRUD de eventos

El contrato actual del CRUD deberá cambiar para representar el `evento` real.

### Creación

Deberá manejar al menos:

- `titulo`
- `descripcion` opcional
- `fechaInicio`
- `fechaFin` opcional
- `costoReferencial`
- `lugarId`
- categorías
- `fuenteInformacion` opcional

`id_usuario_creador` se obtendrá del usuario autenticado en operaciones protegidas.

`id_usuario_revisor`, `fecha_revision` y el cambio a `APROBADO` se gestionarán mediante el flujo de revisión correspondiente, no mediante datos arbitrarios enviados por un cliente sin autorización.

### Actualización

Deberá validar:

- coherencia de fechas;
- costo no negativo;
- lugar activo;
- categorías activas;
- permisos por rol;
- transiciones válidas de estado.

### Eliminación

`DELETE /eventos/{id}` realizará eliminación lógica mediante `estado_evento = 'ELIMINADO'` y no borrará físicamente el registro.

### Consulta pública

Solo devolverá eventos que cumplan:

```text
estado_evento = PROGRAMADO
estado_revision = APROBADO
```

y cuyas relaciones necesarias para la consulta se encuentren activas.

## 12. Datos iniciales (`seed`)

El `seed` deberá ser reescrito para el modelo canónico.

Como mínimo incluirá:

1. provincia de Zamora Chinchipe;
2. cantones requeridos por las pruebas/demostración;
3. parroquias necesarias para los lugares de demostración;
4. sectores necesarios, incluyendo `CABECERA_PARROQUIAL` cuando corresponda;
5. al menos un lugar válido dentro de la jerarquía completa;
6. roles `ADMINISTRADOR`, `ASISTENTE` y `VISITANTE`;
7. categorías de demostración;
8. usuarios de prueba únicamente en la base de pruebas o mediante preparación explícita, evitando credenciales reales en el repositorio.

El seed deberá ser idempotente o utilizar una estrategia reproducible que no cree duplicados en ejecuciones consecutivas.

## 13. Estrategia de migración

### 13.1 No reescribir migraciones históricas

Se conservarán las migraciones existentes:

- `20260719230105_init_event_domain`
- `20260720032806_add_authentication`
- `20260720063553_add_reminder_queue`

La realineación se añadirá como una nueva migración posterior.

Esto permite demostrar la corrección y conserva la trazabilidad del proyecto.

### 13.2 Inventario previo obligatorio

Antes de generar o aplicar una migración correctiva sobre `zamorafest_dev` se registrarán conteos de las tablas actuales para determinar si contienen únicamente seed/datos de demostración o información que deba conservarse.

Como mínimo se inventariarán:

- usuarios;
- refresh tokens;
- cantones;
- lugares;
- categorías;
- eventos;
- evento-categorías;
- programaciones;
- imágenes;
- recordatorios.

### 13.3 Copia de seguridad

Antes de cualquier migración potencialmente destructiva de desarrollo se realizará un `pg_dump` de `zamorafest_dev`.

La base `zamorafest_test` podrá reconstruirse desde cero porque su finalidad es exclusivamente automatizada.

### 13.4 Cambio UUID → INT

UUID no se convertirá mediante casts directos a entero.

La migración deberá utilizar una de estas estrategias, seleccionada después del inventario:

**Escenario A — datos exclusivamente reproducibles (seed/demo):**

- conservar las migraciones históricas;
- ejecutar una migración correctiva que reconstruya las tablas funcionales con el esquema canónico;
- regenerar datos mediante el nuevo seed;
- reconstruir la base de pruebas.

**Escenario B — existen datos locales que deben conservarse:**

- crear estructuras temporales/canónicas;
- generar nuevos identificadores enteros;
- construir tablas de correspondencia UUID → INT;
- migrar relaciones respetando dichas correspondencias;
- validar conteos y relaciones;
- retirar las estructuras antiguas únicamente después de la verificación.

El inventario de `zamorafest_dev` fue ejecutado antes de modificar el esquema.

Se encontraron 9 cantones, 3 categorías, 1 lugar, 12 eventos y 12 asociaciones evento-categoría. No existen usuarios, refresh tokens, programaciones, imágenes ni recordatorios.

Los 12 eventos tienen títulos de demostración, identificadores UUID secuenciales y fueron generados como datos técnicos de prueba. No representan información funcional que requiera conservación y tampoco poseen un usuario creador que pueda trasladarse legítimamente al modelo de Semana 4.

Por tanto, se selecciona el **Escenario A — reconstrucción controlada de datos reproducibles**.

Antes de aplicar la migración correctiva se realizará un `pg_dump` de `zamorafest_dev`. Después, la nueva migración reconstruirá las tablas funcionales según el modelo canónico y el nuevo seed generará datos coherentes con la jerarquía territorial, roles, usuarios de desarrollo cuando estén configurados y datos de demostración compatibles con el nuevo esquema.

Los UUID de los 12 eventos actuales no se convertirán artificialmente a enteros ni se les asignará un creador inexistente.

## 14. Flujo de trabajo con Prisma

Una vez aprobados `spec.md`, `plan.md` y `tasks.md`:

1. modificar `schema.prisma`;
2. ejecutar `npm run prisma:format`;
3. ejecutar `npm run prisma:validate`;
4. ejecutar `npm run prisma:generate`;
5. ejecutar `npm run typecheck` para identificar impacto esperado en el código;
6. generar la migración inicialmente con `--create-only`;
7. inspeccionar manualmente `migration.sql`;
8. añadir manualmente los `CHECK`, índices parciales y restricciones que Prisma no represente;
9. validar nuevamente el SQL;
10. aplicar primero sobre una base aislada o de pruebas;
11. actualizar seed y código dependiente;
12. ejecutar la batería completa de pruebas;
13. aplicar en desarrollo únicamente después de disponer de respaldo y resultados satisfactorios.

No se utilizará `prisma db push` para sustituir el historial de migraciones.

## 15. Adaptación por capas

El cambio se realizará en este orden:

1. especificación y plan;
2. inventario de datos;
3. `schema.prisma`;
4. migración `--create-only` revisada;
5. seed;
6. pruebas del modelo relacional;
7. autenticación y roles;
8. repositorio/servicio/controlador de eventos;
9. programación e imágenes necesarias para consultas;
10. favoritos;
11. recordatorios y BullMQ;
12. Redis y estrategias de carga;
13. OpenAPI;
14. documentación del modelo;
15. mediciones finales;
16. integración móvil.

## 16. Puertas de verificación

### Puerta A — documentación

Antes de modificar Prisma:

- `spec.md` aprobado;
- `plan.md` aprobado;
- `tasks.md` creado;
- repositorio limpio.

### Puerta B — esquema

Antes de generar migración:

- Prisma formatea;
- Prisma valida;
- Prisma Client genera;
- relaciones canónicas representadas;
- ninguna de las 14 entidades omitida.

### Puerta C — SQL

Antes de aplicar migración:

- SQL revisado línea por línea;
- `CHECK` presentes;
- FKs correctas;
- `ON DELETE/UPDATE` correctos;
- índices revisados;
- índice parcial de imagen principal presente;
- estrategia evento/programación verificada;
- copia de seguridad realizada cuando corresponda.

### Puerta D — base de pruebas

Antes de tocar desarrollo:

- base de pruebas reconstruible;
- seed correcto;
- pruebas de integridad aprobadas;
- claves y restricciones comprobadas;
- no existen relaciones huérfanas.

### Puerta E — backend

Antes de considerar terminada la realineación:

- `npm run prisma:validate` correcto;
- `npm run prisma:generate` correcto;
- `npm run typecheck` correcto;
- `npm run lint` correcto;
- pruebas unitarias correctas;
- pruebas de integración correctas;
- CRUD real correcto;
- autenticación y autorización correctas;
- favoritos y recordatorios correctos;
- Redis/BullMQ funcionando sin sustituir PostgreSQL;
- OpenAPI actualizado.

## 17. Línea base y comparación posterior

La línea base previa permanece documentada como:

- 19/19 pruebas de integración aprobadas;
- consulta sin caché ≈ 498.31 ms;
- caché caliente promedio ≈ 8.86 ms;
- reducción observada ≈ 98.22 %.

Las cifras posteriores deberán medirse nuevamente bajo condiciones documentadas. No se exigirá conservar exactamente los mismos milisegundos porque el modelo y el conjunto de datos cambiarán; sí se exigirá conservar el comportamiento de optimización y demostrarlo con una comparación reproducible.

## 18. Criterio de cierre del plan

La realineación no se considerará una simple modificación de Prisma. Estará finalizada únicamente cuando el diseño de Semana 4, PostgreSQL, Prisma, backend, API, pruebas, documentación y posterior cliente móvil describan el mismo sistema y todas las extensiones posteriores estén justificadas sin sustituir el dominio original.
