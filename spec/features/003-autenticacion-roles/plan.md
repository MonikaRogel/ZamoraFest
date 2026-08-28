# Plan retrospectivo: autenticación y roles (003)

> [!IMPORTANT]
> Este documento fue reconstruido durante una auditoría posterior del repositorio. El `plan.md` original fue creado vacío en el commit `b9af830`. Por tanto, este archivo no constituye evidencia de un plan aprobado antes de la implementación.

## Base de evidencia

- Commit documental original: `b9af830`.
- Commit principal de implementación: `845c511`.
- Pull Request histórico: #5.
- Merge del Pull Request #5: `f373fd4`.
- Código, migración, pruebas y configuración incluidos en ese pull request.

## Objetivo histórico reconstruido

Implementar autenticación y autorización para el backend de ZamoraFest, incorporando registro, inicio de sesión, renovación de sesión mediante refresh token y control de acceso a operaciones protegidas.

## Alcance histórico verificado

- Registro e inicio de sesión.
- Contraseñas protegidas mediante bcrypt.
- Access tokens JWT con vigencia de 15 minutos.
- Refresh tokens con vigencia de 7 días.
- Almacenamiento del hash de los refresh tokens.
- Rotación y revocación durante la renovación.
- Roles `ASISTENTE` y `ADMIN` en el alcance de esa etapa.
- Consultas públicas de eventos.
- Escritura de eventos protegida para `ADMIN`.
- Validación del access token sin consulta redundante a la base de datos.

## Secuencia técnica reconstruida

1. Incorporar `bcryptjs` y `jose` y configurar las variables JWT de ejemplo.
2. Extender el modelo Prisma con usuarios, roles y refresh tokens y aplicar la migración correspondiente.
3. Crear esquemas de validación, servicio, controlador y rutas de autenticación.
4. Implementar `register`, `login` y `refresh`.
5. Implementar middleware de autenticación y autorización por rol.
6. Proteger las operaciones de escritura de eventos y conservar públicas las consultas.
7. Ejecutar pruebas de integración y verificaciones de calidad.
8. Publicar y revisar la funcionalidad mediante Pull Request.

## Validaciones históricas registradas

- 17 pruebas de integración aprobadas.
- Prueba del endpoint de salud aprobada.
- Hash de contraseñas verificado.
- Login y renovación de tokens verificados.
- Reutilización de refresh token rechazada.
- Respuestas `401 Unauthorized` y `403 Forbidden` verificadas.
- TypeScript, ESLint, Prettier y build correctos.
- Ausencia de credenciales y archivos `.env` versionados.

## Límites de esta reconstrucción

Este documento describe únicamente lo que puede comprobarse mediante el historial del repositorio y el Pull Request #5.

No se afirma que esta estructura existiera antes de la implementación. Tampoco sustituye las decisiones posteriores del proyecto: el estado vigente debe interpretarse junto con las funcionalidades y realineaciones posteriores.

La explicación completa de esta anomalía se conserva en `docs/trazabilidad-sdd-historica.md`.
