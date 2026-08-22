# Plan técnico: modelo de datos y backend inicial (001)

> [!IMPORTANT]
> **Vigencia:** este documento conserva la evidencia histórica de la funcionalidad `001-modelo-datos` aprobada el 2026-07-19. Su modelo reducido de siete entidades y las decisiones asociadas quedaron **supersedidos para el estado vigente del proyecto** por `spec/features/008-realineacion-modelo-semana4/`, que realinea ZamoraFest con el modelo canónico de Semana 4.
>
> El contenido histórico que sigue no se reescribe ni elimina; se conserva para mantener la trazabilidad técnica y académica.

## Metadatos

- **Rama:** `feat/001-modelo-datos`
- **Estado:** aprobado.
- **Fecha de aprobación:** 2026-07-19.
- **Especificación:** `spec/features/001-modelo-datos/spec.md`
- **Constitución:** `spec/constitution/`
- **Fecha de elaboración:** 2026-07-19
- **Alcance temporal:** Etapa 2 del proyecto ZamoraFest

## Propósito del plan

Este documento define cómo se implementará la especificación 001 sin ampliar el alcance funcional. La implementación dejará un backend mínimo ejecutable, un modelo relacional reproducible y pruebas verificables de sus restricciones. No incorporará todavía el CRUD de eventos, autenticación, Swagger, Redis, BullMQ ni la aplicación móvil.

## Comprobación de compatibilidad

Las versiones se verificaron el 19 de julio de 2026 antes de aprobar este plan.

| Componente | Versión elegida | Decisión |
|---|---:|---|
| Node.js | 24 LTS | Entorno oficial del proyecto |
| npm | 11 | Gestor de paquetes; se versionará `package-lock.json` |
| TypeScript | 5.9.3 | Compatible con Prisma 7 y `typescript-eslint`; no se usará TypeScript 7 todavía |
| Express | 5.2.1 | Base HTTP mínima |
| Prisma ORM | 7.8.0 | ORM y migraciones |
| PostgreSQL | 18.1 | Base relacional local ya instalada |
| Vitest | 4.1.10 | Pruebas unitarias y de integración |
| Supertest | 7.2.2 | Prueba del endpoint de salud sin abrir un puerto real |

Prisma 7 admite Node 24 y PostgreSQL 18. También requiere ESM, una ruta de salida explícita para Prisma Client y un adaptador de base de datos. TypeScript 5.9.3 se conserva porque la línea actual de `typescript-eslint` no declara todavía compatibilidad con TypeScript 7.

## Dependencias previstas

### Producción

| Paquete | Versión inicial | Uso |
|---|---:|---|
| `express` | 5.2.1 | Servidor HTTP |
| `@prisma/client` | 7.8.0 | Cliente tipado generado |
| `@prisma/adapter-pg` | 7.8.0 | Adaptador PostgreSQL obligatorio en Prisma 7 |
| `pg` | 8.22.0 | Controlador y pool de conexiones |
| `zod` | 4.4.3 | Validación de variables de entorno |
| `dotenv` | 17.4.2 | Carga explícita de archivos `.env` |

### Desarrollo y pruebas

| Paquete | Versión inicial | Uso |
|---|---:|---|
| `prisma` | 7.8.0 | CLI, esquema y migraciones |
| `typescript` | 5.9.3 | Compilación estricta |
| `tsx` | 4.23.1 | Ejecución TypeScript durante desarrollo y seed |
| `vitest` | 4.1.10 | Ejecutor de pruebas |
| `@vitest/coverage-v8` | 4.1.10 | Cobertura |
| `supertest` | 7.2.2 | Pruebas HTTP |
| `eslint` | 10.7.0 | Análisis estático |
| `@eslint/js` | 10.0.1 | Reglas base de ESLint |
| `typescript-eslint` | 8.64.0 | Integración TypeScript/ESLint |
| `prettier` | 3.9.5 | Formato uniforme |
| `eslint-config-prettier` | 10.1.8 | Evitar conflictos ESLint/Prettier |
| `@types/node` | 24.13.3 | Tipos alineados con Node 24 |
| `@types/express` | 5.0.6 | Tipos de Express 5 |
| `@types/supertest` | 7.2.1 | Tipos de Supertest |
| `@types/pg` | 8.20.0 | Tipos del controlador PostgreSQL |

Las versiones exactas instaladas quedarán fijadas en `backend/package-lock.json`. No se actualizarán automáticamente durante esta funcionalidad.

## Estructura que se implementará

