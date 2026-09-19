# Tareas: lógica funcional móvil (011)

## Estado

- **Rama de trabajo:** `main`
- **Especificación:** `spec.md`
- **Plan técnico:** `plan.md`
- **Mapa de rutas:** `route-map.md`
- **Fase:** preparación e implementación
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe

## 1. Preparación y baseline

- [x] T001 Confirmar trabajo directo sobre `main`.
- [x] T002 Verificar repositorio limpio antes de iniciar Semana 11.
- [x] T003 Confirmar sincronización entre `main` y `origin/main`.
- [x] T004 Confirmar que Feature 010 está integrada en `main`.
- [x] T005 Ejecutar typecheck móvil sin errores.
- [x] T006 Ejecutar lint móvil sin errores.
- [x] T007 Ejecutar suite móvil: 49 de 49 pruebas aprobadas.
- [x] T008 Ejecutar build móvil correctamente.
- [x] T009 Ejecutar typecheck backend sin errores.
- [x] T010 Ejecutar lint backend sin errores.
- [x] T011 Ejecutar suite backend: 228 de 228 pruebas aprobadas.
- [x] T012 Ejecutar build backend correctamente.
- [x] T013 Verificar existencia de variables seed para ADMINISTRADOR, ASISTENTE y VISITANTE sin exponer credenciales.

## 2. Análisis y trazabilidad

- [x] T014 Revisar los requisitos académicos de Semana 11.
- [x] T015 Auditar las rutas móviles existentes.
- [x] T016 Auditar el contrato móvil actual de login.
- [x] T017 Auditar autenticación y autorización del backend.
- [x] T018 Confirmar comportamiento diferenciado de `401` y `403` en backend.
- [x] T019 Confirmar que el registro público crea únicamente usuarios `VISITANTE`.
- [x] T020 Confirmar que la creación de eventos requiere rol `ASISTENTE`.
- [x] T021 Confirmar que `ADMINISTRADOR` no se considera `ASISTENTE` implícitamente.
- [x] T022 Detectar que el cliente móvil descarta actualmente los tokens recibidos en login.
- [x] T023 Detectar que el backend responde actualmente `400` ante errores Zod.
- [x] T024 Detectar ausencia de un endpoint público específico para consultar lugares.
- [ ] T025 Regularizar la trazabilidad de T046 y T047 de Feature 010 como actividad separada y no como deuda técnica del Avance 10.

## 3. Documentación SDD

- [x] T026 Crear `spec/features/011-logica-funcional-movil/`.
- [x] T027 Crear `spec.md`.
- [x] T028 Documentar propósito, alcance y criterios de aceptación en `spec.md`.
- [x] T029 Crear `route-map.md`.
- [x] T030 Documentar rutas públicas, protegidas y ruta anidada.
- [x] T031 Documentar parámetros de ruta y reconstrucción mediante URL.
- [x] T032 Documentar comportamiento de `401`, `403` y destino post-login.
- [x] T033 Crear `plan.md`.
- [x] T034 Documentar orden de implementación compatible con Semanas 12 y 13.
- [x] T035 Corregir encabezados duplicados detectados por markdownlint en `route-map.md`.
- [x] T036 Verificar codificación UTF-8 y numeración completa de `route-map.md`.
- [x] T037 Corregir y verificar encabezados de verificación Mobile/Backend en `plan.md`.
- [x] T038 Completar `evidence.md`.
- [ ] T039 Ejecutar revisión final de markdownlint sobre la documentación SDD.

## 4. Contrato HTTP y validación backend

- [x] T040 Añadir prueba que confirme `422` para errores de validación procesables del cuerpo JSON.
- [x] T041 Diferenciar la validación del `request.body` para devolver `422`, conservando `400` para `params`, `query` y solicitudes malformadas.
- [x] T042 Mantener estructura `error.code`, `error.message` y `error.details`.
- [x] T043 Confirmar que cada detalle de validación conserva `path` y `message`.
- [x] T044 Mantener `400` para solicitudes realmente malformadas.
- [x] T045 Actualizar OpenAPI con la respuesta `422` cuando corresponda.
- [x] T046 Ejecutar pruebas backend específicas de validación.
- [x] T047 Ejecutar suite backend completa sin regresiones.

