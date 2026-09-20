# Evidencias y validación - Feature 011

## Estado

- **Rama de trabajo:** `main`
- **Feature:** `011-logica-funcional-movil`
- **Semana:** 11
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe
- **Estado actual:** preparación SDD previa a implementación funcional

## 1. Política de evidencias

Este documento registra únicamente verificaciones realmente ejecutadas.

No se marcarán como realizadas:

- pruebas no ejecutadas;
- capturas todavía inexistentes;
- funcionamiento no comprobado;
- resultados estimados;
- evidencia de dispositivo físico aún no repetida para Feature 011;
- video aún no grabado.

Las evidencias se incorporarán progresivamente durante la implementación.

## 2. Repositorio de trabajo

Repositorio:

`https://github.com/MonikaRogel/ZamoraFest`

Rama utilizada para Semana 11:

`main`

La Feature 011 se desarrollará directamente sobre `main`, conforme al flujo de trabajo definido para esta etapa del proyecto.

El video demostrativo no se almacenará como archivo pesado dentro del repositorio.

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

`plan.md` documenta el orden incremental de implementación desde contratos backend hasta video y cierre.

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

## 19. Evidencia del video

La entrega de Semana 11 requiere un video demostrativo de entre 3 y 5 minutos.

El video deberá demostrar el funcionamiento real de la aplicación y no únicamente capturas estáticas.

La evidencia deberá incluir:

- ejecución;
- login;
- validaciones;
- datos o credenciales incorrectas;
- autenticación correcta;
- funcionalidad protegida;
- navegación entre al menos tres pantallas o funcionalidades;
- mantenimiento del estado;
- logout;
- intento de acceso protegido después del logout;
- explicación breve de navegación y estado.

El archivo de video no se almacenará en Git.

Se publicará posteriormente mediante una plataforma externa accesible.

Enlace:

`PENDIENTE`

## 20. Correspondencia entre video y repositorio

Antes de la entrega deberá verificarse que:

1. el código mostrado en el video corresponde con `main`;
2. el repositorio es accesible para el docente;
3. el enlace del video tiene permisos de visualización;
4. no existen secretos o credenciales publicados;
5. las funcionalidades demostradas pueden reproducirse desde el código entregado.

Estado actual:

`PENDIENTE`

## 21. Modelo de sesión móvil

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

## 22. Estado global de aplicación

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

## 23. Estado remoto cerrado

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

## 24. Infraestructura de protección de rutas

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

## 25. Evolución del login

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

## 26. Registro público de visitantes

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

## 27. Separación de datos de eventos

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

## 28. Detalle público de eventos

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
- fecha final cuando existe;
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

## 29. Área protegida

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

## 30. Datos auxiliares del formulario de Evento

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

## 31. Formulario protegido de creación de Evento

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

## 32. Creación protegida de eventos

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

## 33. Validaciones móviles del formulario de Evento

Se completaron las validaciones móviles correspondientes a `T163` hasta `T177`.

### Implementación realizada

Se incorporó una capa de validación independiente para el borrador de creación de eventos mediante `validateEventCreateDraft`.

Esta función constituye la única fuente de verdad para validar y normalizar los datos antes de construir `CreateEventoRequest`.

Las reglas implementadas se mantienen alineadas con el contrato actual del backend:

- título obligatorio;
- título con máximo de 200 caracteres;
- fecha y hora de inicio obligatoria y válida;
- fecha final opcional;
- fecha final no anterior a la fecha inicial;
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

`15 pruebas aprobadas`

Estas pruebas cubren:

- normalización de un borrador válido;
- título obligatorio;
- máximo de caracteres del título;
- fecha inicial vacía o inválida;
- fecha final opcional;
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

## 34. Próxima evidencia a obtener

La siguiente fase corresponde al mapeo estructurado de errores HTTP `422`.

Se continuará con:

- `T178`: extender el error HTTP móvil para conservar el cuerpo estructurado;
- `T179`: interpretar `VALIDATION_ERROR`;
- las tareas posteriores definidas en la sección de mapeo de errores `422`.

Esta fase deberá reutilizar los mensajes del backend y asociarlos a los campos correspondientes sin borrar el formulario.

El manejo específico de `401` y `403` continuará posteriormente en la fase prevista para autorización y sesión.

No se incorporarán video, PDF, persistencia offline ni sincronización dentro del código de este incremento.
