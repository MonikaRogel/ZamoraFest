# Evidencias de la Semana 8

## Propósito

Este directorio conservará las evidencias académicas relacionadas con la medición y optimización del backend de ZamoraFest durante la Semana 8.

Las evidencias deberán demostrar el funcionamiento real del sistema y permitir comparar su comportamiento antes y después de aplicar las optimizaciones.

## Regla principal

No se registrarán resultados, métricas ni conclusiones que no hayan sido obtenidos mediante una ejecución real y verificable del backend.

Los espacios pendientes se completarán cuando exista una versión funcional sobre la cual realizar mediciones.

## Optimizaciones que deberán evidenciarse

Las evidencias deberán cubrir, según corresponda:

- Medición inicial de endpoints.
- Aplicación de caché cache-aside con Redis.
- Configuración de TTL.
- Invalidación del caché.
- Prevención del problema N+1.
- Comparación entre carga diferida y anticipada.
- Estrategias de respuesta `basic` y `detailed`.
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

Registrará los comandos utilizados, los escenarios comprobados y los resultados de las pruebas automatizadas y manuales.

### `uso-ia.md`

Registrará de manera transparente cómo se utilizó inteligencia artificial durante el análisis, la documentación, la implementación y la revisión.

## Organización futura

Cuando exista evidencia real se incorporará la siguiente estructura:

```text
docs/evidencias/semana-08/
├── antes/
├── despues/
├── README.md
├── metricas.md
├── pruebas.md
└── uso-ia.md