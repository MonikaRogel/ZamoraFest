# Plan técnico: lógica funcional móvil (011)

## Estado

- **Rama de trabajo:** `main`
- **Especificación:** `spec.md`
- **Mapa de rutas:** `route-map.md`
- **Fase:** planificación previa a implementación
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe

## 1. Estrategia

Feature 011 se implementará de forma incremental, verificable y compatible con las features anteriores.

La prioridad es incorporar navegación, sesión, autorización, detalle de eventos y formularios validados sin acoplar las pantallas directamente al transporte HTTP ni adelantar funcionalidades que pertenecen a Semana 12 o Semana 13.

La implementación continuará directamente sobre `main`.

Cada incremento deberá superar sus verificaciones antes de considerarse completado.

## 2. Baseline confirmado

Antes de iniciar Feature 011 se verificó:

- rama `main` limpia;
- sincronización con `origin/main`;
- Feature 010 integrada;
- typecheck móvil correcto;
- lint móvil correcto;
- 49 de 49 pruebas móviles aprobadas;
- build móvil correcto;
- typecheck backend correcto;
- lint backend correcto;
- 228 de 228 pruebas backend aprobadas;
- build backend correcto;
- variables locales de usuarios seed configuradas sin exponer credenciales.

Este baseline constituye el punto de retorno lógico de Semana 11.

## 3. Fase A - Contratos y consistencia HTTP

Antes de modificar la interfaz se revisarán los contratos necesarios para Semana 11.

### 3.1. Validación 422

El backend actualmente transforma errores de validación Zod en `400`.

La guía de Semana 11 requiere asociar respuestas `422` con los campos correspondientes del formulario.

Se ajustará el manejo centralizado para que los errores de validación procesables utilicen `422 Unprocessable Entity`, conservando el formato estructurado:

- `code`;
- `message`;
- `details`;
- `path`;
- mensaje específico.

Se conservará `400` para casos que correspondan realmente a solicitudes malformadas.

### 3.2. Consulta de lugares

La creación de Evento exige un `lugarId` válido y activo.

Actualmente no existe un endpoint público específico para consultar lugares.

Se incorporará una consulta mínima de solo lectura:

`GET /api/v1/lugares`

El endpoint deberá:

- devolver únicamente lugares activos;
- proporcionar identificador;
- proporcionar un nombre comprensible;
- mantener la relación territorial necesaria para la interfaz;
- no alterar el modelo canónico de Semana 4.

No se utilizará un identificador de lugar incrustado en el cliente como solución definitiva.

### 3.3. Pruebas backend

Los cambios de contratos deberán acompañarse de pruebas específicas y no podrán reducir la suite existente.

## 4. Fase B - Modelo de sesión móvil

El contrato actual de login recibe una sesión completa del backend, pero el cliente móvil conserva únicamente el usuario autenticado.

Se evolucionará el contrato móvil para conservar:

- usuario;
- rol;
- access token;
- refresh token;
- tipo de token;
- expiración disponible.

Los tokens existirán únicamente en memoria durante Feature 011.

No se utilizará almacenamiento persistente inseguro.

## 5. Fase C - Estado global de aplicación

Se implementará un mecanismo de estado compartido basado en React Context y reducer o una estructura equivalente suficientemente tipada.

Se distinguirán:

### Estado efímero

Ejemplos:

- texto temporal de un campo;
- control de visibilidad;
- foco;
- estado visual local que no necesita compartirse.

### Estado de aplicación

Ejemplos:

- sesión autenticada;
- usuario;
- rol;
- tokens;
- destino previo al login;
- borrador de creación que debe sobrevivir a navegación interna.

No se incorporará Redux, Zustand u otra dependencia global sin una necesidad demostrada.

## 6. Fase D - Estados remotos cerrados

Se definirá un tipo reusable para representar operaciones remotas mediante estados mutuamente excluyentes:

- `idle`;
- `loading`;
- `success`;
- `error`.

La solución deberá impedir estados contradictorios mediante TypeScript.

Se integrará con `AsyncStateView` cuando corresponda.

## 7. Fase E - Protección de rutas

