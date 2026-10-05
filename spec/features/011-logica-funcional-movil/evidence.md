# Evidencias y validación - Feature 011

## Estado

- **Rama de trabajo:** `main`
- **Feature:** `011-logica-funcional-movil`
- **Semana:** 11
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe
- **Estado actual:** implementación funcional completada; cierre técnico y documental en verificación final

> **Nota de trazabilidad:** las secciones intermedias conservan el estado existente en el momento en que cada fase fue ejecutada. Cuando una condición cambió posteriormente, como la obligatoriedad de `fechaFin` o la incorporación de `/gestion/eventos`, prevalecen las secciones de cierre y la especificación vigente.

## 1. Política de evidencias

Este documento registra únicamente verificaciones realmente ejecutadas.

No se marcarán como realizadas:

- pruebas no ejecutadas;
- capturas todavía inexistentes;
- funcionamiento no comprobado;
- resultados estimados;
- evidencia de dispositivo físico aún no repetida para Feature 011;

Las evidencias se incorporarán progresivamente durante la implementación.

## 2. Repositorio de trabajo

Repositorio:

`https://github.com/MonikaRogel/ZamoraFest`

Rama utilizada para Semana 11:

`main`

La Feature 011 se desarrollará directamente sobre `main`, conforme al flujo de trabajo definido para esta etapa del proyecto.

## 3. Baseline móvil previo a Feature 011

Antes de implementar la lógica funcional de Semana 11 se ejecutaron las verificaciones del cliente móvil.

Directorio utilizado:

`mobile`

Resultados confirmados:

| Verificación | Resultado |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS |
| Pruebas automatizadas | PASS |
| Total de pruebas | 49 de 49 |
| Build de producción | PASS |

El build presentó advertencias no bloqueantes ya conocidas relacionadas con:

- CSS generado por Ionic y `:host-context`;
- tamaño de algunos chunks superior a 500 kB.

Estas advertencias no impidieron el build y no fueron tratadas como errores funcionales de Feature 011.

## 4. Baseline backend previo a Feature 011

Antes de realizar cambios en contratos o endpoints se ejecutaron las verificaciones del backend.

Directorio utilizado:

`backend`

Resultados confirmados:

| Verificación | Resultado |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS |
| Pruebas automatizadas | PASS |
| Total de pruebas | 228 de 228 |
| Build | PASS |

Este resultado constituye el baseline que deberá conservarse o superarse después de los cambios de Semana 11.

## 5. Configuración local de usuarios de prueba

Se verificó la existencia del archivo local:

`.env`

Resultado:

`True`

También se verificó exclusivamente la presencia, sin mostrar valores, de las siguientes variables:

| Variable | Presente |
| --- | --- |
| `SEED_ADMIN_EMAIL` | Sí |
| `SEED_ADMIN_PASSWORD` | Sí |
| `SEED_ASISTENTE_EMAIL` | Sí |
| `SEED_ASISTENTE_PASSWORD` | Sí |
| `SEED_VISITANTE_EMAIL` | Sí |
| `SEED_VISITANTE_PASSWORD` | Sí |

No se registran contraseñas, tokens ni valores sensibles en esta evidencia.

La presencia de estas variables no implica todavía que se haya comprobado en Feature 011 la autenticación real de cada usuario contra la base de datos.

## 6. Auditoría del cliente móvil existente

Antes de modificar el código se comprobó que `App.tsx` dispone actualmente de las rutas:

- `/login`;
- `/environment`;
- `/explore`;
- `/`.

La ruta raíz redirige actualmente hacia `/login`.

Todavía no existen en el baseline inicial de Feature 011:

- `/register`;
- `/eventos/:id`;
- `/gestion`;
- `/gestion/eventos/nuevo`.

Estas rutas forman parte de la implementación prevista para Semana 11.

## 7. Auditoría del login existente

El cliente móvil ya dispone de formulario y contrato básico de inicio de sesión.

Se identificó que el backend devuelve información de sesión que incluye tokens y usuario autenticado.

Sin embargo, el comportamiento móvil actual de `zamoraFestApi.login()` devuelve únicamente el usuario autenticado a la pantalla.

Por tanto, antes de Feature 011 los tokens recibidos no forman todavía parte del estado global de la aplicación.

Esta condición se registró como requisito de evolución y no como evidencia de sesión completa.

## 8. Auditoría de roles y autorización backend

La revisión de middleware y pruebas existentes confirmó que el backend diferencia autenticación y autorización.

Se confirmó la existencia de los roles:

- `ADMINISTRADOR`;
- `ASISTENTE`;
- `VISITANTE`.

También se verificó que la autorización utiliza los roles permitidos expresamente por cada operación.

La política actual no convierte implícitamente `ADMINISTRADOR` en `ASISTENTE`.

Por tanto, una operación configurada específicamente para `ASISTENTE` deberá respetar esa política también desde la experiencia móvil.

El backend seguirá siendo la autoridad final de autorización.

## 9. Auditoría del registro público

Se confirmó que el registro público no permite asignar desde el cliente privilegios administrativos.

El autorregistro corresponde a usuarios `VISITANTE`.

Campos privilegiados como rol, identificador de rol o estado no deberán enviarse desde la interfaz móvil.

La implementación de `RegisterPage` todavía está pendiente.

## 10. Auditoría de creación de eventos

Se confirmó que:

`POST /api/v1/eventos`

es una operación protegida.

La creación requiere el rol autorizado por el backend, actualmente `ASISTENTE`.

El formulario móvil todavía no ha sido implementado en Feature 011.

## 11. Auditoría de validación HTTP

El baseline previo a Feature 011 transformaba cualquier `ZodError` en una respuesta HTTP `400`, sin distinguir si el error provenía del cuerpo JSON, los parámetros de ruta o los parámetros de consulta.

Durante Feature 011 se implementó una separación explícita del contrato HTTP:

- un cuerpo JSON sintácticamente válido que no cumple el esquema devuelve `422 Unprocessable Entity`;
- parámetros de ruta o consulta inválidos continúan devolviendo `400 Bad Request`;
- un cuerpo JSON sintácticamente malformado devuelve `400 Bad Request` con código `MALFORMED_JSON`;
- los errores de validación conservan `error.code`, `error.message` y `error.details`;
- cada elemento de `error.details` conserva `path` y `message`, permitiendo posteriormente asociar errores del backend con campos concretos del formulario móvil.

La validación de cuerpos se centralizó mediante `parseRequestBody`, sin modificar la semántica existente de `params` y `query`.

Se añadió la prueba:

`backend/tests/http-validation-contract.test.ts`

La prueba específica comprobó tres casos:

1. body JSON procesable pero inválido → `422`;
2. query param inválido → `400`;
3. JSON sintácticamente malformado → `400` y no `500`.

Resultado de la prueba específica:

`3 passed (3)`

Después de aplicar el contrato a todos los controladores que reciben `request.body`, se ejecutó la suite backend completa.

Resultado:

- 34 archivos de pruebas aprobados;
- 231 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

OpenAPI fue actualizado para documentar la nueva separación entre `400` y `422`.

Comprobaciones del contrato OpenAPI:

- 11 operaciones con `requestBody`;
- 11 respuestas `422`;
- componente reutilizable `UnprocessableEntity`;
- esquema de detalle de validación con `path` y `message`.

Estado:

`COMPLETADO Y VERIFICADO`

## 12. Auditoría de lugares

El modelo canónico de ZamoraFest requiere un `lugarId` válido para crear un evento.

El baseline previo a esta fase disponía de las entidades territoriales necesarias en PostgreSQL y Prisma, pero no exponía un endpoint público específico para consultar lugares desde el cliente móvil.

Durante Feature 011 se implementó:

`GET /api/v1/lugares`

El endpoint es público y devuelve únicamente lugares activos cuya jerarquía territorial también se encuentra activa.

La respuesta incluye información suficiente para que el cliente móvil identifique y presente correctamente cada lugar:

- identificador del lugar;
- nombre;
- tipo de lugar;
- dirección referencial;
- sector;
- tipo de sector;
- parroquia;
- cantón;
- provincia.

La implementación se organizó mediante:

- `lugar.repository.ts`;
- `lugar.service.ts`;
- `lugar.controller.ts`;
- `lugar.routes.ts`.

La ruta fue registrada en:

`backend/src/app.ts`

El repositorio filtra lugares activos y conserva la jerarquía canónica:

`Lugar -> Sector -> Parroquia -> Canton -> Provincia`

No se utilizó ningún identificador de lugar fijo en el cliente.

OpenAPI fue actualizado con:

- tag `Lugares`;
- operación `GET /lugares`;
- esquema `LugarConsulta`;
- respuesta pública `200`;
- respuesta `500` reutilizando `InternalError`.

Se implementaron las pruebas:

- `backend/tests/lugar-repository.test.ts`;
- `backend/tests/lugares-api.test.ts`.

Las pruebas específicas del bloque obtuvieron:

- 2 archivos de prueba aprobados;
- 3 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite backend completa y se obtuvieron 36 archivos de prueba aprobados sin regresiones reportadas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

Finalmente, `git diff -- backend/prisma/schema.prisma` no produjo cambios, confirmando que esta implementación no modificó el modelo canónico de base de datos definido previamente.

Estado:

`COMPLETADO Y VERIFICADO`

## 13. Documentación SDD de Feature 011

Durante la preparación de Semana 11 se crearon:

- `spec.md`;
- `plan.md`;
- `tasks.md`;
- `route-map.md`;
- `evidence.md`.

### 13.1 Especificación

`spec.md` documenta:

- propósito;
- alcance;
- navegación;
- autenticación;
- autorización;
- estado remoto;
- creación de eventos;
- validaciones;
- continuidad con Feature 010;
- preparación para Semanas 12 y 13;
- criterios de aceptación.

### 13.2 Mapa de rutas

`route-map.md` contiene 20 secciones numeradas.

Se corrigió la advertencia `MD024/no-duplicate-heading` provocada inicialmente por encabezados repetidos.

Posteriormente se comprobó que no existieran encabezados duplicados.

También se verificó la lectura correcta del archivo en UTF-8.

### 13.3 Plan técnico

`plan.md` documenta el orden incremental de implementación desde contratos backend hasta la verificación funcional.

Se comprobó la existencia diferenciada de las verificaciones:

- `18.1 Mobile`;
- `18.2 Backend`.

El control de encabezados duplicados finalizó sin resultados.

### 13.4 Tareas

`tasks.md` contiene:

`277`

tareas identificadas mediante códigos `T001` a `T277`.

En la preparación inicial quedaron justificadamente completadas:

`36`

tareas.

Las tareas restantes permanecerán abiertas hasta que exista evidencia técnica suficiente.

## 14. Mapa de rutas previsto

| Ruta | Acceso | Estado inicial |
| --- | --- | --- |
| `/login` | Público | Existente, requiere evolución |
| `/register` | Público | Pendiente |
| `/explore` | Público | Existente |
| `/eventos/:id` | Público | Pendiente |
| `/gestion` | Autenticado | Pendiente |
| `/gestion/eventos/nuevo` | `ASISTENTE` | Pendiente |

La implementación y verificación real de estas rutas deberá registrarse posteriormente.

## 15. Evidencia funcional pendiente

Las siguientes evidencias no se consideran realizadas todavía:

