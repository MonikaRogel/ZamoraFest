# Tareas: realineación del modelo de datos con Semana 4 (008)

## Estado

- **Rama:** `fix/realineacion-modelo-semana4`
- **Especificación:** `spec.md`
- **Plan técnico:** `plan.md`
- **Estado general:** Fase 3 completada; Fase 4 en ejecución

## Regla de ejecución

Las tareas se ejecutarán en el orden definido en este documento. No se avanzará a una fase posterior mientras la puerta de verificación de la fase actual no haya sido superada.

No se ejecutará `prisma migrate reset`, `prisma db push` ni una migración correctiva sobre `zamorafest_dev` antes del respaldo, revisión del esquema y validación del SQL.

---

## Fase 0 — Línea base y protección

### T001 — Confirmar rama y árbol limpio

- [x] Confirmar rama `fix/realineacion-modelo-semana4`.
- [x] Confirmar `git status` limpio.
- [x] Confirmar que `spec.md`, `plan.md` y `tasks.md` se encuentran versionados.

### T002 — Registrar línea base funcional previa

- [x] Conservar evidencia de 19/19 pruebas de integración aprobadas antes de la realineación.
- [x] Conservar medición previa de caché: MISS aproximado 498.31 ms.
- [x] Conservar medición previa de caché: HIT promedio aproximado 8.86 ms.
- [x] Documentar que estas métricas corresponden al modelo reducido anterior.

### T003 — Respaldar `zamorafest_dev`

- [x] Ejecutar `pg_dump` de `zamorafest_dev` antes de cualquier modificación destructiva.
- [x] Verificar que el archivo de respaldo exista y tenga tamaño mayor que cero.
- [x] Registrar fecha/hora y nombre del respaldo.
- [x] No versionar credenciales ni secretos en Git.

Evidencia:
- respaldo: `zamorafest_dev_pre_realineacion_20260818-230418.dump`;
- ubicación externa al repositorio: `D:\UEA\NIVEL V\APP_MOVILES_MR\ZamoraFest_Backups`;
- tamaño: 26.09 KB (26714 bytes);
- validación `pg_restore --list`: correcta;
- entradas reconocidas: 61.

### T004 — Confirmar inventario previo

- [x] Registrar que existen 9 cantones.
- [x] Registrar que existen 3 categorías.
- [x] Registrar que existe 1 lugar.
- [x] Registrar que existen 12 eventos de demostración.
- [x] Registrar que existen 12 asociaciones evento-categoría.
- [x] Registrar que no existen usuarios, refresh tokens, programaciones, imágenes ni recordatorios.
- [x] Confirmar formalmente el Escenario A: reconstrucción controlada de datos reproducibles.

### Puerta G0

No continuar si:

- el respaldo no existe;
- la rama no está limpia;
- la base objetivo no es `zamorafest_dev`;
- aparece información funcional no contemplada por el inventario.

---

## Fase 1 — Modelo canónico en Prisma

### T005 — Eliminar sustituciones conceptuales incorrectas

- [x] Retirar `RolUsuario` como sustituto de la entidad `rol`.
- [x] Retirar `EstadoRecordatorio` de la entidad funcional `recordatorio`.
- [x] Retirar el modelo reducido que relaciona `lugar` directamente con `canton`.
- [x] Retirar campos de eliminación lógica que contradigan el modelo canónico cuando su función ya esté representada por `estado` o `estado_evento`.

### T006 — Implementar jerarquía territorial completa

- [x] Crear modelo Prisma `Provincia` → tabla `provincia`.
- [x] Crear modelo Prisma `Canton` → tabla `canton`.
- [x] Crear modelo Prisma `Parroquia` → tabla `parroquia`.
- [x] Crear modelo Prisma `Sector` → tabla `sector`.
- [x] Crear modelo Prisma `Lugar` → tabla `lugar`.
- [x] Implementar PK `INT` autogeneradas.
- [x] Implementar FK en cadena `provincia → canton → parroquia → sector → lugar`.
- [x] Implementar códigos DPA y unicidades definidas.
- [x] Implementar coordenadas `DECIMAL(9,6)`.