Se implementará una capa de protección compatible con Ionic React Router y React Router 5.

El flujo deberá distinguir:

- usuario no autenticado;
- usuario autenticado;
- rol permitido;
- rol no permitido.

Cuando un usuario no autenticado solicite una ruta protegida:

1. se conservará la ruta interna solicitada;
2. se navegará a `/login`;
3. después de un login correcto se intentará regresar al destino;
4. el destino será validado como ruta interna antes de utilizarse.

## 8. Fase F - Evolución del login

`LoginPage` dejará de mantener la sesión únicamente como estado local de la pantalla.

Después de autenticar correctamente deberá:

- almacenar la sesión en el estado de aplicación;
- conservar el comportamiento seguro frente a credenciales inválidas;
- impedir envíos duplicados;
- utilizar el destino pendiente cuando exista;
- navegar sin perder la sesión.

Las pruebas actuales del login deberán conservarse o adaptarse sin reducir cobertura funcional.

## 9. Fase G - Registro de visitantes

Se implementará `RegisterPage`.

Utilizará:

`POST /api/v1/auth/register`

El formulario deberá derivar sus restricciones del contrato real.

No permitirá proporcionar:

- rol;
- `idRol`;
- estado;
- atributos administrativos.

El flujo deberá dejar claro que el autorregistro crea un `VISITANTE`.

## 10. Fase H - Repositorio de eventos

Se introducirá una separación mínima entre presentación y transporte HTTP.

Dirección prevista:

`Página -> EventRepository -> RemoteEventSource -> ZamoraFestApi`

La finalidad no es crear una arquitectura excesiva, sino evitar que nuevas páginas sigan dependiendo directamente del cliente HTTP.

`ExploreEventsPage` se migrará gradualmente hacia esta estructura sin alterar su comportamiento visible.

## 11. Fase I - Detalle de evento

Se implementará:

`/eventos/:id`

La pantalla deberá:

- leer el identificador desde la ruta;
- validar que sea aceptable;
- consultar el backend;
- representar carga;
- representar error;
- representar 404;
- representar éxito;
- funcionar al abrir directamente la dirección;
- reutilizar componentes de Feature 010.

`EventCard` no conocerá rutas.

La pantalla que lo utiliza proporcionará el callback de navegación correspondiente.

## 12. Fase J - Área protegida

Se implementará:

`/gestion`

La vista deberá demostrar que:

- la sesión permanece entre pantallas;
- se conoce el usuario autenticado;
- se conoce su rol;
- existen acciones condicionadas por autorización;
- el usuario puede cerrar sesión.

No se añadirá lógica administrativa no requerida por Semana 11.

## 13. Fase K - Formulario de creación de Evento

Se implementará:

`/gestion/eventos/nuevo`

El formulario utilizará datos reales del backend.

Campos:

- título;
- descripción;
- fecha de inicio;
- fecha de fin;
- costo referencial;
- lugar;
- categorías;
- fuente de información.

Datos auxiliares:

- `GET /api/v1/categorias`;
- `GET /api/v1/lugares`.

Creación:

`POST /api/v1/eventos`.

## 14. Fase L - Validación de formulario

Las validaciones se derivarán del contrato backend.

Se comprobarán al menos:

- campos obligatorios;
- longitudes;
- fechas;
- relación entre fecha inicial y final;
- costo;
- número de decimales;
- identificadores;
- categorías;
- fuente de información.

La validación se realizará:

1. al abandonar el campo cuando corresponda;
2. al enviar el formulario.

Los errores `422` enviados por el backend se mapearán utilizando `details[].path`.

## 15. Fase M - Manejo de 401 y 403

### 401

Una respuesta `401` protegida provocará:

- invalidación de la sesión en memoria;
- conservación del destino cuando corresponda;
- navegación hacia login.

### 403

Una respuesta `403` provocará:

- conservación de la sesión;
- permanencia dentro de un flujo seguro;
- mensaje de permiso insuficiente;
- ausencia de logout automático.

Se crearán pruebas que garanticen que ambos comportamientos no se confundan.

## 16. Fase N - Preservación del borrador