```text
backend/
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── .env.example
├── .env.test.example
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── generated/
│   │   └── prisma/              # generado; no se versiona
│   ├── infrastructure/
│   │   └── database/
│   │       └── prisma.ts
│   └── routes/
│       └── health.routes.ts
└── tests/
    ├── health.test.ts
    └── integration/
        └── modelo-datos.test.ts
```

No se crearán carpetas vacías para controladores, servicios o repositorios. Esas capas aparecerán cuando la funcionalidad 002 tenga casos de uso reales.

## Decisiones de ejecución y compilación

1. `backend/package.json` declarará `"type": "module"` porque Prisma 7 se distribuye como ESM.
2. TypeScript usará modo estricto, destino ES2023 y resolución `NodeNext`.
3. Los imports relativos usarán extensiones compatibles con el JavaScript compilado.
4. `src/app.ts` construirá y exportará la aplicación Express sin abrir el puerto.
5. `src/server.ts` será el único punto que invoque `listen`, lo que permitirá probar la aplicación con Supertest.
6. El endpoint `GET /api/v1/health` responderá `200` con un JSON pequeño y determinista.
7. El endpoint de salud comprobará que el proceso HTTP está activo; la conectividad de PostgreSQL se comprobará mediante migraciones y pruebas de integración, no en cada solicitud de salud.

## Scripts npm previstos

| Script | Finalidad |
|---|---|
| `dev` | Ejecutar el servidor en modo observación con `tsx` |
| `build` | Compilar TypeScript |
| `start` | Ejecutar la salida compilada |
| `typecheck` | Validar tipos sin emitir archivos |
| `lint` | Ejecutar ESLint |
| `format` | Aplicar Prettier |
| `format:check` | Verificar formato sin modificar |
| `test` | Ejecutar pruebas unitarias |
| `test:integration` | Ejecutar pruebas contra la base aislada de pruebas |
| `test:coverage` | Generar cobertura con V8 |
| `prisma:format` | Formatear `schema.prisma` |
| `prisma:validate` | Validar el esquema |
| `prisma:generate` | Generar Prisma Client explícitamente |
| `prisma:migrate:dev` | Crear/aplicar migraciones de desarrollo |
| `prisma:migrate:deploy` | Aplicar migraciones ya versionadas |
| `prisma:seed` | Cargar datos iniciales de forma explícita |

No se utilizará `prisma db push` como sustituto de las migraciones.

## Variables de entorno

`src/config/env.ts` validará con Zod, como mínimo:

- `NODE_ENV`: `development`, `test` o `production`.
- `PORT`: entero válido, con valor local predeterminado.
- `DATABASE_URL`: URL PostgreSQL obligatoria para ejecución normal.
- `TEST_DATABASE_URL`: URL PostgreSQL obligatoria para pruebas de integración.

`.env.example` y `.env.test.example` contendrán valores ficticios y nombres de variables, nunca credenciales reales. Los archivos `.env` reales permanecerán ignorados por Git.

Antes de configurar PostgreSQL se avisará que PowerShell o `psql` podrían solicitar la contraseña local. Esa contraseña se escribirá únicamente en el equipo de la propietaria y no se pegará en chats, capturas, commits ni documentación.

## Configuración de Prisma 7

1. `prisma.config.ts` estará junto a `package.json` dentro de `backend/`.
2. Cargará las variables mediante `dotenv`.
3. Declarará la ruta `prisma/schema.prisma`, el directorio `prisma/migrations` y el comando explícito de seed.
4. La URL se configurará en `prisma.config.ts`, no en el bloque `datasource` del esquema.
5. El generador usará `provider = "prisma-client"` y una salida explícita en `src/generated/prisma`.
6. La aplicación construirá `PrismaClient` mediante `PrismaPg` y el pool de `pg`.
7. El cliente generado permanecerá fuera de Git; las migraciones sí se versionarán.

## Convenciones físicas de PostgreSQL

- Los modelos y propiedades de Prisma conservarán `PascalCase` y `camelCase`.
- Las tablas y columnas de PostgreSQL usarán `snake_case` mediante `@@map` y `@map`.
- Las tablas serán: `cantones`, `lugares`, `categorias`, `eventos`, `evento_categorias`, `programaciones_evento` e `imagenes_evento`.
- Los UUID se almacenarán con el tipo nativo `uuid`.
- Los instantes se almacenarán como `timestamptz` para evitar ambigüedad de zona horaria.
- Las coordenadas usarán `decimal(9,6)`.
- Las descripciones usarán `text`; nombres y títulos tendrán longitudes máximas explícitas.
- `EstadoEvento` se representará como enum de PostgreSQL con `BORRADOR` y `PUBLICADO`.

