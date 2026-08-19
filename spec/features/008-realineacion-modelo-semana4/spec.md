# Especificación: realineación del modelo de datos con Semana 4 (008)

## Metadatos

- **Rama:** `fix/realineacion-modelo-semana4`.
- **Estado:** en revisión.
- **Origen:** corrección de coherencia académica y técnica.
- **Modelo canónico:** diseño relacional de ZamoraFest presentado en Semana 4.
- **Depende de:** requisitos acumulativos del práctico experimental y de las Semanas 4, 5, 6, 7 y 8.
- **Bloquea a:** continuación de la integración móvil hasta recuperar la correspondencia entre base de datos, ORM, backend y API.

## Problema identificado

Durante la implementación posterior al diseño de Semana 4 se construyó un modelo de datos reducido que no conserva íntegramente las entidades, atributos, relaciones y reglas de negocio previamente definidas para ZamoraFest.

La implementación actual simplifica la jerarquía territorial, modifica las claves primarias, reemplaza la tabla de roles por un enum, reduce la entidad `evento`, omite favoritos y transforma parcialmente el concepto funcional de `recordatorio` en un mecanismo de procesamiento técnico.

Aunque el backend resultante es ejecutable y cuenta con pruebas automatizadas, dicha implementación no mantiene la correspondencia estricta exigida entre el diseño de la base de datos, el backend y las funcionalidades del proyecto.

Esta especificación establece la realineación sin ocultar ni reescribir el historial anterior.

## Objetivo

Restablecer el modelo relacional de Semana 4 como núcleo canónico de ZamoraFest y adaptar posteriormente PostgreSQL, Prisma, repositorios, servicios, API, autenticación, optimizaciones, pruebas y documentación para que trabajen sobre dicho modelo.

La corrección deberá preservar las mejoras técnicas incorporadas en semanas posteriores únicamente cuando:

1. respondan a un requisito académico posterior;
2. no sustituyan ni contradigan una entidad o regla definida en Semana 4;
3. puedan justificarse técnicamente;
4. sean documentadas como una evolución del modelo base.

## Principio de trazabilidad

La cadena obligatoria de correspondencia será:

`Requisito funcional → Diseño Semana 4 → PostgreSQL → Prisma ORM → Repositorios → Servicios → API → Pruebas → Aplicación móvil`

Una modificación no podrá considerarse terminada si cualquiera de estas capas representa un modelo diferente.

## Fuente de verdad

El diseño de Semana 4 constituye la fuente de verdad para:

- entidades funcionales;
- atributos;
- relaciones;
- claves primarias;
- claves foráneas;
- cardinalidades;
- reglas de negocio;
- jerarquía territorial;
- asociación de eventos;
- favoritos;
- recordatorios;
- imágenes;
- programación;
- usuarios y roles.

Las extensiones introducidas posteriormente deberán identificarse explícitamente y no podrán reemplazar elementos del diseño base.

## Alcance

### Incluye

- Recuperar las 14 entidades funcionales de Semana 4.
- Recuperar la jerarquía territorial completa.
- Recuperar las claves primarias de tipo entero.
- Recuperar los atributos originalmente definidos.
- Recuperar las claves foráneas y cardinalidades.
- Recuperar la tabla `rol`.
- Recuperar la relación entre creador, revisor y evento.
- Recuperar la relación muchos-a-muchos entre eventos y categorías.
- Recuperar favoritos.
- Recuperar recordatorios con fecha de notificación.
- Recuperar imágenes vinculables opcionalmente a una programación.
- Recuperar programación con lugar opcional.
- Implementar restricciones de integridad.
- Implementar índices justificados por consultas reales.
- Mantener PostgreSQL como fuente de verdad.
- Mantener Prisma como ORM.
- Mantener el backend Node.js, TypeScript y Express.
- Mantener autenticación JWT y refresh tokens como extensión posterior.
- Mantener Redis como caché.
- Mantener BullMQ como infraestructura de procesamiento asíncrono.
- Adaptar pruebas automatizadas al modelo real.
- Actualizar posteriormente la documentación técnica y OpenAPI.

