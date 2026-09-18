# Sistema de diseño y catálogo de componentes - Feature 010

## 1. Propósito

Este documento describe el sistema visual y los componentes reutilizables
implementados durante la Feature 010 de ZamoraFest.

El objetivo es dejar una base consistente para las siguientes etapas del
proyecto, evitando duplicar estilos, lógica de presentación o patrones de
interacción.

La Feature 010 no modifica el modelo de datos ni el dominio definido
previamente. Su alcance se concentra en tokens visuales, accesibilidad,
componentes reutilizables, patrones de composición, adaptación responsive y
soporte para modo claro y oscuro.

## 2. Sistema de tokens

Los tokens se encuentran centralizados en:

`mobile/src/theme/variables.css`

Se evita distribuir valores visuales arbitrarios entre componentes cuando
existe un token reutilizable.

### 2.1. Colores primitivos y semánticos

La paleta utiliza verdes naturales y tonos menta como identidad principal de
ZamoraFest. También incorpora un acento dorado de uso limitado para
proporcionar jerarquía visual al evento destacado.

Los principales grupos son verdes naturales, neutros con matiz verde, dorados
suaves, colores de estado y blanco.

Los componentes utilizan colores semánticos para representar fondo,
superficies, texto, color primario, bordes, foco y estados. Esta separación
permite modificar la identidad visual sin alterar individualmente cada
componente.

## 3. Tipografía

La familia tipográfica base utiliza fuentes disponibles en el sistema:

`Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`

No se incorpora una dependencia externa de fuentes durante esta fase.

| Token | Valor |
| --- | ---: |
| `--zf-font-size-caption` | 0.75rem |
| `--zf-font-size-label` | 0.875rem |
| `--zf-font-size-body` | 1rem |
| `--zf-font-size-heading` | 1.125rem |
| `--zf-font-size-title` | 1.375rem |
| `--zf-font-size-display` | `clamp(1.75rem, 5vw, 2.125rem)` |

Los pesos tipográficos definidos son:

| Token | Valor |
| --- | ---: |
| `--zf-font-weight-medium` | 500 |
| `--zf-font-weight-semibold` | 600 |
| `--zf-font-weight-bold` | 700 |

Las unidades relativas permiten que la interfaz se adapte a distintos tamaños
de pantalla y configuraciones de accesibilidad.

## 4. Espaciado

El sistema utiliza una escala basada en incrementos de 4 px.

| Token | Valor aproximado |
| --- | ---: |
| `--zf-space-1` | 4 px |
| `--zf-space-2` | 8 px |
| `--zf-space-3` | 12 px |
| `--zf-space-4` | 16 px |
| `--zf-space-5` | 20 px |
| `--zf-space-6` | 24 px |
| `--zf-space-8` | 32 px |

Esta escala mantiene consistencia entre separación de secciones, padding
interno, encabezados, filtros, tarjetas y acciones.

## 5. Radios y elevación

Los radios se organizan mediante tokens de tamaño pequeño, medio, grande,
extra grande y tipo píldora.

| Token | Uso principal |
| --- | --- |
| `--zf-radius-sm` | elementos pequeños |
| `--zf-radius-md` | controles |
| `--zf-radius-lg` | superficies |
| `--zf-radius-xl` | tarjetas |
| `--zf-radius-pill` | chips y badges |

La elevación utiliza dos niveles:

`--zf-shadow-sm`

`--zf-shadow-md`

La elevación es moderada y el nivel superior se reserva para elementos con
mayor jerarquía, como el evento destacado.

## 6. Interacción y accesibilidad

Las propiedades visuales reutilizables relacionadas con interacción se
centralizan mediante tokens del tema.

| Token | Valor | Propósito |
| --- | ---: | --- |
| `--zf-control-min-size` | 3rem | Tamaño mínimo de controles táctiles |
| `--zf-border-width` | 1px | Grosor común de bordes |
| `--zf-focus-ring-width` | 3px | Grosor del indicador de foco |
| `--zf-focus-ring-offset` | 2px | Separación entre control y foco |
| `--zf-disabled-opacity` | 0.6 | Opacidad de controles deshabilitados |

### 6.1. Tamaño mínimo táctil

El sistema define:

`--zf-control-min-size: 3rem`

Con una raíz tipográfica de 16 px equivale aproximadamente a 48 px.

Este mínimo se aplica a controles interactivos como `PrimaryButton` y
`FilterChip`.