## Integridad y restricciones

### Eliminación lógica

Todas las entidades tendrán `eliminadoEn DateTime?`, mapeado a `eliminado_en`.

- Registro activo: `eliminadoEn IS NULL`.
- Eliminación: asignar la fecha y hora de la operación.
- Las consultas funcionales futuras excluirán por defecto los registros eliminados.
- No se agregará simultáneamente un campo `activo`.
- La restauración no forma parte de 001.
- `eliminadoPorId` se evaluará cuando exista la entidad Usuario en 003.

### Unicidad con registros eliminados

La unicidad de nombres de cantón y categoría se aplicará únicamente a registros activos mediante índices únicos parciales de PostgreSQL. Esto conserva el historial y permite volver a utilizar un nombre después de una eliminación lógica.

`EventoCategoria` tendrá clave primaria compuesta `(evento_id, categoria_id)`. Una asociación eliminada lógicamente se reactivará actualizando la misma fila; no se insertará un duplicado.

### Imagen principal

La migración incorporará un índice único parcial equivalente a:

```sql
CREATE UNIQUE INDEX imagenes_evento_principal_activa_uq
ON imagenes_evento (evento_id)
WHERE es_principal = TRUE AND eliminado_en IS NULL;
```

La base impedirá que existan dos imágenes principales activas para el mismo evento. En 002, el cambio de portada se realizará además dentro de una transacción.

### Reglas `CHECK`

La migración añadirá restricciones para comprobar:

1. Latitud y longitud presentes ambas o ausentes ambas.
2. Latitud entre -90 y 90.
3. Longitud entre -180 y 180.
4. `fin` posterior a `inicio` cuando exista.

### Relaciones y borrado físico

Las claves foráneas usarán comportamiento restrictivo para el borrado físico. No habrá `CASCADE` físico silencioso porque la política funcional es conservar trazabilidad.

La eliminación lógica futura seguirá estas reglas:

- No se podrá eliminar lógicamente un cantón mientras conserve lugares activos.
- No se podrá eliminar lógicamente un lugar mientras conserve eventos activos.
- No se podrá eliminar lógicamente una categoría mientras conserve asociaciones activas.
- La eliminación lógica de un evento archivará, en una transacción, sus asociaciones, programaciones e imágenes activas.

Estas operaciones de servicio se implementarán en 002; en 001 solo quedarán modeladas y comprobadas las restricciones persistentes.

## Índices previstos

Además de claves primarias y restricciones únicas, se crearán índices orientados a las consultas futuras:

- `lugares(canton_id, eliminado_en)`.
- `eventos(lugar_id, eliminado_en)`.
- `eventos(estado, eliminado_en)`.
- `evento_categorias(categoria_id, eliminado_en)`.
- `programaciones_evento(evento_id, eliminado_en)`.
- `programaciones_evento(inicio, eliminado_en)`.
- `imagenes_evento(evento_id, eliminado_en)`.

No se crearán índices especulativos adicionales. Su eficacia se medirá con consultas reales en etapas posteriores.

## Datos iniciales

`prisma/seed.ts` cargará de manera idempotente los nueve cantones de Zamora Chinchipe:

- Centinela del Cóndor
- Chinchipe
- El Pangui
- Nangaritza
- Palanda
- Paquisha
- Yacuambi
- Yantzaza
- Zamora

La ejecución del seed será explícita mediante `npm run prisma:seed`, porque Prisma 7 ya no lo ejecuta automáticamente después de una migración. Los identificadores serán deterministas o la carga utilizará una clave natural activa para evitar duplicados.

## Estrategia de migración

1. Crear el esquema Prisma completo y formatearlo.
2. Ejecutar `prisma validate`.
3. Generar una migración inicial con nombre `init_event_domain`.
4. Revisar manualmente el SQL generado.
5. Añadir al SQL los índices parciales y restricciones `CHECK` que Prisma Schema no expresa directamente.
6. Aplicar la migración a una base de desarrollo vacía.
7. Generar Prisma Client de forma explícita.
8. Ejecutar el seed explícitamente.
9. Reconstruir una base aislada desde cero usando únicamente migraciones y seed.
10. Versionar `prisma/migrations`, `schema.prisma`, `prisma.config.ts` y `package-lock.json`.

## Aislamiento de pruebas