### No incluye todavía

- Modificación inmediata de `schema.prisma`.
- Ejecución de nuevas migraciones.
- Eliminación o reinicio de bases de datos.
- Desarrollo de nuevas pantallas móviles.
- Publicación de la aplicación.
- Incorporación arbitraria de nuevas entidades funcionales.
- Reescritura o eliminación del historial Git anterior.

## Modelo funcional canónico

El modelo funcional de ZamoraFest queda compuesto por las siguientes 14 entidades:

1. `provincia`
2. `canton`
3. `parroquia`
4. `sector`
5. `lugar`
6. `rol`
7. `usuario`
8. `categoria`
9. `evento`
10. `programacion_evento`
11. `imagen_evento`
12. `recordatorio`
13. `evento_categoria`
14. `usuario_evento_favorito`

## Jerarquía territorial

La estructura territorial obligatoria será:

`provincia → canton → parroquia → sector → lugar`

No se permitirá relacionar `lugar` directamente con `canton`, porque dicha simplificación elimina niveles territoriales definidos en el diseño original.

Un evento se relacionará con un lugar y obtendrá su contexto territorial mediante las relaciones anteriores.

## Entidad `provincia`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_provincia` | INT | PK |
| `codigo_dpa` | VARCHAR | Obligatorio y único |
| `nombre` | VARCHAR | Obligatorio y único |
| `descripcion` | TEXT | Opcional |
| `imagen_portada` | VARCHAR | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Una provincia puede contener varios cantones.

## Entidad `canton`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_canton` | INT | PK |
| `codigo_dpa` | VARCHAR | Obligatorio y único |
| `nombre` | VARCHAR | Obligatorio |
| `id_provincia` | INT | FK obligatoria a `provincia` |
| `descripcion` | TEXT | Opcional |
| `poblacion_aprox` | INT | Opcional |
| `anio_poblacion` | INT | Opcional |
| `fuente_informacion` | VARCHAR | Opcional |
| `fecha_actualizacion` | DATE | Opcional |
| `latitud` | DECIMAL | Opcional |
| `longitud` | DECIMAL | Opcional |
| `imagen_portada` | VARCHAR | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Restricciones mínimas:

- `latitud` entre -90 y 90 cuando exista.
- `longitud` entre -180 y 180 cuando exista.
- La referencia a `provincia` deberá existir.

## Entidad `parroquia`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_parroquia` | INT | PK |
| `codigo_dpa` | VARCHAR | Obligatorio y único |
| `nombre` | VARCHAR | Obligatorio |
| `id_canton` | INT | FK obligatoria a `canton` |
| `descripcion` | TEXT | Opcional |
| `poblacion_aprox` | INT | Opcional |
| `anio_poblacion` | INT | Opcional |
| `clima` | VARCHAR | Opcional |
| `altitud` | INT | Opcional |
| `latitud` | DECIMAL | Opcional |
| `longitud` | DECIMAL | Opcional |
| `imagen_portada` | VARCHAR | Opcional |
| `fuente_informacion` | VARCHAR | Opcional |
| `fecha_actualizacion` | DATE | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Restricciones mínimas:

- `latitud` entre -90 y 90 cuando exista.
- `longitud` entre -180 y 180 cuando exista.
- La referencia a `canton` deberá existir.

## Entidad `sector`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_sector` | INT | PK |
| `id_parroquia` | INT | FK obligatoria a `parroquia` |
| `nombre` | VARCHAR | Obligatorio |
| `tipo_sector` | VARCHAR | Dominio controlado |
| `descripcion` | TEXT | Opcional |
| `latitud` | DECIMAL | Opcional |
| `longitud` | DECIMAL | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Restricciones mínimas:

- Unicidad de `(id_parroquia, nombre)`.
- Coordenadas dentro de sus rangos válidos.
- `tipo_sector` deberá utilizar valores controlados.

La regla funcional documentada en Semana 4 permite utilizar un sector referencial denominado “Cabecera parroquial” cuando no se conoce un sector más específico.