Los badges informativos no requieren esa dimensión porque no representan
objetivos táctiles.

### 6.2. Bordes

El grosor común de los bordes reutilizables se centraliza mediante:

`--zf-border-width: 1px`

Los componentes combinan este token con los colores semánticos correspondientes
en lugar de repetir el grosor directamente en cada archivo CSS.

### 6.3. Foco visible

El foco utiliza:

`--zf-focus-ring-width: 3px`

y:

`--zf-focus-ring-offset: 2px`

Los controles interactivos implementan `:focus-visible` y consumen además
`--zf-color-focus` para mantener una indicación perceptible y coherente.

### 6.4. Estado deshabilitado

Los controles deshabilitados utilizan:

`--zf-disabled-opacity: 0.6`

La opacidad queda centralizada en el tema para evitar que cada componente
defina independientemente su tratamiento visual.

### 6.5. Consumo desde componentes

`PrimaryButton`, `FilterChip`, `AsyncStateView` y `EventCard` consumen estos
tokens desde sus hojas de estilo.

De esta forma, propiedades reutilizables como peso tipográfico, grosor de
borde, tamaño táctil, foco y opacidad de estado no quedan replicadas como
constantes visuales independientes entre componentes.

## 7. Contraste WCAG 2.2 AA

Se utilizaron como referencia los criterios de contraste de WCAG 2.2 AA:

- texto normal: mínimo 4.5:1;
- texto grande: mínimo 3:1;
- elementos no textuales necesarios para reconocer controles o estados:
  mínimo 3:1.

Las relaciones se calcularon utilizando los colores opacos finales de la
interfaz.

### 7.1. Contraste en modo claro

| Elemento | Primer color | Fondo | Relación | Resultado |
| --- | --- | --- | ---: | --- |
| Texto principal | `#17211D` | `#F7FBF9` | 15.82:1 | Cumple |
| Texto secundario | `#53645C` | `#F7FBF9` | 6.02:1 | Cumple |
| Primario | `#2F7559` | `#FFFFFF` | 5.51:1 | Cumple |
| Texto sobre primario | `#FFFFFF` | `#2F7559` | 5.51:1 | Cumple |
| Borde fuerte | `#789888` | `#FFFFFF` | 3.16:1 | Cumple |
| Foco | `#2F7559` | `#FFFFFF` | 5.51:1 | Cumple |

El borde fuerte `#789888` sobre el fondo general `#F7FBF9` alcanza
aproximadamente 3.03:1.

### 7.2. Contraste en modo oscuro

| Elemento | Primer color | Fondo | Relación | Resultado |
| --- | --- | --- | ---: | --- |
| Texto principal | `#F4F8F6` | `#0E1D18` | 16.23:1 | Cumple |
| Texto secundario | `#B9CBC2` | `#0E1D18` | 10.26:1 | Cumple |
| Primario menta | `#72D9AA` | `#0E1D18` | 10.12:1 | Cumple |
| Texto sobre primario | `#0E1D18` | `#72D9AA` | 10.12:1 | Cumple |
| Borde normal | `#5C8B76` | `#15352A` | 3.44:1 | Cumple |
| Borde fuerte | `#69D6A3` | `#15352A` | 7.46:1 | Cumple |
| Foco | `#72D9AA` | `#15352A` | 7.76:1 | Cumple |
| Texto principal destacado | `#F4F8F6` | `#194434` | 10.22:1 | Cumple |
| Texto secundario destacado | `#B9CBC2` | `#194434` | 6.46:1 | Cumple |
| Acento dorado | `#E7C875` | `#194434` | 6.74:1 | Cumple |

El dorado se utiliza como acento visual y no constituye por sí solo el medio
para transmitir información funcional.

Los degradados y transparencias complementan la presentación, pero la
comprensión del contenido no depende exclusivamente de ellos.

## 8. Identidad visual

La identidad visual combina un fondo verde profundo, superficies verdes
diferenciadas, verde menta como color primario, tonos claros para texto y un
dorado suave como acento secundario.

El dorado se reserva principalmente para el evento destacado. Esta decisión
crea jerarquía sin perder la asociación visual con Zamora Chinchipe y con la
temática cultural y natural de ZamoraFest.

## 9. Catálogo de componentes reutilizables

### 9.1. PrimaryButton

**Propósito de PrimaryButton.**