- Desarrollo usará una base como `zamorafest_dev`.
- Integración usará otra base como `zamorafest_test` mediante `TEST_DATABASE_URL`.
- Las pruebas nunca ejecutarán `migrate reset` sobre la URL de desarrollo.
- Antes de cualquier reinicio automatizado se validará `NODE_ENV=test` y que la base objetivo termine en `_test`.
- Cada prueba limpiará únicamente sus propios datos dentro de la base de pruebas.
- La limpieza técnica de esa base aislada no representa una eliminación funcional del dominio.

## Estrategia de pruebas

### Pruebas unitarias/HTTP

- `GET /api/v1/health` responde `200`.
- El cuerpo JSON coincide con el contrato definido.
- La aplicación puede importarse en Supertest sin abrir un puerto.

### Pruebas de integración del modelo

- Las siete tablas existen después de aplicar migraciones.
- Las relaciones obligatorias rechazan claves foráneas inexistentes.
- El par de `EventoCategoria` no puede repetirse.
- Dos imágenes principales activas para un evento producen un error de restricción.
- Una imagen principal eliminada lógicamente no impide establecer una nueva principal activa.
- Las coordenadas incompletas o fuera de rango se rechazan.
- Una programación con `fin <= inicio` se rechaza.
- Los borrados físicos de padres referenciados se rechazan.
- La reconstrucción desde cero y el seed son reproducibles.

Las pruebas deberán crear y retirar sus datos; no dependerán de filas creadas manualmente en pgAdmin.

## Controles de calidad antes del commit

Se deberán ejecutar y conservar sus resultados:

```text
npm run format:check
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
npm test
npm run test:integration
git diff --check
git status --short
```

También se verificará que:

- `package-lock.json` esté versionado.
- `prisma/migrations` esté versionado.
- no exista ningún `.env` real en Git.
- no se haya versionado `src/generated/prisma`.
- no se hayan agregado endpoints o entidades fuera de 001.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Instalar TypeScript 7 por ser la versión más nueva | Fijar TypeScript 5.9.3 por compatibilidad declarada con el linting actual |
| Usar configuración antigua de Prisma 6 | Aplicar ESM, `prisma.config.ts`, generador nuevo y `@prisma/adapter-pg` |
| Exponer credenciales | Versionar solo archivos `.example`; nunca copiar contraseñas a documentación o chats |
| Perder restricciones al usar solo Prisma Schema | Revisar y completar el SQL de la migración con índices parciales y `CHECK` |
| Destruir por error la base de desarrollo | Separar `TEST_DATABASE_URL` y validar el nombre antes de reiniciar pruebas |
| Ocultar registros históricos por filtros inconsistentes | Establecer `eliminadoEn IS NULL` como regla transversal para repositorios futuros |
| Ampliar el dominio | Limitar 001 a las siete entidades aprobadas y al endpoint de salud |

## Evidencias de la funcionalidad 001

Se conservarán, como mínimo:

- diagrama entidad-relación aprobado;
- SQL de la migración inicial;
- salida de validación y generación de Prisma;
- evidencia de reconstrucción de la base;
- salida de pruebas unitarias e integración;
- captura o consulta de las siete tablas;
- registro proporcional del apoyo de IA, decisiones revisadas y comandos ejecutados.

Estas evidencias no se mezclarán con las mediciones de optimización de Semana 8.

## Referencias técnicas verificadas

- Prisma ORM 7, guía de actualización: <https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7>
- Requisitos de Prisma ORM: <https://www.prisma.io/docs/orm/reference/system-requirements>
- Bases admitidas por Prisma ORM: <https://www.prisma.io/docs/orm/reference/supported-databases>
- Express 5, instalación: <https://expressjs.com/en/5x/starter/installing/>
- Vitest, guía de inicio: <https://vitest.dev/guide/>
- Compatibilidad de `typescript-eslint`: <https://typescript-eslint.io/users/dependency-versions/>
- Fuente territorial para los nueve cantones: <https://zamora-chinchipe.gob.ec/wp-content/uploads/2020/08/PDOT-2019-2023-ZAMORA-CHINCHIPE.pdf>

## Condición de aprobación

Este plan estará aprobado cuando:

1. Sea coherente con `spec.md` y la constitución.
2. No queden decisiones técnicas abiertas que afecten `schema.prisma`.
3. `tasks.md` traduzca este plan en tareas pequeñas y verificables.
4. Se cambie su estado de `en revisión` a `aprobado` antes de instalar dependencias o generar código.
