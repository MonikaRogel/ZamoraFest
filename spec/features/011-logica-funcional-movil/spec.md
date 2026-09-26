# Especificación: lógica funcional móvil (011)

## Estado

- **Rama de trabajo:** `main`
- **Fase:** Semana 11
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe
- **Base previa:** Feature 010 integrada y verificada
- **Estado funcional:** especificación previa a implementación

## 1. Propósito

Implementar la lógica funcional de la aplicación móvil ZamoraFest mediante navegación, manejo de estado, autenticación, protección de rutas y formularios validados conectados con el backend real.

La Feature 011 continúa directamente sobre los componentes reutilizables y el sistema de diseño construidos en Semana 10.

No se modifica el modelo canónico de datos definido y realineado con Semana 4.

La implementación debe dejar una base suficientemente desacoplada para incorporar posteriormente persistencia local, almacenamiento seguro, sincronización, integración HTTP avanzada, capacidades nativas e inteligencia artificial sin reconstruir las pantallas desarrolladas durante esta semana.

## 2. Resultado funcional esperado

Al finalizar Feature 011, ZamoraFest deberá permitir:

- navegar entre pantallas mediante Ionic Router;
- abrir pantallas directamente mediante su URL;
- iniciar sesión contra el backend real;
- mantener usuario y tokens como estado de aplicación durante la ejecución;
- cerrar sesión;
- impedir el acceso a rutas protegidas cuando no existe sesión;
- conservar el destino solicitado antes de autenticar al usuario;
- diferenciar falta de autenticación de falta de permisos;
- consultar el listado real de eventos;
- abrir el detalle de un evento mediante su identificador;
- registrar usuarios visitantes mediante el backend real;
- crear eventos mediante un formulario validado para usuarios autorizados;
- conservar el borrador del formulario mientras el usuario navega dentro de la aplicación;
- representar las operaciones remotas mediante estados mutuamente excluyentes;
- reutilizar el catálogo visual construido en Feature 010.

## 3. Navegación

Se utilizará navegación declarativa mediante Ionic React Router.

Las pantallas deberán reconstruirse utilizando únicamente la información presente en la dirección y el estado global necesario.

No se transportarán objetos completos entre rutas.

### 3.1. Rutas iniciales

- `/login`
- `/register`
- `/explore`
- `/eventos/:id`
- `/gestion`
- `/gestion/eventos/nuevo`

### 3.2. Rutas públicas

Son públicas:

- `/login`;
- `/register`;
- `/explore`;
- `/eventos/:id`.

### 3.3. Rutas protegidas

Requieren una sesión autenticada:

- `/gestion`;
- `/gestion/eventos/nuevo`.

La creación de eventos requiere además el rol `ASISTENTE`, conforme a la política vigente del backend.

El rol `ADMINISTRADOR` no debe considerarse implícitamente equivalente a `ASISTENTE` cuando la política del backend no lo autorice.

### 3.4. Ruta anidada

`/gestion/eventos/nuevo` constituye una ruta funcionalmente anidada dentro del área protegida `/gestion`.

### 3.5. Parámetros de ruta

El detalle utilizará:

`/eventos/:id`

La ruta transportará únicamente el identificador entero del evento.

`EventDetailPage` deberá consultar el recurso mediante:

`GET /api/v1/eventos/:id`

La pantalla no dependerá de que el usuario haya visitado previamente `/explore`.

## 4. Estado de autenticación

Se implementará un estado global de sesión mediante React Context.

La sesión contendrá como mínimo:

- usuario autenticado;
- rol;
- access token;
- refresh token;
- tiempo o información de expiración disponible;
- estado de autenticación.

La sesión permanecerá únicamente en memoria durante Feature 011.

No se utilizará `localStorage` ni otro almacenamiento inseguro para persistir tokens.

El almacenamiento seguro persistente corresponde a Semana 12.

## 5. Flujo de autenticación

### 5.1. Inicio de sesión

`POST /api/v1/auth/login`

Un inicio de sesión correcto deberá:

1. validar el formulario;
2. consultar el backend;
3. conservar usuario y tokens en el estado de aplicación;
4. determinar si existe un destino protegido pendiente;
5. navegar hacia ese destino o hacia la pantalla correspondiente.

### 5.2. Registro

`POST /api/v1/auth/register`

El registro público conservará la política vigente del backend:

- crea únicamente usuarios `VISITANTE`;
- no permite enviar rol, id de rol ni atributos privilegiados;
- no permite escalamiento de privilegios desde el cliente.

