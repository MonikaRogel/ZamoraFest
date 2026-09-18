# Especificación: diseño UI móvil y componentes reutilizables (010)

## Estado

- **Rama:** `feat/010-diseno-ui-movil`
- **Fase:** Semana 10
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe
- **Estado funcional:** implementación validada; documentación y evidencias en cierre

## 1. Propósito

Definir el sistema de diseño móvil de ZamoraFest, construir componentes reutilizables y ensamblar una primera pantalla real utilizando datos de la API existente.

La Feature 010 mantiene la propuesta original de ZamoraFest y el modelo canónico realineado con Semana 4. No modifica el dominio ni la base de datos.

El objetivo de esta feature es dejar una base visual, accesible y reutilizable sobre la cual las siguientes semanas puedan incorporar navegación, estado, persistencia local, integración API avanzada y capacidades nativas sin reconstruir la interfaz existente.

## 2. Pantalla real seleccionada

La pantalla de evidencia es **Explorar eventos**, disponible mediante la ruta pública `/explore`.

Consume `GET /api/v1/eventos` mediante `zamoraFestApi.getEventos()` y presenta información real procedente del backend.

La consulta pública de eventos no depende obligatoriamente del inicio de sesión.

La pantalla incluye:

- identidad visual de ZamoraFest;
- encabezado de pantalla reutilizable;
- filtros por categoría;
- selección del próximo evento futuro;
- tarjeta destacada para el próximo evento;
- listado compacto de los demás eventos;
- estados loading, empty y error;
- reintento cuando ocurre un error de carga;
- comportamiento responsivo.

## 3. Componentes reutilizables

La Feature 010 define cinco componentes reutilizables:

- `EventCard`: presentación reusable de eventos mediante variantes `featured` y `compact`.
- `FilterChip`: control seleccionable reusable para filtros; en `ExploreEventsPage` se utiliza para filtrar por categoría.
- `AsyncStateView`: representación reusable de estados loading, empty y error.
- `PrimaryButton`: acción primaria reusable con tamaño táctil y foco accesible.
- `ScreenHeader`: encabezado reusable de pantalla con título, descripción, texto contextual y zona opcional de acciones.

Los componentes:

- no consultan directamente la API;
- no conocen rutas de navegación;
- no dependen de autenticación global;
- reciben datos y comportamiento mediante propiedades;
- utilizan tokens del sistema de diseño;
- pueden ser compuestos por las pantallas sin incorporar lógica de dominio innecesaria.

## 4. Sistema de diseño

El sistema visual se implementa mediante tokens centralizados en `src/theme/variables.css`.

Incluye:

- colores primitivos;
- colores semánticos;
- superficies;
- contraste y estados;
- tipografía;
- escala de espaciado;
- radios;
- elevación;
- tamaño mínimo de interacción;
- foco visible;
- tokens específicos para cards, badges y filtros;
- integración con variables de Ionic;
- adaptación automática a modo claro y oscuro.

La identidad visual mantiene una base verde natural asociada a Zamora Chinchipe, con tonos menta y un acento dorado limitado al evento destacado.

Los valores visuales reutilizables deben proceder de tokens y no quedar dispersos entre componentes.

## 5. Accesibilidad y adaptación

La Feature 010 debe considerar WCAG 2.2 AA y las condiciones reales de uso móvil.

Se verifican:

- contraste textual;
- contraste no textual cuando el elemento requiere diferenciación visual;
- tamaño mínimo de controles táctiles;
- foco visible;
- nombre, función y estado de controles interactivos;
- comportamiento responsivo en más de un ancho;
- tamaño de fuente del sistema ampliado;
- fuente negrita del sistema;
- navegación y lectura mediante TalkBack;
- ejecución en un dispositivo Android físico.

El tamaño mínimo definido para controles interactivos es de `3rem`, equivalente a 48 px con la base tipográfica normal.

## 6. Evolución prevista

La interfaz de Semana 10 queda preparada para incorporar posteriormente:

- navegación y rutas;
- búsqueda;
- filtros avanzados por cantón, categoría y fecha;
- autenticación y estado de usuario;
- avatar o acceso al perfil;
- favoritos;
- recordatorios;
- persistencia local;
- sincronización y comportamiento offline;
- imágenes de eventos;
- geolocalización;
- cámara;
- notificaciones;
- capacidades nativas;
- funciones de inteligencia artificial sustentadas en datos reales de ZamoraFest.

Estas capacidades no se simulan dentro de Feature 010 cuando todavía no existe su implementación funcional.

## 7. Fuera de alcance

No se implementan todavía:

- navegación definitiva;
- persistencia segura;
- almacenamiento offline;
- búsqueda global contra la API;
- filtros avanzados de backend;
- GPS;
- cámara;
- notificaciones nativas;
- imágenes de evento no expuestas por el contrato móvil actual;
- avatar de usuario no expuesto por el contrato actual;
- inteligencia artificial funcional.

Estas capacidades quedan reservadas para sus semanas y features correspondientes.

## 8. Criterios de aceptación

La Feature 010 se considera técnicamente preparada para cierre cuando:

- el sistema de tokens está implementado;
- existen al menos tres componentes reutilizables reales;
- los componentes son independientes del backend y de la navegación;
- loading, empty y error están resueltos;
- `ExploreEventsPage` consume `GET /api/v1/eventos`;
- el filtrado por categoría funciona;
- la pantalla funciona contra el backend real;
- TypeScript no presenta errores;
- lint finaliza correctamente;
- la suite completa de pruebas finaliza correctamente;
- el build de producción finaliza correctamente;
- la interfaz se verifica en dos anchos;
- la fuente ampliada no rompe la composición;
- TalkBack puede recorrer el flujo principal;
- la pantalla funciona en el Samsung físico;
- las mediciones de contraste quedan documentadas;
- el catálogo de componentes queda documentado;
- las evidencias de ejecución y accesibilidad quedan conservadas;
- el uso de herramientas de IA queda registrado;
- el cierre Git se realiza únicamente después de superar las verificaciones finales.
