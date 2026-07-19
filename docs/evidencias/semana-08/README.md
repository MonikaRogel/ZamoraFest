# Evidencias de la Semana 8

## Propósito

Este directorio conservará las evidencias académicas relacionadas con la medición y optimización del backend de ZamoraFest durante la Semana 8.

Las evidencias deberán demostrar el funcionamiento real del sistema y permitir comparar su comportamiento antes y después de las optimizaciones.

## Regla principal

No se registrarán resultados, métricas ni conclusiones que no hayan sido obtenidos mediante una ejecución real y verificable del backend.

Los espacios pendientes se completarán cuando exista una versión funcional sobre la cual realizar mediciones.

## Optimizaciones que deberán evidenciarse

Las evidencias deberán cubrir:

- Medición inicial de endpoints.
- Aplicación de cache-aside con Redis.
- Configuración de TTL.
- Invalidación del caché.
- Prevención del problema N+1.
- Comparación entre carga diferida y anticipada.
- Estrategias `basic` y `detailed`.
- Procesamiento asíncrono con BullMQ.
- Ejecución del worker de recordatorios.
- Reducción de consultas redundantes de autenticación.
- Selección explícita de campos.
- Paginación.
- Reducción del tamaño de respuestas JSON.
- Medición final.
- Pruebas automatizadas.
- Uso documentado de inteligencia artificial.

## Archivos de control

### `metricas.md`

Registrará las condiciones de medición y la comparación cuantitativa antes y después de las optimizaciones.

### `pruebas.md`

Registrará los comandos, escenarios comprobados y resultados de las pruebas automatizadas y manuales.

### `uso-ia.md`

Registrará de manera transparente los apoyos materiales recibidos mediante inteligencia artificial.

## Organización futura

Cuando exista evidencia real, la carpeta `semana-08` contendrá:

- `antes`: capturas y resultados del backend sin optimizar.
- `despues`: capturas y resultados posteriores a las optimizaciones.
- `README.md`: criterios para conservar evidencias.
- `metricas.md`: comparación cuantitativa.
- `pruebas.md`: registro de verificaciones.
- `uso-ia.md`: registro de apoyo mediante IA.

Las carpetas `antes` y `despues` no se crearán ni llenarán artificialmente. Se añadirán cuando existan capturas, resultados o archivos reales.

## Condiciones de comparación

Las mediciones antes y después deberán realizarse utilizando:

- El mismo computador.
- El mismo endpoint.
- Los mismos parámetros y filtros.
- El mismo conjunto de datos.
- La misma cantidad de solicitudes.
- Condiciones equivalentes de caché.
- La misma herramienta de medición.

Si alguna condición cambia, deberá registrarse para evitar conclusiones incorrectas.

## Convención para evidencias

Los nombres deberán describir claramente su contenido y momento de obtención.

Ejemplos válidos:

- `antes/listado-eventos-sin-cache.png`.
- `antes/consultas-eventos-n-plus-one.txt`.
- `despues/listado-eventos-cache-hit.png`.
- `despues/consultas-eventos-optimizadas.txt`.
- `despues/worker-recordatorio-procesado.png`.

No deberán utilizarse nombres ambiguos como `captura1.png`, `nuevo.png` o `prueba-final.png`.

## Evidencias aceptables

Podrán conservarse:

- Capturas de terminal.
- Resultados de pruebas.
- Mediciones de tiempo.
- Registros controlados de consultas.
- Respuestas de endpoints.
- Capturas de Swagger.
- Evidencias de Redis.
- Evidencias de la cola y el worker.
- Tablas comparativas.
- Comandos reproducibles.

## Información que deberá ocultarse

Antes de incorporar una captura se comprobará que no muestre:

- Contraseñas.
- Secretos JWT.
- Refresh tokens.
- Access tokens completos.
- Cadenas de conexión reales.
- Tokens de GitHub.
- Datos personales innecesarios.
- Contenido del archivo `.env`.

Si una evidencia contiene información sensible, deberá repetirse ocultando o sustituyendo los valores.

## Trazabilidad

Cada evidencia deberá relacionarse con:

1. Un requisito académico.
2. Una especificación de ZamoraFest.
3. Una rama o commit.
4. Un comando o procedimiento reproducible.
5. Un resultado explicado en `metricas.md` o `pruebas.md`.

## Estado actual

La estructura documental está preparada, pero las mediciones y capturas permanecen pendientes hasta disponer de un backend funcional.

No existen todavía resultados válidos para comparar.