### 5.3. Cierre de sesión

El cierre de sesión deberá:

- eliminar de memoria el usuario;
- eliminar access token;
- eliminar refresh token;
- limpiar el estado de autenticación;
- impedir volver a entrar a rutas protegidas sin autenticarse nuevamente.

La limpieza de datos persistidos será ampliada en Semana 12 cuando exista almacenamiento local seguro.

## 6. Autorización y respuestas HTTP

El cliente debe distinguir explícitamente:

### 6.1. `401 Unauthorized`

Representa ausencia o invalidez de autenticación.

Ante un `401` en una operación protegida:

- invalidar la sesión en memoria;
- conservar, cuando corresponda, el destino solicitado;
- redirigir a `/login`.

### 6.2. `403 Forbidden`

Representa un usuario autenticado sin autorización suficiente.

Ante un `403`:

- no eliminar la sesión;
- no redirigir automáticamente al login;
- mostrar un mensaje comprensible indicando que la cuenta no dispone del permiso requerido.

### 6.3. `422 Unprocessable Entity`

Los errores de validación del backend deberán utilizarse para asociar mensajes a los campos correspondientes del formulario.

El backend deberá conservar una respuesta estructurada con información equivalente a:

- código;
- mensaje general;
- ruta o campo afectado;
- mensaje específico de validación.

Los errores de validación estructural procesables se normalizarán a `422`.

`400` permanecerá reservado para solicitudes HTTP malformadas u otros casos que realmente correspondan a una solicitud inválida no procesable como formulario.

## 7. Estado remoto

Las operaciones remotas relevantes deberán modelarse mediante tipos cerrados con casos mutuamente excluyentes.

Como mínimo:

- `idle`;
- `loading`;
- `success`;
- `error`.

No se utilizarán combinaciones independientes que permitan estados contradictorios como:

- cargando y error simultáneamente;
- éxito sin datos;
- error junto con éxito.

Estos estados deberán integrarse con los componentes reutilizables de Feature 010, especialmente `AsyncStateView`.

## 8. Repositorios y fuentes de datos

Las nuevas pantallas no deberán incrementar el acoplamiento directo entre interfaz y cliente HTTP.

La dirección arquitectónica será:

`Pantalla -> repositorio -> fuente remota -> API`

Durante Feature 011 se introducirá la separación mínima necesaria para eventos y autenticación.

Esta decisión prepara:

- Semana 12: fuente local, almacenamiento seguro y funcionamiento offline;
- Semana 13: cliente HTTP robusto, renovación de sesión, reintentos y sincronización;
- semanas posteriores: capacidades nativas e integración adicional sin reescribir las pantallas.

## 9. Detalle de evento

Se implementará una pantalla de detalle accesible mediante:

`/eventos/:id`

La pantalla:

- validará el identificador recibido;
- consultará `GET /api/v1/eventos/:id`;
- resolverá loading, error, no encontrado y éxito;
- podrá abrirse directamente desde su URL;
- reutilizará componentes y tokens de Feature 010;
- no dependerá de un objeto Evento transportado desde `/explore`.

## 10. Creación de evento

La entidad principal continúa siendo `Evento`.

La creación utilizará:

`POST /api/v1/eventos`

El formulario deberá representar el contrato real vigente del backend:

- `titulo`;
- `descripcion`;
- `fechaInicio`;
- `fechaFin`;
- `costoReferencial`;
- `lugarId`;
- `categoriaIds`;
- `fuenteInformacion`.

No se expondrán campos controlados por el servidor como:

- usuario creador;
- usuario revisor;
- estado del evento;
- estado de revisión;
- fecha de revisión.

El backend continuará creando inicialmente el evento como:

- `BORRADOR`;
- `PENDIENTE`.

## 11. Validación del formulario

Las reglas de cliente se derivarán del contrato real del backend y del modelo de datos vigente.

Como mínimo se verificará:

- título obligatorio y dentro de su longitud permitida;
- fecha de inicio válida;
- fecha final obligatoria y válida;
- fecha final estrictamente posterior a la fecha inicial;
- costo no negativo;
- máximo de dos decimales para el costo;
- `lugarId` entero positivo;
- al menos una categoría;
- categorías sin duplicados;
- fuente de información dentro de su longitud permitida.

La validación se ejecutará:

1. al abandonar el campo cuando corresponda;
2. nuevamente antes de enviar el formulario.

Los mensajes deberán identificar qué debe corregir el usuario.

## 12. Lugar y categorías

Las categorías utilizarán:

`GET /api/v1/categorias`

