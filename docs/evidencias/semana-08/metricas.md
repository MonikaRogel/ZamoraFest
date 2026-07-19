# Métricas de optimización — Semana 8

## Estado

**Pendiente de medición.**

Este documento se completará cuando exista un backend funcional y un conjunto de datos controlado.

No se incluirán valores estimados ni inventados.

## Objetivo

Comparar el comportamiento del backend antes y después de aplicar las optimizaciones de la Semana 8 bajo condiciones equivalentes y reproducibles.

## Identificación de las mediciones

### Medición inicial

- Fecha y hora: pendiente.
- Rama: pendiente.
- Commit: pendiente.
- Responsable: pendiente.
- Estado del caché: no implementado o desactivado.
- Evidencia relacionada: pendiente.

### Medición final

- Fecha y hora: pendiente.
- Rama: pendiente.
- Commit: pendiente.
- Responsable: pendiente.
- Estado del caché: especificar `miss`, `hit` o invalidado.
- Evidencia relacionada: pendiente.

## Entorno de ejecución

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

Estos datos deberán registrarse nuevamente cuando se realicen las mediciones.

## Conjunto de datos

| Condición | Valor |
|---|---|
| Total de eventos | Pendiente |
| Eventos publicados | Pendiente |
| Categorías | Pendiente |
| Lugares | Pendiente |
| Usuarios | Pendiente |
| Recordatorios | Pendiente |
| Origen de los datos | Pendiente |
| Procedimiento de carga | Pendiente |

El mismo conjunto de datos deberá utilizarse antes y después.

## Metodología general

Para cada endpoint evaluado se registrará:

1. URL y método HTTP.
2. Parámetros y filtros.
3. Cantidad de solicitudes.
4. Nivel de concurrencia.
5. Estado inicial del caché.
6. Tiempo de calentamiento, si corresponde.
7. Tiempo de respuesta.
8. Cantidad de consultas a PostgreSQL.
9. Tamaño de la respuesta JSON.
10. Código HTTP obtenido.
11. Herramienta y comando exactos.
12. Commit evaluado.

## Endpoint principal

- Método: `GET`.
- Ruta prevista: `/api/v1/eventos`.
- Parámetros: pendiente.
- Filtros: pendiente.
- Página: pendiente.
- Límite: pendiente.
- Solicitudes: pendiente.
- Concurrencia: pendiente.
- Comando utilizado: pendiente.

## Comparación general

| Métrica | Antes | Después | Variación | Observación |
|---|---:|---:|---:|---|
| Tiempo promedio | Pendiente | Pendiente | Pendiente | Pendiente |
| Tiempo mínimo | Pendiente | Pendiente | Pendiente | Pendiente |
| Tiempo máximo | Pendiente | Pendiente | Pendiente | Pendiente |
| Percentil 95 | Pendiente | Pendiente | Pendiente | Pendiente |
| Consultas a PostgreSQL | Pendiente | Pendiente | Pendiente | Pendiente |
| Tamaño del JSON | Pendiente | Pendiente | Pendiente | Pendiente |
| Solicitudes exitosas | Pendiente | Pendiente | Pendiente | Pendiente |
| Solicitudes fallidas | Pendiente | Pendiente | Pendiente | Pendiente |

## Caché Redis

### Cache miss

- Clave utilizada: pendiente.
- TTL configurado: pendiente.
- Consultas a PostgreSQL: pendiente.
- Tiempo de respuesta: pendiente.
- Tamaño de respuesta: pendiente.
- Evidencia: pendiente.

### Cache hit

- Clave utilizada: pendiente.
- TTL restante: pendiente.
- Consultas a PostgreSQL: pendiente.
- Tiempo de respuesta: pendiente.
- Tamaño de respuesta: pendiente.
- Evidencia: pendiente.

### Invalidación

