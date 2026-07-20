# Plan técnico: gestión de eventos (002)

## Metadatos

- **Rama:** `feat/002-gestion-eventos`
- **Estado:** aprobado
- **Fecha de aprobación:** 2026-07-19
- **Especificación:** `spec/features/002-gestion-eventos/spec.md`

## Objetivo

Implementar el CRUD REST de eventos solicitado para la Semana 6, utilizando Express, Zod, Prisma y PostgreSQL sin añadir dependencias nuevas.

## Componentes

La implementación utiliza:

1. Esquemas Zod para validar datos y parámetros.
2. Repositorio para acceder a PostgreSQL mediante Prisma.
3. Servicio para aplicar las reglas de negocio.
4. Controladores para generar las respuestas HTTP.
5. Rutas para exponer los endpoints.
6. Manejador centralizado de errores.
7. Pruebas de integración sobre `zamorafest_test`.

## Archivos principales

```text
backend/src/
├── common/errors/app-error.ts
├── middleware/error-handler.ts
└── modules/eventos/
    ├── evento.controller.ts
    ├── evento.repository.ts
    ├── evento.routes.ts
    ├── evento.schemas.ts
    └── evento.service.ts
```
