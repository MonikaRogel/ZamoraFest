# Evidencias y validación - Feature 010

## 1. Inventario de pantallas derivado de la API

El inventario de pantallas de ZamoraFest se deriva de los endpoints reales
expuestos por el backend. La existencia de un endpoint no implica
automáticamente una pantalla independiente: operaciones como eliminación,
publicación, favoritos o renovación de token pueden resolverse como acciones
o procesos internos dentro de otras vistas.

### 1.1. Autenticación

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `POST /api/v1/auth/register` | Público | Registro |
| `POST /api/v1/auth/login` | Público | Inicio de sesión |
| `POST /api/v1/auth/refresh` | Técnico | Renovación interna de sesión |

### 1.2. Categorías

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/categorias` | Público | Catálogo utilizado por filtros |

Las categorías no requieren una pantalla independiente durante esta fase.
Funcionan como criterio de descubrimiento y filtrado.

### 1.3. Eventos

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/eventos` | Público | Explorar eventos |
| `GET /api/v1/eventos/:id` | Público | Detalle del evento |
| `POST /api/v1/eventos` | ASISTENTE | Crear evento |
| `PATCH /api/v1/eventos/:id` | ASISTENTE / ADMINISTRADOR | Editar evento |
| `DELETE /api/v1/eventos/:id` | ADMINISTRADOR | Acción administrativa |
| `POST /api/v1/eventos/:id/revision` | ADMINISTRADOR | Revisión de evento |
| `POST /api/v1/eventos/:id/publicacion` | ADMINISTRADOR | Publicación de evento |

La revisión y publicación pueden integrarse en una misma vista administrativa
de detalle y no requieren necesariamente pantallas separadas.

### 1.4. Programación de eventos

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/eventos/:eventoId/programaciones` | Público | Agenda del evento |
| `GET /api/v1/eventos/:eventoId/programaciones/:programacionId` | Público | Detalle de actividad |
| `POST /api/v1/eventos/:eventoId/programaciones` | ASISTENTE / ADMINISTRADOR | Crear actividad |
| `PATCH /api/v1/eventos/:eventoId/programaciones/:programacionId` | ASISTENTE / ADMINISTRADOR | Editar actividad |
| `DELETE /api/v1/eventos/:eventoId/programaciones/:programacionId` | ASISTENTE / ADMINISTRADOR | Eliminar actividad |

La programación pública puede presentarse dentro del detalle del evento.
La edición sí requiere controles específicos para usuarios autorizados.

### 1.5. Imágenes

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/eventos/:eventoId/imagenes` | Público | Galería del evento |
| `GET /api/v1/eventos/:eventoId/imagenes/:imagenId` | Público | Visualización de imagen |
| `POST /api/v1/eventos/:eventoId/imagenes` | ASISTENTE / ADMINISTRADOR | Gestión de imágenes |
| `DELETE /api/v1/eventos/:eventoId/imagenes/:imagenId` | ASISTENTE / ADMINISTRADOR | Eliminación de imagen |

La galería pública se considera parte del detalle del evento. La gestión de
imágenes corresponde al flujo de administración del contenido.

### 1.6. Favoritos

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/favoritos` | Autenticado | Mis favoritos |
| `POST /api/v1/favoritos` | Autenticado | Agregar favorito |
| `DELETE /api/v1/favoritos/:eventoId` | Autenticado | Quitar favorito |

Agregar y quitar favoritos son acciones asociadas a eventos. El listado de
favoritos sí justifica una vista propia.

### 1.7. Recordatorios

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/recordatorios` | Autenticado | Mis recordatorios |
| `POST /api/v1/recordatorios` | Autenticado | Crear recordatorio |

El listado justifica una vista propia, mientras que la creación puede
originarse desde el detalle del evento o de una actividad.

### 1.8. Salud del backend

| Endpoint | Acceso | Derivación móvil |
| --- | --- | --- |
| `GET /api/v1/health` | Técnico | Sin pantalla de usuario |

