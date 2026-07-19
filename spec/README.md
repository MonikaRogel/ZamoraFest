# Especificaciones de ZamoraFest

Este directorio contiene la documentación de requisitos y decisiones técnicas que orientará el desarrollo de ZamoraFest mediante Spec-Driven Development (SDD).

## Propósito

El objetivo de las especificaciones es definir qué debe construirse, cómo se planificará y qué tareas deberán completarse antes de comenzar la implementación.

Codex y cualquier colaborador deberán respetar las decisiones aprobadas en estos documentos. La generación de código comenzará únicamente cuando la especificación, el plan y las tareas de una funcionalidad hayan sido revisados.

## Fuentes del proyecto

Las decisiones de ZamoraFest se fundamentan, en este orden, en:

1. Las actividades práctico-experimentales de la asignatura.
2. Los foros académicos relacionados con ZamoraFest.
3. Las tutorías y los encuentros con el docente.
4. El repositorio `canchago-main`, utilizado únicamente como referencia metodológica.

La arquitectura, el dominio y las tecnologías particulares de Canchago no se copiarán en ZamoraFest.

## Organización

```text
spec/
├── constitution/
│   ├── mission.md
│   ├── tech-stack.md
│   └── roadmap.md
└── features/
    └── NNN-nombre-funcionalidad/
        ├── spec.md
        ├── plan.md
        └── tasks.md