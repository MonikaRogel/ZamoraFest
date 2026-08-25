# ZamoraFest

ZamoraFest es una aplicación orientada a la gestión y consulta de eventos culturales y festivos de Zamora Chinchipe. El repositorio contiene el backend REST vigente, la documentación técnica del modelo de datos y la base para la integración móvil con Ionic y Capacitor.

## Estado actual

El backend se encuentra realineado con el modelo canónico definido en la propuesta académica de Semana 4. La implementación vigente incluye:

- API REST con Node.js, TypeScript y Express.
- PostgreSQL con Prisma ORM.
- Autenticación JWT con access token y refresh token.
- Autorización por roles `ADMINISTRADOR`, `ASISTENTE` y `VISITANTE`.
- Gestión de eventos, categorías, programaciones, imágenes, favoritos y recordatorios.
- Redis para caché de consultas públicas.
- BullMQ para la cola de recordatorios.
- Validación con Zod.
- Pruebas con Vitest y Supertest.
- Documentación OpenAPI 3.1 y Swagger UI en entornos distintos de producción.

La integración de la aplicación móvil continúa sobre este backend y este modelo ya realineado.

## Stack técnico

- Node.js 24
- npm 11
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- Redis
- BullMQ
- OpenAPI 3.1
- Swagger UI
- Vitest
- Supertest

Los rangos de ejecución definidos por el backend son:

```text
Node.js >=24.0.0 <25
npm     >=11.0.0 <12
```

## Modelo de datos vigente

El modelo funcional está compuesto por las 14 entidades canónicas de Semana 4:

1. `provincia`
2. `canton`
3. `parroquia`
4. `sector`
5. `lugar`
6. `rol`
7. `usuario`
8. `categoria`
9. `evento`
10. `evento_categoria`
11. `programacion_evento`
12. `imagen_evento`
13. `recordatorio`
14. `usuario_evento_favorito`

`refresh_token` se conserva como una extensión técnica de autenticación y no forma parte del conteo académico de las 14 entidades.

Las entidades con clave primaria simple utilizan identificadores enteros autoincrementales. Las tablas `evento_categoria` y `usuario_evento_favorito` utilizan claves primarias compuestas. La tabla técnica `refresh_token` mantiene un UUID propio.

La jerarquía territorial implementada es:

```text
provincia -> canton -> parroquia -> sector -> lugar
```

Los eventos separan su estado funcional de su estado de revisión:

```text
estado_evento:
BORRADOR | PROGRAMADO | CANCELADO | FINALIZADO | ELIMINADO

estado_revision:
PENDIENTE | APROBADO | RECHAZADO
```

Un evento es público únicamente cuando se encuentra simultáneamente en:

```text
estado_evento = PROGRAMADO
estado_revision = APROBADO
```

La descripción completa del modelo, sus relaciones, restricciones, política temporal e índices se encuentra en:

```text
docs/modelo-datos.md
```

## Requisitos de entorno

Antes de ejecutar el backend se requiere:

- Node.js dentro del rango indicado.
- npm dentro del rango indicado.
- PostgreSQL accesible para desarrollo.
- Una base PostgreSQL separada para pruebas de integración.
- Redis accesible para caché y BullMQ.

Los archivos de referencia de configuración son:

```text
backend/.env.example
backend/.env.test.example
```

Para desarrollo, `backend/.env.example` contempla:

```text
NODE_ENV
PORT
DATABASE_URL
SHADOW_DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
REDIS_URL

SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_ASISTENTE_EMAIL
SEED_ASISTENTE_PASSWORD
SEED_VISITANTE_EMAIL
SEED_VISITANTE_PASSWORD
```

Las seis variables `SEED_*` son opcionales para la creación de usuarios de desarrollo. Si se utilizan, deben configurarse localmente y no deben contener credenciales reales versionadas en Git.

Para las pruebas de integración debe crearse `backend/.env.test` a partir de `backend/.env.test.example`. Este entorno utiliza:

```text
NODE_ENV=test
PORT
TEST_DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
REDIS_URL
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_ASISTENTE_EMAIL
SEED_ASISTENTE_PASSWORD
SEED_VISITANTE_EMAIL
SEED_VISITANTE_PASSWORD
```

`TEST_DATABASE_URL` debe apuntar exclusivamente a la base `zamorafest_test`. El script de preparación de pruebas cancela la ejecución si la base objetivo tiene otro nombre.

## Instalación del backend

Desde la raíz del repositorio:

```powershell
cd backend
npm ci
```

Después copie `backend/.env.example` como archivo local `.env` y configure las conexiones y secretos correspondientes.

Para ejecutar las pruebas de integración, copie también `backend/.env.test.example` como `.env.test` y configure `TEST_DATABASE_URL` para `zamorafest_test`.

No se deben versionar archivos `.env`, contraseñas ni secretos JWT.

## Prisma y generación del cliente