## Entidad `lugar`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_lugar` | INT | PK |
| `id_sector` | INT | FK obligatoria a `sector` |
| `nombre` | VARCHAR | Obligatorio |
| `tipo_lugar` | VARCHAR | Dominio controlado |
| `direccion_referencial` | VARCHAR | Opcional |
| `referencia` | TEXT | Opcional |
| `latitud` | DECIMAL | Opcional |
| `longitud` | DECIMAL | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Restricciones mínimas:

- Unicidad de `(id_sector, nombre)`.
- Coordenadas dentro de sus rangos válidos.
- `tipo_lugar` deberá utilizar valores controlados.

La dirección específica pertenece a `lugar` y no deberá duplicarse en `evento`.

## Entidad `rol`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_rol` | INT | PK |
| `nombre` | VARCHAR | Obligatorio y único |
| `descripcion` | VARCHAR | Opcional |
| `estado` | BOOLEAN | Obligatorio |

La tabla `rol` no será reemplazada por un enum del ORM.

Los roles utilizados por la API se gestionarán como datos controlados en esta tabla.

## Entidad `usuario`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_usuario` | INT | PK |
| `id_rol` | INT | FK obligatoria a `rol` |
| `nombre_completo` | VARCHAR | Obligatorio |
| `correo` | VARCHAR | Obligatorio y único |
| `contrasena_hash` | VARCHAR | Obligatorio |
| `fecha_registro` | TIMESTAMP | Obligatorio |
| `estado` | BOOLEAN | Obligatorio |

Reglas mínimas:

- Las contraseñas nunca se almacenarán en texto plano.
- El correo deberá validarse y normalizarse antes de persistirse.
- El rol deberá existir.

## Entidad `categoria`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_categoria` | INT | PK |
| `nombre` | VARCHAR | Obligatorio y único |
| `descripcion` | TEXT | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Un evento puede pertenecer a varias categorías y una categoría puede asociarse con varios eventos mediante `evento_categoria`.

## Entidad `evento`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_evento` | INT | PK |
| `titulo` | VARCHAR | Obligatorio |
| `descripcion` | TEXT | Opcional |
| `fecha_inicio` | TIMESTAMP | Obligatorio |
| `fecha_fin` | TIMESTAMP | Opcional |
| `costo_referencial` | DECIMAL | Obligatorio |
| `id_lugar` | INT | FK obligatoria a `lugar` |
| `id_usuario_creador` | INT | FK obligatoria a `usuario` |
| `id_usuario_revisor` | INT | FK opcional a `usuario` |
| `estado_evento` | VARCHAR | Dominio controlado |
| `estado_revision` | VARCHAR | Dominio controlado |
| `fuente_informacion` | VARCHAR | Opcional |
| `fecha_creacion` | TIMESTAMP | Obligatorio |
| `fecha_actualizacion` | TIMESTAMP | Opcional |
| `fecha_revision` | TIMESTAMP | Opcional |

Restricciones y reglas mínimas:

- Cuando exista `fecha_fin`, deberá cumplirse `fecha_fin >= fecha_inicio`.
- `costo_referencial >= 0`.
- El lugar deberá existir dentro de la jerarquía territorial válida.
- Creador y revisor deberán referenciar usuarios existentes.
- `estado_evento` y `estado_revision` representan dimensiones diferentes y no se fusionarán.
- El flujo de publicación deberá respetar la regla de revisión definida en Semana 4.

## Entidad `programacion_evento`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_programacion` | INT | PK |
| `id_evento` | INT | FK obligatoria a `evento` |
| `id_lugar` | INT | FK opcional a `lugar` |
| `titulo_actividad` | VARCHAR | Obligatorio |
| `descripcion` | TEXT | Opcional |
| `fecha_hora_inicio` | TIMESTAMP | Obligatorio |
| `fecha_hora_fin` | TIMESTAMP | Opcional |
| `artista_invitado` | VARCHAR | Opcional |
| `orden` | INT | Opcional |
| `estado` | BOOLEAN | Obligatorio |

Reglas mínimas:

