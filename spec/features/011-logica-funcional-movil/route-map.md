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
| `/` | Público | Ninguno | Redirección inicial | Ninguno | Existente / ajustar |
| `/login` | Público | Ninguno | `LoginPage` | `POST /api/v1/auth/login` | Existente / evolucionar |
| `/register` | Público | Ninguno | `RegisterPage` | `POST /api/v1/auth/register` | Por implementar |
| `/explore` | Público | Ninguno | `ExploreEventsPage` | `GET /api/v1/eventos` | Existente |
| `/eventos/:id` | Público | Ninguno | `EventDetailPage` | `GET /api/v1/eventos/:id` | Por implementar |
| `/gestion` | Protegido | Usuario autenticado | `ManagementPage` | Ninguno obligatorio | Por implementar |
| `/gestion/eventos/nuevo` | Protegido | `ASISTENTE` | `CreateEventPage` | `POST /api/v1/eventos` | Por implementar |

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

y el endpoint mínimo de lugares activos que se incorpore durante Feature 011.

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

Se implementará un guard de autenticación.

### 12.1 Sin sesión

Solicitud:

`/gestion/eventos/nuevo`

Resultado:

`/login?redirect=%2Fgestion%2Feventos%2Fnuevo`

### 12.2 Login correcto como ASISTENTE

Resultado:

`/gestion/eventos/nuevo`

### 12.3 Login correcto sin rol requerido

La sesión se mantiene.

El usuario será dirigido a una pantalla segura y recibirá un mensaje de falta de permisos.

No se eliminará su sesión.

## 13. Tratamiento de 401

Una respuesta `401 Unauthorized` en una operación protegida representa ausencia o invalidez de autenticación.

Comportamiento:

1. limpiar la sesión en memoria;
2. conservar el destino cuando corresponda;
3. navegar hacia `/login`;
4. solicitar una nueva autenticación.

## 14. Tratamiento de 403

Una respuesta `403 Forbidden` representa una sesión válida sin permiso suficiente.

Comportamiento:

1. mantener la sesión;
2. no enviar al usuario al login;
3. mostrar un mensaje comprensible;
4. permitir continuar utilizando las funciones autorizadas.

## 15. Formulario de creación

`CreateEventPage` consumirá:

`POST /api/v1/eventos`

y utilizará información auxiliar procedente de:

- categorías activas;
- lugares activos.

No se utilizarán IDs incrustados como solución definitiva.

La navegación fuera de la pantalla no deberá eliminar el borrador durante la misma ejecución.

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

Actualmente no existe una ruta pública específica para consultar lugares desde el cliente móvil.

Feature 011 incorporará una consulta de solo lectura mínima, sin modificar el modelo de datos.

Ruta prevista:

`GET /api/v1/lugares`

Propósito:

- listar lugares activos;
- proporcionar identificador y datos suficientes para seleccionar un lugar;
- evitar IDs fijos;
- mantener integridad con la jerarquía territorial existente.

La respuesta mínima deberá permitir identificar de forma comprensible el lugar seleccionado.

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

Este recorrido se utilizará como base para las pruebas funcionales y el video demostrativo.
