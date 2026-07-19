# Especificaciones de ZamoraFest

Este directorio contiene la documentación de requisitos y decisiones técnicas que orientará el desarrollo de ZamoraFest mediante Spec-Driven Development (SDD).

## Propósito

El objetivo de las especificaciones es definir qué debe construirse, cómo se planificará y qué tareas deberán completarse antes de comenzar la implementación.

Las decisiones aprobadas en estos documentos deberán respetarse durante el desarrollo. La generación de código comenzará únicamente cuando la especificación, el plan y las tareas de una funcionalidad hayan sido revisados.

## Fuentes del proyecto

Las decisiones de ZamoraFest se fundamentan, en este orden, en:

1. Las actividades práctico-experimentales de la asignatura.
2. Los foros académicos relacionados con ZamoraFest.
3. Las tutorías y los encuentros con el docente.
4. El repositorio `canchago-main`, utilizado únicamente como referencia metodológica.

La arquitectura, el dominio y las tecnologías particulares de Canchago no se copiarán en ZamoraFest.

## Organización

La documentación se organizará de esta manera:

- `spec/constitution/mission.md`: misión y alcance.
- `spec/constitution/tech-stack.md`: tecnologías aprobadas.
- `spec/constitution/roadmap.md`: orden de desarrollo.
- `spec/features/NNN-nombre-funcionalidad/spec.md`: requisitos de una funcionalidad.
- `spec/features/NNN-nombre-funcionalidad/plan.md`: diseño técnico.
- `spec/features/NNN-nombre-funcionalidad/tasks.md`: tareas verificables.

La carpeta `features` se incorporará cuando comience la primera funcionalidad.

## Documentos de cada funcionalidad

- `spec.md`: describe requisitos, alcance y criterios de aceptación.
- `plan.md`: establece el diseño técnico y la estrategia de pruebas.
- `tasks.md`: divide la implementación en tareas pequeñas y verificables.

## Flujo de trabajo

Cada funcionalidad seguirá este orden:

1. Identificar el requisito académico.
2. Registrar la decisión técnica de ZamoraFest.
3. Aprobar `spec.md`.
4. Aprobar `plan.md`.
5. Aprobar `tasks.md`.
6. Crear una rama desde `main` actualizado.
7. Implementar únicamente el alcance aprobado.
8. Ejecutar las pruebas.
9. Revisar el código y las evidencias.
10. Realizar el commit y abrir un pull request.

Después del commit inicial no se incorporarán cambios directamente en `main`.