### T007 — Implementar `rol`

- [x] Crear modelo Prisma `Rol` → tabla `rol`.
- [x] Implementar `id_rol INT` autogenerado.
- [x] Implementar `nombre` único.
- [x] Implementar `descripcion`.
- [x] Implementar `estado`.
- [x] No utilizar enum Prisma como reemplazo funcional de `rol`.

### T008 — Implementar `usuario`

- [x] Crear modelo Prisma `Usuario` → tabla `usuario`.
- [x] Implementar `id_usuario INT` autogenerado.
- [x] Implementar `id_rol` FK obligatoria.
- [x] Implementar `nombre_completo`.
- [x] Implementar `correo` único.
- [x] Implementar `contrasena_hash`.
- [x] Implementar `fecha_registro`.
- [x] Implementar `estado`.
- [x] Definir relaciones con eventos creados, eventos revisados, imágenes, favoritos y recordatorios.

### T009 — Adaptar `refresh_token`

- [x] Mantener `refresh_token` como extensión técnica posterior.
- [x] Mantener UUID como identificador técnico si continúa siendo conveniente.
- [x] Cambiar `usuario_id` de UUID a `INT`.
- [x] Mantener hash de token.
- [x] Mantener expiración y revocación.
- [x] Mantener `TIMESTAMPTZ` para tiempos técnicos de seguridad.

### T010 — Implementar `categoria`

- [x] Crear/realinear `Categoria` → tabla `categoria`.
- [x] Implementar PK `INT`.
- [x] Implementar `nombre` único.
- [x] Implementar `descripcion`.
- [x] Implementar `estado`.

### T011 — Implementar `evento`

- [x] Crear/realinear `Evento` → tabla `evento`.
- [x] Implementar PK `INT`.
- [x] Implementar `titulo`.
- [x] Implementar `descripcion` opcional.
- [x] Implementar `fecha_inicio`.
- [x] Implementar `fecha_fin` opcional.
- [x] Implementar `costo_referencial DECIMAL(10,2)`.
- [x] Implementar FK obligatoria a `lugar`.
- [x] Implementar FK obligatoria `id_usuario_creador`.
- [x] Implementar FK opcional `id_usuario_revisor`.
- [x] Implementar `estado_evento`.
- [x] Implementar `estado_revision`.
- [x] Implementar `fuente_informacion`.
- [x] Implementar fechas de creación, actualización y revisión.

### T012 — Implementar `evento_categoria`

- [x] Crear tabla `evento_categoria`.
- [x] Implementar PK compuesta `(id_evento, id_categoria)`.
- [x] Implementar ambas FK.
- [x] Impedir asociaciones duplicadas.

### T013 — Implementar `programacion_evento`

- [x] Crear tabla `programacion_evento`.
- [x] Implementar PK `INT`.
- [x] Implementar FK obligatoria a `evento`.
- [x] Implementar FK opcional a `lugar`.
- [x] Implementar título de actividad.
- [x] Implementar descripción.
- [x] Implementar inicio y fin.
- [x] Implementar artista invitado.
- [x] Implementar orden.
- [x] Implementar estado.

### T014 — Implementar `imagen_evento`

- [x] Crear tabla `imagen_evento`.
- [x] Implementar PK `INT`.
- [x] Implementar FK obligatoria a `evento`.
- [x] Implementar FK opcional a `programacion_evento`.
- [x] Implementar FK obligatoria a `usuario` como usuario de subida.
- [x] Implementar URL, tipo, descripción, principal, fecha y estado.
- [x] Preparar integridad evento/programación.

### T015 — Implementar `usuario_evento_favorito`