Representar una acción primaria reutilizable y accesible.

**Interfaz pública de PrimaryButton.**

| Propiedad | Tipo | Obligatoria | Valor por defecto |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Sí | — |
| `type` | `'button' \| 'submit'` | No | `'button'` |
| `disabled` | `boolean` | No | `false` |
| `loading` | `boolean` | No | `false` |
| `loadingLabel` | `string` | No | `'Cargando...'` |
| `expand` | `'block' \| 'full'` | No | `'block'` |
| `ariaLabel` | `string` | No | — |
| `onClick` | `() => void` | No | — |

**Estados de PrimaryButton.**

El componente contempla estado normal, deshabilitado, carga y foco visible.
Durante `loading` se deshabilita, expone `aria-busy`, muestra un spinner y
utiliza una etiqueta de carga configurable.

El contenido principal se delega mediante `children` y la acción mediante el
callback `onClick`.

**Justificación de reutilización de PrimaryButton.**

Las acciones primarias aparecen en autenticación, formularios, reintentos,
confirmaciones y gestión de eventos. Centralizar el patrón evita repetir
comportamiento, dimensiones táctiles y estilos de foco.

### 9.2. FilterChip

**Propósito de FilterChip.**

Representar una opción seleccionable dentro de un conjunto de filtros.

**Interfaz pública de FilterChip.**

| Propiedad | Tipo | Obligatoria | Valor por defecto |
| --- | --- | --- | --- |
| `label` | `string` | Sí | — |
| `selected` | `boolean` | No | `false` |
| `disabled` | `boolean` | No | `false` |
| `onClick` | `() => void` | Sí | — |

El componente contempla estados normal, seleccionado, deshabilitado y foco
visible.

Utiliza semántica de botón y comunica su estado mediante `aria-pressed`.

**Justificación de reutilización de FilterChip.**

Puede reutilizarse posteriormente para categorías, cantones, fechas,
colecciones de descubrimiento y filtros administrativos. El componente no
conoce el criterio de filtrado; la pantalla proporciona la etiqueta, el estado
y la acción.

### 9.3. AsyncStateView

**Propósito de AsyncStateView.**

Unificar la presentación y semántica de estados asincrónicos.

**Interfaz pública de AsyncStateView.**

| Propiedad | Tipo | Obligatoria | Valor por defecto |
| --- | --- | --- | --- |
| `state` | `'loading' \| 'empty' \| 'error'` | Sí | — |
| `title` | `string` | No | depende de `state` |
| `message` | `string` | No | depende de `state` |
| `actionLabel` | `string` | No | `'Reintentar'` |
| `onAction` | `() => void` | No | — |

Para `loading` utiliza `role="status"`, `aria-live="polite"` y
`aria-busy="true"`.

Para `error` utiliza `role="alert"` y `aria-live="assertive"`.

El estado `empty` informa de ausencia de contenido sin presentarlo como error.

La acción se muestra únicamente cuando el estado no es `loading` y existe
`onAction`. La acción reutiliza internamente `PrimaryButton`.

**Justificación de reutilización de AsyncStateView.**

Los estados loading, empty y error son comunes a pantallas que dependen de API,
persistencia local, sincronización, permisos o recursos nativos. Centralizar
estos estados evita mensajes y comportamientos inconsistentes.

### 9.4. ScreenHeader

**Propósito de ScreenHeader.**

Representar el encabezado contextual reutilizable de una pantalla.

**Interfaz pública de ScreenHeader.**

| Propiedad | Tipo | Obligatoria | Valor por defecto |
| --- | --- | --- | --- |
| `title` | `string` | Sí | — |
| `eyebrow` | `string` | No | — |
| `description` | `string` | No | — |
| `actions` | `ReactNode` | No | — |

`actions` permite delegar controles desde una pantalla sin que `ScreenHeader`
conozca su naturaleza.

La zona podrá utilizarse posteriormente para perfil, creación, edición,
filtros u otras acciones contextuales.

**Justificación de reutilización de ScreenHeader.**

Las pantallas principales necesitan una estructura consistente formada por
título, contexto, descripción y acciones opcionales. El componente evita
duplicar esta composición y no conoce rutas ni lógica de negocio.

### 9.5. EventCard

**Propósito de EventCard.**

Representar información resumida de un evento sin consultar directamente el
backend.

**Interfaz pública de EventCard.**

