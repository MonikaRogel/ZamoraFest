# Métricas de caché — T047

## Estado

Medición completada sobre el modelo canónico realineado con la propuesta de Semana 4.

La ejecución se realizó el **21 de agosto de 2026 a las 19:24:31, hora de Ecuador (UTC-05:00)**, correspondiente a `2026-08-22T00:24:31.155Z`.

## Objetivo

Repetir la medición del listado público de eventos después de la realineación del modelo de datos y verificar el comportamiento actual de Redis mediante la estrategia cache-aside.

La medición distingue explícitamente:

- una primera solicitud `MISS`;
- diez solicitudes posteriores `HIT`;
- tiempo promedio de los `HIT`;
- mínimo y máximo observados;
- reducción entre el `MISS` actual y el promedio `HIT` actual.

## Condiciones de ejecución

| Condición                  | Valor                                          |
| -------------------------- | ---------------------------------------------- |
| Rama                       | `fix/realineacion-modelo-semana4`              |
| Commit base                | `e05aefe300fdeff5c127d16d64b46d8bf011e56a`     |
| Plataforma                 | Windows (`win32`)                              |
| Node.js                    | `v24.14.0`                                     |
| Endpoint                   | `/api/v1/eventos?page=1&limit=50`              |
| Método                     | `GET`                                          |
| Página                     | `1`                                            |
| Límite                     | `50`                                           |
| Estrategia de carga        | `basic`                                        |
| Concurrencia               | Secuencial                                     |
| Primera solicitud          | Caché invalidada, resultado obligatorio `MISS` |
| Solicitudes posteriores    | 10 resultados obligatorios `HIT`               |
| Eventos públicos devueltos | 12                                             |
| Fuente primaria            | PostgreSQL                                     |
| Caché                      | Redis                                          |
| Estrategia                 | cache-aside                                    |
| TTL del caché              | 60 segundos                                    |

El instrumento utilizado fue `backend/scripts/measure-cache.ts`, ejecutado mediante:

`npm run measure:cache`

La prueba también verificó que el total de eventos públicos permaneciera estable durante las once solicitudes.

## Resultado actual

Los diez tiempos `HIT` individuales fueron:

`11,28; 7,94; 9,85; 9,29; 9,49; 9,42; 8,32; 9,97; 8,48; 7,28 ms`

| Escenario                                       | Estado |    Tiempo |
| ----------------------------------------------- | ------ | --------: |
| Consulta actual sin entrada disponible en caché | `MISS` | 831,74 ms |
| Caché actual, promedio de 10 solicitudes        | `HIT`  |   9,13 ms |
| Caché actual, mínimo observado                  | `HIT`  |   7,28 ms |
| Caché actual, máximo observado                  | `HIT`  |  11,28 ms |
| Reducción observada MISS → HIT promedio         | —      |   98,90 % |

El promedio exacto de los diez `HIT` fue aproximadamente `9,132 ms`.

La reducción se obtiene de forma aproximada mediante:

`((831,74 - 9,132) / 831,74) × 100 = 98,90 %`

## Comparación con la evidencia histórica de Semana 8

La evidencia específica de métricas de Semana 8 registró:

| Escenario histórico |    Tiempo |
| ------------------- | --------: |
| `MISS`              | 488,30 ms |
| `HIT` promedio      |   9,26 ms |
| Reducción observada |   98,10 % |

La diferencia descriptiva entre ambas ejecuciones es:

- `MISS`: de 488,30 ms a 831,74 ms, una diferencia de **+343,44 ms**.
- `HIT` promedio: de 9,26 ms a 9,13 ms, una diferencia aproximada de **-0,13 ms**.
- reducción relativa interna: de 98,10 % a 98,90 %.

Estos valores **no deben interpretarse como una comparación experimental equivalente**.

La medición histórica corresponde al backend y modelo anteriores a la realineación. La medición T047 corresponde al modelo canónico actual, con nuevas entidades, relaciones, reglas de publicación, identificadores enteros, jerarquía territorial y selección de campos adaptada.

Por ello, la diferencia del tiempo `MISS` no demuestra por sí sola una regresión causada por un componente concreto. Para realizar una comparación causal serían necesarias condiciones completamente equivalentes de esquema, datos, estado de procesos, calentamiento de PostgreSQL, Redis, sistema operativo y carga del equipo.

Lo que sí puede afirmarse a partir de esta ejecución es que, dentro del modelo actual, el `HIT` de Redis permanece muy por debajo del `MISS` y el cache-aside continúa proporcionando una reducción observada cercana al 99 %.

## Discrepancia en la línea base histórica

Existe una diferencia documental entre dos registros anteriores:

- `docs/evidencias/semana-08/metricas.md` registra **488,30 ms MISS, 9,26 ms HIT y 98,10 %**.
- la especificación de realineación resume otra ejecución histórica aproximada como **498,31 ms MISS, 8,86 ms HIT y 98,22 %**.

T047 no elimina ni reemplaza ninguna de las dos referencias.

Para la tabla comparativa anterior se utiliza `docs/evidencias/semana-08/metricas.md` porque contiene las condiciones y resultados explícitos de aquella ejecución. La discrepancia se conserva documentada para mantener trazabilidad y evitar presentar valores históricos distintos como si pertenecieran a una misma corrida.

## Observación técnica

Durante la ejecución actual apareció una advertencia de `pg`:

`Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.`

La advertencia no detuvo la medición, no cambió los estados `MISS/HIT` y el proceso terminó correctamente.

No obstante, debe conservarse como observación técnica para una revisión posterior del flujo concurrente de consultas antes de actualizar a `pg@9`.

## Conclusión

T047 confirma en el modelo realineado que:

1. la primera solicitud posterior a la invalidación produce `MISS`;
2. las diez solicitudes siguientes producen `HIT`;
3. el conjunto público permaneció estable en 12 eventos;
4. el `MISS` medido fue 831,74 ms;
5. el promedio `HIT` fue 9,13 ms;
6. la reducción interna observada fue 98,90 %;
7. Redis mantiene un impacto significativo sobre el tiempo de respuesta del listado público;
8. la comparación con Semana 8 se conserva únicamente como referencia histórica y no como experimento equivalente.
