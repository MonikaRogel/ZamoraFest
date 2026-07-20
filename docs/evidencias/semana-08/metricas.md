# Métricas de optimización — Semana 8

## Estado

**Medición completada el 20 de julio de 2026.**

Los valores presentados fueron obtenidos mediante una ejecución real del backend de ZamoraFest en el entorno local.

## Objetivo

Comparar el tiempo de respuesta del listado público de eventos antes y después de aplicar caché Redis mediante la estrategia cache-aside.

## Entorno de ejecución

| Elemento                | Valor                             |
| ----------------------- | --------------------------------- |
| Sistema operativo       | Windows                           |
| Node.js                 | 24.14.0                           |
| npm                     | 11.9.0                            |
| PostgreSQL              | 18.1                              |
| Prisma                  | 7.8.0                             |
| Docker                  | 29.5.3                            |
| Redis                   | 7.4 Alpine                        |
| BullMQ                  | 5.80.9                            |
| Herramienta de medición | Script TypeScript con Supertest   |
| Rama                    | `feat/004-optimizacion-semana-08` |

## Conjunto de datos

| Condición          | Valor                             |
| ------------------ | --------------------------------- |
| Eventos publicados | 12                                |
| Categorías activas | 3                                 |
| Lugares activos    | 1                                 |
| Origen             | Datos controlados de demostración |
| Preparación        | `npm run demo:prepare`            |

El script de preparación es idempotente, por lo que puede ejecutarse nuevamente sin duplicar los eventos de demostración.

## Operación evaluada

- Método: `GET`.
- Ruta: `/api/v1/eventos`.
- Página: `1`.
- Límite: `50`.
- Primera solicitud: caché invalidado, resultado `MISS`.
- Solicitudes posteriores: 10 solicitudes con resultado `HIT`.
- Concurrencia: secuencial.
- Comando utilizado: `npm run measure:cache`.

## Resultados

| Escenario                   | Estado de caché |    Tiempo |
| --------------------------- | --------------- | --------: |
| Antes: consulta sin caché   | `MISS`          | 488,30 ms |
| Después: promedio con caché | `HIT`           |   9,26 ms |
| Reducción aproximada        | —               |   98,10 % |

La reducción fue calculada con la fórmula:

`((488,30 - 9,26) / 488,30) × 100 = 98,10 %`

## Implementación del caché

Se utilizó la estrategia cache-aside:

1. El servicio busca primero la respuesta en Redis.
2. Si la clave existe, devuelve la información desde Redis y responde con `X-Cache: HIT`.
3. Si la clave no existe, consulta PostgreSQL, guarda el resultado en Redis y responde con `X-Cache: MISS`.
4. Las entradas tienen un TTL de 60 segundos.
5. Las claves incluyen una versión para permitir invalidación explícita.

Ejemplos de claves:

- `eventos:v1:list:1:50`
- `eventos:v1:detail:{id}`
- `eventos:version`

## Invalidación

| Operación         | Acción realizada                    | Verificación               |
| ----------------- | ----------------------------------- | -------------------------- |
| Crear evento      | Incrementar la versión del caché    | Implementada               |
| Actualizar evento | Incrementar la versión del caché    | Verificada mediante prueba |
| Publicar evento   | Invalidación mediante actualización | Implementada               |
| Eliminar evento   | Incrementar la versión del caché    | Implementada               |

La prueba de integración confirmó la secuencia:

`MISS → HIT → actualización → MISS`

Esto demuestra que una modificación no deja respuestas antiguas disponibles desde el caché.

## Prevención de N+1 y carga de relaciones

El listado de eventos recupera mediante una selección anidada los datos necesarios de:

- Lugar.
- Cantón.
- Categorías asociadas.

La consulta se encuentra centralizada en el repositorio y no ejecuta una consulta individual dentro de un ciclo por cada evento.

De esta forma, el número de operaciones no crece linealmente con cada evento retornado y se evita el patrón N+1.

Se eligió eager loading mediante `select` porque el listado público necesita mostrar esas relaciones en la misma respuesta. Además, únicamente se seleccionan los campos requeridos, evitando recuperar columnas innecesarias.

## Autenticación optimizada

La validación del access token se realiza localmente mediante la firma JWT.

El token contiene:

- Identificador del usuario.
- Correo electrónico.
- Rol.

Por tanto, las solicitudes protegidas no consultan nuevamente la tabla de usuarios en cada petición únicamente para validar la identidad y el rol.

La base de datos se consulta durante operaciones que realmente lo requieren, como el inicio de sesión y la renovación del refresh token.

## Cola y worker

La creación de recordatorios responde con código HTTP `202 Accepted` y estado inicial `PENDIENTE`.

El procesamiento se realiza de manera asíncrona mediante:

- BullMQ.
- Redis.
- Worker de recordatorios.

La prueba de integración verificó la transición:

`PENDIENTE → PROCESANDO → COMPLETADO`

El procesamiento del worker no bloquea la respuesta HTTP que registra el recordatorio.

## Evidencia automatizada

Las pruebas de integración verifican:

- Caché `MISS` y `HIT`.
- Invalidación después de actualizar.
- Autenticación JWT.
- Respuestas `401 Unauthorized`.
- Respuestas `403 Forbidden`.
- Creación y procesamiento asíncrono de recordatorios.
- Estado final `COMPLETADO`.
- Restricciones del modelo relacional.
- CRUD de eventos.

## Limitaciones

- La medición se realizó en un entorno local y no representa un servidor de producción.
- El primer tiempo incluye el acceso a PostgreSQL y el almacenamiento inicial en Redis.
- El resultado puede variar dependiendo del equipo y de la carga del sistema.
- No se realizó una prueba de carga concurrente porque el objetivo fue comparar el mismo endpoint en condiciones controladas.

## Conclusión

La optimización con mayor impacto fue el caché Redis aplicado al listado de eventos.

El tiempo observado disminuyó de 488,30 ms a un promedio de 9,26 ms, equivalente a una reducción aproximada del 98,10 %.

Además, el backend evita el riesgo de N+1 mediante selección anidada de relaciones, valida los access tokens sin consultas redundantes y procesa recordatorios de manera asíncrona mediante BullMQ.