- [x] Crear tabla `usuario_evento_favorito`.
- [x] Implementar PK compuesta `(id_usuario, id_evento)`.
- [x] Implementar `fecha_agregado`.
- [x] Impedir favoritos duplicados.

### T016 — Implementar `recordatorio`

- [x] Crear/realinear tabla `recordatorio`.
- [x] Implementar PK `INT`.
- [x] Implementar FK a `usuario`.
- [x] Implementar FK a `evento`.
- [x] Implementar FK opcional a `programacion_evento`.
- [x] Implementar `fecha_notificacion`.
- [x] Implementar `activo`.
- [x] Implementar `fecha_creacion`.
- [x] Eliminar de la entidad funcional los estados técnicos de BullMQ.

### Puerta G1

Ejecutar y aprobar:

- [x] `npm run prisma:format`
- [x] `npm run prisma:validate`
- [x] `npm run prisma:generate`

No avanzar si Prisma no representa las 14 entidades funcionales más `refresh_token` como extensión técnica.

---

## Fase 2 — Restricciones físicas PostgreSQL

### T017 — Implementar CHECK de dominios

- [x] `sector.tipo_sector`.
- [x] `lugar.tipo_lugar`.
- [x] `evento.estado_evento` con `BORRADOR`, `PROGRAMADO`, `CANCELADO`, `FINALIZADO`, `ELIMINADO`.
- [x] `evento.estado_revision` con `PENDIENTE`, `APROBADO`, `RECHAZADO`.
- [x] `imagen_evento.tipo_imagen`.

### T018 — Implementar CHECK numéricos y temporales

- [x] Coordenadas en rango.
- [x] Pares de coordenadas coherentes cuando corresponda.
- [x] `costo_referencial >= 0`.
- [x] `fecha_fin >= fecha_inicio` cuando exista fecha de fin.
- [x] `fecha_hora_fin >= fecha_hora_inicio` cuando exista fin de programación.

### T019 — Implementar integridad evento/programación

- [x] Garantizar que `imagen_evento.id_programacion`, cuando exista, pertenezca al mismo `id_evento`.
- [x] Garantizar que `recordatorio.id_programacion`, cuando exista, pertenezca al mismo `id_evento`.
- [x] Preferir FK compuesta si Prisma y PostgreSQL lo permiten de forma estable.
- [x] No fue necesario mantener esta integridad fuera de Prisma: las FK compuestas quedaron representadas de forma estable.

### T020 — Implementar imagen principal única activa

- [x] Impedir más de una imagen principal activa por evento.
- [x] Utilizar índice parcial PostgreSQL si resulta adecuado.

### T021 — Implementar índices

- [x] FK territoriales.
- [x] códigos DPA.
- [x] correo de usuario.
- [x] lugar de evento.
- [x] creador y revisor.
- [x] estados de publicación.
- [x] fecha de inicio de evento.
- [x] categoría-evento.
- [x] recordatorios por usuario y fecha.
- [x] índices requeridos por consultas públicas y Strategy.

### T022 — Revisar acciones referenciales

- [x] Aplicar `RESTRICT` donde la eliminación de un padre invalidaría el dominio.
- [x] Aplicar `CASCADE` únicamente en tablas asociativas donde esté justificado.
- [x] Verificar que la eliminación lógica del dominio no dependa de borrado físico.

### Puerta G2

- [x] Esquema Prisma válido.
- [x] Restricciones físicas documentadas.
- [x] Índices justificados.
- [x] Ninguna regla canónica omitida.

---

## Fase 3 — Migración correctiva

### T023 — Generar migración únicamente para revisión

- [x] Generar migración con `--create-only`.
- [x] No aplicarla inmediatamente.
- [x] Revisar `migration.sql` línea por línea.

### T024 — Adaptar SQL al Escenario A