## 5. Consulta pública de lugares

- [x] T048 Diseñar contrato mínimo para `GET /api/v1/lugares`.
- [x] T049 Implementar repositorio de lectura de lugares activos.
- [x] T050 Implementar servicio de consulta de lugares activos.
- [x] T051 Implementar controlador de consulta de lugares.
- [x] T052 Registrar la ruta `/api/v1/lugares`.
- [x] T053 Devolver identificador y datos suficientes para identificar el lugar.
- [x] T054 Mantener únicamente lugares activos y jerarquía territorial activa en la respuesta.
- [x] T055 Mantener consistencia con la jerarquía territorial de Semana 4.
- [x] T056 Documentar el endpoint en OpenAPI.
- [x] T057 Implementar pruebas del endpoint de lugares.
- [x] T058 Confirmar que no se modificó el modelo canónico de base de datos.

## 6. Modelo de sesión móvil

- [x] T059 Definir tipo de sesión autenticada.
- [x] T060 Incluir usuario autenticado dentro de la sesión.
- [x] T061 Incluir rol dentro de la sesión.
- [x] T062 Incluir access token dentro de la sesión.
- [x] T063 Incluir refresh token dentro de la sesión.
- [x] T064 Incluir tipo de token y expiración disponible.
- [x] T065 Evolucionar `zamoraFestApi.login()` para devolver la sesión completa.
- [x] T066 Mantener validación estricta del contrato recibido desde backend.
- [x] T067 Actualizar pruebas del contrato de login.
- [x] T068 Confirmar que ningún token se guarda en `localStorage`.

## 7. Estado global de aplicación

- [x] T069 Implementar contexto global de autenticación.
- [x] T070 Implementar reducer o mecanismo equivalente tipado para sesión.
- [x] T071 Implementar acción de inicio de sesión.
- [x] T072 Implementar acción de cierre de sesión.
- [x] T073 Exponer usuario autenticado.
- [x] T074 Exponer rol autenticado.
- [x] T075 Exponer tokens únicamente en memoria.
- [x] T076 Definir estado para destino protegido pendiente.
- [x] T077 Definir estado para borrador de creación de evento.
- [x] T078 Diferenciar estado efímero de estado de aplicación.
- [x] T079 Crear pruebas del estado global.

## 8. Estado remoto cerrado

- [x] T080 Definir tipo reusable `RemoteData` o equivalente.
- [x] T081 Incluir caso `idle`.
- [x] T082 Incluir caso `loading`.
- [x] T083 Incluir caso `success`.
- [x] T084 Incluir caso `error`.
- [x] T085 Evitar combinaciones de estado contradictorias mediante TypeScript.
- [x] T086 Integrar el estado remoto con `AsyncStateView`.
- [x] T087 Añadir pruebas del tipo y flujo remoto.

## 9. Protección de rutas

- [x] T088 Implementar protección compatible con Ionic React Router y React Router 5.
- [ ] T089 Proteger `/gestion`.
- [ ] T090 Proteger `/gestion/eventos/nuevo`.
- [x] T091 Conservar destino solicitado cuando no existe sesión.
- [x] T092 Redirigir al login cuando corresponde.
- [x] T093 Validar que el destino de retorno sea una ruta interna.
- [x] T094 Evitar redirecciones abiertas hacia URLs externas.
- [x] T095 Volver al destino protegido después de login exitoso cuando esté autorizado.
- [x] T096 Mantener sesión ante falta de rol.
- [x] T097 Añadir pruebas de rutas protegidas.

## 10. Evolución del login

