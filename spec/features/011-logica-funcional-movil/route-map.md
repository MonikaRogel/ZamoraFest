# Mapa de rutas - Feature 011

## 1. Propósito

Definir la estructura de navegación de ZamoraFest para Semana 11, indicando para cada ruta su nivel de acceso, pantalla asociada, rol requerido, endpoint consumido y comportamiento de reconstrucción.

La navegación se implementará mediante Ionic React Router.

Las rutas deben poder abrirse directamente y no depender de objetos transportados desde una pantalla anterior.

## 2. Principios de navegación

- Utilizar navegación declarativa.
- Mantener rutas legibles y estables.
- Transportar identificadores mediante la URL.
- No transportar objetos completos entre pantallas.
- Distinguir rutas públicas de rutas protegidas.
- Aplicar autorización en cliente únicamente como control de experiencia de usuario.
- Mantener el backend como autoridad final de permisos.
- Conservar el destino solicitado por un usuario no autenticado.
- Evitar redirecciones externas mediante el parámetro de retorno.
- Mantener compatibilidad futura con deep links.

## 3. Mapa principal

| Ruta | Acceso | Rol | Pantalla | Endpoint principal | Estado |
| --- | --- | --- | --- | --- | --- |
| `/` | Público | Ninguno | Redirección inicial | Ninguno | Existente |
| `/login` | Público | Ninguno | `LoginPage` | `POST /api/v1/auth/login` | Implementado y evolucionado |
| `/register` | Público | Ninguno | `RegisterPage` | `POST /api/v1/auth/register` | Implementado |
| `/explore` | Público | Ninguno | `ExploreEventsPage` | `GET /api/v1/eventos` | Implementado |
| `/eventos/:id` | Público | Ninguno | `EventDetailPage` | `GET /api/v1/eventos/:id` | Implementado |
| `/gestion` | Protegido | Usuario autenticado | `ManagementPage` | Ninguno obligatorio | Implementado |
| `/gestion/eventos/nuevo` | Protegido | `ASISTENTE` | `CreateEventPage` | `POST /api/v1/eventos` | Implementado |

## 4. Ruta inicial

La ruta `/` conservará inicialmente el comportamiento académico existente y redirigirá hacia `/login`.

Esta decisión evita alterar innecesariamente el flujo ya probado durante Semanas 9 y 10.

La navegación pública hacia `/explore` continuará disponible sin autenticación.

## 5. Inicio de sesión

### 5.1 Ruta

`/login`

### 5.2 Acceso

Público.

### 5.3 Endpoint

`POST /api/v1/auth/login`

### 5.4 Responsabilidades

- validar correo y contraseña;
- autenticar contra el backend real;
- almacenar sesión en memoria;
- conservar usuario, rol y tokens;
- recuperar el destino solicitado antes del login;
- navegar al destino autorizado tras autenticarse.

### 5.5 Destino pendiente

Cuando una persona no autenticada intente acceder a una ruta protegida, se redirigirá a:

`/login?redirect=<ruta-interna>`

Ejemplo:

`/login?redirect=%2Fgestion%2Feventos%2Fnuevo`

El valor `redirect` solo podrá utilizar rutas internas reconocidas por la aplicación.

No se permitirán URLs externas.

## 6. Registro

### 6.1 Ruta

`/register`

### 6.2 Acceso

Público.

### 6.3 Endpoint

`POST /api/v1/auth/register`

### 6.4 Política

El autorregistro crea únicamente cuentas `VISITANTE`.

El cliente no enviará:

- rol;
- id de rol;
- estado;
- atributos administrativos.

La política de roles permanecerá controlada por el backend.

## 7. Explorar eventos

### 7.1 Ruta

`/explore`

### 7.2 Acceso

Público.

### 7.3 Endpoint

`GET /api/v1/eventos`

### 7.4 Pantalla

`ExploreEventsPage`

### 7.5 Estado actual

Implementada en Feature 010.

### 7.6 Evolución Feature 011

La pantalla continuará mostrando datos reales y se adaptará gradualmente a la separación:

`Pantalla -> repositorio -> fuente remota -> API`

La navegación hacia un evento utilizará exclusivamente su identificador.

Ejemplo:

`/eventos/12`

## 8. Detalle de evento

### 8.1 Ruta

`/eventos/:id`

### 8.2 Acceso

Público.

### 8.3 Endpoint

`GET /api/v1/eventos/:id`

### 8.4 Pantalla

`EventDetailPage`

### 8.5 Parámetro

`id`: entero positivo correspondiente al evento.

### 8.6 Reconstrucción

La pantalla debe funcionar correctamente cuando:

- se abre desde `ExploreEventsPage`;
- se escribe directamente la URL;
- se recarga la vista;
- se abre mediante un enlace profundo futuro.

No recibirá un objeto `Evento` completo mediante navegación.

