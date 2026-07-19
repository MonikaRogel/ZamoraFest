# Hoja de ruta de ZamoraFest

## Propósito

Esta hoja de ruta establece el orden de construcción de ZamoraFest hasta completar los requerimientos académicos de la Semana 8.

Las optimizaciones se aplicarán únicamente sobre un backend real, probado y medible.

## Estados de una etapa

- Pendiente: todavía no ha comenzado.
- En especificación: se preparan `spec.md`, `plan.md` y `tasks.md`.
- En implementación: la documentación fue aprobada y se desarrolla el código.
- En revisión: los cambios y pruebas están siendo inspeccionados.
- Completada: los cambios fueron aprobados e integrados en `main`.

## Resumen de etapas

| Etapa | Rama principal | Resultado |
|---|---|---|
| 0. Preparación | `main` | Entorno y repositorio inicial |
| 1. Constitución | `docs/constitution` | Alcance y decisiones técnicas |
| 2. Modelo de datos | `feat/001-modelo-datos` | Backend inicial y migraciones |
| 3. Gestión de eventos | `feat/002-gestion-eventos` | CRUD y consultas |
| 4. Autenticación | `feat/003-autenticacion-roles` | Sesiones, JWT y roles |
| 5. Caché | `feat/004-cache-redis` | Cache-aside, TTL e invalidación |
| 6. N+1 | `feat/005-prevencion-n-plus-one` | Consultas optimizadas |
| 7. Recordatorios | `feat/006-cola-recordatorios` | Cola y worker |
| 8. Estrategias de carga | `feat/007-carga-diferida-strategy` | Basic y detailed |
| 9. Evidencias | Ramas relacionadas | Comparación antes y después |

## Etapa 0: preparación del entorno

**Estado:** completada.

Actividades realizadas:

- Verificación de Node.js y npm.
- Verificación de Git y Visual Studio Code.
- Verificación de PostgreSQL y `psql`.
- Verificación de Docker Desktop.
- Instalación de extensiones de desarrollo.
- Creación del repositorio público `MonikaRogel/ZamoraFest`.
- Clonación del repositorio.
- Creación del commit inicial en `main`.

El commit inicial contiene únicamente:

- `README.md`.
- `.gitignore`.
- `.gitattributes`.

Mensaje utilizado: `chore: inicializar repositorio ZamoraFest`.

## Etapa 1: constitución técnica

**Rama:** `docs/constitution`.

**Estado:** en revisión.

Documentos:

- `spec/README.md`.
- `spec/constitution/mission.md`.
- `spec/constitution/tech-stack.md`.
- `spec/constitution/roadmap.md`.
- `docs/evidencias/semana-08/README.md`.
- `docs/evidencias/semana-08/metricas.md`.
- `docs/evidencias/semana-08/pruebas.md`.
- `docs/evidencias/semana-08/uso-ia.md`.

Criterios de finalización:

1. La misión y el alcance están delimitados.
2. El stack coincide con las decisiones aprobadas.
3. La hoja de ruta establece un orden verificable.
4. Las plantillas no contienen resultados inventados.
5. La rama se revisa mediante pull request.

Mensaje principal previsto: `docs: definir constitución técnica de ZamoraFest`.

## Etapa 2: modelo de datos y backend inicial

**Rama:** `feat/001-modelo-datos`.

Antes de implementar se crearán:

- `spec/features/001-modelo-datos/spec.md`.
- `spec/features/001-modelo-datos/plan.md`.
- `spec/features/001-modelo-datos/tasks.md`.

Actividades previstas:

- Inicializar el backend con npm.
- Configurar TypeScript.
- Configurar Express.
- Configurar ESLint y Prettier.
- Configurar Vitest.
- Configurar variables de entorno.
- Configurar Prisma.
- Diseñar el modelo relacional.
- Crear la primera migración.
- Verificar la conexión con PostgreSQL.
- Incorporar una comprobación de salud del backend.

Criterios de finalización:

1. El servidor puede ejecutarse localmente.
2. Las variables de entorno se validan.
3. La base de datos puede reproducirse mediante migraciones.
4. `package-lock.json` y las migraciones están versionados.
5. Las pruebas iniciales se ejecutan correctamente.
6. No existen credenciales en el repositorio.

## Etapa 3: gestión de eventos

**Rama:** `feat/002-gestion-eventos`.

Documentación previa:

- `spec/features/002-gestion-eventos/spec.md`.
- `spec/features/002-gestion-eventos/plan.md`.
- `spec/features/002-gestion-eventos/tasks.md`.

Actividades previstas:

- Crear eventos.
- Listar eventos con paginación.
- Consultar un evento individual.
- Actualizar eventos.
- Eliminar eventos.
- Validar entradas mediante Zod.
- Aplicar manejo centralizado de errores.
- Seleccionar explícitamente los campos necesarios.
- Documentar endpoints con OpenAPI.
- Incorporar pruebas unitarias y de integración.

Las entidades, campos, relaciones y reglas exactas se aprobarán antes de modificar el esquema de Prisma.

