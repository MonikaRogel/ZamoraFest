# Tareas: modelo de datos y backend inicial (001)

## Metadatos

- **Rama:** `feat/001-modelo-datos`
- **Estado:** aprobadas.
- **Fecha de aprobación:** 2026-07-19.
- **Especificación:** `spec/features/001-modelo-datos/spec.md`
- **Plan:** `spec/features/001-modelo-datos/plan.md`
- **Fecha de elaboración:** 2026-07-19

## Objetivo

Convertir la especificación y el plan de la funcionalidad 001 en pasos pequeños, ordenados y comprobables. La funcionalidad finalizará con un backend mínimo ejecutable, una migración reproducible, datos iniciales controlados y pruebas de las restricciones del modelo.

## Reglas de ejecución

1. No comenzar la implementación hasta que `spec.md`, `plan.md` y este archivo estén aprobados.
2. Ejecutar las tareas en el orden indicado, salvo las marcadas expresamente como paralelas.
3. Marcar una tarea con `[x]` únicamente después de comprobar su resultado.
4. No incluir trabajo de las funcionalidades 002 a 007.
5. No copiar ni publicar contraseñas, URLs reales de conexión o archivos `.env`.
6. Versionar `package-lock.json` y `prisma/migrations/`.
7. No versionar `node_modules/`, archivos `.env` ni el cliente generado de Prisma.
8. Detenerse y revisar si una tarea exige cambiar el alcance o contradecir la constitución.

## Dependencias entre fases

```text
Fase 0: aprobación documental
    ↓
Fase 1: inicialización del backend
    ↓
Fase 2: configuración y salud HTTP
    ↓
Fase 3: bases PostgreSQL aisladas
    ↓
Fase 4: Prisma y modelo relacional
    ↓
Fase 5: migración, restricciones y seed
    ↓
Fase 6: pruebas de integración
    ↓
Fase 7: verificación, evidencia y pull request
```

## Fase 0 — Aprobación documental

### Revisión de coherencia

- [x] **T001** Confirmar que la rama actual sea `feat/001-modelo-datos`.
- [x] **T002** Revisar que `spec.md` contenga únicamente las siete entidades aprobadas.
- [x] **T003** Confirmar que `spec.md` incluya eliminación lógica mediante `eliminadoEn`.
- [x] **T004** Confirmar que `plan.md` responda las veinte preguntas abiertas de la especificación.
- [x] **T005** Verificar que ni la especificación ni el plan incorporen CRUD, autenticación, Swagger, Redis, BullMQ o Ionic.
- [x] **T006** Ejecutar `git diff --check` y corregir cualquier problema reportado.
- [x] **T007** Cambiar el estado de `spec.md` de `en especificación` a `aprobada` e incluir la fecha de aprobación.
- [x] **T008** Cambiar el estado de `plan.md` de `en revisión` a `aprobado`.
- [x] **T009** Cambiar el estado de `tasks.md` de `en revisión` a `aprobadas`.

### Punto de control documental

- [x] **T010** Revisar el diff completo de los tres documentos constitucionales modificados y de `spec/features/001-modelo-datos/`.
- [x] **T011** Confirmar que todos los archivos estén guardados en UTF-8 y LF.
- [x] **T012** Crear el commit documental con el mensaje `docs: especificar modelo de datos inicial`.
- [x] **T013** Publicar la rama si todavía no existe en GitHub y comprobar que el commit esté disponible remotamente.

**Resultado de la fase:** especificación, plan y tareas aprobados y versionados antes de generar código.

## Fase 1 — Inicialización del backend

### Estructura mínima

- [x] **T014** Crear la carpeta `backend/` en la raíz del repositorio.
- [x] **T015** Inicializar `backend/package.json` con npm.
- [x] **T016** Configurar nombre, versión privada, `type: module` y motores de Node 24/npm 11.
- [x] **T017** Añadir los scripts npm definidos en `plan.md` sin ejecutar todavía migraciones.

### Dependencias

- [x] **T018** Instalar las dependencias de producción con las versiones aprobadas.
- [x] **T019** Instalar las dependencias de desarrollo y pruebas con las versiones aprobadas.
- [x] **T020** Comprobar que se haya creado `backend/package-lock.json`.
- [x] **T021** Ejecutar `npm ls --depth=0` y revisar que no existan dependencias inválidas.
- [x] **T022** Confirmar que TypeScript sea 5.9.3 y que no se haya instalado TypeScript 7.

