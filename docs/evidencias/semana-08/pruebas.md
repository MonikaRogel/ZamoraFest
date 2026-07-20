# Evidencia de pruebas — Semana 8

## Estado

**Pruebas completadas correctamente el 20 de julio de 2026.**

Las verificaciones se ejecutaron sobre la rama:

`feat/004-optimizacion-semana-08`

## Resumen

| Grupo                  | Archivos | Pruebas | Resultado |
| ---------------------- | -------: | ------: | --------- |
| Prueba HTTP de salud   |        1 |       1 | Aprobadas |
| Modelo relacional      |        1 |      11 | Aprobadas |
| API de eventos y caché |        1 |       4 | Aprobadas |
| Autenticación y roles  |        1 |       3 | Aprobadas |
| Cola de recordatorios  |        1 |       1 | Aprobadas |
| Total                  |        5 |      20 | Aprobadas |

De las 20 pruebas:

- 1 corresponde al endpoint de salud.
- 19 son pruebas de integración con PostgreSQL y Redis.

## Pruebas del modelo relacional

Se verificaron:

- Las diez tablas esperadas.
- Claves foráneas.
- Restricciones de unicidad.
- Valores predeterminados.
- Imágenes principales.
- Coordenadas válidas.
- Programaciones con fechas válidas.
- Restricción del borrado físico.
- Reutilización de nombres eliminados lógicamente.

Resultado:

`11 pruebas aprobadas`.

## Pruebas del CRUD de eventos

Se verificaron:

- Creación de eventos.
- Listado público paginado.
- Consulta individual.
- Actualización parcial.
- Eliminación lógica.
- Validaciones con Zod.
- Ocultamiento de eventos en borrador.
- Respuestas JSON y códigos HTTP.

Resultado:

`4 pruebas aprobadas`.

## Prueba del caché Redis

La prueba automatizada ejecutó la siguiente secuencia:

1. Invalidar el caché.
2. Consultar el listado y recibir `X-Cache: MISS`.
3. Consultar nuevamente y recibir `X-Cache: HIT`.
4. Actualizar un evento.
5. Consultar otra vez y recibir `X-Cache: MISS`.

Esto confirma que el caché funciona y que su invalidación evita devolver datos desactualizados.

## Pruebas de autenticación

Se verificaron:

- Registro de un usuario con rol `ASISTENTE`.
- Almacenamiento de la contraseña mediante hash.
- Inicio de sesión.
- Emisión de access token y refresh token.
- Rotación del refresh token.
- Rechazo de reutilización.
- Respuesta `401 Unauthorized` sin token.
- Respuesta `403 Forbidden` cuando un asistente intenta modificar eventos.

Resultado:

`3 pruebas aprobadas`.

## Prueba de BullMQ

Se verificó el flujo completo:

1. Un usuario autenticado registra un recordatorio.
2. La API responde con `202 Accepted`.
3. El recordatorio se guarda como `PENDIENTE`.
4. El trabajo se agrega a BullMQ.
5. El worker recibe y procesa el trabajo.
6. El registro termina con estado `COMPLETADO`.

Resultado:

`1 prueba aprobada`.

La salida del worker confirmó el procesamiento y la finalización del trabajo.

## Base de pruebas

Las pruebas utilizan exclusivamente:

`zamorafest_test`

Antes de ejecutar las pruebas de integración se realizan automáticamente:

1. Aplicación de migraciones pendientes.
2. Ejecución del seed.
3. Confirmación de la base de pruebas.
4. Limpieza controlada de los registros utilizados.

## Comandos de verificación

```text
npm run format:check
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm audit
git diff --check
```