| Evidencia | Estado |
| --- | --- |
| Login con sesión global | PENDIENTE |
| Registro de visitante | PENDIENTE |
| Protección de `/gestion` | PENDIENTE |
| Retorno al destino después de login | PENDIENTE |
| Detalle mediante `/eventos/:id` | PENDIENTE |
| Consulta real de lugares | PENDIENTE |
| Formulario de creación | PENDIENTE |
| Mapeo de `422` por campo | PENDIENTE |
| Diferenciación móvil `401/403` | PENDIENTE |
| Preservación del borrador | PENDIENTE |
| Creación real como `ASISTENTE` | PENDIENTE |
| Logout | PENDIENTE |
| Acceso protegido después de logout | PENDIENTE |

## 16. Evidencia en dispositivo físico

La Feature 010 fue probada previamente en un dispositivo Android físico.

Esa comprobación no se utilizará como sustituto de las pruebas de Feature 011.

El recorrido funcional de Semana 11 deberá ejecutarse nuevamente en el dispositivo físico cuando la implementación esté completa.

Estado actual:

`PENDIENTE`

## 17. Accesibilidad

Feature 010 dejó una base accesible con controles, foco y componentes reutilizables ya verificados.

Feature 011 deberá comprobar específicamente:

- etiquetas de formularios;
- asociación de mensajes de error;
- navegación entre campos;
- foco tras errores;
- controles protegidos;
- estados asincrónicos;
- TalkBack durante el nuevo flujo.

Estas verificaciones todavía no se consideran realizadas para las nuevas pantallas.

## 18. Registro inicial de uso de inteligencia artificial

Durante la fase de análisis y planificación de Feature 011 se utilizó una herramienta de inteligencia artificial como apoyo.

Uso registrado:

- análisis de las guías académicas;
- revisión de continuidad con Feature 010;
- auditoría conceptual de navegación y estado;
- revisión del contrato de autenticación;
- análisis de roles;
- identificación de la diferencia entre `400` y `422`;
- identificación de la ausencia del endpoint de lugares;
- estructuración de la especificación SDD;
- planificación del orden de implementación;
- revisión de documentación Markdown.

Las propuestas de IA no se consideran verificadas por sí mismas.

Las decisiones técnicas deberán comprobarse mediante código, pruebas, ejecución real y revisión del repositorio.

Este registro se ampliará durante el desarrollo.

## 19. Modelo de sesión móvil

Durante Feature 011 se evolucionó el contrato de autenticación del cliente móvil para conservar la sesión completa devuelta por el backend.

Se definió `AuthSession` con:

- `accessToken`;
- `refreshToken`;
- `tokenType`;
- `expiresIn`;
- `usuario`.

El objeto `usuario` conserva:

- identificador;
- nombre;
- correo electrónico;
- rol autenticado.

`zamoraFestApi.login()` dejó de descartar los tokens y ahora devuelve la sesión autenticada completa.

La validación del contrato HTTP continúa siendo estricta. Una respuesta `200` que no incluya todos los campos requeridos de la sesión es rechazada como incompatible con el contrato esperado.

También se comprueba que únicamente se acepten los roles:

- `VISITANTE`;
- `ASISTENTE`;
- `ADMINISTRADOR`.

`LoginPage` consume la sesión completa, pero únicamente presenta en pantalla los datos seguros del usuario. Los tokens no se muestran en la interfaz.

Además, la pantalla reconoce tanto `400` como `422` como errores corregibles de los datos enviados.

Se actualizaron las pruebas:

- `src/services/api/auth-login-contract.test.ts`;
- `src/pages/LoginPage.test.tsx`;
- `src/pages/LoginPage.security.test.tsx`.

Las pruebas específicas del flujo de autenticación obtuvieron:

- 3 archivos de prueba aprobados;
- 10 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 12 archivos de prueba aprobados;
- 52 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente. Se mantienen advertencias no bloqueantes procedentes del procesamiento CSS de Ionic mediante LightningCSS y del tamaño de algunos chunks generados por Vite. Estas advertencias no impidieron la generación del build.

Para Semana 11, los tokens permanecen únicamente en memoria. Se verificó el código fuente móvil buscando:

- `localStorage`;
- `sessionStorage`;
- escritura de `accessToken`;
- escritura de `refreshToken`.

No se detectó persistencia de tokens mediante esos mecanismos.

El almacenamiento seguro y la recuperación persistente de sesión quedan reservados para la fase correspondiente de Semana 12.

Estado:

`COMPLETADO Y VERIFICADO`

## 20. Estado global de aplicación

Durante Feature 011 se implementó un estado global de aplicación basado en React Context y `useReducer`.

La aplicación incorpora:

- `ApplicationStateProvider`;
- `useApplicationState`;
- `applicationReducer`;
- estado inicial tipado;
- acciones explícitas para login, logout, destino pendiente y borrador de evento.

La sesión autenticada se conserva únicamente en memoria y contiene:

- usuario autenticado;
- rol;
- access token;
- refresh token;
- tipo de token;
- expiración.

El contexto expone de forma centralizada:

- `session`;
- `user`;
- `role`;
- `accessToken`;
- `refreshToken`;
- `pendingDestination`;
- `eventDraft`.

El inicio de sesión incorpora la sesión completa mediante la acción `LOGIN`.

El cierre de sesión mediante `LOGOUT` elimina:

- sesión;
- usuario;
- tokens;
- destino protegido pendiente;
- borrador del evento.

También se definió un estado compartido para conservar el destino protegido solicitado y poder utilizarlo posteriormente durante la navegación autenticada.

El borrador de creación de evento se mantiene como estado de aplicación para evitar pérdida de información durante la navegación entre pantallas.

Se diferenció explícitamente el estado efímero del estado de aplicación.

En `LoginPage` permanecen como estado efímero local:

- correo electrónico;
- contraseña;
- errores de campos;
- error de solicitud;
- estado de envío.

En el estado global permanecen:

- sesión;
- usuario;
- rol;
- tokens;
- destino protegido pendiente;
- borrador del evento.

`App.tsx` incorpora `ApplicationStateProvider` por encima de las rutas, permitiendo que las pantallas compartan el mismo estado de aplicación.

`LoginPage` dejó de conservar localmente el usuario autenticado. Después de una autenticación correcta, la sesión completa se incorpora al estado global mediante `login(session)`.

Se implementaron pruebas específicas para:

- reducer;
- login;
- logout;
- usuario y rol;
- tokens en memoria;
- destino pendiente;
- borrador de evento;
- integración de `LoginPage`;
- integración del provider con `App`.

La verificación específica del bloque obtuvo:

- 5 archivos de prueba aprobados;
- 17 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 14 archivos de prueba aprobados;
- 61 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente.

Se mantienen las advertencias no bloqueantes ya identificadas anteriormente relacionadas con:

- procesamiento de `:host-context` de Ionic mediante LightningCSS;
- tamaño de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build y no fueron introducidas por el estado global.

Estado:

`COMPLETADO Y VERIFICADO`

## 21. Estado remoto cerrado

Durante Feature 011 se implementó un modelo reusable y cerrado para representar operaciones remotas.

Se creó el tipo genérico:

`RemoteData<T, E>`

El modelo utiliza una unión discriminada mediante la propiedad `status` y contempla exclusivamente los estados:

- `idle`;
- `loading`;
- `success`;
- `error`.

Cada estado contiene únicamente la información válida para ese momento del flujo.

`idle` no contiene datos ni error.

`loading` no contiene datos ni error.

`success` contiene obligatoriamente los datos obtenidos.

`error` contiene obligatoriamente la información del error.

Esta estructura impide mediante TypeScript combinaciones contradictorias como:

- carga y error simultáneos;
- éxito sin datos;
- error con datos de éxito;
- estados booleanos independientes incompatibles entre sí.

También se implementaron funciones auxiliares:

- `remoteIdle`;
- `remoteLoading`;
- `remoteSuccess`;
- `remoteError`.

`ExploreEventsPage` fue migrada desde tres estados independientes:

- eventos;
- estado de carga;
- mensaje de error;

hacia un único:

`RemoteData<readonly Evento[], string>`

El flujo remoto de eventos quedó definido de la siguiente forma:

1. la consulta inicia en `loading`;
2. una respuesta válida produce `success`;
3. un fallo produce `error`;
4. los datos solo se consumen cuando el estado es `success`.

`AsyncStateView` continúa siendo el componente reutilizable encargado de representar visualmente:

- carga;
- error;
- ausencia de datos.

El filtro por categoría permanece como estado efímero local de `ExploreEventsPage`, ya que no forma parte del estado remoto.

Se implementaron pruebas para:

- estado `idle`;
- estado `loading`;
- estado `success`;
- estado `error`;
- discriminación del tipo;
- integración con `ExploreEventsPage`;
- integración con `AsyncStateView`.

La verificación específica obtuvo:

- 3 archivos de prueba aprobados;
- 12 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 15 archivos de prueba aprobados;
- 66 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente.