- [x] Conservar las tres migraciones históricas.
- [x] Crear migración correctiva posterior.
- [x] Retirar/reconstruir las tablas funcionales reducidas según orden seguro de FK.
- [x] Crear las tablas canónicas de Semana 4.
- [x] Crear `rol` y `usuario` en la misma migración correctiva.
- [x] Mantener `refresh_token` como extensión adaptada al nuevo `usuario`.
- [x] Incorporar manualmente CHECK, índices parciales y restricciones no generadas por Prisma.

### T025 — Revisar seguridad de la migración

- [x] Confirmar que el SQL actúa únicamente sobre el esquema esperado.
- [x] Confirmar que existe respaldo `pg_dump` válido.
- [x] Confirmar que los 12 eventos actuales son datos de demostración y no se migrarán artificialmente.
- [x] Confirmar que no se inventará un usuario creador para datos antiguos.

### T026 — Aplicar migración en entorno controlado

- [x] Probar primero la reconstrucción en `zamorafest_test` o base temporal equivalente.
- [x] Verificar creación de todas las tablas.
- [x] Verificar FK, PK, UQ, CHECK e índices.
- [x] Solo después aplicar en `zamorafest_dev`.

### Puerta G3

- [x] Migración reproducible desde historial completo.
- [x] 14 entidades funcionales presentes.
- [x] `refresh_token` presente como extensión.
- [x] Ninguna tabla reducida antigua permanece como fuente funcional.

---

## Fase 4 — Seed coherente

### T027 — Reescribir `seed.ts`

- [x] Crear provincia Zamora Chinchipe.
- [x] Crear los cantones necesarios con DPA correcto.
- [x] Crear parroquias necesarias.
- [x] Crear sectores necesarios.
- [x] Crear `CABECERA_PARROQUIAL` cuando corresponda.
- [x] Crear al menos un lugar válido en la jerarquía completa.
- [x] Crear categorías.
- [x] Crear roles `ADMINISTRADOR`, `ASISTENTE`, `VISITANTE`.

### T028 — Preparar usuarios de desarrollo/prueba

- [x] Crear usuarios de prueba para los tres roles en entorno de pruebas.
- [x] No guardar contraseñas reales en Git.
- [x] Para desarrollo manual, obtener credenciales desde variables de entorno.
- [x] Generar hashes mediante el mecanismo de autenticación real.
- [x] Verificar FK `usuario → rol`.

### T029 — Regenerar datos de demostración compatibles

- [x] Crear eventos únicamente después de disponer de usuario creador válido.
- [x] Crear datos con `BORRADOR/PENDIENTE` y/o `PROGRAMADO/APROBADO` según el caso de prueba.
- [x] Asociar categorías.
- [x] Crear programación cuando sea necesaria para pruebas.
- [x] No copiar los UUID anteriores.

### Puerta G4

- [x] Seed idempotente/reproducible.
- [x] Ningún evento sin creador.
- [x] Ningún usuario sin rol.
- [x] Jerarquía territorial completa y válida.

---

## Fase 5 — Autenticación y autorización

### T030 — Adaptar repositorio/servicio de autenticación

- [ ] Cambiar identificador de usuario de UUID a `INT`.
- [ ] Obtener rol mediante relación `usuario → rol`.
- [ ] Mantener hash seguro de contraseña.
- [ ] Mantener access token.
- [ ] Mantener refresh token de 7 días según definición previa.
- [ ] Mantener rotación y revocación.

### T031 — Adaptar claims JWT

- [ ] Incluir `id_usuario` adecuado.
- [ ] Incluir rol normalizado.
- [ ] Mantener únicamente claims necesarios.

### T032 — Adaptar autorización

- [ ] `VISITANTE` autenticado: favoritos y recordatorios propios.
- [ ] `ASISTENTE`: crear eventos y modificar borradores conforme a reglas.
- [ ] `ADMINISTRADOR`: revisar, aprobar, publicar, actualizar y eliminar lógicamente.
- [ ] Impedir escalamiento de privilegios.

### Puerta G5

- [ ] Login válido.
- [ ] Refresh válido.
- [ ] Revocación válida.
- [ ] Matriz de roles probada.