- Cuando exista `fecha_hora_fin`, deberá cumplirse `fecha_hora_fin >= fecha_hora_inicio`.
- Cuando `id_lugar` sea nulo, funcionalmente se utilizará el lugar principal del evento.
- Cuando `id_lugar` tenga valor, deberá referenciar un lugar existente.

## Entidad `imagen_evento`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_imagen` | INT | PK |
| `id_evento` | INT | FK obligatoria a `evento` |
| `id_programacion` | INT | FK opcional a `programacion_evento` |
| `id_usuario_subida` | INT | FK obligatoria a `usuario` |
| `url_imagen` | VARCHAR | Obligatorio |
| `tipo_imagen` | VARCHAR | Dominio controlado |
| `descripcion` | VARCHAR | Opcional |
| `es_principal` | BOOLEAN | Obligatorio |
| `fecha_subida` | TIMESTAMP | Obligatorio |
| `estado` | BOOLEAN | Obligatorio |

Reglas mínimas:

- Toda imagen deberá pertenecer a un evento y a un usuario que la incorporó.
- Cuando `id_programacion` tenga valor, la programación deberá pertenecer al mismo evento indicado en `id_evento`.
- Como mejora de integridad, un evento no deberá mantener simultáneamente más de una imagen activa marcada como principal.

## Entidad `recordatorio`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_recordatorio` | INT | PK |
| `id_usuario` | INT | FK obligatoria a `usuario` |
| `id_evento` | INT | FK obligatoria a `evento` |
| `id_programacion` | INT | FK opcional a `programacion_evento` |
| `fecha_notificacion` | TIMESTAMP | Obligatorio |
| `activo` | BOOLEAN | Obligatorio |
| `fecha_creacion` | TIMESTAMP | Obligatorio |

Reglas mínimas:

- Todo recordatorio pertenecerá a un usuario y a un evento.
- Cuando `id_programacion` tenga valor, la programación deberá pertenecer al mismo evento indicado en `id_evento`.
- Los estados internos de BullMQ no sustituirán los atributos funcionales de esta tabla.

## Entidad `evento_categoria`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_evento` | INT | PK parcial y FK a `evento` |
| `id_categoria` | INT | PK parcial y FK a `categoria` |

La PK compuesta será `(id_evento, id_categoria)` y no podrá existir una asociación duplicada.

## Entidad `usuario_evento_favorito`

| Campo | Tipo conceptual | Regla |
|---|---|---|
| `id_usuario` | INT | PK parcial y FK a `usuario` |
| `id_evento` | INT | PK parcial y FK a `evento` |
| `fecha_agregado` | TIMESTAMP | Obligatorio |

La PK compuesta será `(id_usuario, id_evento)` y un usuario no podrá marcar dos veces el mismo evento como favorito.

## Relaciones canónicas

- `provincia 1:N canton`
- `canton 1:N parroquia`
- `parroquia 1:N sector`
- `sector 1:N lugar`
- `lugar 1:N evento`
- `rol 1:N usuario`
- `usuario 1:N evento` como creador
- `usuario 1:N evento` como revisor
- `evento N:M categoria` mediante `evento_categoria`
- `evento 1:N programacion_evento`
- `lugar 1:N programacion_evento`
- `evento 1:N imagen_evento`
- `programacion_evento 1:N imagen_evento` de manera opcional desde la imagen
- `usuario 1:N imagen_evento`
- `usuario N:M evento` mediante `usuario_evento_favorito`
- `usuario 1:N recordatorio`
- `evento 1:N recordatorio`
- `programacion_evento 1:N recordatorio` de manera opcional desde el recordatorio

## Reglas funcionales recuperadas