Se mantienen únicamente advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` de Ionic mediante LightningCSS;
- tamaño de algunos chunks de Vite.

Estas advertencias no impidieron la generación del build.

Estado:

`COMPLETADO Y VERIFICADO`

## 22. Infraestructura de protección de rutas

Durante Feature 011 se implementó la infraestructura de protección de navegación compatible con Ionic React Router y React Router 5.

Se incorporó `ProtectedRoute` como guard reutilizable para distinguir:

- usuario sin sesión;
- usuario autenticado;
- usuario autenticado con rol permitido;
- usuario autenticado sin el rol requerido.

Cuando no existe sesión, una ruta protegida genera una redirección hacia `/login` incluyendo el destino interno solicitado mediante el parámetro `redirect`.

Ejemplo:

`/gestion/eventos/nuevo`

se transforma en:

`/login?redirect=%2Fgestion%2Feventos%2Fnuevo`

Se implementó una capa específica de seguridad de rutas mediante:

- `sanitizeInternalAppDestination`;
- `sanitizeProtectedDestination`;
- `buildLoginRedirect`;
- `resolvePostLoginDestination`.

La validación no confía únicamente en que el destino comience con `/`.

También comprueba que:

- la ruta pertenezca a ZamoraFest;
- sea una ruta interna reconocida;
- las URLs absolutas externas sean rechazadas;
- las URLs protocol-relative sean rechazadas;
- las rutas desconocidas no se utilicen como destino de retorno.

De esta manera se evita una vulnerabilidad de redirección abierta.

También se implementó `LoginRoute`, responsable de integrar la pantalla de inicio de sesión con la navegación.

`LoginRoute`:

1. lee el parámetro `redirect`;
2. valida que corresponda a un destino protegido permitido;
3. conserva el destino en el estado global de aplicación;
4. ejecuta el flujo normal de login;
5. después de una autenticación correcta regresa al destino solicitado;
6. elimina el destino pendiente después de utilizarlo;
7. utiliza `/explore` como destino seguro cuando el retorno es inválido.

El flujo conserva además la política de autorización definida para ZamoraFest.

La ruta de creación de eventos requiere específicamente el rol:

`ASISTENTE`

Un usuario autenticado con un rol diferente no pierde su sesión.

La falta de rol:

- no ejecuta logout;
- no elimina usuario ni tokens;
- redirige hacia una pantalla pública segura.

Esta distinción prepara el tratamiento explícito de `403 Forbidden` que se completará en la fase correspondiente.

Se añadieron pruebas automatizadas para:

- aceptación de rutas internas reconocidas;
- conservación de query y hash;
- rechazo de URLs externas absolutas;
- rechazo de URLs protocol-relative;
- rechazo de rutas internas desconocidas;
- codificación del parámetro `redirect`;
- fallback seguro;
- redirección de usuario sin sesión;
- conservación del destino anidado;
- acceso con sesión;
- autorización específica de `ASISTENTE`;
- mantenimiento de sesión ante rol insuficiente;
- conservación del destino en estado global;
- retorno a `/gestion`;
- retorno a `/gestion/eventos/nuevo`;
- rechazo de redirect externo durante login.

La verificación específica del bloque obtuvo:

- 4 archivos de prueba aprobados;
- 20 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 18 archivos de prueba aprobados;
- 84 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas de:

- procesamiento de `:host-context` de Ionic mediante LightningCSS;
- tamaño de algunos chunks generados por Vite.

Las tareas `T089` y `T090` permanecen pendientes hasta registrar las rutas reales `/gestion` y `/gestion/eventos/nuevo` con `ManagementPage` y `CreateEventPage`.

Estado:

`INFRAESTRUCTURA COMPLETADA Y VERIFICADA; REGISTRO DE RUTAS FINALES PENDIENTE`

## 23. Evolución del login

Se auditó la evolución de `LoginPage` después de incorporar el estado global y la protección de rutas.

La pantalla de login utiliza actualmente `useApplicationState()` como fuente de autenticación.

Después de una autenticación correcta:

1. `zamoraFestApi.login()` devuelve la sesión completa;
2. `LoginPage` ejecuta `login(session)`;
3. la sesión completa se incorpora al estado global;
4. el usuario autenticado se deriva desde el contexto;
5. `LoginRoute` determina el destino seguro posterior al login.

La sesión almacenada contiene:

- access token;
- refresh token;
- tipo de token;
- expiración;
- usuario autenticado;
- rol.

`LoginPage` ya no utiliza un estado local independiente para representar al usuario autenticado.

Se conservaron las validaciones existentes del formulario mediante `validateLoginForm`.

También se conserva el manejo seguro de errores:

- `401` muestra un mensaje genérico de credenciales incorrectas;
- `400` y `422` solicitan corregir los datos;
- fallos de conexión no exponen detalles técnicos;
- los mensajes internos del backend no se presentan directamente al usuario.

El bloqueo de envíos duplicados continúa implementado mediante una referencia de solicitud activa, evitando ejecutar dos llamadas simultáneas de login.

El retorno posterior a la autenticación se implementa mediante `LoginRoute`.

El flujo:

1. lee el parámetro `redirect`;
2. valida que corresponda a una ruta interna protegida reconocida;
3. conserva el destino en el estado global;
4. realiza el login;
5. recupera el destino pendiente;
6. navega hacia el destino autorizado;
7. limpia el destino pendiente después de utilizarlo.

Si el parámetro de retorno es inválido o externo, se utiliza `/explore` como destino seguro.

Las pruebas existentes y actualizadas cubren:

- validación del formulario;
- login correcto;
- almacenamiento de sesión global;
- ausencia de tokens en la interfaz;
- credenciales incorrectas;
- errores `400`;
- errores `422`;
- fallos de conexión;
- bloqueo de doble envío;
- conservación del destino protegido;
- retorno a `/gestion`;
- retorno a `/gestion/eventos/nuevo`;
- rechazo de redirecciones externas;
- mantenimiento de sesión cuando el rol no es suficiente.

La última verificación funcional ejecutada antes de esta auditoría obtuvo:

- 18 archivos de prueba aprobados;
- 84 pruebas aprobadas;
- 0 pruebas fallidas;
- `npm run typecheck` correcto;
- `npm run lint` correcto;
- `npm run build` correcto.

No fue necesario introducir código adicional durante esta auditoría porque las tareas `T098` a `T105` ya estaban satisfechas por los incrementos anteriores.

Estado:

`COMPLETADO Y VERIFICADO`

## 24. Registro público de visitantes

Se implementó el flujo público de registro de visitantes de ZamoraFest.

La implementación se derivó del contrato real del backend:

`POST /api/v1/auth/register`

El cliente permite enviar exclusivamente:

- `nombre`;
- `email`;
- `password`.

No se permite enviar desde la aplicación móvil:

- rol;
- identificador de rol;
- estado;
- atributos administrativos;
- otros campos privilegiados.

La capa HTTP reconstruye explícitamente el cuerpo permitido antes de serializarlo, por lo que incluso si un objeto en tiempo de ejecución contiene propiedades adicionales, estas no son enviadas al backend.

Las reglas de validación fueron derivadas del contrato vigente:

- nombre obligatorio;
- nombre entre 2 y 100 caracteres después de aplicar `trim`;
- correo válido;
- correo máximo de 254 caracteres;
- correo normalizado mediante `trim` y conversión a minúsculas;
- contraseña con mínimo 8 caracteres;
- contraseña con máximo de 72 bytes UTF-8 debido al límite de bcrypt;
- contraseña preservada exactamente, sin aplicar `trim`.

Se incorporó `RegisterPage` como pantalla pública.

La ruta:

`/register`

se encuentra disponible sin autenticación.

La pantalla permite:

- ingresar nombre completo;
- ingresar correo electrónico;
- ingresar contraseña;
- validar los datos antes de realizar la solicitud;
- impedir solicitudes duplicadas mientras existe una operación activa;
- mostrar confirmación después de un registro correcto;
- regresar posteriormente al inicio de sesión.

El registro público utiliza:

`zamoraFestApi.register()`

La respuesta HTTP esperada es:

`201 Created`

y el cliente valida que el usuario devuelto tenga obligatoriamente:

`rol: VISITANTE`

Una respuesta de registro que intente devolver un rol privilegiado, como `ASISTENTE` o `ADMINISTRADOR`, es rechazada por la validación del contrato móvil.

También se implementó manejo comprensible de errores:

- `409` informa que el correo electrónico ya está registrado;
- `400` y `422` solicitan revisar los datos ingresados;
- fallos de conexión muestran un mensaje orientado al usuario;
- los detalles técnicos internos no se presentan en la interfaz.

Se añadieron pruebas para:

- normalización de nombre y correo;
- límites de longitud;
- validación de correo;
- contraseña mínima;
- límite de 72 bytes UTF-8;
- preservación exacta de la contraseña;
- llamada a `POST /api/v1/auth/register`;
- envío exclusivo de `nombre`, `email` y `password`;
- rechazo de campos privilegiados;
- aceptación exclusiva del rol `VISITANTE`;
- rechazo de respuestas con rol privilegiado;
- conservación de estados HTTP `409` y `422`;
- registro correcto desde `RegisterPage`;
- prevención de envío de formularios inválidos;
- tratamiento comprensible de correo duplicado;
- tratamiento de errores de validación;
- tratamiento de fallos de conexión;
- bloqueo de doble envío;
- disponibilidad pública de `/register`.

La verificación específica del bloque obtuvo:

- 4 archivos de prueba aprobados;
- 24 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 21 archivos de prueba aprobados;
- 106 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- `:host-context` de Ionic procesado mediante LightningCSS;
- tamaño de algunos chunks generados por Vite.

Estado:

`COMPLETADO Y VERIFICADO`

## 25. Separación de datos de eventos

Se introdujo una capa de repositorio para desacoplar la interfaz de exploración de la implementación HTTP.

Se definió el contrato:

`EventRepository`

con la operación:

`listEvents(): Promise<readonly Evento[]>`

La pantalla `ExploreEventsPage` ya no consume directamente `zamoraFestApi`.

La arquitectura resultante es:

`ExploreEventsPage`

→ `EventRepository`

→ `RemoteEventRepository`

→ `zamoraFestApi`

→ API REST

`zamoraFestApi` se mantiene como la capa HTTP de bajo nivel y continúa siendo responsable de:

- construir URLs;
- ejecutar solicitudes HTTP;
- validar respuestas del backend;
- conservar estados HTTP;
- representar errores de transporte.

`RemoteEventRepository` utiliza esa capa HTTP y expone a la interfaz únicamente datos de dominio y errores propios del repositorio.

Se incorporó `EventRepositoryError` con las categorías:

- `connection`;
- `server`;
- `request`;
- `unexpected`.

De esta manera, la pantalla ya no necesita conocer `ApiRequestError` ni detalles de transporte HTTP.

`ExploreEventsPage` fue migrada para utilizar:

`eventRepository.listEvents()`

Se conservaron sin cambios funcionales los comportamientos previamente validados de Feature 010:

- estado de carga;
- estado de error;
- estado vacío;
- listado de eventos;
- evento futuro más próximo destacado;
- filtrado por categoría;
- reutilización de `EventCard`;
- reutilización de `FilterChip`;
- reutilización de `ScreenHeader`;
- reutilización de `AsyncStateView`;
- estado remoto cerrado mediante `RemoteData`.

Los componentes reutilizables continúan sin conocer:

- endpoints;
- URLs;
- métodos HTTP;
- códigos de estado HTTP;
- cliente REST.

Se añadieron pruebas del repositorio remoto para comprobar:

- obtención de eventos mediante la capa HTTP;
- extracción únicamente de `data`;
- traducción de fallos de conexión;
- traducción de errores HTTP 5xx;
- traducción de errores HTTP no 5xx;
- encapsulamiento de errores inesperados.

Las pruebas de `ExploreEventsPage` fueron migradas para simular el repositorio y no la capa HTTP.

La verificación específica obtuvo:

- 2 archivos de prueba aprobados;
- 9 pruebas aprobadas;
- 0 pruebas fallidas.

Posteriormente se ejecutó la suite móvil completa:

- 22 archivos de prueba aprobados;
- 111 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

El build de producción finalizó correctamente.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- `:host-context` de Ionic procesado mediante LightningCSS;
- tamaño de algunos chunks generados por Vite.

La separación introducida prepara la aplicación para incorporar posteriormente almacenamiento local, estrategias local-first y sincronización sin acoplar las pantallas directamente al transporte HTTP.

Estado:

`COMPLETADO Y VERIFICADO`

## 26. Detalle público de eventos

Se implementó y verificó el detalle público de eventos correspondiente a las tareas `T121` a `T133` de Feature 011.

La navegación pública incorpora la ruta:

`/eventos/:id`

La pantalla asociada es:

`EventDetailPage`

La ruta puede abrirse directamente sin depender de una navegación previa desde otra pantalla.

La pantalla obtiene exclusivamente el parámetro:

`id`

desde la URL.

No se transporta el objeto completo `Evento` mediante estado de navegación, parámetros adicionales ni memoria temporal de la pantalla anterior.

La reconstrucción del detalle sigue el flujo:

`/eventos/:id`

→ `EventDetailPage`

→ `EventRepository`

→ `RemoteEventRepository`

→ `zamoraFestApi`

→ `GET /api/v1/eventos/:id`

De esta manera, una apertura directa de una dirección como:

`/eventos/7`

puede reconstruir el estado de la pantalla consultando el evento correspondiente mediante su identificador.

### Validación del identificador

El parámetro de ruta se valida antes de consultar el repositorio.

Se aceptan únicamente identificadores representados como enteros positivos canónicos.

La validación rechaza, entre otros:

- `0`;
- valores negativos;
- decimales;
- identificadores con cero inicial;
- representaciones no decimales;
- valores superiores al límite de `INTEGER` utilizado por PostgreSQL.

También se comprueba que el valor convertido sea un entero seguro de JavaScript.

Cuando el identificador de la ruta no es válido, la pantalla muestra un estado controlado y no realiza una solicitud al backend.

### Contrato HTTP

Se auditó el contrato vigente del backend para:

`GET /api/v1/eventos/:id`

La operación es pública.

La capa HTTP móvil incorporó:

`getEventoById(id)`

La respuesta se valida antes de entregarla al repositorio.

El contrato móvil fue además alineado con los campos nullable permitidos por el backend.

En particular:

- `descripcion` puede ser `null`;
- `fechaActualizacion` puede ser `null`.

Esta corrección evita rechazar respuestas válidas producidas por el backend.

### Repositorio de eventos

El contrato `EventRepository` fue ampliado con:

`getEventById(id)`

La implementación remota utiliza `zamoraFestApi` como capa HTTP de bajo nivel.

El repositorio conserva la separación arquitectónica establecida previamente:

`Pantalla`

→ `Repositorio`

→ `Capa HTTP`

→ `API REST`

Una respuesta HTTP `404` se transforma en ausencia de evento:

`null`

Esto permite que la interfaz represente el caso "evento no encontrado" como un estado funcional explícito y no como un fallo técnico genérico.

Los demás errores continúan encapsulados mediante `EventRepositoryError`.

### Estados de la pantalla

`EventDetailPage` representa de forma mutuamente excluyente:

- carga;
- error;
- evento no encontrado;
- éxito.

Para ello reutiliza el modelo cerrado:

`RemoteData`

y el componente visual:

`AsyncStateView`

El estado exitoso muestra información real del evento obtenida desde el repositorio, incluyendo:

- título;
- descripción cuando existe;
- fecha de inicio;
- fecha final;
- lugar;
- dirección referencial;
- cantón;
- costo;
- categorías;
- fuente de información cuando existe.

### Navegación desde exploración

`ExploreEventsPage` incorpora navegación hacia el detalle.

La navegación utiliza únicamente el identificador:

`/eventos/{id}`

Por ejemplo:

`/eventos/1`

No se transmite el objeto `Evento` completo entre pantallas.

`EventCard` permanece independiente de React Router.

El componente reutilizable continúa exponiendo únicamente una acción genérica:

`onAction`

Por tanto, `EventCard` no conoce:

- rutas;
- parámetros de URL;
- `useHistory`;
- `Route`;
- endpoints;
- cliente HTTP.

La decisión de navegación permanece en `ExploreEventsPage`.

### Pruebas específicas del área protegida

Se implementaron y actualizaron pruebas para comprobar:

- contrato HTTP de detalle;
- respuesta válida del backend;
- aceptación de campos nullable;
- conservación de HTTP `404`;
- obtención del evento mediante el repositorio;
- transformación de `404` en ausencia de evento;
- tratamiento de errores de servidor;
- estado de carga;
- estado de éxito;
- estado de evento no encontrado;
- estado de error;
- apertura directa de `/eventos/:id`;
- reconstrucción del evento únicamente mediante `id`;
- rechazo de identificadores inválidos;
- ausencia de consulta al backend para identificadores inválidos;
- navegación desde `ExploreEventsPage`;
- conservación de `EventCard` como componente independiente de rutas.

La verificación específica final obtuvo:

- 4 archivos de prueba aprobados;
- 20 pruebas aprobadas;
- 0 pruebas fallidas.

La prueba específica de navegación de `ExploreEventsPage` obtuvo adicionalmente:

- 1 archivo de prueba aprobado;
- 5 pruebas aprobadas;
- 0 pruebas fallidas.

### Verificación global móvil del área protegida

Después de completar el detalle público se ejecutó la suite móvil completa.

Resultado:

- 25 archivos de prueba aprobados;
- 127 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `git diff --check`.

El build de producción se ejecutó mediante:

`npm run build`

Resultado:

`PASS`

Vite transformó correctamente 249 módulos y finalizó el build de producción en aproximadamente 9 segundos.

Se mantienen únicamente advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del directorio `dist` y no fueron introducidas por el detalle público de eventos.

El bloque `T121` a `T133` queda funcionalmente implementado y automatizadamente verificado.

Estado:

`COMPLETADO Y VERIFICADO`

## 27. Área protegida

Se implementó y verificó el área protegida correspondiente a las tareas `T134` a `T141`, con excepción de `T139`, que permanecerá pendiente hasta existir el formulario real de creación de eventos.

También se completó `T089` al registrar y proteger efectivamente la ruta:

`/gestion`

La pantalla asociada es:

`ManagementPage`

### Protección de la ruta

La ruta `/gestion` utiliza el componente reutilizable:

`ProtectedRoute`

Cuando no existe sesión autenticada, el acceso a `/gestion` redirige hacia:

`/login?redirect=%2Fgestion`

Esto conserva el destino solicitado y permite que el flujo de login pueda retornar posteriormente al área protegida.

La infraestructura de protección no fue duplicada dentro de `ManagementPage`.

La pantalla depende del estado global ya implementado y no realiza comprobaciones paralelas de autenticación.

### Información de sesión

`ManagementPage` consume el estado global mediante:

`useApplicationState()`

La pantalla muestra únicamente información segura de la cuenta autenticada:

- nombre;
- correo electrónico;
- rol.

No muestra:

- access token;
- refresh token;
- credenciales;
- información sensible de autenticación.

Los roles se presentan de forma comprensible para el usuario:

- `VISITANTE` → Visitante;
- `ASISTENTE` → Asistente;
- `ADMINISTRADOR` → Administrador.

### Autorización de acciones

La interfaz respeta la política vigente de roles de ZamoraFest.

El rol:

`ASISTENTE`

es el único que visualiza la acción relacionada con creación de eventos.

El rol:

`ADMINISTRADOR`

no se interpreta como equivalente implícito de `ASISTENTE`.

Por tanto, tanto `VISITANTE` como `ADMINISTRADOR` permanecen sin la acción de creación específica de Asistente.

La acción "Crear evento" se mantiene temporalmente deshabilitada porque la ruta real:

`/gestion/eventos/nuevo`

y `CreateEventPage` todavía no se han implementado.

Esta decisión evita introducir navegación hacia una pantalla inexistente.

Por esta razón:

- `T139` permanece pendiente;
- `T090` permanece pendiente.

Ambas tareas se cerrarán cuando se implemente el formulario real de creación.

### Navegación disponible

La pantalla protegida permite navegar hacia:

`/explore`

mediante la acción:

`Explorar eventos`

Esta navegación no modifica la sesión autenticada.

### Cierre de sesión

`ManagementPage` incorpora la acción:

`Cerrar sesión`

El flujo utiliza la función global:

`logout()`

Después del cierre de sesión:

- la sesión en memoria queda eliminada;
- el usuario deja de estar autenticado;
- los tokens dejan de estar disponibles en el estado global;
- el destino pendiente y el borrador se limpian según el reducer vigente;
- la navegación regresa a `/login`.

La comprobación más amplia de acceso protegido posterior al logout se conservará también para las tareas específicas `T199` a `T205`.

### Pruebas específicas

Se añadieron pruebas de `ManagementPage` para comprobar:

- identidad del usuario autenticado;
- rol autenticado;
- acción de creación visible únicamente para `ASISTENTE`;
- acción de creación todavía deshabilitada;
- ausencia de la acción para `VISITANTE`;
- ausencia de la acción para `ADMINISTRADOR`;
- separación explícita entre `ADMINISTRADOR` y `ASISTENTE`;
- navegación hacia exploración;
- cierre de sesión;
- retorno al login.

También se actualizó `App.test.tsx` para comprobar que la ruta real:

`/gestion`

no muestra el área protegida cuando no existe sesión.

La infraestructura existente de `ProtectedRoute` continúa comprobando de forma específica la conservación exacta del destino:

`/login?redirect=%2Fgestion`

La verificación específica obtuvo:

- 3 archivos de prueba aprobados;
- 15 pruebas aprobadas;
- 0 pruebas fallidas.

### Verificación global móvil

Después de implementar el área protegida se ejecutó la suite móvil completa.

Resultado:

- 26 archivos de prueba aprobados;
- 134 pruebas aprobadas;
- 0 pruebas fallidas.

También se verificaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `git diff --check`.

El build de producción se ejecutó mediante:

`npm run build`

Resultado:

`PASS`

Vite transformó correctamente 252 módulos y completó el build de producción en aproximadamente 9 segundos.

Se mantienen únicamente advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build y no fueron introducidas por `ManagementPage`.

Estado:

`COMPLETADO Y VERIFICADO, EXCEPTO ACCESO REAL A CREACIÓN`

## 28. Datos auxiliares del formulario de Evento

Se implementó la infraestructura móvil necesaria para consultar los datos auxiliares que posteriormente consumirá el formulario de creación de eventos.

Este incremento corresponde a:

- `T142`: consulta móvil de categorías;
- `T143`: consulta móvil de lugares;
- `T148`: modelado de loading y error de datos auxiliares.

Las tareas `T144` a `T147` permanecen pendientes porque `CreateEventPage` todavía no ha sido implementada.

### Contratos HTTP de datos auxiliares

El cliente móvil incorporó las operaciones:

`GET /api/v1/categorias`

y:

`GET /api/v1/lugares`

mediante nuevos métodos de `ZamoraFestApi`:

- `getCategorias()`;
- `getLugares()`.

Ambas operaciones utilizan la infraestructura HTTP existente y validan en tiempo de ejecución la estructura recibida antes de exponerla al resto de la aplicación.

La consulta de categorías espera la estructura:

`CategoriasResponse`

con:

- identificador entero positivo;
- nombre;
- descripción anulable.

La consulta de lugares utiliza un contrato específico:

`LugarConsulta`

porque la representación entregada por `GET /api/v1/lugares` no es idéntica al objeto `Lugar` incluido en el detalle de un evento.

`LugarConsulta` conserva únicamente los campos realmente expuestos por ese endpoint:

- identificador;
- nombre;
- tipo de lugar;
- dirección referencial anulable;
- sector;
- parroquia;
- cantón;
- provincia.

Esta separación evita asumir propiedades que el endpoint auxiliar no devuelve.

### Repositorio de datos auxiliares

Se incorporó:

`EventFormDataRepository`

como abstracción para los datos requeridos por el futuro formulario.

Su implementación remota:

`RemoteEventFormDataRepository`

consulta categorías y lugares mediante la capa HTTP y devuelve una estructura única:

`EventFormData`

compuesta por:

- categorías;
- lugares.

Las dos consultas se ejecutan mediante:

`Promise.all`

sin introducir identificadores fijos en esta capa.

El repositorio traduce los fallos HTTP hacia errores propios del dominio:

- `connection`;
- `server`;
- `request`;
- `unexpected`.

De esta forma, la futura pantalla no necesitará depender directamente de `ApiRequestError`.

### Estado remoto de datos auxiliares

Se incorporó:

`useEventFormData`

para conectar posteriormente el formulario con el repositorio.

El hook utiliza el tipo cerrado `RemoteData` ya construido en Feature 011 y representa de forma excluyente:

- `loading`;
- `success`;
- `error`.

También proporciona una acción:

`reload()`

para repetir la consulta cuando sea necesario.

El mensaje presentado al usuario distingue al menos:

- fallo de conexión;
- indisponibilidad del servidor;
- fallo general de carga.

Esta implementación mantiene la dirección arquitectónica prevista:

`Pantalla -> repositorio -> API`

y evita que la futura `CreateEventPage` tenga que consultar directamente el cliente HTTP.

### Pruebas específicas de datos auxiliares

Se añadieron pruebas para:

`event-form-data-contract.test.ts`

que verifican:

- solicitud GET de categorías;
- solicitud GET de lugares;
- aceptación de `direccionReferencial` nula;
- rechazo de identificadores inválidos;
- rechazo de jerarquías territoriales incompletas.

También se verificó:

`remote-event-form-data-repository.test.ts`

para comprobar:

- carga conjunta de categorías y lugares;
- traducción de fallos de conexión;
- traducción de errores `5xx`;
- encapsulamiento de errores inesperados.

Finalmente:

`use-event-form-data.test.ts`

comprueba:

- estado inicial `loading`;
- transición a `success`;
- transición a `error` con mensaje comprensible.

Resultado de la verificación específica:

- 3 archivos de prueba aprobados;
- 11 pruebas aprobadas;
- 0 pruebas fallidas.

También finalizaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `git diff --check`.

### Verificación global tras datos auxiliares

Después de integrar este incremento se ejecutó la suite móvil completa.

Resultado:

- 29 archivos de prueba aprobados;
- 145 pruebas aprobadas;
- 0 pruebas fallidas.

No se produjo ninguna regresión respecto de las funcionalidades móviles previamente verificadas.

Posteriormente se ejecutó:

`npm run build`

El comando incluye:

`tsc --noEmit && vite build`

Resultado:

`PASS`

Vite transformó correctamente 252 módulos y completó el build de producción en aproximadamente 9 segundos.

Se mantienen únicamente advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build y no fueron introducidas por la infraestructura de datos auxiliares.

Estado:

`COMPLETADO Y VERIFICADO PARA T142, T143 Y T148`

### Límites de este incremento

Todavía no se declara completado:

- `T144`: cargar categorías reales en el formulario;
- `T145`: cargar lugares reales en el formulario;
- `T146`: evitar IDs de categorías incrustados en el formulario;
- `T147`: evitar `lugarId` incrustado en el formulario.

Estas tareas requieren la existencia real de:

`CreateEventPage`

y se comprobarán cuando el formulario utilice los datos auxiliares implementados en este incremento.

Tampoco se cierran todavía:

- `T090`;
- `T139`.

Ambas dependen de la ruta real:

`/gestion/eventos/nuevo`.

## 29. Formulario protegido de creación de Evento

Se implementó la primera versión funcional de la pantalla de creación de eventos.

Este incremento cierra:

- `T090`;
- `T139`;
- `T144` a `T147`;
- `T149` a `T159`.

La operación HTTP de creación todavía no forma parte de este incremento, por lo que `T160`, `T161` y `T162` permanecen pendientes.

### Ruta protegida de creación

Se registró la ruta:

`/gestion/eventos/nuevo`

mediante `ProtectedRoute`.

La ruta requiere explícitamente:

`ASISTENTE`

como rol autorizado.

Cuando no existe sesión, la infraestructura vigente conserva el destino solicitado y redirige al login.

Cuando existe una sesión cuyo rol no es `ASISTENTE`, la ruta no presenta el formulario protegido.

Esta implementación mantiene separados los roles:

- `ASISTENTE`;
- `VISITANTE`;
- `ADMINISTRADOR`.

El rol `ADMINISTRADOR` no se interpreta como equivalente implícito de `ASISTENTE`.

### Acceso desde el área de gestión

`ManagementPage` habilita ahora la acción:

`Crear evento`

únicamente cuando el usuario autenticado posee el rol:

`ASISTENTE`.

La acción navega hacia:

`/gestion/eventos/nuevo`.

Para `VISITANTE` y `ADMINISTRADOR` la acción de creación no se muestra.

Con ello se completa el acceso real que anteriormente permanecía deshabilitado.

### CreateEventPage

Se creó:

`CreateEventPage`

como pantalla protegida dedicada a la captura de los datos principales de un evento.

La pantalla reutiliza:

- `ScreenHeader`;
- `PrimaryButton`;
- `AsyncStateView`;
- estado global de aplicación;
- `useEventFormData`.

No se introdujo acceso HTTP directo desde la página.

La dirección arquitectónica se mantiene como:

`Pantalla -> hook/repositorio -> API`.

### Datos auxiliares reales

El formulario consume las categorías y los lugares cargados mediante la infraestructura implementada previamente.

Las categorías proceden de:

`GET /api/v1/categorias`.

Los lugares proceden de:

`GET /api/v1/lugares`.

El formulario no contiene identificadores fijos de categorías ni un `lugarId` incrustado.

Los identificadores utilizados en el borrador proceden exclusivamente de los objetos recuperados desde el backend.

Si no existe al menos una categoría o un lugar activo, el formulario no se presenta como utilizable y muestra un estado vacío específico.

Si la consulta de datos auxiliares falla, se presenta un estado de error con acción de reintento.

### Campos implementados

La pantalla incorpora los campos exigidos por el contrato de creación:

- título;
- descripción;
- fecha y hora de inicio;
- fecha y hora de fin;
- costo referencial;
- lugar;
- selección múltiple de categorías;
- fuente de información.

Los valores se almacenan en el borrador compartido:

`eventDraft`.

Todavía no se aplican en esta fase las reglas completas de validación previstas para `T163` a `T177`.

### Campos controlados por servidor

La pantalla no expone controles para propiedades administradas por el backend.

Entre ellas:

- `estadoEvento`;
- `estadoRevision`;
- usuario creador;
- usuario revisor;
- fecha de creación;
- fecha de actualización;
- fecha de revisión.

Estas propiedades continuarán siendo responsabilidad exclusiva del servidor.

### Estado de envío

El botón principal:

`Crear evento`

permanece temporalmente deshabilitado.

Esta decisión es intencional porque todavía no se ha implementado:

- `POST /api/v1/eventos`;
- adjunto del access token;
- estado remoto de creación.

Estas responsabilidades corresponden a `T160`, `T161` y `T162`.

### Pruebas específicas del formulario protegido

Se creó:

`CreateEventPage.test.tsx`

con comprobaciones para:

- estado loading;
- carga de campos;
- uso de lugares reales;
- uso de categorías reales;
- actualización del borrador con IDs obtenidos del repositorio;
- ausencia de campos controlados por servidor;
- estado vacío;
- reintento después de error.

También se actualizó:

`ManagementPage.test.tsx`

para comprobar:

- acceso a creación para `ASISTENTE`;
- ausencia de la acción para `VISITANTE`;
- ausencia de la acción para `ADMINISTRADOR`;
- navegación hacia la ruta del formulario.

`App.test.tsx` comprueba además que la ruta real:

`/gestion/eventos/nuevo`

permanece protegida cuando no existe sesión.

Las pruebas existentes de:

`ProtectedRoute`

continúan verificando:

- conservación del destino anidado;
- acceso del rol `ASISTENTE`;
- rechazo de roles no autorizados sin destruir la sesión.

Resultado de la verificación específica:

- 4 archivos de prueba aprobados;
- 22 pruebas aprobadas;
- 0 pruebas fallidas.

También finalizaron correctamente:

- `npm run typecheck`;
- `npm run lint`;
- `git diff --check`.

### Verificación global después del formulario

Después de integrar la pantalla y la ruta se ejecutó la suite móvil completa.

Resultado:

- 30 archivos de prueba aprobados;
- 152 pruebas aprobadas;
- 0 pruebas fallidas.

No se detectaron regresiones respecto de las funcionalidades previamente verificadas.

Posteriormente se ejecutó:

`npm run build`

El comando incluye:

`tsc --noEmit && vite build`

Resultado:

`PASS`

Vite transformó correctamente 257 módulos y completó el build de producción en aproximadamente 10 segundos.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build.

Estado:

`COMPLETADO Y VERIFICADO PARA T090, T139, T144-T147 Y T149-T159`

## 30. Creación protegida de eventos

Se completó el flujo de creación remota correspondiente a `T160`, `T161` y `T162`.

### Implementación de validaciones del Evento

La capa API móvil incorpora la operación:

`POST /api/v1/eventos`

La solicitud utiliza autenticación mediante:

`Authorization: Bearer <accessToken>`

El access token se obtiene de la sesión mantenida en el estado global de la aplicación y no se encuentra incrustado en el código.

El cuerpo enviado al backend se reconstruye explícitamente antes de realizar la solicitud y contiene únicamente los campos permitidos por el contrato:

- `titulo`;
- `descripcion`;
- `fechaInicio`;
- `fechaFin`;
- `costoReferencial`;
- `lugarId`;
- `categoriaIds`;
- `fuenteInformacion`.

No se envían campos controlados por el servidor como:

- `estadoEvento`;
- `estadoRevision`;
- `usuarioCreador`;
- fechas de creación o revisión.

Se incorporó una capa de repositorio específica para la creación de eventos. Esta capa desacopla la pantalla del cliente HTTP y traduce los errores remotos a errores propios del dominio móvil.

El flujo de creación utiliza `RemoteData` para representar los estados cerrados:

- `idle`;
- `loading`;
- `success`;
- `error`.

`CreateEventPage` utiliza el borrador mantenido en el estado de aplicación, construye la solicitud y delega la creación al repositorio mediante `useEventCreation`.

Durante la operación se muestra el estado de carga con el texto `Creando evento...`. Cuando la creación finaliza correctamente se presenta el evento creado y su identificador. Ante un error remoto se conserva el formulario y se informa el fallo sin eliminar los datos introducidos.

La limpieza definitiva del borrador después de una creación exitosa no se implementa todavía, ya que corresponde a una tarea posterior del plan.

### Verificación específica

Se ejecutaron las pruebas correspondientes a:

- contrato HTTP de creación;
- repositorio remoto de creación;
- formulario de creación existente;
- integración del formulario con la creación remota.

Resultado:

`4 archivos de prueba aprobados`

`15 pruebas aprobadas`

Las pruebas verifican, entre otros aspectos:

- uso de `POST /api/v1/eventos`;
- envío del encabezado Bearer;
- reconstrucción segura del cuerpo;
- exclusión de propiedades controladas por el servidor;
- propagación del access token desde la sesión;
- transición al estado `loading`;
- representación de `success`;
- representación de `error`;
- conservación del formulario después de un rechazo remoto.

### Verificación global

Se ejecutó la suite completa del cliente móvil.

Resultado:

`33 archivos de prueba aprobados`

`161 pruebas aprobadas`

También se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

Se ejecutó:

`npm run lint`

Resultado:

`PASS`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite transformó correctamente 260 módulos y completó el build de producción en aproximadamente 11 segundos.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build.

También se ejecutó:

`git diff --check`

Resultado:

`PASS`

Estado:

`COMPLETADO Y VERIFICADO PARA T160-T162`

## 31. Validaciones móviles del formulario de Evento

Se completaron las validaciones móviles correspondientes a `T163` hasta `T177`.

### Implementación realizada

Se incorporó una capa de validación independiente para el borrador de creación de eventos mediante `validateEventCreateDraft`.

Esta función constituye la única fuente de verdad para validar y normalizar los datos antes de construir `CreateEventoRequest`.

Las reglas implementadas se mantienen alineadas con el contrato actual del backend:

- título obligatorio;
- título con máximo de 200 caracteres;
- fecha y hora de inicio obligatoria y válida;
- fecha final obligatoria y válida;
- fecha final estrictamente posterior a la fecha inicial;
- costo referencial obligatorio;
- costo no negativo;
- costo máximo de `99_999_999.99`;
- máximo de dos decimales en el costo;
- lugar con identificador entero positivo;
- al menos una categoría;
- identificadores de categorías válidos;
- rechazo de categorías duplicadas;
- fuente de información opcional;
- fuente de información con máximo de 500 caracteres;
- descripción y fuente opcionales normalizadas a `null` cuando están vacías.

Cuando descripción o fuente contienen únicamente espacios después de haber sido proporcionadas, la validación las rechaza para mantener coherencia con el contrato del backend.

### Validación durante la interacción

`CreateEventPage` ejecuta validaciones al abandonar los campos cuando corresponde.

Los errores se representan junto al campo relacionado y se enlazan mediante atributos de accesibilidad:

- `aria-invalid`;
- `aria-describedby`;
- mensajes con `role="alert"`.

Cuando el usuario modifica nuevamente un campo se elimina el error local correspondiente para permitir una nueva validación.

La relación entre fecha inicial y fecha final también se vuelve a comprobar cuando cambia o se abandona alguno de los campos relacionados.

### Validación completa al enviar

Antes de invocar el repositorio de creación se ejecuta una validación completa del borrador.

Si existe al menos un error:

- no se ejecuta `POST /api/v1/eventos`;
- no se llama al repositorio de creación;
- se muestran los mensajes específicos de los campos inválidos;
- se conservan los valores introducidos por el usuario.

Si el formulario es válido, la misma función de validación devuelve el objeto `CreateEventoRequest` normalizado que se entrega al flujo de creación remota.

De esta manera se eliminó la construcción manual duplicada de la solicitud dentro de `CreateEventPage`.

### Presentación visual

Los controles inválidos utilizan el token semántico existente:

`--zf-color-error`

No se incorporaron colores independientes del sistema visual.

La presentación conserva compatibilidad con los modos claro y oscuro definidos en los tokens de diseño de Semana 10.

### Pruebas específicas de validación

Se añadieron pruebas puras para `validateEventCreateDraft`.

Resultado:

`16 pruebas aprobadas`

Estas pruebas cubren:

- normalización de un borrador válido;
- título obligatorio;
- máximo de caracteres del título;
- fecha inicial vacía o inválida;
- fecha final obligatoria;
- fecha final inválida;
- rango incorrecto de fechas;
- costo vacío;
- costo negativo;
- costo con más de dos decimales;
- costo superior al máximo permitido;
- lugar inválido;
- ausencia de categorías;
- categorías duplicadas;
- identificadores de categoría inválidos;
- campos opcionales;
- longitud de fuente de información;
- cadenas compuestas únicamente por espacios.

También se añadieron pruebas de interacción de `CreateEventPage`.

Resultado:

`4 pruebas aprobadas`

Estas pruebas verifican:

- validación del título al abandonar el campo;
- validación del costo al abandonar el campo;
- validación de la relación entre fecha inicial y fecha final;
- validación completa al enviar;
- mensajes específicos por campo;
- atributos de accesibilidad;
- ausencia de llamadas al repositorio cuando el formulario es inválido.

Se volvieron a ejecutar las pruebas de creación remota existentes para comprobar que las nuevas validaciones no rompieran el flujo previamente implementado.

### Verificación focalizada

Resultado conjunto:

`3 archivos de prueba aprobados`

`22 pruebas aprobadas`

### Verificación global de T163-T177

Se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

Se ejecutó:

`npm run lint`

Resultado:

`PASS`

Se ejecutó la suite completa:

`npm test`

Resultado:

`35 archivos de prueba aprobados`

`180 pruebas aprobadas`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite transformó correctamente 261 módulos y completó el build de producción en aproximadamente 10 segundos.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build.

También se ejecutó:

`git diff --check`

Resultado:

`PASS`

Estado:

`COMPLETADO Y VERIFICADO PARA T163-T177`

## 32. Mapeo estructurado de errores HTTP 422

Se completó el flujo móvil para conservar, interpretar y presentar los errores estructurados de validación devueltos por el backend durante la creación de eventos.

### Contrato HTTP conservado en el móvil

`ApiRequestError` fue extendido para conservar, además del estado HTTP, un cuerpo estructurado compatible con el contrato de error de ZamoraFest.

La estructura conservada contiene:

- `error.code`;
- `error.message`;
- `error.details` cuando existe.

Cuando una respuesta HTTP no es exitosa, `requestJson` intenta leer el cuerpo JSON antes de lanzar el error.

El cuerpo únicamente se conserva como error estructurado cuando contiene los campos mínimos esperados:

- `error.code` como cadena;
- `error.message` como cadena.

Las respuestas no JSON o con una estructura diferente siguen conservando el estado HTTP, pero su cuerpo estructurado se representa como `null`.

Con esto se evita confiar en datos remotos no validados y se mantiene compatibilidad con los errores HTTP previamente soportados.

### Interpretación de VALIDATION_ERROR

El repositorio remoto de creación de eventos interpreta el código:

`VALIDATION_ERROR`

Cuando el backend devuelve este código, se conservan los elementos válidos de `details`.

Cada detalle aceptado debe contener:

- `path` como cadena;
- `message` como cadena.

La información se propaga mediante `EventCreateRepositoryError`, que ahora conserva:

- tipo de error;
- estado HTTP;
- código remoto;
- detalles estructurados de validación.

Los fallos de conexión, servidor, autorización y errores inesperados mantienen su clasificación anterior.

### Asociación de rutas del backend con el formulario

Se añadió `mapEventCreateServerValidation` para transformar los errores estructurados del backend en errores visibles dentro del formulario de creación.

Las rutas reconocidas son:

- `titulo`;
- `descripcion`;
- `fechaInicio`;
- `fechaFin`;
- `costoReferencial`;
- `lugarId`;
- `categoriaIds`;
- `fuenteInformacion`.

Para rutas indexadas, por ejemplo:

`categoriaIds.0`

se utiliza el primer segmento de la ruta y el mensaje se asocia al campo `categoriaIds`.

De esta forma los errores de elementos concretos del arreglo de categorías se muestran junto al grupo de categorías del formulario.

Los mensajes recibidos desde el backend se reutilizan directamente como mensajes del campo correspondiente.

### Errores no asociados a un campo

Cuando `details[].path` no corresponde a ninguno de los campos editables del formulario, el mensaje se conserva como error general.

Por ejemplo, una ruta como:

`estadoEvento`

no se fuerza artificialmente sobre ningún control del formulario.

Cuando existen varios mensajes generales se eliminan duplicados y se presentan conjuntamente.

Si el backend devuelve `422 VALIDATION_ERROR` sin detalles utilizables, se presenta el mensaje general:

`La solicitud contiene datos inválidos.`

### Integración con CreateEventPage

`useEventCreation` conserva ahora el `EventCreateRepositoryError` asociado al último fallo remoto.

`CreateEventPage` utiliza ese error para:

- mantener los mensajes generales del estado remoto;
- aplicar errores de servidor a los campos correspondientes;
- conservar los valores introducidos por el usuario;
- mantener los atributos `aria-invalid`;
- conservar los vínculos `aria-describedby`;
- evitar eliminar el borrador ante un `422`.

La validación local continúa ejecutándose antes del envío.

La validación del backend actúa como segunda barrera cuando la solicitud alcanza el servidor.

### Pruebas específicas de T178-T183

Se añadieron pruebas del cuerpo HTTP estructurado para comprobar:

- conservación de `code`;
- conservación de `message`;
- conservación de `details`;
- rechazo seguro de cuerpos JSON incompatibles;
- compatibilidad con respuestas HTTP que no contienen JSON válido.

También se ampliaron las pruebas del repositorio remoto para comprobar:

- propagación de `VALIDATION_ERROR`;
- conservación del estado `422`;
- lectura de `details[].path`;
- conservación de los mensajes específicos del backend.

Se añadieron pruebas específicas para `mapEventCreateServerValidation` que verifican:

- asociación directa de errores a campos;
- asociación de rutas indexadas como `categoriaIds.0`;
- conversión de rutas desconocidas en error general;
- rechazo del mapeo cuando el error no corresponde a `422 VALIDATION_ERROR`.

Las pruebas de `CreateEventPage` también verifican que los errores `422`:

- aparezcan junto al campo correcto;
- mantengan `aria-invalid`;
- presenten mensajes generales cuando corresponda;
- conserven el contenido del formulario.

### Verificación focalizada de T178-T183

Se ejecutó el conjunto específico de pruebas relacionadas con esta fase.

Resultado:

`5 archivos de prueba aprobados`

`20 pruebas aprobadas`

También se ejecutaron:

`npm run typecheck`

Resultado:

`PASS`

`npm run lint`

Resultado:

`PASS`

`git diff --check`

Resultado:

`PASS`

### Verificación global de T178-T183

Se ejecutó nuevamente la suite completa mediante:

`npm test`

Resultado:

`37 archivos de prueba aprobados`

`189 pruebas aprobadas`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite transformó correctamente 262 módulos y completó el build de producción en aproximadamente 12.31 segundos.

Se mantienen únicamente las advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- tamaño superior a 500 kB de algunos chunks generados por Vite.

Estas advertencias no impidieron la generación del build.

Estado:

`COMPLETADO Y VERIFICADO PARA T178-T183`

## 33. Tratamiento diferenciado de HTTP 401 y 403

Se completó el tratamiento móvil diferenciado de fallos de autenticación y autorización durante operaciones protegidas.

La implementación reutiliza el estado global, el repositorio de creación, el guard de rutas y el mecanismo de retorno post-login ya incorporados anteriormente en Feature 011.

No se creó un segundo sistema de autenticación ni una navegación paralela.

### Invalidación de sesión distinta de logout

El estado global incorpora la transición:

`INVALIDATE_SESSION`

Esta operación elimina únicamente la sesión autenticada.

Como consecuencia dejan de estar disponibles en memoria:

- usuario autenticado;
- rol;
- access token;
- refresh token.

La invalidación no elimina:

- destino protegido pendiente;
- borrador de creación del evento.

Esta separación evita utilizar `LOGOUT` para representar un token de acceso inválido.

El logout continúa representando el cierre explícito de sesión y conserva su responsabilidad independiente.

### Flujo HTTP 401

`useEventCreation` conserva el `EventCreateRepositoryError` recibido desde el repositorio.

Cuando el error posee:

`status === 401`

se ejecuta:

`invalidateSession()`

La lógica de navegación no se duplicó dentro de la página de creación.

Al quedar la sesión en `null`, el `ProtectedRoute` existente vuelve a evaluar la ruta protegida y utiliza el mecanismo previamente implementado para dirigir al usuario hacia login.

Para:

`/gestion/eventos/nuevo`

el retorno seguro se expresa mediante:

`/login?redirect=%2Fgestion%2Feventos%2Fnuevo`

`LoginRoute` utiliza el destino interno validado para permitir regresar después de una nueva autenticación correcta.

La invalidación conserva el borrador para evitar eliminar el trabajo introducido por el usuario únicamente porque el access token dejó de ser válido.

No se incorporó renovación automática mediante refresh token en esta fase, ya que esa responsabilidad corresponde al endurecimiento del cliente HTTP previsto posteriormente.

### Flujo HTTP 403

Cuando la operación protegida devuelve:

`status === 403`

no se ejecuta invalidación de sesión.

Se conservan:

- sesión;
- usuario;
- rol;
- access token;
- refresh token;
- destino pendiente;
- borrador del evento.

El estado remoto presenta el mensaje:

`La sesión no tiene permisos para crear eventos.`

El usuario no es enviado al login y no se ejecuta logout.

De esta forma `401` y `403` representan comportamientos diferentes tanto en estado como en navegación.

### Reutilización de infraestructura existente

Para completar T184-T192 se reutilizaron:

- `ApplicationStateContext`;
- `applicationReducer`;
- `useEventCreation`;
- `EventCreateRepositoryError`;
- `ProtectedRoute`;
- `buildLoginRedirect`;
- `LoginRoute`;
- `pendingDestination`;
- estado compartido del borrador.

No fue necesario modificar:

- backend;
- contrato HTTP de `zamoraFestApi`;
- repositorio remoto de creación;
- `CreateEventPage`;
- `ProtectedRoute`;
- `LoginRoute`;
- `route-security`.

La única nueva responsabilidad añadida al flujo de creación es invalidar la sesión cuando el repositorio comunica realmente un `401`.

### Pruebas de estado

Las pruebas de `applicationReducer` verifican que `INVALIDATE_SESSION`:

- elimina la sesión;
- conserva el destino protegido pendiente;
- conserva el borrador.

Las pruebas de `ApplicationStateContext` verifican que después de invalidar la autenticación:

- `session` es `null`;
- `user` es `null`;
- `role` es `null`;
- `accessToken` es `null`;
- `refreshToken` es `null`;
- el destino protegido continúa disponible;
- el borrador continúa disponible.

### Pruebas específicas de autorización

Se añadió:

`use-event-creation.authorization.test.tsx`

Resultado:

`2 pruebas aprobadas`

Los casos comprueban de manera diferenciada:

#### Respuesta 401

- propagación de `status = 401`;
- conservación de `INVALID_ACCESS_TOKEN`;
- invalidación de autenticación;
- eliminación de los tokens en memoria;
- conservación del destino;
- conservación del borrador.

#### Respuesta 403

- propagación de `status = 403`;
- conservación de `FORBIDDEN`;
- mantenimiento de la sesión;
- mantenimiento de usuario y rol;
- mantenimiento de access token y refresh token;
- mantenimiento del borrador;
- mensaje comprensible de permiso insuficiente;
- ausencia de invalidación automática.

### Verificación integrada de navegación y autorización

También se ejecutaron conjuntamente las pruebas existentes de:

- `application-state`;
- `ApplicationStateContext`;
- `useEventCreation`;
- `ProtectedRoute`;
- `LoginRoute`.

Resultado:

`23 pruebas aprobadas`

Estas pruebas verifican conjuntamente las responsabilidades utilizadas por el flujo:

- invalidación de sesión;
- protección de rutas;
- construcción del redirect seguro;
- conservación del destino;
- retorno después de login;
- mantenimiento de sesión cuando no corresponde invalidarla.

### Verificación focalizada final

Se ejecutó nuevamente:

`npm run typecheck`

Resultado:

`PASS`

También se ejecutaron conjuntamente:

- `ApplicationStateContext.test.tsx`;
- `use-event-creation.authorization.test.tsx`.

Resultado:

`2 archivos de prueba aprobados`

`7 pruebas aprobadas`

### Verificación global de T184-T192

Se ejecutó:

`npm test`

Resultado:

`38 archivos de prueba aprobados`

`193 pruebas aprobadas`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite:

- versión `8.2.2`;
- transformó correctamente `262` módulos;
- completó el build de producción en aproximadamente `24.84 s`.

Se mantienen las advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` procedente del CSS de Ionic mediante LightningCSS;
- chunks superiores a 500 kB después de minificación.