---

## Fase 6 — CRUD y reglas de negocio

### T033 — Adaptar DTO/Zod de eventos

- [ ] Validar todos los campos canónicos requeridos.
- [ ] Validar fechas.
- [ ] Validar costo.
- [ ] Validar lugar.
- [ ] Validar categorías.
- [ ] No aceptar directamente creador/revisor cuando deban derivarse de autenticación.

### T034 — Adaptar repositorio de eventos

- [ ] Consultar nueva jerarquía territorial.
- [ ] Consultar creador y revisor.
- [ ] Consultar categorías.
- [ ] Consultar programación e imágenes según Strategy.
- [ ] Evitar N+1.

### T035 — Adaptar servicio de eventos

- [ ] Crear evento como `BORRADOR/PENDIENTE` para el flujo de asistente.
- [ ] Asociar creador autenticado.
- [ ] Validar lugar activo.
- [ ] Validar categorías activas.
- [ ] Implementar flujo de revisión.
- [ ] Registrar revisor y fecha de revisión.
- [ ] Publicar solo cuando corresponda.

### T036 — Adaptar eliminación lógica

- [ ] `DELETE` no eliminará físicamente el evento.
- [ ] Cambiar a `estado_evento = ELIMINADO` cuando la operación esté autorizada.
- [ ] Excluir eliminados de consultas normales.

### T037 — Adaptar consultas públicas

- [ ] Mostrar solo `PROGRAMADO + APROBADO`.
- [ ] Mantener paginación.
- [ ] Mantener filtros.
- [ ] Mantener selección de campos.

---

## Fase 7 — Favoritos, imágenes y programación

### T038 — Implementar favoritos

- [ ] Crear favorito para usuario autenticado.
- [ ] Impedir duplicados.
- [ ] Listar favoritos propios.
- [ ] Eliminar favorito propio según contrato definido.

### T039 — Implementar programación

- [ ] CRUD/servicio requerido por el alcance actual.
- [ ] Validar pertenencia al evento.
- [ ] Validar lugar opcional.
- [ ] Validar fechas.

### T040 — Implementar imágenes

- [ ] Validar evento.
- [ ] Registrar usuario de subida.
- [ ] Validar programación opcional.
- [ ] Garantizar coherencia evento/programación.
- [ ] Garantizar principal única activa.

---

## Fase 8 — Recordatorios y BullMQ

### T041 — Adaptar recordatorio funcional

- [ ] Crear recordatorio con usuario, evento, programación opcional y fecha de notificación.
- [ ] Validar pertenencia de programación al evento.
- [ ] Validar propiedad del usuario.
- [ ] Mantener `activo`.

### T042 — Adaptar cola BullMQ

- [ ] Job con `recordatorioId: number`.
- [ ] No persistir estado técnico de BullMQ en los campos funcionales del recordatorio.
- [ ] Mantener reintentos/estado técnico en la cola.

### T043 — Adaptar worker

- [ ] Recuperar recordatorio por `INT`.
- [ ] Comprobar `activo`.
- [ ] Cargar evento/programación/usuario.
- [ ] Procesar sin redefinir la semántica del registro.

---

## Fase 9 — Caché y rendimiento

### T044 — Realinear claves de caché

- [ ] Actualizar claves que dependan de IDs UUID.
- [ ] Adaptarlas a IDs enteros y nuevo contrato.

### T045 — Mantener cache-aside

- [ ] Listados públicos.
- [ ] detalle público.
- [ ] categorías.
- [ ] invalidación al crear/revisar/publicar/actualizar/eliminar.

### T046 — Revalidar Strategy y N+1

- [ ] `basic`.
- [ ] `detailed`.
- [ ] verificar número de consultas.
- [ ] mantener selección de campos.

### T047 — Repetir medición