Si el identificador es inválido se mostrará un estado de error comprensible.

Si el backend devuelve `404`, se mostrará que el evento no está disponible.

## 9. Área protegida

### 9.1 Ruta

`/gestion`

### 9.2 Acceso

Usuario autenticado.

### 9.3 Pantalla

`ManagementPage`

### 9.4 Objetivo

Servir como raíz del área protegida y demostrar navegación condicionada por autenticación.

La pantalla podrá mostrar:

- identidad del usuario;
- rol;
- acciones permitidas;
- acceso a funcionalidades compatibles con su rol;
- cierre de sesión.

No requiere necesariamente un endpoint propio.

## 10. Crear evento

### 10.1 Ruta

`/gestion/eventos/nuevo`

### 10.2 Acceso

Protegido.

### 10.3 Rol

`ASISTENTE`.

### 10.4 Pantalla

`CreateEventPage`

### 10.5 Endpoints

Principal:

`POST /api/v1/eventos`

Datos auxiliares:

`GET /api/v1/categorias`

`GET /api/v1/lugares`

### 10.6 Ruta anidada

Esta ruta pertenece funcionalmente a:

`/gestion`

y satisface el requisito de disponer de navegación anidada dentro del área protegida.

## 11. Política de roles

La autorización móvil respetará exactamente la política vigente del backend.

### 11.1 VISITANTE

Puede:

- explorar eventos;
- consultar detalles;
- acceder a funcionalidades futuras propias de visitantes autenticados.

No puede crear eventos.

### 11.2 ASISTENTE

Puede:

- autenticarse;
- acceder al área protegida;
- crear eventos;
- gestionar las operaciones permitidas por el backend sobre sus recursos.

### 11.3 ADMINISTRADOR

Mantiene las capacidades administrativas definidas por el backend.

No se considerará automáticamente `ASISTENTE`.

Si una operación requiere específicamente `ASISTENTE`, un usuario `ADMINISTRADOR` no será autorizado únicamente por tener un rol de mayor jerarquía nominal.

## 12. Protección de rutas

La aplicación utiliza `ProtectedRoute` como guard de autenticación y autorización de navegación.

La protección del cliente controla la experiencia de usuario, pero no sustituye la autorización del backend, que continúa siendo la autoridad final para cada operación protegida.

### 12.1 Sin sesión

Solicitud:

`/gestion/eventos/nuevo`

Resultado:

`/login?redirect=%2Fgestion%2Feventos%2Fnuevo`

La dirección solicitada se construye a partir de la ruta protegida actual y se valida como destino interno reconocido antes de utilizarse.

### 12.2 Login correcto como ASISTENTE

Después de una autenticación válida con el rol requerido, `LoginRoute` recupera el destino protegido pendiente y permite regresar a:

`/gestion/eventos/nuevo`

El destino pendiente se elimina después de aplicarse correctamente.

### 12.3 Rol no permitido por el guard del cliente

Cuando existe una sesión válida pero el rol conocido por el cliente no está incluido entre los roles permitidos para la ruta:

- la sesión se conserva;
- no se ejecuta logout;
- `ProtectedRoute` redirige hacia la ruta segura configurada mediante `forbiddenRedirect`;
- para `/gestion/eventos/nuevo`, la ruta segura actual es `/explore`.

Este control preventivo de navegación no debe confundirse con una respuesta HTTP `403` producida por el backend durante una operación remota.

### 12.4 Autoridad del backend

La protección de rutas del cliente no constituye un mecanismo suficiente de seguridad.

El backend valida nuevamente:

- autenticación;
- token de acceso;
- rol autorizado;
- permisos correspondientes a la operación.

Las respuestas `401` y `403` del backend se procesan de manera diferenciada incluso cuando la navegación preventiva del cliente ya se haya aplicado.

### 12.5 Cierre explícito de sesión

El cierre explícito de sesión se realiza desde `ManagementPage` mediante `logout()`.

La acción `LOGOUT` restablece el estado de aplicación asociado a la sesión:

- `session` pasa a `null`;
- usuario y rol dejan de estar disponibles porque derivan de la sesión;
- access token y refresh token dejan de estar disponibles;
- `pendingDestination` pasa a `null`;
- `eventDraft` vuelve a `initialEventDraft`.

Después del logout, `ManagementPage` navega a `/login`.

Si el usuario intenta acceder nuevamente a `/gestion`, `ProtectedRoute` detecta que `session` es `null` y vuelve a exigir autenticación mediante el redirect seguro hacia:

`/login?redirect=%2Fgestion`

Este cierre voluntario de sesión se mantiene separado de `INVALIDATE_SESSION`, utilizado para respuestas `401`.

Durante Feature 011 la limpieza se limita al estado mantenido en memoria. La limpieza de almacenamiento seguro o base local corresponde a Semana 12.

## 13. Tratamiento de 401

