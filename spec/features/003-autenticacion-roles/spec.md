# Tareas: autenticación y roles (003)

## Metadatos

- **Rama:** `feat/003-autenticacion-roles`
- **Estado:** aprobadas
- **Fecha de aprobación:** 2026-07-19

## Documentación y dependencias

- [x] **T001** Aprobar especificación y plan.
- [x] **T002** Instalar `bcryptjs` y `jose`.
- [ ] **T003** Configurar variables JWT de ejemplo.

## Base de datos

- [ ] **T004** Añadir `RolUsuario`, `Usuario` y `RefreshToken`.
- [ ] **T005** Crear y aplicar la migración.
- [ ] **T006** Generar Prisma Client.

## Autenticación

- [ ] **T007** Crear esquemas Zod.
- [ ] **T008** Implementar registro.
- [ ] **T009** Implementar login.
- [ ] **T010** Implementar emisión y rotación de tokens.
- [ ] **T011** Crear controladores y rutas.

## Autorización

- [ ] **T012** Crear middleware de autenticación sin consulta redundante.
- [ ] **T013** Crear autorización por rol.
- [ ] **T014** Proteger escritura de eventos.
- [ ] **T015** Mantener consultas públicas.

## Pruebas y cierre

- [ ] **T016** Probar registro y hash.
- [ ] **T017** Probar login y refresh.
- [ ] **T018** Probar respuestas `401` y `403`.
- [ ] **T019** Probar acceso de administrador.
- [ ] **T020** Ejecutar verificaciones de calidad.
- [ ] **T021** Confirmar ausencia de secretos.
- [ ] **T022** Crear commits descriptivos.
- [ ] **T023** Publicar pull request.
- [ ] **T024** Revisar y fusionar en `main`.
