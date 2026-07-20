# Especificación: gestión de eventos (002)

## Metadatos

- **Rama:** `feat/002-gestion-eventos`
- **Estado:** aprobada
- **Fecha de aprobación:** 2026-07-19
- **Depende de:** `001-modelo-datos`
- **Objetivo académico:** CRUD de la entidad principal — Semana 6

## Objetivo

Implementar el CRUD REST de `Evento` con validaciones, paginación, eliminación lógica, respuestas JSON consistentes y manejo centralizado de errores.

## Alcance

Incluye:

- Crear un evento.
- Listar eventos publicados y activos con paginación.
- Consultar un evento publicado y activo.
- Actualizar parcialmente un evento.
- Eliminar lógicamente un evento.
- Asociar el evento con un lugar y una o varias categorías existentes.
- Pruebas automatizadas de los casos esenciales.

Los endpoints de escritura se protegerán posteriormente en `003-autenticacion-roles`.

## Endpoints

| Método   | Ruta                  | Resultado                     |
| -------- | --------------------- | ----------------------------- |
| `POST`   | `/api/v1/eventos`     | Crear evento                  |
| `GET`    | `/api/v1/eventos`     | Listar eventos publicados     |
| `GET`    | `/api/v1/eventos/:id` | Consultar un evento publicado |
| `PATCH`  | `/api/v1/eventos/:id` | Actualizar parcialmente       |
| `DELETE` | `/api/v1/eventos/:id` | Eliminar lógicamente          |

El listado acepta:

- `page`: entero mayor o igual a 1; valor inicial 1.
- `limit`: entero entre 1 y 50; valor inicial 10.

## Datos de entrada

La creación acepta:

- `titulo`: obligatorio, entre 3 y 200 caracteres.
- `descripcion`: obligatoria, mínimo 10 caracteres.
- `lugarId`: UUID de un lugar activo.
- `categoriaIds`: arreglo no vacío de UUID únicos de categorías activas.
- `estado`: `BORRADOR` o `PUBLICADO`; valor inicial `BORRADOR`.

La actualización acepta los mismos campos de forma opcional. Cuando se envíe `categoriaIds`, reemplazará las asociaciones activas del evento.

## Reglas de negocio

1. Un evento debe pertenecer a un lugar activo.
2. Un evento debe tener al menos una categoría activa.
3. Una categoría no puede repetirse dentro del mismo evento.
4. Todo evento nuevo nace como `BORRADOR` si no se indica otro estado.
5. Las consultas públicas solo devuelven eventos `PUBLICADO` y no eliminados.
6. El `DELETE` asigna `eliminadoEn`; no elimina físicamente el registro.
7. Un evento eliminado no puede consultarse ni actualizarse mediante estos endpoints.

## Respuestas

Éxito individual:

```json
{
  "data": {}
}
```

Listado:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Error:

```json
{
  "error": {
    "code": "CODIGO",
    "message": "Descripción comprensible"
  }
}
```

## Códigos HTTP

- `200`: consulta o actualización correcta.
- `204`: eliminación lógica correcta, sin cuerpo de respuesta.
- `201`: creación correcta.
- `400`: datos o parámetros inválidos.
- `404`: evento, lugar o categoría inexistente o inactiva.
- `409`: conflicto con una regla de negocio.
- `500`: error interno no controlado.

## Criterios de aceptación

1. Los cinco endpoints funcionan con los códigos HTTP definidos.
2. El listado devuelve únicamente eventos publicados y activos.
3. La paginación informa `page`, `limit`, `total` y `totalPages`.
4. Zod rechaza cuerpos, UUID y parámetros inválidos.
5. La creación y actualización de categorías se realizan mediante una transacción.
6. El borrado es lógico y el registro permanece en PostgreSQL.
7. Los errores utilizan el contrato JSON acordado.
8. Las pruebas cubren creación, listado, consulta, actualización, eliminación, validación y recurso inexistente.
9. TypeScript, ESLint, Prettier, build y pruebas terminan correctamente.

## Fuera de alcance

- Autenticación y roles.
- Swagger/OpenAPI.
- CRUD independiente de lugares, categorías, imágenes o programaciones.
- Redis, caché, BullMQ y optimizaciones de Semana 8.
- Aplicación móvil.