Desde `backend`:

```powershell
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
```

Estos comandos permiten comprobar y generar el cliente Prisma a partir del esquema vigente.

## Flujo de migraciones

El historial actual de migraciones se conserva completo:

```text
20260719230105_init_event_domain
20260720032806_add_authentication
20260720063553_add_reminder_queue
20260819044407_realineacion_modelo_semana4
```

La migración `20260819044407_realineacion_modelo_semana4` es la migración correctiva posterior que realinea el esquema con el modelo canónico de Semana 4. Las migraciones históricas anteriores no deben reescribirse ni eliminarse.

Para aplicar en una base existente el historial ya versionado:

```powershell
cd backend
npm run prisma:migrate:deploy
```

Para trabajo de desarrollo que requiera crear una nueva migración Prisma:

```powershell
npm run prisma:migrate:dev
```

Antes de generar o aplicar una migración correctiva sobre datos relevantes debe existir respaldo y revisión previa del SQL. No se utiliza `prisma migrate reset` ni `prisma db push` como sustituto del flujo de migraciones controlado del proyecto.

## Seed canónico

El seed vigente se encuentra en:

```text
backend/prisma/seed.ts
```

Prepara de forma idempotente la base canónica con datos estructurales de desarrollo, entre ellos:

- Provincia de Zamora Chinchipe.
- 9 cantones.
- Parroquia, sector y lugar de referencia.
- 3 categorías.
- Roles `ADMINISTRADOR`, `ASISTENTE` y `VISITANTE`.
- Usuarios de desarrollo únicamente cuando las variables `SEED_*` están configuradas.

Para ejecutarlo:

```powershell
cd backend
npm run prisma:seed
```

Para preparar además los datos de demostración utilizados por el proyecto:

```powershell
npm run demo:prepare
```

`demo:prepare` ejecuta primero el seed y después el script de preparación de datos de demostración.

## Ejecución del backend

En desarrollo:

```powershell
cd backend
npm run dev
```

El puerto se obtiene de `PORT` y el valor de referencia del archivo `.env.example` es `3000`.

Para compilar y ejecutar la salida construida:

```powershell
npm run build
npm start
```

## OpenAPI y Swagger

La API vigente está descrita mediante OpenAPI 3.1.

Con `NODE_ENV` distinto de `production` se exponen:

```text
GET /api-docs.json
GET /api-docs/
```

- `/api-docs.json` devuelve el documento OpenAPI.
- `/api-docs/` muestra Swagger UI.

En `production` ambas rutas permanecen deshabilitadas y responden `404`.

La fuente del contrato se encuentra en:

```text
backend/src/docs/openapi.ts
```

## Pruebas y verificaciones

Desde `backend` se dispone de los siguientes controles:

### TypeScript

```powershell
npm run typecheck
```

### ESLint

```powershell
npm run lint
```

### Pruebas unitarias

```powershell
npm test
```

### Pruebas de integración

```powershell
npm run test:integration
```

El script de integración prepara primero la base de pruebas mediante:

```text
npm run db:test:prepare
```

y luego ejecuta las pruebas ubicadas en `tests/integration`.

### Compilación

```powershell
npm run build
```

## Redis, caché y medición

Redis se utiliza para el patrón cache-aside aplicado a consultas públicas.

La conexión se configura mediante:

```text
REDIS_URL
```

La medición de caché puede ejecutarse con:

```powershell
cd backend
npm run measure:cache
```

## Recordatorios y BullMQ

Los recordatorios funcionales se almacenan en PostgreSQL. BullMQ se utiliza como infraestructura de cola y sus estados técnicos no forman parte de la entidad canónica `recordatorio`.

El worker puede iniciarse desde `backend` con:

```powershell
npm run worker:recordatorios
```

El identificador funcional de `recordatorio` es entero.

## Estructura relevante

```text
ZamoraFest/
├─ backend/
│  ├─ prisma/
│  │  ├─ migrations/
│  │  ├─ schema.prisma
│  │  ├─ seed.ts
│  │  └─ prepare-test-database.ts
│  ├─ scripts/
│  │  ├─ prepare-demo-data.ts
│  │  └─ measure-cache.ts
│  └─ src/
│     ├─ docs/
│     │  └─ openapi.ts
│     ├─ modules/
│     └─ workers/
│        └─ recordatorio.worker.ts
├─ docs/
│  └─ modelo-datos.md
├─ spec/
└─ README.md
```

## Metodología y trazabilidad

El proyecto utiliza Spec-Driven Development (SDD). Las funcionalidades se documentan mediante especificación, plan y tareas antes de su implementación.

La realineación vigente del modelo se encuentra en:

```text
spec/features/008-realineacion-modelo-semana4/
```

La documentación histórica se conserva para mantener trazabilidad, pero el modelo funcional vigente es el documentado por la realineación `008` y por `docs/modelo-datos.md`.