- [x] T098 Integrar `LoginPage` con el estado global.
- [x] T099 Eliminar dependencia de usuario autenticado únicamente como estado local.
- [x] T100 Conservar validaciones existentes.
- [x] T101 Conservar manejo seguro de credenciales incorrectas.
- [x] T102 Conservar bloqueo de envíos duplicados.
- [x] T103 Guardar sesión completa después de login.
- [x] T104 Aplicar destino pendiente después del login.
- [x] T105 Actualizar pruebas de `LoginPage`.

## 11. Registro de visitante

- [x] T106 Crear `RegisterPage`.
- [x] T107 Registrar ruta pública `/register`.
- [x] T108 Implementar llamada a `POST /api/v1/auth/register`.
- [x] T109 Derivar reglas de validación del contrato backend.
- [x] T110 Impedir envío de campos privilegiados.
- [x] T111 Mostrar errores de registro comprensibles.
- [x] T112 Confirmar creación exclusiva de rol `VISITANTE`.
- [x] T113 Implementar pruebas del flujo de registro.

## 12. Separación de datos de eventos

- [x] T114 Definir contrato de `EventRepository`.
- [x] T115 Implementar fuente remota de eventos.
- [x] T116 Mantener `zamoraFestApi` como capa HTTP de bajo nivel.
- [x] T117 Migrar `ExploreEventsPage` para consumir repositorio.
- [x] T118 Confirmar que `ExploreEventsPage` conserva su comportamiento de Feature 010.
- [x] T119 Confirmar que componentes reutilizables no conocen endpoints.
- [x] T120 Añadir pruebas del repositorio remoto.

## 13. Detalle de evento

- [ ] T121 Crear `EventDetailPage`.
- [ ] T122 Registrar ruta pública `/eventos/:id`.
- [ ] T123 Leer únicamente `id` desde la ruta.
- [ ] T124 Validar identificador entero positivo.
- [ ] T125 Implementar `GET /api/v1/eventos/:id` en la capa de datos.
- [ ] T126 Representar loading.
- [ ] T127 Representar error.
- [ ] T128 Representar evento no encontrado.
- [ ] T129 Representar éxito.
- [ ] T130 Permitir apertura directa de `/eventos/:id`.
- [ ] T131 Conectar navegación desde `ExploreEventsPage`.
- [ ] T132 Mantener `EventCard` independiente de rutas.
- [ ] T133 Implementar pruebas de detalle y navegación.

## 14. Área protegida

- [ ] T134 Crear `ManagementPage`.
- [ ] T135 Registrar `/gestion`.
- [ ] T136 Mostrar identidad del usuario autenticado.
- [ ] T137 Mostrar rol del usuario.
- [ ] T138 Mostrar únicamente acciones compatibles con autorización.
- [ ] T139 Incorporar acceso a creación para `ASISTENTE`.
- [ ] T140 Incorporar acción de cierre de sesión.
- [ ] T141 Implementar pruebas de `ManagementPage`.

## 15. Datos auxiliares del formulario

- [ ] T142 Implementar consulta móvil de categorías.
- [ ] T143 Implementar consulta móvil de lugares.
- [ ] T144 Cargar categorías reales en el formulario.
- [ ] T145 Cargar lugares reales en el formulario.
- [ ] T146 Evitar IDs de categorías incrustados.
- [ ] T147 Evitar `lugarId` incrustado.
- [ ] T148 Modelar loading y error de datos auxiliares.

## 16. Formulario de creación de Evento

- [ ] T149 Crear `CreateEventPage`.
- [ ] T150 Registrar `/gestion/eventos/nuevo`.
- [ ] T151 Implementar campo título.
- [ ] T152 Implementar campo descripción.
- [ ] T153 Implementar fecha de inicio.
- [ ] T154 Implementar fecha de fin.
- [ ] T155 Implementar costo referencial.
- [ ] T156 Implementar selección de lugar.
- [ ] T157 Implementar selección múltiple de categorías.
- [ ] T158 Implementar fuente de información.
- [ ] T159 No exponer campos controlados por servidor.
- [ ] T160 Implementar `POST /api/v1/eventos`.
- [ ] T161 Adjuntar access token en la operación protegida.
- [ ] T162 Representar estado remoto de creación.