| Operación | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|
| Crear evento | Invalidar listados relacionados | Pendiente | Pendiente |
| Publicar evento | Invalidar listados relacionados | Pendiente | Pendiente |
| Actualizar evento | Invalidar detalle y listados | Pendiente | Pendiente |
| Eliminar evento | Invalidar detalle y listados | Pendiente | Pendiente |

## Prevención de N+1

La cantidad de consultas deberá mantenerse estable al incrementar el tamaño de página.

| Tamaño de página | Consultas antes | Consultas después |
|---:|---:|---:|
| 1 | Pendiente | Pendiente |
| 10 | Pendiente | Pendiente |
| 50 | Pendiente | Pendiente |

El resultado esperado después de optimizar es `Q(1) = Q(10) = Q(50)`.

Esto representa una cantidad estable de consultas y no exige que todo se resuelva mediante una única consulta SQL.

## Estrategias `basic` y `detailed`

Rutas previstas:

- `GET /api/v1/eventos/{id}?detailLevel=basic`.
- `GET /api/v1/eventos/{id}?detailLevel=detailed`.

| Métrica | Basic | Detailed | Observación |
|---|---:|---:|---|
| Tiempo de respuesta | Pendiente | Pendiente | Pendiente |
| Consultas a PostgreSQL | Pendiente | Pendiente | Pendiente |
| Tamaño del JSON | Pendiente | Pendiente | Pendiente |
| Relaciones recuperadas | Pendiente | Pendiente | Pendiente |

La comparación deberá demostrar que `basic` evita recuperar y enviar información que no necesita.

## Autenticación

| Escenario | Consultas antes | Consultas después | Resultado |
|---|---:|---:|---|
| Access token válido | Pendiente | Pendiente | Pendiente |
| Access token inválido | Pendiente | Pendiente | Pendiente |
| Rol autorizado | Pendiente | Pendiente | Pendiente |
| Rol no autorizado | Pendiente | Pendiente | Pendiente |
| Renovación de token | Pendiente | Pendiente | Pendiente |

## Paginación y selección de campos

| Escenario | Límite | Tamaño JSON | Tiempo |
|---|---:|---:|---:|
| Listado básico | Pendiente | Pendiente | Pendiente |
| Listado con filtros | Pendiente | Pendiente | Pendiente |
| Detalle básico | 1 recurso | Pendiente | Pendiente |
| Detalle ampliado | 1 recurso | Pendiente | Pendiente |

## Cola y worker

| Métrica | Resultado |
|---|---|
| Tiempo de respuesta del endpoint | Pendiente |
| Identificador del trabajo | Pendiente |
| Estado inicial | Pendiente |
| Tiempo hasta el procesamiento | Pendiente |
| Estado final | Pendiente |
| Cantidad de intentos | Pendiente |
| Resultado ante error controlado | Pendiente |
| Evidencia del worker | Pendiente |

El procesamiento del worker no deberá bloquear la respuesta HTTP que registra el recordatorio.

## Fórmulas de comparación

Reducción porcentual del tiempo:

`((tiempo_antes - tiempo_despues) / tiempo_antes) × 100`

Reducción porcentual de consultas:

`((consultas_antes - consultas_despues) / consultas_antes) × 100`

Reducción porcentual del tamaño JSON:

`((tamaño_antes - tamaño_despues) / tamaño_antes) × 100`

Un resultado negativo indicará que la métrica aumentó y deberá analizarse sin ocultarlo.

## Resultados y conclusiones

Esta sección se completará después de obtener mediciones reales.

- Optimización con mayor impacto: pendiente.
- Optimización con menor impacto: pendiente.
- Costos o compromisos identificados: pendiente.
- Limitaciones: pendiente.
- Conclusión técnica: pendiente.

## Reproducibilidad

Para cada resultado deberán conservarse:

- Comando ejecutado.
- Configuración relevante.
- Commit evaluado.
- Datos utilizados.
- Captura o salida correspondiente.
- Explicación del resultado.