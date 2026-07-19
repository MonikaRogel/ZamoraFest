# Hoja de ruta de ZamoraFest

## Propósito

Esta hoja de ruta establece el orden de construcción de ZamoraFest hasta completar los requerimientos académicos de la Semana 8.

El orden busca garantizar que las optimizaciones se apliquen sobre un backend real, probado y medible.

## Estados de una etapa

Cada etapa podrá encontrarse en uno de los siguientes estados:

- Pendiente: todavía no ha comenzado.
- En especificación: se están preparando `spec.md`, `plan.md` y `tasks.md`.
- En implementación: las especificaciones fueron aprobadas y se está desarrollando el código.
- En revisión: el código y las pruebas están siendo inspeccionados.
- Completada: los cambios fueron aprobados e integrados en `main`.

## Etapa 0: preparación del entorno

**Estado:** completada.

Actividades realizadas:

- Verificación de Node.js y npm.
- Verificación de Git y Visual Studio Code.
- Verificación de PostgreSQL y `psql`.
- Verificación de Docker Desktop.
- Instalación de extensiones de desarrollo.
- Creación del repositorio público `MonikaRogel/ZamoraFest`.
- Clonación del repositorio.
- Creación del commit inicial en `main`.

El commit inicial contiene únicamente:

- `README.md`.
- `.gitignore`.
- `.gitattributes`.

## Etapa 1: constitución técnica

**Rama:** `docs/constitution`  
**Estado:** en elaboración.

Documentos previstos:

- `spec/README.md`.
- `spec/constitution/mission.md`.
- `spec/constitution/tech-stack.md`.
- `spec/constitution/roadmap.md`.
- `docs/evidencias/semana-08/README.md`.
- `docs/evidencias/semana-08/metricas.md`.
- `docs/evidencias/semana-08/pruebas.md`.
- `docs/evidencias/semana-08/uso-ia.md`.

Criterios de finalización:

1. La misión y el alcance están claramente delimitados.
2. El stack tecnológico coincide con las decisiones académicas aprobadas.
3. La hoja de ruta define un orden verificable.
4. Los documentos de evidencias no contienen resultados inventados.
5. La rama se revisa mediante un pull request antes de integrarse en `main`.

Commit previsto:

```text
docs: definir constitución técnica de ZamoraFest