Las advertencias no impidieron la generación del build.

También se ejecutó:

`git diff --check`

Resultado:

`PASS`

Estado:

`COMPLETADO Y VERIFICADO PARA T184-T192`

## 34. Preservación del borrador T193-T198

Se completó y verificó la preservación del borrador de creación de eventos durante la misma ejecución de la aplicación.

La implementación reutiliza el estado global existente y no introduce una segunda fuente de verdad.

### Estado de aplicación para T193-T198

`eventDraft` ya forma parte de `ApplicationState`.

`CreateEventPage` utiliza directamente:

- `eventDraft`;
- `updateEventDraft()`.

Los campos del formulario escriben sobre ese estado compartido.

No se incorporó `localStorage`, base de datos local ni otro mecanismo de persistencia durante Feature 011.

### Navegación y recuperación

Se añadió una prueba específica de navegación:

`CreateEventPage.draft-navigation.test.tsx`

El caso comprobado:

1. abre `/gestion/eventos/nuevo`;
2. ingresa un título;
3. selecciona un lugar real del repositorio de prueba;
4. selecciona una categoría;
5. navega hacia `/gestion`;
6. regresa a `/gestion/eventos/nuevo`;
7. verifica que título, lugar y categoría continúan presentes.

De esta forma se comprueba que desmontar y volver a montar la pantalla no elimina el borrador mientras `ApplicationStateProvider` continúa activo.

