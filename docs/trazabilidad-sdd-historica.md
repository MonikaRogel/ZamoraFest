# Trazabilidad histórica del desarrollo SDD

## Propósito

Este documento registra inconsistencias históricas detectadas durante una auditoría posterior del repositorio ZamoraFest. Su objetivo es conservar una trazabilidad verificable sin reescribir el historial de Git ni presentar como originales documentos creados retrospectivamente.

Las correcciones documentales posteriores no modifican los commits históricos. Los commits y pull requests originales permanecen como fuente primaria para comprobar qué ocurrió en cada etapa.

## Funcionalidad 002 — Gestión de eventos

La rama `feat/002-gestion-eventos` originó el Pull Request #4. Este pull request permaneció abierto y no fue fusionado en `main`.

Por esta razón, la tarea T030 de `spec/features/002-gestion-eventos/tasks.md`, correspondiente a revisar y fusionar esa rama, se conserva sin marcar. No se modifica retrospectivamente porque hacerlo alteraría la representación del proceso realmente seguido.

La funcionalidad de gestión de eventos sí evolucionó posteriormente y el estado vigente de `main` contiene una implementación más amplia que incorpora autenticación, autorización, revisión, publicación y otras extensiones del dominio.

El Pull Request #4 debe considerarse una propuesta histórica reemplazada por la evolución posterior del proyecto y no debe fusionarse sobre el estado vigente.

## Funcionalidad 003 — Autenticación y roles

El commit histórico `b9af830` creó la documentación inicial de `003-autenticacion-roles`. Durante la auditoría se comprobó que `plan.md` y `tasks.md` fueron creados vacíos y que el contenido con formato de tareas quedó almacenado en `spec.md`.

Esta inconsistencia pertenece al historial original y no se oculta ni se reescribe. La implementación posterior de autenticación y autorización fue incorporada mediante el Pull Request #5.

Durante esta auditoría se incorporaron documentos retrospectivos en `plan.md` y `tasks.md`, identificados expresamente como reconstrucciones posteriores basadas en commits, código, pruebas y el Pull Request #5.

Una reconstrucción retrospectiva no debe interpretarse como evidencia de que esos documentos existieron correctamente antes de la implementación.

## Funcionalidad 009 — Entorno móvil

La rama `feat/009-entorno-movil` está completamente contenida en el historial vigente de `main`: no conserva commits exclusivos respecto de la rama principal.

La auditoría de GitHub confirmó que no existe un Pull Request asociado a `feat/009-entorno-movil`. Por tanto, no se crea un Pull Request retrospectivo ni se afirma que existió uno.

La trazabilidad de esta etapa se conserva mediante los commits de la rama, `spec/features/009-entorno-movil/`, las evidencias de Semana 9 y su presencia efectiva en `main`.

## Rama histórica docs/constitution

La rama local `docs/constitution` conserva dos commits históricos que ya no poseen una rama remota.

La auditoría comparó los ocho archivos afectados por esos commits contra `main`: tres permanecen idénticos y cinco poseen versiones posteriores. No se detectaron archivos faltantes.

Por esta razón, la eliminación futura de la referencia local `docs/constitution` no implica pérdida de contenido vigente del proyecto.

## Principio de conservación histórica

ZamoraFest no corrige inconsistencias históricas mediante rebase destructivo, force push o modificación de commits ya publicados.

Cuando se detecta una anomalía documental se conserva el historial y se añade una explicación posterior verificable. De esta manera se diferencia entre:

- lo que ocurrió originalmente;
- lo que fue implementado y comprobado posteriormente;
- y la documentación de normalización creada durante la auditoría.

Este criterio permite mantener integridad académica, reproducibilidad técnica y trazabilidad en Git.