- [ ] Medir MISS con nuevo modelo.
- [ ] Medir HIT con nuevo modelo.
- [ ] Documentar condiciones.
- [ ] Comparar con línea base sin afirmar equivalencia si cambian las condiciones.

---

## Fase 10 — Pruebas

### T048 — Pruebas del modelo

- [ ] PK/FK.
- [ ] unicidades.
- [ ] CHECK.
- [ ] jerarquía territorial.
- [ ] roles/usuarios.
- [ ] evento/programación cruzada.
- [ ] favoritos duplicados.
- [ ] imagen principal.

### T049 — Pruebas de autenticación

- [ ] login.
- [ ] token inválido.
- [ ] refresh.
- [ ] revocación.
- [ ] rol inactivo si aplica.

### T050 — Pruebas de autorización

- [ ] VISITANTE.
- [ ] ASISTENTE.
- [ ] ADMINISTRADOR.
- [ ] operaciones prohibidas por rol.

### T051 — Pruebas CRUD eventos

- [ ] creación.
- [ ] actualización.
- [ ] revisión.
- [ ] publicación.
- [ ] eliminación lógica.
- [ ] consulta pública.

### T052 — Pruebas de favoritos y recordatorios

- [ ] favoritos propios.
- [ ] duplicados.
- [ ] recordatorios válidos.
- [ ] programación perteneciente a otro evento rechazada.
- [ ] BullMQ con identificador entero.

### T053 — Calidad general

- [ ] `npm run typecheck`.
- [ ] `npm run lint`.
- [ ] `npm run test` o scripts equivalentes definidos.
- [ ] `npm run test:integration`.
- [ ] `npm run build`.

### Puerta G10

No continuar al cierre si existe una prueba relevante fallida.

---

## Fase 11 — Documentación

### T054 — Actualizar modelo de datos

- [ ] Actualizar `docs/modelo-datos.md`.
- [ ] Sustituir DER reducido por las 14 entidades canónicas.
- [ ] Documentar `refresh_token` como extensión técnica.

### T055 — Actualizar especificaciones anteriores afectadas

- [ ] Marcar explícitamente en 001 que su simplificación quedó supersedida por 008.
- [ ] No borrar ni reescribir la evidencia histórica.
- [ ] Añadir referencia a la corrección 008.

### T056 — Actualizar OpenAPI

- [ ] IDs enteros.
- [ ] campos reales de evento.
- [ ] estados.
- [ ] roles.
- [ ] favoritos.
- [ ] recordatorios.
- [ ] respuestas de error.

### T057 — Actualizar README

- [ ] Modelo real.
- [ ] flujo de migración.
- [ ] seed.
- [ ] ejecución de pruebas.
- [ ] requisitos de entorno.

---

## Fase 12 — Cierre de la realineación

### T058 — Auditoría final contra Semana 4

- [ ] Comparar entidad por entidad.
- [ ] Comparar campo por campo.
- [ ] Comparar PK/FK.
- [ ] Comparar cardinalidades.
- [ ] Comparar reglas de negocio.
- [ ] Verificar que no falte ninguna de las 14 entidades.

### T059 — Auditoría de regresión Semanas 7 y 8

- [ ] autenticación y autorización.
- [ ] refresh tokens.
- [ ] CRUD.
- [ ] Swagger/OpenAPI.
- [ ] caché.
- [ ] N+1.
- [ ] Strategy.
- [ ] BullMQ.

### T060 — Estado final Git

- [ ] árbol limpio.
- [ ] commits trazables.
- [ ] push de rama.
- [ ] PR correctiva preparada.
- [ ] no fusionar a `main` hasta completar todas las puertas relevantes.

## Criterio de finalización

La realineación 008 estará terminada únicamente cuando PostgreSQL, Prisma, backend, pruebas y documentación representen el mismo modelo funcional de Semana 4 y las extensiones posteriores estén claramente separadas y justificadas.

Solo después de este cierre se continuará con el desarrollo de la interfaz móvil sobre una API y una base de datos ya coherentes.