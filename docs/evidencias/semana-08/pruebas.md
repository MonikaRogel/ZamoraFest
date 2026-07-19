# Pruebas y verificaciones — Semana 8

## Estado

**Pendiente de ejecución.**

Este documento registrará las pruebas realizadas sobre el backend de ZamoraFest. Los resultados se completarán únicamente después de ejecutar los comandos y comprobar el comportamiento real.

## Objetivo

Conservar evidencia reproducible de que las funcionalidades y optimizaciones cumplen sus especificaciones y no introducen regresiones.

## Principios

Las pruebas deberán:

- Relacionarse con criterios de aceptación aprobados.
- Ejecutarse en un entorno controlado.
- Utilizar datos preparados para pruebas.
- No depender de información secreta.
- Incluir casos exitosos y fallidos.
- Poder repetirse mediante comandos documentados.
- Registrar honestamente errores y limitaciones.

## Entorno de prueba

| Elemento | Valor |
|---|---|
| Fecha y hora | Pendiente |
| Rama | Pendiente |
| Commit | Pendiente |
| Node.js | Pendiente |
| npm | Pendiente |
| PostgreSQL | Pendiente |
| Redis | Pendiente |
| Base de datos de prueba | Pendiente |
| Sistema operativo | Pendiente |

No se utilizará una base de datos de producción para ejecutar pruebas automatizadas.

## Comandos previstos

Durante la inicialización del backend deberán configurarse:

- `npm test`.
- `npm run test:coverage`.
- `npm run lint`.
- `npm run typecheck`.
- `npm run build`.

Cuando se ejecuten se registrarán la fecha, el commit, el resultado, la duración y la evidencia correspondiente.

## Resumen de ejecución

| Comando | Resultado | Pruebas | Duración | Evidencia |
|---|---|---:|---:|---|
| `npm test` | Pendiente | Pendiente | Pendiente | Pendiente |
| `npm run test:coverage` | Pendiente | Pendiente | Pendiente | Pendiente |
| `npm run lint` | Pendiente | No aplica | Pendiente | Pendiente |
| `npm run typecheck` | Pendiente | No aplica | Pendiente | Pendiente |
| `npm run build` | Pendiente | No aplica | Pendiente | Pendiente |

## Niveles de prueba

### Pruebas unitarias

Comprobarán unidades aisladas como:

- Esquemas Zod.
- Servicios.
- Estrategias de carga.
- Utilidades.
- Generación y validación de tokens.
- Reglas de autorización.
- Construcción de claves de caché.

### Pruebas de integración

Comprobarán la interacción entre:

- Rutas de Express.
- Controladores y servicios.
- Prisma y PostgreSQL.
- Autenticación y autorización.
- Redis.
- BullMQ.
- Cola y worker.

### Verificaciones manuales

Complementarán las pruebas para:

- Revisar Swagger.
- Observar respuestas HTTP.
- Comprobar Redis.
- Verificar el worker.
- Obtener capturas académicas.

Las verificaciones manuales no reemplazarán las pruebas automatizadas de comportamientos críticos.

## Gestión de eventos

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Crear evento válido | Evento creado | Pendiente |
| Crear con datos inválidos | Error de validación | Pendiente |
| Listar eventos | Respuesta paginada | Pendiente |
| Aplicar filtros válidos | Resultados filtrados | Pendiente |
| Usar paginación inválida | Error controlado | Pendiente |
| Consultar evento existente | Evento encontrado | Pendiente |
| Consultar evento inexistente | Recurso no encontrado | Pendiente |
| Actualizar evento válido | Evento actualizado | Pendiente |
| Actualizar con datos inválidos | Error de validación | Pendiente |
| Eliminar evento existente | Operación exitosa | Pendiente |
| Eliminar evento inexistente | Error controlado | Pendiente |

## Validaciones y errores

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Cuerpo vacío | Error de validación consistente | Pendiente |
| Identificador inválido | Error de validación consistente | Pendiente |
| JSON mal formado | Error HTTP controlado | Pendiente |
| Recurso inexistente | Respuesta 404 consistente | Pendiente |
| Ruta inexistente | Respuesta 404 consistente | Pendiente |
| Error interno controlado | Respuesta sin información sensible | Pendiente |

Las respuestas no deberán mostrar secretos, contraseñas ni trazas internas innecesarias.