El endpoint de salud se utiliza para diagnóstico y verificación de
infraestructura y no representa una función de interfaz para el usuario.

## 2. Pantallas funcionales previstas

A partir del análisis de los endpoints, se identifican las siguientes vistas
funcionales:

1. Explorar eventos.
2. Detalle del evento.
3. Inicio de sesión.
4. Registro.
5. Mis favoritos.
6. Mis recordatorios.
7. Crear o editar evento.
8. Revisión y publicación administrativa de evento.
9. Agenda o programación del evento.
10. Crear o editar actividad.
11. Gestión de imágenes del evento.

Este inventario no obliga a que cada función se implemente como una ruta
independiente. Durante las siguientes semanas podrán utilizarse pantallas
compuestas, rutas anidadas, modales o acciones contextuales según corresponda.

La única pantalla completa implementada dentro del alcance de Feature 010 es
`ExploreEventsPage`, correspondiente a **Explorar eventos**.

## 3. Verificación contra backend real

`ExploreEventsPage` fue ejecutada contra el backend real de ZamoraFest.

La pantalla consume:

`GET /api/v1/eventos`

mediante:

`zamoraFestApi.getEventos()`.

Durante la comprobación se confirmó que la pantalla no depende de datos
estáticos incrustados en el componente.

La comunicación fue verificada desde el navegador y desde el dispositivo
Android físico, utilizando la configuración de desarrollo existente del
proyecto.

La pantalla presentó eventos procedentes de la API y mantuvo correctamente
sus estados visuales y filtros.

Resultado:

- carga desde backend real: correcta;
- presentación de eventos: correcta;
- filtrado por categoría: correcto;
- selección del próximo evento: correcta;
- ausencia de errores visibles de integración: confirmada.

Esta verificación respalda T025.

## 4. Verificación responsive

La pantalla fue comprobada en más de un ancho.

### 4.1. Dispositivo Android físico

Se utilizó un Samsung real con Android 11.

La interfaz conservó:

- jerarquía visual;
- legibilidad;
- controles táctiles;
- filtros;
- tarjeta destacada;
- listado de eventos;
- desplazamiento vertical.

No se observaron desbordamientos horizontales.

### 4.2. Vista de 768 × 1024

La segunda comprobación se realizó mediante las herramientas responsivas del
navegador con:

- ancho: 768 px;
- alto: 1024 px;
- zoom: 100 %.

En esta anchura se verificó:

- ausencia de overflow horizontal;
- encabezado completo;
- título y descripción sin recortes;
- filtros correctamente distribuidos;
- evento destacado estable;
- cambio del listado secundario a dos columnas;
- badges y metadatos sin superposición.

Resultado: correcto.

Esta comprobación respalda T035.

## 5. Fuente del sistema ampliada

La interfaz fue comprobada en el Samsung físico aumentando el tamaño de fuente
del sistema.

También se activó temporalmente la opción de fuente negrita, sometiendo la
interfaz a una condición más exigente que el tamaño estándar.

Se verificó que:

- el encabezado siguiera siendo legible;
- el título de pantalla no se cortara;
- la descripción pudiera crecer verticalmente;
- los filtros permanecieran utilizables;
- los títulos de eventos no se desbordaran;
- fecha y lugar permanecieran visibles;
- los badges mantuvieran su estructura;
- las tarjetas crecieran verticalmente en lugar de ocultar contenido.

No se detectaron superposiciones ni pérdida de contenido funcional.

Esta comprobación respalda T036.

## 6. Verificación con TalkBack

Se activó TalkBack en el dispositivo Android físico y se recorrió el flujo
principal de `ExploreEventsPage`.

Se comprobó el acceso mediante lector de pantalla a:

- identidad de ZamoraFest;
- título de pantalla;
- filtros;
- encabezado de próximo evento;
- categorías;
- costo;
- título del evento;
- fecha;
- lugar;
- listado de más eventos.

El foco de accesibilidad fue visible durante el recorrido.