## Etapa 4: autenticación y roles

**Rama:** `feat/003-autenticacion-roles`.

Documentación previa:

- `spec/features/003-autenticacion-roles/spec.md`.
- `spec/features/003-autenticacion-roles/plan.md`.
- `spec/features/003-autenticacion-roles/tasks.md`.

Actividades previstas:

- Registro de usuarios.
- Inicio de sesión.
- Hash seguro de contraseñas.
- Emisión de access tokens.
- Emisión y almacenamiento seguro de refresh tokens.
- Rotación y renovación.
- Revocación de sesiones.
- Autorización basada en roles.
- Separación de endpoints públicos y protegidos.
- Pruebas de autenticación y autorización.
- Documentación OpenAPI de seguridad.

## Punto de control del backend base

Antes de implementar optimizaciones deberá existir un backend que permita:

- Ejecutar migraciones.
- Gestionar eventos.
- Registrar e identificar usuarios.
- Aplicar roles y permisos.
- Consultar eventos públicamente.
- Ejecutar pruebas automatizadas.
- Consultar Swagger.

Sobre esta versión se realizará la medición inicial.

No se implementará Redis ni BullMQ antes de alcanzar este punto.

## Medición inicial

Antes de optimizar se registrarán:

- Entorno de ejecución.
- Commit evaluado.
- Tamaño del conjunto de datos.
- Endpoint y parámetros.
- Cantidad de solicitudes.
- Tiempo de respuesta.
- Cantidad de consultas.
- Tamaño de la respuesta JSON.
- Herramientas y comandos utilizados.

Las mediciones finales deberán repetir las mismas condiciones.

## Etapa 5: caché con Redis

**Rama:** `feat/004-cache-redis`.

Objetivos:

- Aplicar cache-aside.
- Definir claves normalizadas y versionadas.
- Configurar TTL.
- Invalidar el caché ante mutaciones.
- Comprobar cache hit y cache miss.
- Mantener PostgreSQL como fuente de verdad.

## Etapa 6: prevención de N+1

**Rama:** `feat/005-prevencion-n-plus-one`.

Objetivos:

- Identificar consultas redundantes.
- Medir la cantidad de consultas.
- Recuperar relaciones de forma controlada.
- Mantener una cantidad estable de consultas.
- Comparar resultados antes y después.

## Etapa 7: cola de recordatorios

**Rama:** `feat/006-cola-recordatorios`.

Objetivos:

- Configurar BullMQ.
- Registrar recordatorios.
- Añadir trabajos a una cola.
- Procesarlos mediante un worker.
- Manejar estados, errores y reintentos.
- Evitar que el procesamiento bloquee la respuesta HTTP.

## Etapa 8: carga diferida y Strategy

**Rama:** `feat/007-carga-diferida-strategy`.

Objetivos:

- Implementar `detailLevel=basic`.
- Implementar `detailLevel=detailed`.
- Evitar relaciones innecesarias.
- Reducir el tamaño del JSON básico.
- Comparar carga diferida y anticipada.
- Aplicar Strategy de forma limitada y justificable.

Cada optimización deberá contar previamente con `spec.md`, `plan.md` y `tasks.md`.

## Medición final y evidencias

Después de las optimizaciones se repetirán las mediciones iniciales bajo condiciones equivalentes.

Se documentarán:

- Resultados antes y después.
- Cantidad de consultas.
- Tiempos observados.
- Tamaño de respuestas.
- Funcionamiento del caché.
- Procesamiento del worker.
- Pruebas automatizadas.
- Capturas necesarias.
- Limitaciones.
- Uso de inteligencia artificial.

Las carpetas `antes` y `despues` se crearán únicamente cuando existan evidencias reales.

## Revisión y entrega

Antes de la entrega se deberá:

- Ejecutar todas las pruebas.
- Ejecutar la validación de tipos.
- Ejecutar ESLint.
- Revisar migraciones.
- Revisar Swagger.
- Comprobar que no existan secretos.
- Verificar las instrucciones de instalación.
- Revisar especificaciones y evidencias.
- Preparar la demostración académica.

## Desarrollo móvil posterior

Ionic, Capacitor, Java y Android Studio quedan reservados para una fase posterior.

La futura aplicación móvil consumirá la API, pero no forma parte del alcance inmediato hasta la Semana 8.

## Política de ramas

Después del commit inicial no se trabajará directamente sobre `main`.

Cada rama deberá:

1. Crearse desde `main` actualizado.
2. Incluir únicamente los cambios de su alcance.
3. Ejecutar sus pruebas antes del commit.
4. Publicarse en GitHub.
5. Revisarse mediante pull request.
6. Integrarse en `main` antes de comenzar la etapa siguiente.

Las ramas de funcionalidades no se crearán unas desde otras.

## Regla de avance

Una etapa no estará completada solamente porque existan archivos o código.

Para avanzar se requerirá:

- Especificación aprobada.
- Implementación correspondiente.
- Pruebas verificables.
- Revisión del cambio.
- Commit identificable.
- Evidencia cuando sea exigida académicamente.