No se incrustarán identificadores de categoría fijos en la interfaz.

La creación de Evento requiere un `lugarId` válido y activo.

Actualmente el backend no expone una consulta pública específica de lugares.

Feature 011 podrá incorporar un endpoint de lectura mínimo para lugares activos, sin modificar el modelo canónico, con el único objetivo de permitir seleccionar una ubicación real desde el formulario.

No se utilizará un `lugarId` fijo como solución definitiva.

## 13. Conservación del formulario

El borrador de creación deberá conservarse mientras el usuario navega hacia otra pantalla y regresa durante la misma ejecución de la aplicación.

En Feature 011 esta conservación será estado de aplicación en memoria.

Semana 12 ampliará este comportamiento mediante persistencia local.

## 14. Continuidad con Feature 010

Las nuevas pantallas deberán reutilizar cuando corresponda:

- `ScreenHeader`;
- `PrimaryButton`;
- `AsyncStateView`;
- `EventCard`;
- `FilterChip`;
- tokens de `variables.css`.

Los componentes reutilizables continuarán sin conocer directamente:

- endpoints;
- rutas de navegación;
- autenticación global;
- lógica específica del backend.

## 15. Preparación de Semana 12

Feature 011 deberá finalizar sin bloquear la incorporación posterior de:

- almacenamiento seguro de tokens;
- base de datos local;
- esquema local versionado;
- caché persistente;
- cola de operaciones pendientes;
- funcionamiento sin conexión;
- sincronización;
- resolución de conflictos;
- timestamps procedentes del servidor;
- TTL;
- limpieza local de sesión.

No se implementarán prematuramente estas funciones durante Semana 11 salvo que sean estrictamente necesarias para mantener una interfaz estable.

## 16. Preparación de Semana 13

La arquitectura deberá permitir posteriormente:

- cliente HTTP centralizado;
- encabezado `Authorization` transparente;
- refresh token;
- prevención de bucles de renovación;
- coordinación de respuestas `401` simultáneas;
- timeouts;
- cancelación;
- reintentos seguros;
- logs sin información sensible;
- separación entre fuente remota, fuente local y repositorio.

No se almacenarán secretos de servicios externos dentro de la aplicación.

## 17. Preparación de capacidades posteriores

La estructura deberá admitir posteriormente, sin alterar el núcleo de navegación y sesión:

- favoritos;
- recordatorios;
- geolocalización;
- notificaciones;
- imágenes y cámara cuando corresponda;
- capacidades nativas de Capacitor;
- funcionalidades de inteligencia artificial sustentadas en datos reales del proyecto.

La inteligencia artificial será una capacidad adicional y no sustituirá las funciones principales de ZamoraFest.

Cualquier integración futura con un proveedor de IA deberá realizarse mediante el backend cuando requiera claves secretas.

## 18. Evidencia de Semana 11

Se conservarán evidencias del recorrido:

1. aplicación ejecutándose;
2. validación de login;
3. credenciales incorrectas;
4. autenticación correcta;
5. ruta protegida;
6. listado de eventos;
7. detalle por `:id`;
8. creación mediante formulario validado;
9. conservación del estado al navegar;
10. cierre de sesión;
11. intento de entrar nuevamente a una ruta protegida.

## 19. Criterios de aceptación

Feature 011 se considerará técnicamente completa cuando:

- las rutas estén documentadas e implementadas;
- exista al menos una ruta anidada;
- las rutas públicas y protegidas estén diferenciadas;
- el detalle sea reconstruible desde `/eventos/:id`;
- una ruta protegida conserve el destino previo al login;
- usuario y tokens formen parte del estado de aplicación;
- no existan tokens persistidos de forma insegura;
- logout invalide la sesión local;
- `401` y `403` tengan comportamientos diferentes;
- exista al menos una operación remota con estado cerrado;
- el formulario de Evento derive sus validaciones del backend;
- exista validación al abandonar campos y al enviar;
- los errores `422` se asocien a campos;
- el borrador permanezca al navegar y regresar;
- se consulten datos reales del backend;
- se pueda crear un evento real con un usuario autorizado;
- el código preserve la separación necesaria para Semana 12 y Semana 13;
- TypeScript finalice sin errores;
- lint finalice sin errores;
- las pruebas automatizadas finalicen correctamente;
- el build móvil finalice correctamente;
- el backend conserve sus verificaciones;
- el recorrido funcional se pruebe en dispositivo físico;
- las evidencias requeridas queden documentadas;
- el código verificado esté publicado en `main`.