### Limpieza después de creación exitosa

`useEventCreation` reutiliza `clearEventDraft()`.

La limpieza se ejecuta únicamente después de que el repositorio devuelve un Evento creado correctamente y el estado remoto pasa a `success`.

Una creación fallida no limpia el borrador.

Esto permite corregir datos o reintentar sin perder el contenido introducido.

### Comportamiento ante logout

El reducer ya define que `LOGOUT` restablece:

- sesión;
- destino pendiente;
- `eventDraft`.

La prueba existente de `applicationReducer` confirma que el cierre explícito de sesión devuelve el estado al `initialApplicationState`.

Este comportamiento se mantiene separado de `INVALIDATE_SESSION`, que conserva el borrador cuando la autenticación deja de ser válida por un `401`.

### Pruebas específicas de preservación del borrador

Se añadieron:

- `use-event-creation.draft.test.tsx`;
- `CreateEventPage.draft-navigation.test.tsx`.

Las pruebas verifican:

- limpieza del borrador después de creación exitosa;
- conservación del borrador ante fallo remoto;
- conservación durante navegación;
- recuperación al regresar al formulario.

También se mantuvieron las pruebas existentes de:

- `application-state`;
- `ApplicationStateContext`;
- autorización `401` y `403`.

### Verificación focalizada de T199-T205