## Registro y autenticación

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Registrar usuario válido | Usuario registrado | Pendiente |
| Registrar correo duplicado | Conflicto controlado | Pendiente |
| Registrar datos inválidos | Error de validación | Pendiente |
| Iniciar sesión correctamente | Tokens emitidos | Pendiente |
| Usar contraseña incorrecta | Acceso rechazado | Pendiente |
| Usar usuario inexistente | Acceso rechazado sin filtrar información | Pendiente |
| Renovar sesión válida | Tokens rotados | Pendiente |
| Reutilizar refresh token rotado | Sesión rechazada | Pendiente |
| Revocar sesión | Refresh token invalidado | Pendiente |
| Usar refresh token revocado | Sesión rechazada | Pendiente |

Los tokens completos no deberán mostrarse en capturas.

## Autorización por roles

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Endpoint público sin token | Acceso permitido | Pendiente |
| Endpoint protegido sin token | Acceso rechazado | Pendiente |
| Token inválido | Acceso rechazado | Pendiente |
| Token expirado | Acceso rechazado | Pendiente |
| Rol autorizado | Acceso permitido | Pendiente |
| Rol sin permisos | Acceso prohibido | Pendiente |

Los roles definitivos se aprobarán en la especificación de autenticación.

## Caché Redis

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Primera consulta | Cache miss y consulta a PostgreSQL | Pendiente |
| Consulta repetida | Cache hit | Pendiente |
| Expiración del TTL | Nueva consulta a PostgreSQL | Pendiente |
| Crear evento | Invalidación correspondiente | Pendiente |
| Publicar evento | Invalidación correspondiente | Pendiente |
| Actualizar evento | Invalidación correspondiente | Pendiente |
| Eliminar evento | Invalidación correspondiente | Pendiente |
| Redis no disponible | Comportamiento controlado | Pendiente |

Una falla de Redis no deberá modificar la fuente de verdad almacenada en PostgreSQL.

## Prevención de N+1

| Límite | Consultas esperadas después de optimizar | Consultas obtenidas |
|---:|---|---:|
| 1 | Cantidad fija | Pendiente |
| 10 | La misma cantidad fija | Pendiente |
| 50 | La misma cantidad fija | Pendiente |

La prueba deberá detectar si la cantidad de consultas crece proporcionalmente con cada evento.

## Estrategias de detalle

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| `detailLevel=basic` | Información esencial | Pendiente |
| `detailLevel=detailed` | Información ampliada | Pendiente |
| Nivel no admitido | Error de validación | Pendiente |
| Nivel omitido | Comportamiento predeterminado documentado | Pendiente |
| Evento inexistente | Recurso no encontrado | Pendiente |

También se comprobará que `basic` no recupere relaciones reservadas para `detailed`.

## Paginación y campos

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Primera página | Metadatos y elementos correctos | Pendiente |
| Página intermedia | Elementos correspondientes | Pendiente |
| Página fuera de rango | Comportamiento consistente | Pendiente |
| Límite máximo | Respuesta controlada | Pendiente |
| Límite superior al permitido | Error o ajuste documentado | Pendiente |
| Campos del listado | Solo información necesaria | Pendiente |

## Cola y worker

| Escenario | Resultado esperado | Resultado obtenido |
|---|---|---|
| Crear recordatorio válido | Trabajo añadido | Pendiente |
| Datos inválidos | Trabajo no añadido | Pendiente |
| Procesar trabajo | Estado actualizado | Pendiente |
| Error temporal | Reintento controlado | Pendiente |
| Agotar reintentos | Fallo registrado | Pendiente |
| Trabajo duplicado | Comportamiento definido | Pendiente |
| Worker detenido | Endpoint no bloqueado | Pendiente |

## Swagger y OpenAPI

Se verificará que:

- Swagger pueda abrirse.
- Los endpoints estén documentados.
- Los parámetros coincidan con las validaciones.
- Los códigos de respuesta estén descritos.
- Los endpoints protegidos indiquen seguridad.
- Los ejemplos no incluyan credenciales reales.

Resultado: pendiente.

## Registro de defectos

| Identificador | Descripción | Severidad | Estado | Commit de corrección |
|---|---|---|---|---|
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Los defectos encontrados no deberán ocultarse.

## Criterios de aprobación

La ejecución final será satisfactoria cuando:

1. Las pruebas obligatorias terminen sin fallos no explicados.
2. ESLint no reporte errores.
3. TypeScript complete la comprobación.
4. El backend pueda compilarse.
5. Las migraciones puedan reproducirse.
6. Los endpoints cumplan los criterios de aceptación.
7. Las optimizaciones cuenten con pruebas y evidencias.
8. No se expongan secretos.
9. Los resultados se relacionen con un commit.

## Conclusión

Esta sección se completará después de la ejecución final.

- Total de pruebas: pendiente.
- Pruebas aprobadas: pendiente.
- Pruebas fallidas: pendiente.
- Limitaciones conocidas: pendiente.
- Resultado general: pendiente.