### Configuración de calidad

- [x] **T023** Crear `backend/tsconfig.json` en modo estricto, ESM y resolución `NodeNext`.
- [x] **T024** Crear `backend/eslint.config.js` para TypeScript y Node.
- [x] **T025** Crear `backend/.prettierrc.json` coherente con LF y la constitución.
- [x] **T026** Configurar exclusiones para compilación, cobertura y cliente Prisma generado.
- [x] **T027** Ejecutar una primera comprobación de `format:check`, `lint` y `typecheck`.

**Resultado de la fase:** proyecto npm reproducible con compilación y controles de calidad configurados.

## Fase 2 — Configuración y salud HTTP

### Variables de entorno

- [x] **T028** Crear `backend/.env.example` sin credenciales reales.
- [x] **T029** Crear `backend/.env.test.example` con un nombre de base terminado en `_test` y valores ficticios.
- [x] **T030** Crear `src/config/env.ts` con validación Zod para `NODE_ENV`, `PORT`, `DATABASE_URL` y `TEST_DATABASE_URL` según el contexto.
- [x] **T031** Verificar que una configuración inválida falle con un mensaje comprensible sin revelar secretos.
- [x] **T032** Confirmar mediante `git status --ignored` que los `.env` reales estén ignorados.

### Aplicación Express

- [x] **T033** Crear `src/app.ts` y exportar la aplicación sin abrir el puerto.
- [x] **T034** Habilitar el procesamiento JSON básico de Express.
- [x] **T035** Crear `src/routes/health.routes.ts`.
- [x] **T036** Implementar únicamente `GET /api/v1/health` con respuesta `200` y JSON determinista.
- [x] **T037** Crear `src/server.ts` como único punto de arranque y escucha.
- [x] **T038** Implementar cierre ordenado mínimo ante señales del sistema sin añadir infraestructura externa.

### Prueba HTTP

- [x] **T039** Crear `tests/health.test.ts` con Vitest y Supertest.
- [x] **T040** Verificar el código HTTP y el contrato JSON del endpoint.
- [x] **T041** Confirmar que la prueba no abra un puerto real.
- [x] **T042** Ejecutar `npm test`, `npm run typecheck` y `npm run build`.

**Resultado de la fase:** backend ejecutable y endpoint de salud probado, sin endpoints de negocio.

## Fase 3 — Bases PostgreSQL aisladas

### Preparación segura

- [x] **T043** Confirmar que el servicio PostgreSQL continúe en ejecución.
- [x] **T044** Crear una base de desarrollo con nombre `zamorafest_dev`.
- [x] **T045** Crear una base independiente de pruebas con nombre `zamorafest_test`.
- [x] **T046** Crear localmente los archivos `.env` y `.env.test` a partir de sus ejemplos.
- [x] **T047** Verificar las conexiones sin mostrar las URLs completas ni las contraseñas en capturas.
- [x] **T048** Documentar el procedimiento local de conexión sin registrar información secreta.

> **Aviso de seguridad:** estas tareas pueden provocar que `psql`, pgAdmin o PowerShell soliciten la contraseña local de PostgreSQL. La contraseña se introducirá solamente en el equipo de la propietaria. No se pegará en el chat, archivos versionados, capturas ni commits.

### Protección de la base de pruebas

- [x] **T049** Añadir una comprobación que impida reiniciar una base cuyo nombre no termine en `_test`.
- [x] **T050** Confirmar que los comandos de pruebas utilicen `TEST_DATABASE_URL` y no `DATABASE_URL`.

**Resultado de la fase:** desarrollo y pruebas utilizan bases diferentes y ninguna credencial está versionada.

## Fase 4 — Prisma y modelo relacional

### Configuración de Prisma 7

- [x] **T051** Crear `backend/prisma.config.ts` con carga explícita de `dotenv`.
- [x] **T052** Definir las rutas de esquema, migraciones y seed en `prisma.config.ts`.
- [x] **T053** Configurar la URL de migraciones fuera del bloque `datasource` de `schema.prisma`.
- [x] **T054** Crear `backend/prisma/schema.prisma` con proveedor PostgreSQL.
- [x] **T055** Configurar el generador `prisma-client` con salida explícita en `src/generated/prisma`.
- [x] **T056** Crear `src/infrastructure/database/prisma.ts` usando `PrismaPg` y un único `PrismaClient` compartido.

### Enumeración y entidades