| Propiedad | Tipo | Obligatoria | Valor por defecto |
| --- | --- | --- | --- |
| `title` | `string` | Sí | — |
| `description` | `string` | No | — |
| `dateLabel` | `string` | Sí | — |
| `locationLabel` | `string` | Sí | — |
| `categoryLabels` | `readonly string[]` | No | `[]` |
| `costLabel` | `string` | No | — |
| `actionLabel` | `string` | No | `'Ver detalles'` |
| `onAction` | `() => void` | No | — |
| `variant` | `'featured' \| 'compact'` | No | `'compact'` |

La variante `featured` proporciona mayor jerarquía al próximo evento mediante
una superficie diferenciada, descripción, badges y metadatos.

La variante `compact` reduce la densidad visual para listados secundarios.

Cuando se proporciona `onAction`, la tarjeta puede utilizar `PrimaryButton`.

Los iconos decorativos utilizan `aria-hidden="true"` y fecha y lugar conservan
información semántica aunque su presentación visual sea compacta.

**Justificación de reutilización de EventCard.**

La misma representación puede utilizarse en exploración, resultados de
búsqueda, favoritos, historial, agenda, eventos cercanos y listados
administrativos. Las variantes evitan crear componentes separados para cada
nivel de jerarquía.

## 10. Independencia de arquitectura

Los cinco componentes reutilizables están diseñados para permanecer
independientes de la infraestructura y del dominio específico de cada
pantalla.

No realizan solicitudes HTTP, no conocen endpoints, no controlan rutas, no
redireccionan, no consultan autenticación global y no acceden directamente al
almacenamiento.

Las pantallas son responsables de obtener los datos, preparar etiquetas,
manejar navegación, decidir acciones y componer los componentes.

Esta separación reduce acoplamiento y mejora reutilización y capacidad de
prueba.

## 11. Patrones visuales reutilizables previstos

### 11.1. Patrón de encabezado contextual

El patrón combina título, descripción y acciones opcionales mediante
`ScreenHeader`.

Está previsto para explorar eventos, favoritos, recordatorios, gestión de
eventos, perfil y formularios administrativos.

### 11.2. Patrón de estados asincrónicos

`AsyncStateView` concentra loading, empty, error y reintento.

Está previsto para explorar, favoritos, recordatorios, detalle, listados
administrativos y futuras vistas con sincronización u operación offline.

### 11.3. Patrón de acción primaria

`PrimaryButton` concentra acción principal, carga, estado deshabilitado y foco
accesible.

Está previsto para login, formularios, publicación, confirmaciones y
reintentos.

### 11.4. Patrón de filtros seleccionables

`FilterChip` concentra opción activa, inactiva y comportamiento táctil.

Está previsto para categorías, cantones, fechas, colecciones de descubrimiento
y estados administrativos.

### 11.5. Patrón de resumen de evento

`EventCard` concentra categoría, costo, título, descripción, fecha, lugar y
acción opcional.

Está previsto para explorar, búsqueda, favoritos, agenda, eventos cercanos e
historial.

## 12. Decisiones para evitar retrabajo

Durante Feature 010 se decidió no incorporar funcionalidades ficticias o
prematuras.

No se implementó un buscador limitado únicamente a los primeros eventos
cargados, no se simuló un avatar sin contrato de datos, no se simularon
imágenes no proporcionadas por el contrato móvil y no se adelantó la
navegación definitiva.

El evento destacado y los eventos compactos reutilizan el mismo `EventCard`
mediante variantes.

Las categorías de dominio permanecen separadas de futuras colecciones de
descubrimiento.

Los controles táctiles mantienen un mínimo aproximado de 48 px y la
información semántica se conserva aunque algunos conceptos se presenten con
iconografía.

## 13. Base preparada para siguientes semanas

El sistema de diseño queda preparado para incorporar navegación, rutas públicas
y protegidas, formularios, búsqueda, filtros avanzados, favoritos,
recordatorios, persistencia local, sincronización, imágenes, geolocalización,
cámara, notificaciones y otras capacidades nativas.

Las funcionalidades futuras deberán reutilizar los tokens y componentes
existentes siempre que coincidan con su responsabilidad, evitando
reconstrucciones innecesarias.

Las futuras funciones de inteligencia artificial deberán trabajar sobre datos
reales disponibles en ZamoraFest y no inventar eventos ni información ausente
de la fuente de datos.