Se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

Se ejecutó:

`npm run lint`

Resultado:

`PASS`

Se ejecutaron conjuntamente cinco archivos de prueba relacionados con estado, autorización, creación y navegación del borrador.

Resultado:

`5 archivos de prueba aprobados`

### Verificación global de T193-T198

La suite móvil completa se ejecutó dos veces después del cambio.

Resultado en ambas ejecuciones:

`40 archivos de prueba aprobados`

`196 pruebas aprobadas`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite:

- versión `8.2.2`;
- `262` módulos transformados;
- build final completado en aproximadamente `8.64 s`.

Persisten las advertencias no bloqueantes ya conocidas relacionadas con:

- `:host-context` durante la minificación del CSS de Ionic;
- chunks superiores a `500 kB` después de minificación.

Estas advertencias no impidieron la generación del build.

También se ejecutó:

`git diff --check`

Resultado:

`PASS`

Estado:

`COMPLETADO Y VERIFICADO PARA T193-T198`

## 35. Logout T199-T205

Se completó y verificó el flujo de cierre explícito de sesión de Feature 011.

La auditoría previa confirmó que el comportamiento de producción ya existía y no requería duplicar lógica.

### Estado de aplicación para T199-T205

`applicationReducer` define `LOGOUT` restableciendo:

- `session` a `null`;
- `pendingDestination` a `null`;
- `eventDraft` a `initialEventDraft`.

Como `ApplicationStateContext` deriva de `session` los valores:

- `user`;
- `role`;
- `accessToken`;
- `refreshToken`;

todos dejan de estar disponibles después del logout.

### Flujo de interfaz

`ManagementPage` ejecuta:

`logout()`

y posteriormente navega mediante:

`history.replace('/login')`

De esta forma el cierre voluntario de sesión elimina el estado autenticado y lleva al usuario a la pantalla de login.

### Protección posterior al logout

Se añadió:

`src/routing/logout-flow.test.tsx`

La prueba integrada prepara una sesión `ASISTENTE`, un destino pendiente y un borrador antes de ejecutar el logout.

Después del cierre de sesión se comprueba que:

- `session` es `null`;
- `user` es `null`;
- `role` es `null`;
- `accessToken` es `null`;
- `refreshToken` es `null`;
- `pendingDestination` es `null`;
- el borrador queda vacío.

También se comprueba el recorrido:

1. usuario autenticado entra a `/gestion`;
2. ejecuta `Cerrar sesión`;
3. regresa a `/login`;
4. intenta abrir nuevamente `/gestion`;
5. `ProtectedRoute` detecta ausencia de sesión;
6. la aplicación vuelve a login con el destino protegido codificado.

Destino comprobado:

`/login?redirect=%2Fgestion`

Esto confirma que una ruta protegida vuelve a requerir autenticación después del logout.

### Separación respecto de 401

El cierre explícito utiliza `LOGOUT`.

Una respuesta `401` utiliza `INVALIDATE_SESSION`.

La diferencia se conserva porque:

- `LOGOUT` limpia sesión, destino pendiente y borrador;
- `INVALIDATE_SESSION` invalida la sesión pero conserva destino y borrador cuando corresponde al flujo de recuperación de autenticación.

### Verificación focalizada de T193-T198

Se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

Se ejecutó:

`npm run lint`

Resultado:

`PASS`

Se ejecutaron seis archivos de prueba relacionados con:

- logout integrado;
- reducer;
- contexto de aplicación;
- gestión;
- rutas protegidas;
- aplicación principal.

Resultado:

`6 archivos de prueba aprobados`

La prueba nueva:

`logout-flow.test.tsx`

Resultado:

`2 pruebas aprobadas`

### Verificación global de T199-T205

Se ejecutó la suite móvil completa.

Resultado:

`41 archivos de prueba aprobados`

`198 pruebas aprobadas`

Se ejecutó:

`npm run build`

Resultado:

`PASS`

Vite:

- versión `8.2.2`;
- `262` módulos transformados;
- build final completado en aproximadamente `12.66 s`.

Persisten las advertencias no bloqueantes ya conocidas relacionadas con:

- `:host-context` durante la minificación de CSS de Ionic;
- chunks superiores a `500 kB` después de minificación.

Estas advertencias no impidieron la generación del build.

También se ejecutó:

`git diff --check`

Resultado:

`PASS`

Estado:

`COMPLETADO Y VERIFICADO PARA T199-T205`

## 36. Próxima fase: accesibilidad y reutilización visual

La siguiente fase corresponde a:

- `T206`: reutilizar `ScreenHeader` donde corresponda;
- `T207`: reutilizar `PrimaryButton` donde corresponda;
- `T208`: reutilizar `AsyncStateView` para operaciones remotas;
- `T209`: mantener tokens de Feature 010;
- `T210`: verificar labels y nombres accesibles de formularios;
- `T211`: asociar errores de validación con sus controles;
- `T212`: conservar tamaño mínimo táctil;
- `T213`: verificar foco visible;
- `T214`: verificar flujo principal con TalkBack.