Los filtros fueron reconocidos como controles interactivos y su estado se
expone mediante `aria-pressed`.

Los iconos decorativos no interfieren con la lectura porque utilizan
`aria-hidden="true"` cuando corresponde.

Resultado: navegación funcional mediante lector de pantalla.

Esta comprobación respalda T034 y T037.

## 7. Áreas táctiles y foco

El sistema de diseño define:

`--zf-control-min-size: 3rem`

Con una raíz tipográfica estándar de 16 px, este valor corresponde
aproximadamente a 48 px.

Este mínimo se aplica a controles interactivos como:

- `PrimaryButton`;
- `FilterChip`.

El foco visible utiliza un grosor de 3 px.

Durante la comprobación manual se confirmó que los filtros y acciones
principales disponen de un área de interacción adecuada y foco reconocible.

Los badges no se consideran objetivos táctiles y, por tanto, no requieren la
misma dimensión mínima.

Esta comprobación respalda T033.

## 8. Verificación integral en Samsung físico

`ExploreEventsPage` fue utilizada directamente en el dispositivo Android
físico.

Se verificaron:

- carga de la pantalla;
- datos reales;
- desplazamiento;
- filtros;
- tarjetas;
- tipografía;
- fuente ampliada;
- interacción táctil;
- TalkBack.

La prueba no se limitó a un emulador.

Resultado: correcto.

Esta comprobación respalda T038.

## 9. Verificación de accesibilidad

La revisión de accesibilidad de Feature 010 incluyó:

- contraste textual;
- contraste no textual;
- tamaño táctil;
- foco visible;
- nombre y estado de controles;
- dos anchos de pantalla;
- fuente ampliada;
- fuente negrita;
- dispositivo físico;
- TalkBack.

Las principales decisiones aplicadas durante la implementación fueron:

- mínimo táctil de aproximadamente 48 px;
- foco visible de 3 px;
- `aria-pressed` en filtros seleccionables;
- `aria-busy` en estados de carga;
- `aria-live` para cambios asincrónicos;
- `role="alert"` en errores;
- iconos decorativos ocultos para tecnologías de asistencia;
- conservación semántica de fecha y lugar;
- crecimiento vertical de contenido ante fuente ampliada;
- ausencia de información dependiente exclusivamente del color.

No fue necesario realizar una corrección adicional de CSS después de las
pruebas físicas porque la composición final superó las verificaciones
ejecutadas.

Esta sección respalda T044.

## 10. Registro de uso de inteligencia artificial

Durante Feature 010 se utilizaron herramientas de inteligencia artificial como
apoyo al proceso de análisis, revisión y documentación.

El uso incluyó:

- análisis del material académico de Semana 10;
- revisión de continuidad con las semanas anteriores;
- contraste entre requerimientos académicos y arquitectura existente;
- revisión de componentes reutilizables;
- análisis de accesibilidad;
- apoyo para estructurar pruebas;
- revisión de errores y advertencias;
- organización del sistema de diseño;
- preparación de documentación técnica;
- revisión de consistencia antes del cierre Git.

La inteligencia artificial no sustituyó las verificaciones técnicas.

Las decisiones fueron comprobadas mediante:

- ejecución real del código;
- pruebas automatizadas;
- lint;
- build;
- inspección de la interfaz;
- dispositivo Android físico;
- herramientas responsivas del navegador;
- TalkBack.

No se utilizaron datos ficticios para afirmar resultados que no hubieran sido
verificados.

Esta sección respalda T045.

## 11. Repositorio del proyecto

El código fuente de ZamoraFest se mantiene en el siguiente repositorio público:

`https://github.com/MonikaRogel/ZamoraFest`

Repositorio:

`MonikaRogel/ZamoraFest`

Rama principal:

`main`

Rama utilizada para Feature 010:

`feat/010-diseno-ui-movil`

El enlace permite la
consulta del código presentado y de las evidencias asociadas a la feature.