Una respuesta `401 Unauthorized` en una operación protegida representa ausencia o invalidez de autenticación.

Para evitar confundir un token inválido con un cierre voluntario de sesión se diferencian dos transiciones de estado:

- `INVALIDATE_SESSION`: invalida exclusivamente la autenticación;
- `LOGOUT`: corresponde al cierre explícito de sesión y puede limpiar el resto del estado asociado.

Ante un `401` durante la creación protegida de un evento:

1. `useEventCreation` reconoce el estado HTTP recibido desde el repositorio;
2. se ejecuta `invalidateSession()`;
3. la sesión, usuario, rol, access token y refresh token dejan de estar disponibles en memoria;
4. el borrador del evento no se elimina;
5. el destino protegido puede conservarse;
6. `ProtectedRoute` detecta la ausencia de sesión;
7. se genera el retorno seguro hacia `/login`;
8. `LoginRoute` conserva el destino interno validado para utilizarlo después de una nueva autenticación.

No se implementa renovación automática del access token durante Feature 011. Esa capacidad pertenece al endurecimiento posterior del cliente HTTP previsto para Semana 13.

## 14. Tratamiento de 403

Una respuesta `403 Forbidden` representa una identidad autenticada que no posee autorización suficiente para la operación solicitada.

Ante un `403` durante una operación protegida:

1. se conserva la sesión;
2. se conservan usuario, rol y tokens;
3. no se ejecuta `invalidateSession()`;
4. no se ejecuta logout;
5. no se redirige automáticamente al login;
6. se mantiene el estado del formulario;
7. se presenta un mensaje comprensible de permiso insuficiente.

El mensaje utilizado actualmente durante la creación de eventos es:

`La sesión no tiene permisos para crear eventos.`

Este comportamiento es deliberadamente diferente del tratamiento de `401`.

## 15. Formulario de creación

`CreateEventPage` consumirá:

`POST /api/v1/eventos`

y utilizará información auxiliar procedente de:

- categorías activas;
- lugares activos.

No se utilizarán IDs incrustados como solución definitiva.

El borrador de creación forma parte del estado global de aplicación y se conserva al navegar fuera de la pantalla y regresar durante la misma ejecución.

Una creación confirmada como exitosa limpia el borrador mediante `clearEventDraft()`.

Los errores de creación no eliminan el borrador, lo que permite corregir o reintentar sin perder los datos ingresados.

El cierre explícito de sesión limpia el borrador junto con la sesión y el destino pendiente.

No existe persistencia del borrador después de cerrar la aplicación durante Feature 011; esa responsabilidad corresponde a Semana 12.

## 16. Consulta de categorías

Endpoint:

`GET /api/v1/categorias`

Acceso:

Público.

Uso:

- cargar opciones reales;
- permitir selección múltiple;
- enviar `categoriaIds`;
- evitar categorías duplicadas.

## 17. Consulta de lugares

El modelo canónico exige que cada Evento tenga un lugar válido y activo.

Feature 011 incorporó la consulta pública de solo lectura:

`GET /api/v1/lugares`

Acceso:

Público.

Propósito:

- listar lugares activos;
- proporcionar identificadores reales;
- proporcionar datos suficientes para identificar el lugar;
- evitar `lugarId` incrustados en el cliente;
- conservar la jerarquía territorial definida en el modelo canónico.

La respuesta permite identificar de forma comprensible:

- lugar;
- sector;
- parroquia;
- cantón;
- provincia.

El formulario de creación consume este endpoint para construir dinámicamente las opciones disponibles.

## 18. Rutas no implementadas durante Feature 011

El proyecto contempla otras funcionalidades derivadas de la API, pero no forman parte del recorrido obligatorio de Semana 11:

- favoritos;
- recordatorios;
- programación;
- gestión de imágenes;
- revisión administrativa;
- publicación administrativa.

No serán eliminadas ni simuladas.

Se incorporarán cuando corresponda sin romper las rutas definidas durante Feature 011.

## 19. Compatibilidad futura

El esquema de rutas debe admitir posteriormente:

- deep links;
- favoritos;
- recordatorios;
- navegación offline;
- geolocalización;
- notificaciones;
- capacidades nativas;
- restauración segura de sesión;
- sincronización;
- funcionalidades adicionales de inteligencia artificial.

Las futuras capacidades no deben requerir cambiar las URLs públicas ya definidas sin una razón funcional justificada.

## 20. Recorrido mínimo de evidencia

El recorrido funcional principal de Semana 11 será:

`/login`
→ autenticación
→ `/gestion`
→ `/explore`
→ `/eventos/:id`
→ `/gestion/eventos/nuevo`
→ creación
→ navegación
→ regreso al formulario o área protegida
→ cierre de sesión
→ intento de acceso protegido
→ `/login`

Este recorrido se utilizará como base para las pruebas funcionales.