1. Un evento deberá pertenecer a un lugar válido dentro de la jerarquía territorial completa.
2. Cuando no exista un sector específico conocido, deberá utilizarse el sector funcional definido para representar la cabecera parroquial conforme al criterio documentado del proyecto.
3. La dirección específica pertenece a `lugar`, no a `evento`.
4. Las coordenadas deberán respetar los rangos geográficos válidos.
5. Cuando exista `fecha_fin`, no podrá ser anterior a `fecha_inicio`.
6. Un evento podrá pertenecer a múltiples categorías mediante `evento_categoria`.
7. Un usuario no podrá registrar dos veces el mismo evento como favorito.
8. Todo recordatorio pertenecerá a un usuario y un evento.
9. Cuando un recordatorio apunte a una programación, esta deberá pertenecer al mismo evento.
10. Toda imagen pertenecerá a un evento y al usuario que la incorporó.
11. Cuando una imagen apunte a una programación, esta deberá pertenecer al mismo evento.
12. La publicación de un evento deberá respetar tanto `estado_revision` como `estado_evento` según el flujo de negocio definido en Semana 4.
13. La aplicación deberá conservar la trazabilidad de los registros relevantes y evitar eliminaciones físicas indiscriminadas.
14. Las claves foráneas deberán impedir referencias inexistentes.
15. Las validaciones del backend complementarán, pero no sustituirán, la integridad que pueda garantizar PostgreSQL.

## Decisiones de implementación que deberán resolverse en `plan.md`

La presente especificación fija el **qué** del modelo. El `plan.md` deberá fijar el **cómo** técnico antes de modificar Prisma o ejecutar migraciones.

Como mínimo deberán resolverse y justificarse:

- longitudes físicas de los campos `VARCHAR`;
- precisión y escala de coordenadas;
- precisión y escala de `costo_referencial`;
- defaults de campos booleanos y temporales;
- valores exactos permitidos para `tipo_sector`;
- valores exactos permitidos para `tipo_lugar`;
- valores exactos permitidos para `estado_evento`;
- valores exactos permitidos para `estado_revision`;
- valores exactos permitidos para `tipo_imagen`;
- estrategia de zona horaria y tipos físicos PostgreSQL para los campos temporales;
- estrategia de integridad cruzada `evento/programacion` para imágenes y recordatorios;
- índices iniciales;
- comportamiento `ON DELETE`/`ON UPDATE` de las claves foráneas;
- estrategia de migración desde el esquema reducido basado en UUID hacia el modelo canónico basado en enteros;
- compatibilidad de las restricciones propuestas con Prisma 7.8.0;
- tratamiento de los datos de desarrollo y pruebas existentes.

Ninguna de estas decisiones podrá modificar silenciosamente el diseño de Semana 4.

## Extensiones posteriores permitidas

### Refresh tokens

La autenticación mediante refresh token es una extensión posterior del proyecto y podrá conservar una entidad técnica adicional para persistir los datos estrictamente necesarios para renovación, rotación y revocación.

Esta entidad no forma parte de las 14 entidades funcionales originales y deberá permanecer documentada como extensión de seguridad.

### Redis

Redis funcionará como caché y no como fuente primaria de los datos del dominio. PostgreSQL seguirá siendo la fuente de verdad.

### BullMQ

BullMQ podrá procesar trabajos relacionados con recordatorios de forma asíncrona. La cola no reemplazará la entidad funcional `recordatorio`.

Los estados técnicos del job deberán permanecer en la infraestructura de cola o en una estructura técnica separada únicamente si existe una necesidad comprobable y documentada.

## Índices

Los índices se definirán a partir de las consultas reales del backend. Como mínimo se estudiarán:

- claves foráneas utilizadas en joins;
- códigos DPA;
- correo de usuario;
- fechas de eventos;
- estados utilizados por consultas públicas;
- relaciones con categorías;
- recordatorios por usuario y fecha;
- jerarquía territorial.

No se crearán índices redundantes sin justificación.

## Seguridad

- Las contraseñas se almacenarán exclusivamente mediante hash seguro.
- Los refresh tokens persistidos se almacenarán mediante hash cuando corresponda.
- Los secretos permanecerán fuera del repositorio.
- Las operaciones protegidas utilizarán autenticación y autorización.
- La autorización deberá basarse en los roles almacenados en la tabla `rol`.

## Normalización

El modelo deberá conservar las propiedades esperadas de tercera forma normal para el alcance del proyecto:

- atributos atómicos;
- ausencia de grupos repetidos;
- separación de entidades territoriales;
- separación de lugares y eventos;
- categorías independientes;
- relaciones N:M mediante tablas asociativas;
- programación separada del evento;
- imágenes separadas del evento;
- favoritos separados del usuario y evento;
- dependencias funcionales asociadas con las claves correspondientes.

## Compatibilidad con el backend existente

La realineación no autoriza a descartar indiscriminadamente el backend actual.

Se reutilizarán, cuando continúen siendo correctos:

- estructura Express;
- configuración TypeScript;
- manejo centralizado de errores;
- Zod;
- patrón controlador-servicio-repositorio;
- JWT;
- refresh tokens;
- Redis;
- BullMQ;
- paginación;
- estrategias de carga;
- pruebas automatizadas;
- OpenAPI;
- mediciones de rendimiento.

Cada componente deberá adaptarse al modelo canónico.

## Línea base previa a la corrección

Antes de iniciar esta realineación, el backend existente obtuvo:

- 4 archivos de pruebas de integración aprobados;
- 19 de 19 pruebas de integración aprobadas;
- consulta sin caché: `MISS` de aproximadamente 498.31 ms;
- caché caliente promedio: `HIT` de aproximadamente 8.86 ms;
- reducción observada aproximada: 98.22 %.

Estos valores constituyen una línea base histórica del backend anterior y no una validación del modelo de Semana 4.

Después de la corrección deberán generarse nuevas pruebas y mediciones bajo condiciones documentadas.

## Criterios de aceptación de la realineación

La funcionalidad 008 solamente podrá considerarse terminada cuando:

1. Las 14 entidades funcionales de Semana 4 estén representadas en PostgreSQL.
2. Prisma represente las mismas entidades y relaciones.
3. Las PK canónicas de las 14 entidades utilicen enteros cuando así fueron definidas.
4. Exista la jerarquía `provincia → canton → parroquia → sector → lugar`.
5. `lugar` no dependa directamente de `canton`.
6. Exista la tabla `rol`.
7. `usuario` dependa de `rol`.
8. `evento` recupere los atributos definidos en Semana 4.
9. `evento` conserve separados `estado_evento` y `estado_revision`.
10. Existan creador y revisor del evento.
11. `programacion_evento` recupere sus atributos y lugar opcional.
12. `imagen_evento` recupere programación opcional y usuario de subida.
13. `recordatorio` recupere `fecha_notificacion` y programación opcional.
14. Exista `usuario_evento_favorito`.
15. Exista `evento_categoria`.
16. Se garantice la coherencia evento/programación para imágenes y recordatorios.
17. Las restricciones de coordenadas y fechas estén implementadas.
18. La autenticación siga funcionando sobre `usuario` y `rol`.
19. Los refresh tokens permanezcan como extensión documentada.
20. Redis siga siendo únicamente una capa de caché.
21. BullMQ no sustituya la semántica de `recordatorio`.
22. El CRUD de eventos funcione sobre el modelo real.
23. Las consultas públicas respeten las reglas de publicación.
24. Prisma valide y genere correctamente.
25. TypeScript compile sin errores.
26. ESLint no reporte errores.
27. Las pruebas automatizadas correspondientes estén aprobadas.
28. Las migraciones puedan reproducir una base limpia.
29. La documentación del modelo coincida con el esquema físico.
30. OpenAPI coincida con los contratos reales de la API.
31. No existan secretos ni credenciales versionados.
32. La aplicación móvil pueda posteriormente consumir la API sin depender de un modelo diferente.
33. Los cambios puedan relacionarse con esta especificación, su plan, sus tareas, commits y evidencias.

## Condiciones que bloquean la modificación del esquema

No se modificará `schema.prisma` ni se ejecutará una migración correctiva mientras no estén resueltos y documentados en `plan.md`:

- tipos físicos definitivos;
- longitudes y precisiones;
- dominios controlados;
- política temporal y de zona horaria;
- integridad cruzada evento/programación;
- índices iniciales;
- acciones referenciales;
- estrategia de migración de UUID a INT;
- tratamiento de los datos existentes;
- compatibilidad final con Prisma.
