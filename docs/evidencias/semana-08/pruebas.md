# Métricas de optimización — Semana 8

## Estado del documento

**Estado:** pendiente de medición.

Este documento se completará cuando el backend base de ZamoraFest esté funcionando y exista un conjunto de datos controlado.

No se incluirán valores estimados o inventados.

## Objetivo

Comparar el comportamiento del backend antes y después de aplicar las optimizaciones de la Semana 8 bajo condiciones equivalentes y reproducibles.

## Identificación de las mediciones

### Medición inicial

- Fecha y hora: pendiente.
- Rama: pendiente.
- Commit: pendiente.
- Responsable: pendiente.
- Estado del caché: no implementado o desactivado.
- Archivo de evidencia relacionado: pendiente.

### Medición final

- Fecha y hora: pendiente.
- Rama: pendiente.
- Commit: pendiente.
- Responsable: pendiente.
- Estado del caché: especificar `miss`, `hit` o invalidado.
- Archivo de evidencia relacionado: pendiente.

## Entorno de ejecución

Los siguientes datos deberán registrarse nuevamente en el momento de la medición:

| Elemento | Valor |
|---|---|
| Sistema operativo | Pendiente |
| Procesador | Pendiente |
| Memoria RAM disponible | Pendiente |
| Node.js | Pendiente |
| npm | Pendiente |
| PostgreSQL | Pendiente |
| Prisma | Pendiente |
| Docker Desktop | Pendiente |
| Redis | Pendiente |
| BullMQ | Pendiente |
| Herramienta de medición | Pendiente |

## Conjunto de datos

| Condición | Valor |
|---|---|
| Cantidad total de eventos | Pendiente |
| Cantidad de eventos publicados | Pendiente |
| Cantidad de categorías | Pendiente |
| Cantidad de lugares | Pendiente |
| Cantidad de usuarios | Pendiente |
| Cantidad de recordatorios | Pendiente |
| Origen de los datos | Pendiente |
| Procedimiento de carga | Pendiente |

El mismo conjunto de datos deberá utilizarse en las mediciones antes y después.

## Metodología general

Para cada endpoint evaluado se deberá registrar:

1. URL y método HTTP.
2. Parámetros y filtros.
3. Cantidad de solicitudes.
4. Nivel de concurrencia, si se utiliza.
5. Estado inicial del caché.
6. Tiempo de calentamiento, si corresponde.
7. Tiempo de respuesta.
8. Cantidad de consultas a PostgreSQL.
9. Tamaño de la respuesta JSON.
10. Código HTTP obtenido.
11. Herramienta y comando exactos.
12. Commit del código evaluado.

## Endpoint principal de medición

- Método: `GET`.
- Ruta prevista: `/api/v1/eventos`.
- Parámetros: pendiente.
- Filtros: pendiente.
- Página: pendiente.
- Límite: pendiente.
- Cantidad de solicitudes: pendiente.
- Concurrencia: pendiente.
- Comando utilizado: pendiente.

## Comparación general

| Métrica | Antes | Después | Variación | Observación |
|---|---:|---:|---:|---|
| Tiempo promedio de respuesta | Pendiente | Pendiente | Pendiente | Pendiente |
| Tiempo mínimo | Pendiente | Pendiente | Pendiente | Pendiente |
| Tiempo máximo | Pendiente | Pendiente | Pendiente | Pendiente |
| Percentil 95 | Pendiente | Pendiente | Pendiente | Pendiente |
| Consultas a PostgreSQL | Pendiente | Pendiente | Pendiente | Pendiente |
| Tamaño del JSON | Pendiente | Pendiente | Pendiente | Pendiente |
| Solicitudes exitosas | Pendiente | Pendiente | Pendiente | Pendiente |
| Solicitudes fallidas | Pendiente | Pendiente | Pendiente | Pendiente |

## Caché Redis

### Escenario sin caché o cache miss

- Clave utilizada: pendiente.
- TTL configurado: pendiente.
- Consultas a PostgreSQL: pendiente.
- Tiempo de respuesta: pendiente.
- Tamaño de respuesta: pendiente.
- Evidencia: pendiente.

### Escenario cache hit

- Clave utilizada: pendiente.
- TTL restante: pendiente.
- Consultas a PostgreSQL: pendiente.
- Tiempo de respuesta: pendiente.
- Tamaño de respuesta: pendiente.
- Evidencia: pendiente.

### Invalidación

Se comprobarán las siguientes operaciones:

| Operación | Clave o versión afectada | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|
| Crear evento | Pendiente | Invalidar listado relacionado | Pendiente | Pendiente |
| Publicar evento | Pendiente | Invalidar listado relacionado | Pendiente | Pendiente |
| Actualizar evento | Pendiente | Invalidar detalle y listados | Pendiente | Pendiente |
| Eliminar evento | Pendiente | Invalidar detalle y listados | Pendiente | Pendiente |

## Prevención de N+1

La cantidad de consultas deberá mantenerse estable al incrementar el tamaño de página.

| Tamaño de página | Consultas antes | Consultas después | Resultado |
|---:|---:|---:|---|
| 1 | Pendiente | Pendiente | Pendiente |
| 10 | Pendiente | Pendiente | Pendiente |
| 50 | Pendiente | Pendiente | Pendiente |

La comprobación esperada después de optimizar es:

```text
Q(1) = Q(10) = Q(50)