## 17. Validaciones del Evento

- [ ] T163 Validar título obligatorio.
- [ ] T164 Validar longitud permitida del título.
- [ ] T165 Validar fecha de inicio.
- [ ] T166 Validar fecha final opcional.
- [ ] T167 Validar que fecha final no sea anterior a fecha inicial.
- [ ] T168 Validar costo no negativo.
- [ ] T169 Validar máximo de dos decimales.
- [ ] T170 Validar lugar entero positivo.
- [ ] T171 Validar al menos una categoría.
- [ ] T172 Rechazar categorías duplicadas.
- [ ] T173 Validar longitud de fuente de información.
- [ ] T174 Ejecutar validación al abandonar campos cuando corresponda.
- [ ] T175 Ejecutar validación completa al enviar.
- [ ] T176 Mostrar mensajes específicos por campo.
- [ ] T177 Añadir pruebas de validación móvil.

## 18. Mapeo de errores 422

- [ ] T178 Extender el error HTTP móvil para conservar cuerpo estructurado.
- [ ] T179 Interpretar `VALIDATION_ERROR`.
- [ ] T180 Leer `details[].path`.
- [ ] T181 Asociar errores backend con campos del formulario.
- [ ] T182 Mostrar errores no asociados a campo como error general.
- [ ] T183 Añadir pruebas de mapeo de `422`.

## 19. Tratamiento de 401 y 403

- [ ] T184 Implementar flujo móvil de `401`.
- [ ] T185 Invalidar sesión en memoria ante `401` protegido.
- [ ] T186 Conservar destino cuando corresponda.
- [ ] T187 Redirigir a login ante `401`.
- [ ] T188 Implementar flujo móvil de `403`.
- [ ] T189 Mantener sesión ante `403`.
- [ ] T190 Mostrar mensaje de permiso insuficiente.
- [ ] T191 Confirmar que `403` no provoca logout.
- [ ] T192 Añadir pruebas que diferencien `401` y `403`.

## 20. Preservación del borrador

- [ ] T193 Guardar borrador de creación en estado de aplicación.
- [ ] T194 Navegar fuera de la pantalla con datos ingresados.
- [ ] T195 Regresar y recuperar el borrador.
- [ ] T196 Limpiar borrador después de creación exitosa cuando corresponda.
- [ ] T197 Definir comportamiento del borrador al cerrar sesión.
- [ ] T198 Añadir pruebas de preservación durante navegación.

## 21. Logout

- [ ] T199 Eliminar usuario de memoria.
- [ ] T200 Eliminar access token de memoria.
- [ ] T201 Eliminar refresh token de memoria.
- [ ] T202 Eliminar estado de autenticación.
- [ ] T203 Limpiar destino pendiente no aplicable.
- [ ] T204 Verificar que una ruta protegida vuelve a requerir login.
- [ ] T205 Añadir pruebas de logout.

## 22. Accesibilidad y reutilización visual

- [ ] T206 Reutilizar `ScreenHeader` donde corresponda.
- [ ] T207 Reutilizar `PrimaryButton` donde corresponda.
- [ ] T208 Reutilizar `AsyncStateView` para operaciones remotas.
- [ ] T209 Mantener tokens de Feature 010.
- [ ] T210 Verificar labels y nombres accesibles de formularios.
- [ ] T211 Asociar errores de validación con sus controles.
- [ ] T212 Conservar tamaño mínimo táctil.
- [ ] T213 Verificar foco visible.
- [ ] T214 Verificar flujo principal con TalkBack.

## 23. Verificación automatizada final