El contenido del formulario deberá sobrevivir a navegación interna y retorno durante la misma ejecución.

La implementación utilizará estado de aplicación en memoria.

No se utilizará todavía una base local para esta función.

La persistencia después de cerrar y volver a abrir la aplicación corresponde a Semana 12.

## 17. Fase O - Logout

El cierre de sesión eliminará:

- usuario;
- access token;
- refresh token;
- información de autenticación;
- destino pendiente que ya no corresponda.

Después del logout se comprobará que una ruta protegida vuelva a requerir autenticación.

Semana 12 ampliará esta limpieza a los datos persistidos localmente.

## 18. Fase P - Verificación automatizada

Al concluir los incrementos se ejecutarán:

### 18.1 Mobile

- typecheck;
- lint;
- pruebas específicas;
- suite completa;
- build de producción.

### 18.2 Backend

- typecheck;
- lint;
- pruebas específicas;
- suite completa;
- build.

No se aceptará una reducción injustificada del número de pruebas existentes.

## 19. Fase Q - Verificación funcional

El flujo deberá comprobarse contra backend y base de datos reales.

Recorrido mínimo:

1. ejecutar ZamoraFest;
2. probar validación de login;
3. probar credenciales incorrectas;
4. autenticar usuario válido;
5. entrar a área protegida;
6. navegar a explorar;
7. abrir detalle mediante `:id`;
8. abrir creación de evento con `ASISTENTE`;
9. comprobar validaciones;
10. navegar y regresar conservando el borrador;
11. crear un registro válido;
12. comprobar manejo de permisos;
13. cerrar sesión;
14. intentar ingresar nuevamente a una ruta protegida.

## 20. Fase R - Dispositivo físico

Después de superar las verificaciones automatizadas se ejecutará el recorrido principal en el Samsung Android físico utilizado durante las semanas anteriores.

La evidencia física no se declarará completada hasta haber sido ejecutada realmente.

## 21. Fase S - Evidencias

Se conservarán únicamente evidencias reales.

Podrán incluir:

- capturas;
- resultados de pruebas;
- navegación;
- validaciones;
- sesión;
- detalle;
- creación;
- autorización;
- logout;
- dispositivo físico.

No se fabricarán capturas ni resultados.

## 22. Fase T - Video externo

El video demostrativo se realizará después de que el código esté estabilizado.

Duración requerida:

3 a 5 minutos.

El video será alojado externamente en una plataforma accesible.

No se agregará el archivo de video pesado al repositorio.

El video deberá corresponder exactamente con el código publicado en `main`.

## 23. Preparación para Semana 12

La implementación finalizará con puntos de extensión para:

- secure storage;
- base local;
- persistencia después de reinicio;
- caché;
- outbox;
- estado offline;
- sincronización;
- conflictos;
- logout con limpieza persistente.

Feature 011 no implementará estas responsabilidades antes de tiempo.

## 24. Preparación para Semana 13

La arquitectura deberá permitir incorporar posteriormente:

- cliente HTTP central;
- inyección automática de Authorization;
- refresh token;
- control de concurrencia de refresh;
- timeout;
- cancelación;
- reintentos;
- clasificación de fallos;
- logs seguros;
- fuente remota;
- fuente local;
- repositorio.

Las páginas no deberán necesitar una reconstrucción para adoptar estas mejoras.

## 25. Reglas de implementación

- Trabajar directamente sobre `main`.
- Mantener commits pequeños y coherentes.
- No utilizar `git add .`.
- No ejecutar comandos Git destructivos salvo necesidad justificada.
- No instalar dependencias sin justificar su necesidad.
- No almacenar secretos ni credenciales en el repositorio.
- No almacenar tokens en `localStorage`.
- No fijar IDs de base de datos en la interfaz como solución definitiva.
- No modificar el modelo canónico de Semana 4 sin necesidad demostrada.
- No adelantar almacenamiento offline de Semana 12.
- No adelantar capacidades nativas de Semana 14.
- No afirmar que una evidencia fue verificada si todavía no fue ejecutada.
- Mantener el backend como autoridad final de autenticación y autorización.
- Ejecutar verificaciones antes de cada commit funcional.