- [x] **T057** Definir el enum `EstadoEvento` con solamente `BORRADOR` y `PUBLICADO`.
- [x] **T058** Implementar el modelo `Canton` según `spec.md`.
- [x] **T059** Implementar el modelo `Lugar`, incluidas coordenadas opcionales.
- [x] **T060** Implementar el modelo `Categoria`.
- [x] **T061** Implementar el modelo `Evento` con estado inicial `BORRADOR`.
- [x] **T062** Implementar `EventoCategoria` con clave primaria compuesta.
- [x] **T063** Implementar `ProgramacionEvento` con `inicio` y `fin` opcional.
- [x] **T064** Implementar `ImagenEvento` con `esPrincipal` en `false` por defecto.
- [x] **T065** Añadir `eliminadoEn` a las siete entidades sin añadir un campo `activo`.
- [x] **T066** Añadir marcas de creación/actualización definidas por la especificación.

### Relaciones y convenciones físicas

- [x] **T067** Configurar las cinco relaciones conceptuales y sus cardinalidades.
- [x] **T068** Aplicar borrado físico restrictivo en las claves foráneas.
- [x] **T069** Mapear tablas y columnas PostgreSQL a `snake_case` con `@@map` y `@map`.
- [x] **T070** Aplicar tipos nativos UUID, `timestamptz`, `decimal(9,6)`, textos y longitudes acordadas.
- [x] **T071** Añadir en Prisma los índices que puedan expresarse directamente en el esquema.
- [x] **T072** Ejecutar `prisma format` y `prisma validate`.
- [x] **T073** Revisar que Prisma muestre exactamente siete modelos de dominio.

**Resultado de la fase:** esquema Prisma válido y coherente con la especificación aprobada.

## Fase 5 — Migración, restricciones y seed

### Migración inicial

- [x] **T074** Generar la migración `init_event_domain` sobre la base de desarrollo.
- [x] **T075** Revisar manualmente todo el SQL generado antes de aprobarlo.
- [x] **T076** Incorporar índices únicos parciales para nombres activos de cantón y categoría.
- [x] **T077** Incorporar el índice único parcial de imagen principal activa por evento.
- [x] **T078** Incorporar la restricción de coordenadas presentes ambas o ausentes ambas.
- [x] **T079** Incorporar límites válidos de latitud y longitud.
- [x] **T080** Incorporar la restricción `fin > inicio` cuando exista `fin`.
- [x] **T081** Añadir los índices de claves foráneas, estado, fecha y eliminación lógica definidos en `plan.md`.
- [x] **T082** Aplicar la migración y comprobar que no existan errores.
- [x] **T083** Ejecutar `prisma generate` explícitamente.
- [x] **T084** Confirmar que `src/generated/prisma` exista localmente y esté ignorado por Git.
- [x] **T085** Confirmar que `prisma/migrations` aparezca como contenido versionable.

### Datos iniciales

- [x] **T086** Crear `prisma/seed.ts` con los nueve cantones aprobados.
- [x] **T087** Hacer que el seed sea idempotente.
- [x] **T088** Ejecutar el seed explícitamente.
- [x] **T089** Volver a ejecutar el seed y comprobar que no duplique cantones.
- [x] **T090** Comprobar mediante Prisma o `psql` que existan exactamente nueve cantones activos.

### Reproducibilidad

- [x] **T091** Reconstruir la base aislada de pruebas únicamente con las migraciones versionadas.
- [x] **T092** Ejecutar el seed sobre la base reconstruida.
- [x] **T093** Confirmar que la estructura y los datos iniciales coincidan con desarrollo.

**Resultado de la fase:** migración y seed reproducibles, sin depender de cambios manuales de pgAdmin.

## Fase 6 — Pruebas de integración

### Preparación

- [x] **T094** Crear la configuración de Vitest para pruebas de integración en entorno Node.
- [x] **T095** Conectar las pruebas exclusivamente mediante `TEST_DATABASE_URL`.
- [x] **T096** Preparar funciones de creación y limpieza de datos de prueba.
- [x] **T097** Garantizar que cada prueba sea independiente y repetible.

### Restricciones básicas

- [x] **T098** Probar que las siete tablas sean utilizables después de las migraciones.
- [x] **T099** Probar que una clave foránea obligatoria inexistente sea rechazada.
- [x] **T100** Probar que el par de `EventoCategoria` no pueda repetirse.
- [x] **T101** Probar el estado predeterminado `BORRADOR` de un evento.
- [x] **T102** Probar los valores predeterminados de eliminación lógica e imagen principal.