- [ ] T215 Ejecutar typecheck móvil final.
- [ ] T216 Ejecutar lint móvil final.
- [ ] T217 Ejecutar pruebas móviles específicas.
- [ ] T218 Ejecutar suite móvil completa sin regresiones.
- [ ] T219 Ejecutar build móvil final.
- [ ] T220 Ejecutar typecheck backend final.
- [ ] T221 Ejecutar lint backend final.
- [ ] T222 Ejecutar pruebas backend específicas.
- [ ] T223 Ejecutar suite backend completa sin regresiones.
- [ ] T224 Ejecutar build backend final.
- [ ] T225 Ejecutar `git diff --check`.

## 24. Verificación funcional

- [ ] T226 Levantar backend real.
- [ ] T227 Confirmar conexión con PostgreSQL.
- [ ] T228 Ejecutar cliente móvil contra backend real.
- [ ] T229 Probar credenciales incorrectas.
- [ ] T230 Probar login correcto.
- [ ] T231 Probar ruta protegida.
- [ ] T232 Probar listado de eventos.
- [ ] T233 Probar detalle mediante `:id`.
- [ ] T234 Probar registro de visitante.
- [ ] T235 Probar creación como `ASISTENTE`.
- [ ] T236 Probar falta de permiso con rol no autorizado.
- [ ] T237 Probar preservación del borrador.
- [ ] T238 Probar logout.
- [ ] T239 Probar acceso protegido posterior al logout.

## 25. Dispositivo físico y evidencias

- [ ] T240 Ejecutar flujo principal en Samsung Android físico.
- [ ] T241 Registrar evidencia de login.
- [ ] T242 Registrar evidencia de navegación protegida.
- [ ] T243 Registrar evidencia de listado.
- [ ] T244 Registrar evidencia de detalle.
- [ ] T245 Registrar evidencia de formulario validado.
- [ ] T246 Registrar evidencia de creación real.
- [ ] T247 Registrar evidencia de logout.
- [ ] T248 Registrar evidencia de acceso protegido posterior al logout.
- [ ] T249 Registrar verificación de accesibilidad.
- [ ] T250 Actualizar `evidence.md` únicamente con resultados ejecutados.

## 26. Uso de inteligencia artificial

- [ ] T251 Registrar herramienta de IA utilizada.
- [ ] T252 Registrar consultas relevantes utilizadas durante Feature 011.
- [ ] T253 Registrar resultados de IA realmente incorporados.
- [ ] T254 Registrar modificaciones humanas realizadas.
- [ ] T255 Registrar verificaciones técnicas efectuadas sobre los resultados.

## 27. Video y entrega externa

- [ ] T256 Preparar recorrido del video de 3 a 5 minutos.
- [ ] T257 Grabar ejecución real de ZamoraFest.
- [ ] T258 Mostrar validaciones de login.
- [ ] T259 Mostrar credenciales o datos incorrectos.
- [ ] T260 Mostrar autenticación correcta.
- [ ] T261 Mostrar funcionalidad protegida.
- [ ] T262 Mostrar navegación entre al menos tres pantallas o funcionalidades.
- [ ] T263 Mostrar mantenimiento del estado.
- [ ] T264 Mostrar logout.
- [ ] T265 Mostrar intento de acceso protegido después del logout.
- [ ] T266 Explicar brevemente navegación y manejo de estado.
- [ ] T267 Publicar video en plataforma externa accesible.
- [ ] T268 Registrar enlace de visualización en la evidencia correspondiente.
- [ ] T269 Verificar que el código mostrado en el video corresponda con `main`.

## 28. Cierre Git

- [ ] T270 Revisar cambios completos antes de stage.
- [ ] T271 Ejecutar revisión de markdownlint de documentación.
- [ ] T272 Ejecutar verificaciones finales.
- [ ] T273 Realizar stage únicamente de archivos controlados.
- [ ] T274 Crear commit coherente de documentación inicial.
- [ ] T275 Realizar push directo a `origin/main`.
- [ ] T276 Verificar el commit publicado en GitHub.
- [ ] T277 Confirmar que el enlace permanente del repositorio muestra Feature 011.