Antes de modificar código se deberá auditar lo ya implementado en Feature 010 y Feature 011 para distinguir requisitos ya satisfechos de aquellos que todavía necesitan comprobación o ajustes.

La verificación con TalkBack deberá documentarse únicamente después de ejecutarse realmente en dispositivo físico.

## 39. Auditoría técnica de cierre de Feature 011

Antes del cierre de Semana 11 se realizó una auditoría adicional de coherencia entre navegación, contratos HTTP, estado de autenticación, pruebas y documentación.

La auditoría no incorporó nuevas funcionalidades ajenas al alcance de Semana 11. Se concentró en eliminar inconsistencias detectadas entre comportamientos ya implementados y los contratos vigentes del proyecto.

### 39.1 Ruta protegida de eventos propios

Se verificó la ruta:

`/gestion/eventos`

La ruta utiliza:

`MyEventsPage`

y consume:

`GET /api/v1/eventos/mios`

El acceso está restringido al rol:

`ASISTENTE`

La auditoría detectó que la ruta existía en `App.tsx`, pero todavía no estaba registrada en las listas internas utilizadas por `route-security.ts`.

Esta diferencia provocaba que un usuario no autenticado pudiera ser enviado correctamente al login, pero el destino `/gestion/eventos` no se conservara como retorno válido.

Se corrigieron:

- `STATIC_APP_PATHS`;
- `PROTECTED_PATHS`.

Después de la corrección se comprobó que:

- `/gestion/eventos` es reconocido como destino interno;
- `/gestion/eventos` es reconocido como destino protegido;
- `buildLoginRedirect('/gestion/eventos')` conserva el destino;
- después de una autenticación válida el destino puede recuperarse;
- URLs externas continúan siendo rechazadas.

La cobertura correspondiente se mantiene en:

`src/routing/route-security.test.ts`

### 39.2 Contrato obligatorio de fecha final

El modelo vigente de ZamoraFest establece que todo `Evento` concreto debe disponer de:

- `fechaInicio`;
- `fechaFin`.

La regla vigente es:

`fechaFin > fechaInicio`

Durante la auditoría se detectó que el tipo TypeScript ya definía `Evento.fechaFin` como `string`, pero el validador runtime de la API móvil todavía aceptaba `null`.

Se corrigió el contrato de respuesta para exigir:

`isString(value.fechaFin)`

en lugar de aceptar una cadena o `null`.

También se actualizó una fixture histórica de `App.test.tsx` que todavía utilizaba:

`fechaFin: null`

Se añadió la prueba:

`src/services/api/event-end-date-contract.test.ts`

La prueba confirma que una respuesta remota con `fechaFin: null` se rechaza como incompatible con el contrato esperado.

De esta forma quedan alineados:

- modelo de base de datos;
- backend;
- tipos TypeScript;
- formulario móvil;
- validación runtime de respuestas;
- fixtures y pruebas.

### 39.3 Tratamiento de 401 y 403 en Mis eventos

Se auditó `MyEventsPage` para comprobar la política de autenticación definida para operaciones protegidas.

Se confirmó el comportamiento final:

#### HTTP 401

Una respuesta `401 Unauthorized` durante la consulta de eventos propios:

1. se reconoce como fallo de autenticación;
2. ejecuta `invalidateSession()`;
3. elimina la sesión autenticada de memoria;
4. permite que `ProtectedRoute` vuelva a exigir autenticación;
5. conserva el tratamiento seguro del destino protegido.

#### HTTP 403

Una respuesta `403 Forbidden`:

1. no invalida la sesión;
2. conserva usuario y rol;
3. no ejecuta logout;
4. muestra un mensaje de autorización insuficiente.

Se añadió:

`src/pages/MyEventsPage.authorization.test.tsx`

La prueba diferencia explícitamente ambos estados HTTP.

La misma política se aplica tanto durante la carga inicial como durante la carga incremental de eventos propios.

### 39.4 Pruebas dirigidas de cierre

Durante la corrección se ejecutaron pruebas específicas antes y después de cada cambio.

Se verificaron de forma dirigida:

- seguridad de rutas;
- retorno posterior al login;
- ruta real de Mis eventos;
- contrato obligatorio de `fechaFin`;
- contrato de eventos propios;
- comportamiento `401`;
- comportamiento `403`;
- regresión de `MyEventsPage`;
- regresión de `App`.

Las pruebas inicialmente diseñadas para detectar las inconsistencias fallaron antes de la corrección y pasaron después de aplicar el cambio correspondiente.

### 39.5 Suite móvil completa

Desde:

`mobile`

se ejecutó:

`npm test`

Resultado:

`PASS`

Resumen confirmado:

`48 archivos de prueba aprobados de 48`

Entre las pruebas ejecutadas se encuentran:

- `ExploreEventsPage.test.tsx`;
- `CreateEventPage.test.tsx`;
- `CreateEventPage.validation.test.tsx`;
- `CreateEventPage.creation.test.tsx`;
- `CreateEventPage.draft-navigation.test.tsx`;
- `EventDetailPage.test.tsx`;
- `ManagementPage.test.tsx`;
- `MyEventsPage.test.tsx`;
- `MyEventsPage.authorization.test.tsx`;
- `LoginRoute.test.tsx`;
- `ProtectedRoute.test.tsx`;
- `logout-flow.test.tsx`;
- `route-security.test.ts`;
- `event-create-validation.test.ts`;
- `event-create-server-validation.test.ts`;
- `event-own-list-contract.test.ts`;
- `event-end-date-contract.test.ts`.

No se registraron archivos de prueba fallidos.

### 39.6 TypeScript y ESLint

Se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

También se ejecutó:

`npm run lint`

Resultado:

`PASS`

No se registraron errores de TypeScript ni de ESLint.

### 39.7 Build móvil de producción

Se ejecutó:

`npm run build`

El comando ejecutó:

`tsc --noEmit && vite build`

Resultado:

`PASS`

Vite transformó correctamente:

`265 módulos`

El build finalizó correctamente.

Persisten advertencias no bloqueantes ya conocidas relacionadas con:

- procesamiento de `:host-context` perteneciente al CSS de Ionic mediante LightningCSS;
- chunks superiores a `500 kB` después de minificación.

Estas advertencias no impidieron generar el build y no fueron introducidas por los ajustes de cierre de Semana 11.

### 39.8 Integridad del diff

Se ejecutó repetidamente:

`git diff --check`

Resultado:

`PASS`

No se detectaron errores de whitespace.

También se revisaron los diffs individuales para confirmar que los cambios funcionales se limitaron a:

- reconocimiento de `/gestion/eventos` como ruta interna y protegida;
- obligatoriedad runtime de `Evento.fechaFin`;
- actualización de la fixture correspondiente;
- invalidación de sesión ante `401` en `MyEventsPage`;
- pruebas asociadas;
- actualización de documentación de Feature 011.

### 39.9 Registro actualizado de uso de inteligencia artificial

Durante Feature 011 se utilizó ChatGPT de OpenAI como herramienta de apoyo para análisis técnico, revisión y verificación.

Las consultas relevantes se concentraron en:

- auditar el cumplimiento de Semana 11 frente al material académico;
- revisar navegación pública y protegida;
- revisar conservación del destino posterior al login;
- detectar inconsistencias entre tipos TypeScript y validación runtime;
- revisar la obligatoriedad de `fechaFin`;
- revisar el comportamiento diferenciado de `401` y `403`;
- diseñar pruebas de regresión;
- revisar diffs antes de realizar stage;
- revisar consistencia entre código, especificación, mapa de rutas, tareas y evidencia.

Resultados de IA realmente incorporados después de verificación:

- detección de la ausencia de `/gestion/eventos` en `route-security.ts`;
- incorporación de pruebas para el retorno seguro hacia dicha ruta;
- detección del contrato runtime permisivo para `fechaFin`;
- prueba negativa para respuestas con `fechaFin: null`;
- homogeneización del tratamiento `401` de `MyEventsPage`;
- prueba específica que diferencia `401` y `403`;
- actualización de documentación técnica.

Las propuestas no se incorporaron automáticamente.

Las modificaciones humanas registradas durante esta fase incluyeron:

- revisión y aceptación selectiva de cambios propuestos;
- ejecución local de comandos de prueba, lint, typecheck y build;
- inspección manual de los diffs antes de conservar los cambios;
- corrección manual de la documentación de rutas, requisitos, tareas y evidencias;
- decisión de no mezclar advertencias no bloqueantes o deudas técnicas con cambios funcionales ajenos al alcance de Semana 11.

Cada modificación fue revisada mediante una o más de las siguientes verificaciones:

- prueba roja antes de corregir cuando correspondía;
- prueba verde después de corregir;
- pruebas de regresión dirigidas;
- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`;
- revisión manual del diff.

Las decisiones finales se mantuvieron bajo control humano y se contrastaron con el código, las pruebas y los requisitos académicos.

### 39.10 Verificación final del backend

Como parte del cierre técnico de Feature 011 se ejecutó una regresión final del backend sin introducir cambios funcionales adicionales en esta fase.

Desde:

`backend`

se ejecutó:

`npm run typecheck`

Resultado:

`PASS`

También se ejecutó:

`npm run lint`

Resultado:

`PASS`

La suite backend no integrada se ejecutó mediante:

`npm test`

Resultado:

`39 archivos de prueba aprobados de 39`

No se registraron archivos de prueba fallidos.

Posteriormente se ejecutó:

`npm run test:integration`

La preparación de la base de pruebas confirmó:

- base `zamorafest_test`;
- esquema `public`;
- `5` migraciones encontradas;
- ninguna migración pendiente;
- seed ejecutado correctamente.

Resultado de integración:

`5 archivos de prueba aprobados de 5`

Entre las pruebas de integración ejecutadas se encuentran:

- autenticación y refresh token;
- creación y actualización de eventos;
- modelo de datos;
- recordatorios;
- consulta de eventos propios.

Durante algunas pruebas de integración se presentó una advertencia de deprecación de `pg` relacionada con el uso de `client.query()` mientras otra consulta se encuentra en ejecución.

La advertencia no produjo fallos y no impidió que las pruebas de integración finalizaran correctamente. Se conserva como deuda técnica independiente y no se mezcló con el cierre funcional de Semana 11.

También se ejecutó:

`npm run build`

Resultado:

`PASS`

Finalmente se ejecutó desde la raíz del repositorio:

`git diff --check`

Resultado:

`PASS`

Con estas verificaciones quedan confirmados en el cierre:

- typecheck backend;
- lint backend;
- pruebas backend;
- pruebas de integración;
- preparación de la base de pruebas;
- build backend;
- integridad del diff.

### 39.11 Elementos todavía no declarados como completados

Esta auditoría no se utiliza para afirmar comprobaciones que todavía no se han ejecutado en esta fase.

Continúan pendientes hasta disponer de evidencia real:

- ejecución del flujo principal completo contra backend real para el cierre;
- repetición del flujo de Feature 011 en dispositivo Android físico;
- comprobación final con TalkBack;
- capturas definitivas de evidencia;
- grabación y publicación del video demostrativo.

Estos elementos deberán registrarse únicamente después de ser ejecutados.