### Reglas reforzadas en PostgreSQL

- [x] **T103** Probar que dos imágenes principales activas del mismo evento sean rechazadas.
- [x] **T104** Probar que una imagen principal eliminada permita una nueva principal activa.
- [x] **T105** Probar que una sola coordenada sea rechazada.
- [x] **T106** Probar que latitud o longitud fuera de rango sean rechazadas.
- [x] **T107** Probar que una programación con `fin <= inicio` sea rechazada.
- [x] **T108** Probar que el borrado físico de un padre referenciado sea rechazado.
- [x] **T109** Probar la unicidad de nombres activos y su reutilización después de eliminación lógica.

### Ejecución completa

- [x] **T110** Ejecutar `npm run test:integration` al menos dos veces consecutivas.
- [x] **T111** Ejecutar `npm run test:coverage` y revisar resultados sin inventar porcentajes mínimos no aprobados.
- [x] **T112** Confirmar que las pruebas no hayan modificado la base de desarrollo.

**Resultado de la fase:** las reglas críticas están respaldadas por pruebas ejecutables, no solo por documentación.

## Fase 7 — Verificación, evidencia y pull request

### Control de calidad final

- [x] **T113** Ejecutar `npm run format:check`.
- [x] **T114** Ejecutar `npm run lint`.
- [x] **T115** Ejecutar `npm run typecheck`.
- [x] **T116** Ejecutar `npm run prisma:validate`.
- [x] **T117** Ejecutar `npm run build`.
- [x] **T118** Ejecutar `npm test`.
- [x] **T119** Ejecutar `npm run test:integration`.
- [x] **T120** Ejecutar `git diff --check`.

### Revisión de seguridad y alcance

- [x] **T121** Revisar `git status --short --untracked-files=all`.
- [x] **T122** Confirmar que no exista ningún `.env`, contraseña o URL real entre los cambios.
- [x] **T123** Confirmar que `package-lock.json` y las migraciones estén incluidos.
- [x] **T124** Confirmar que `node_modules` y el cliente Prisma generado estén excluidos.
- [x] **T125** Confirmar que solo exista el endpoint `/api/v1/health`.
- [x] **T126** Confirmar que no se hayan creado usuarios, roles, recordatorios, favoritos, parroquias ni sectores.

### Evidencias

- [x] **T127** Guardar el diagrama entidad-relación aprobado.
- [x] **T128** Guardar una evidencia legible de las siete tablas y relaciones.
- [x] **T129** Conservar la salida de migraciones, validaciones y pruebas.
- [x] **T130** Documentar las restricciones demostradas y sus resultados reales.
- [x] **T131** Registrar el uso de IA de forma proporcional: apoyo recibido, decisiones revisadas y validaciones realizadas por la autora.
- [x] **T132** Verificar que ninguna evidencia muestre credenciales o datos sensibles.

### Commits y revisión

- [x] **T133** Crear un commit para la base Express/TypeScript con un mensaje descriptivo.
- [x] **T134** Crear un commit para el modelo, migración y seed con un mensaje descriptivo.
- [x] **T135** Crear un commit para pruebas y evidencias con un mensaje descriptivo.
- [x] **T136** Revisar el historial y comprobar que cada commit tenga un propósito claro.
- [ ] **T137** Publicar la rama actualizada en GitHub.
- [ ] **T138** Abrir un pull request hacia `main` con resumen, alcance y verificaciones.
- [ ] **T139** Revisar todos los archivos del pull request antes de fusionar.
- [ ] **T140** Fusionar únicamente cuando las pruebas estén correctas y no existan cambios fuera del alcance.

**Resultado de la fase:** funcionalidad 001 implementada, probada, documentada y lista para integrarse en `main`.

## Criterio de finalización de 001

La funcionalidad se considerará terminada solamente cuando:

- los tres documentos SDD estén aprobados;
- el backend compile y el endpoint de salud responda correctamente;
- la migración reconstruya la base desde cero;
- existan las siete entidades con sus restricciones;
- las pruebas unitarias y de integración pasen;
- `package-lock.json` y `prisma/migrations` estén versionados;
- no existan secretos ni archivos generados en Git;
- el pull request haya sido revisado antes de integrarse.

No se iniciará 002-gestion-eventos dentro de esta rama.
