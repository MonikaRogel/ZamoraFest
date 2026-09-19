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

## 22. Próxima evidencia a obtener

La siguiente fase corresponde al estado global de aplicación:

- contexto global de autenticación;
- reducer tipado;
- inicio y cierre de sesión;
- exposición del usuario y rol autenticado;
- conservación de tokens únicamente en memoria;
- destino protegido pendiente;
- borrador de creación de evento;
- separación entre estado efímero y estado de aplicación;
- pruebas automatizadas del estado global.

Esta fase corresponde a las tareas `T069` a `T079`.
