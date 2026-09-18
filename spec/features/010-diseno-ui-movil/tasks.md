# Tareas: diseño UI móvil y componentes reutilizables (010)

## Estado

- **Rama:** `feat/010-diseno-ui-movil`
- **Especificación:** `spec.md`
- **Plan técnico:** `plan.md`
- **Implementación:** documentación y cierre

## 1. Control inicial

- [x] T001 Crear rama Feature 010 desde `main` limpio.
- [x] T002 Crear especificación, plan y tareas.
- [x] T003 Auditar la UI móvil existente.
- [x] T004 Ejecutar baseline de typecheck, lint, tests y build.

## 2. Sistema de diseño

- [x] T005 Definir tokens primitivos y semánticos.
- [x] T006 Definir tipografía, espaciado, radios y tamaño mínimo de interacción.
- [x] T007 Implementar tokens en `variables.css`.
- [x] T008 Completar y documentar las mediciones de contraste WCAG 2.2 AA.

## 3. Componentes reutilizables

- [x] T009 Implementar `EventCard`.
- [x] T010 Implementar `FilterChip`.
- [x] T011 Implementar `AsyncStateView`.
- [x] T012 Implementar `PrimaryButton`.
- [x] T013 Implementar `ScreenHeader` para abstraer el encabezado propio de las pantallas.
- [x] T014 Verificar independencia de backend, rutas y autenticación global.
- [x] T015 Documentar propósito, interfaz pública, parámetros obligatorios, valores por defecto, callbacks, contenido delegado y estados de cada componente.
- [x] T016 Documentar la justificación concreta de reutilización de cada componente.

## 4. Pantalla Explorar eventos

- [x] T017 Crear `ExploreEventsPage`.
- [x] T018 Integrar `GET /api/v1/eventos` mediante `zamoraFestApi.getEventos()`.
- [x] T019 Resolver estado loading.
- [x] T020 Resolver estado empty.
- [x] T021 Resolver estado error y reintento.
- [x] T022 Implementar filtrado por categoría mediante `FilterChip`.
- [x] T023 Registrar la ruta pública `/explore`.
- [x] T024 Integrar `ScreenHeader` en `ExploreEventsPage`.
- [x] T025 Verificar `ExploreEventsPage` ejecutándose contra el backend real.

## 5. Calidad técnica

- [x] T026 Ejecutar typecheck.
- [x] T027 Ejecutar lint.
- [x] T028 Ejecutar pruebas específicas de componentes y pantalla.
- [x] T029 Ejecutar suite completa: 49/49 pruebas aprobadas.
- [x] T030 Ejecutar build de producción.
- [x] T031 Registrar warnings no bloqueantes de `lightningcss` y tamaño de chunks.

## 6. Accesibilidad y adaptación

- [x] T032 Verificar contraste textual y no textual conforme a WCAG 2.2 AA.
- [x] T033 Verificar tamaño real de las áreas táctiles.
- [x] T034 Verificar etiquetas, nombre, función y valor de los controles interactivos.
- [x] T035 Probar la pantalla en al menos dos anchos distintos.
- [x] T036 Probar con el tamaño de fuente del sistema ampliado.
- [x] T037 Recorrer el flujo principal con TalkBack en el dispositivo Android.
- [x] T038 Probar `ExploreEventsPage` en el Samsung físico.

## 7. Documentación y evidencias

- [x] T039 Derivar y documentar el inventario de pantallas a partir de los endpoints de la API.
- [x] T040 Identificar y documentar los patrones visuales reutilizados en tres o más pantallas previstas.
- [x] T041 Preparar tabla de tokens con mediciones de contraste.
- [x] T042 Preparar catálogo de componentes con propósito, interfaz pública y estados.
- [x] T043 Conservar capturas de la pantalla en dos anchos y con fuente ampliada.
- [x] T044 Documentar la verificación de accesibilidad y las correcciones aplicadas.
- [x] T045 Registrar el uso de herramientas de inteligencia artificial durante Feature 010.
- [ ] T046 Incorporar el enlace del repositorio al informe técnico.
- [ ] T047 Preparar el informe técnico PDF requerido por Semana 10.

## 8. Cierre Git

- [x] T048 Revisar el diff completo antes de stage.
- [x] T049 Ejecutar `git diff --check`.
- [x] T050 Ejecutar verificaciones finales antes del commit.
- [x] T051 Realizar stage controlado de Feature 010.
- [x] T052 Crear commit de Feature 010.
- [ ] T053 Push de la rama y revisión final del repositorio.
