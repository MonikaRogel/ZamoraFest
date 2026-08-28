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

## Verificación reproducible para evaluación

El repositorio está preparado para que un docente, revisor o desarrollador pueda reproducir el entorno sin necesidad de conocer las credenciales privadas utilizadas por otro equipo.

### Backend

Desde una copia limpia del repositorio:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

En el archivo local `.env` se deben configurar las conexiones, secretos JWT y, si se desean usuarios de prueba, las variables `SEED_*`.

A continuación:

```powershell
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

El estado básico del backend puede comprobarse mediante `GET /api/v1/health`.

### Aplicación móvil

Desde `mobile`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run typecheck
npm run lint
npm test
npm run build
```

En `.env.local` debe configurarse `VITE_API_BASE_URL` de acuerdo con el entorno utilizado: navegador, emulador Android o dispositivo físico.

### Credenciales de prueba

Las credenciales reales o de demostración no se almacenan en GitHub. El evaluador puede definir sus propias variables `SEED_*` y ejecutar nuevamente el seed para generar las cuentas de desarrollo.

Si la evaluación requiere utilizar una cuenta específica preparada por la autora del proyecto, esas credenciales deben entregarse por un canal privado y separado del repositorio.

Esta separación permite mantener simultáneamente la reproducibilidad del proyecto y la confidencialidad de la información sensible.

La política completa se documenta en `SECURITY.md`.


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

<!-- S9-T053-START -->
## Aplicación móvil — Semana 9

La Semana 9 incorpora el entorno móvil Android de ZamoraFest mediante Ionic, React y Capacitor. La aplicación consume el backend REST vigente y mantiene separadas la interfaz, las funcionalidades y la capa de servicios HTTP.

El código móvil se encuentra en `mobile/` y la plataforma Android nativa en `mobile/android/`.

### Requisitos y versiones verificadas

| Componente | Versión verificada |
| --- | --- |
| Node.js | 24.14.0 |
| npm | 11.9.0 |
| Git | 2.52.0.windows.1 |
| Ionic CLI | 7.2.1 |
| Ionic React | 8.8.19 |
| Ionic React Router | 8.8.19 |
| Capacitor Core | 8.5.0 |
| Capacitor Android | 8.5.0 |
| Capacitor CLI | 8.5.0 |
| React | 19.0.0 |
| React DOM | 19.0.0 |
| TypeScript | 5.9.3 |
| Vite | 8.2.2 |
| Vitest | 4.1.11 |
| OpenJDK | 21.0.12.1 LTS |
| Gradle | 8.14.3 |
| Android Debug Bridge | 37.0.1-15733141 |

La validación física se realizó sobre un dispositivo reconocido por ADB como `SM-A305G`, con Android 11 y SDK 30.

El wrapper Android utiliza Gradle 8.14.3 y mantiene `networkTimeout=600000` para evitar interrupciones durante la descarga de la distribución.


### Instalación del entorno móvil

Desde la raíz del repositorio, la instalación reproducible del proyecto móvil se realiza con:

```powershell
cd mobile
npm ci
```

`npm ci` utiliza el archivo de bloqueo del proyecto y evita modificar arbitrariamente las versiones declaradas.

Antes de sincronizar Android se recomienda validar el código móvil mediante:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

El flujo esperado es `typecheck -> lint -> tests -> build web`.

### Sincronización y compilación Android

Después de generar el contenido web en `dist/`, Capacitor sincroniza los recursos con Android mediante:

```powershell
npx cap sync android
```

La compilación del APK de depuración se realiza con:

```powershell
cd android
.\gradlew.bat assembleDebug
```

El APK generado se encuentra en `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

La configuración normal de `mobile/capacitor.config.ts` utiliza `appId=com.monikarogel.zamorafest`, `appName=ZamoraFest` y `webDir=dist`.

En una compilación Android normal no se mantiene `server.url`; esa propiedad solo puede utilizarse temporalmente durante una ejecución explícita con live reload.

### Diagnóstico del entorno

Las versiones principales pueden verificarse con:

```powershell
node --version
npm --version
git --version

cd mobile
npx ionic --version
npm run ionic:info
```

Java y Gradle pueden comprobarse mediante:

```powershell
java -version

cd mobile\android
.\gradlew.bat --version
```

Para verificar Android Debug Bridge y los dispositivos conectados:

```powershell
adb version
adb devices
```

En un dispositivo conectado también pueden consultarse el modelo y la versión de Android con `adb shell getprop`.

Durante el build pueden aparecer advertencias de Ionic/Vite relacionadas con `:host-context`, tamaño de chunks o advertencias de Gradle sobre `flatDir`. En el entorno verificado no impiden la compilación cuando Vite termina correctamente y Gradle informa `BUILD SUCCESSFUL`.

<!-- S9-T053-END -->


<!-- S9-T054-START -->
### Configuración de ejecución móvil

La aplicación no contiene una URL del backend escrita directamente en páginas o componentes. La dirección base se obtiene mediante la variable de entorno `VITE_API_BASE_URL`.

El archivo versionable de referencia es `mobile/.env.example`. Los valores particulares de cada equipo se mantienen en `mobile/.env.local`, archivo que no debe contenerse en commits.

Ejemplo para un dispositivo Android físico conectado a la misma red local que el equipo de desarrollo:

```text
VITE_API_BASE_URL=http://192.168.1.102:3000
```

Para el emulador estándar de Android, la dirección especial `10.0.2.2` permite acceder al localhost del equipo anfitrión:

```text
VITE_API_BASE_URL=http://10.0.2.2:3000
```

La URL debe cambiarse según el entorno donde se ejecute la aplicación; no debe duplicarse dentro del código fuente.

### Scripts móviles

Los scripts principales definidos en `mobile/package.json` son:

| Script | Propósito |
| --- | --- |
| `npm run dev` | Ejecutar Vite en desarrollo. |
| `npm run build` | Validar TypeScript y generar el bundle web. |
| `npm run typecheck` | Ejecutar comprobación estática de TypeScript. |
| `npm run lint` | Ejecutar ESLint. |
| `npm test` | Ejecutar las pruebas con Vitest. |
| `npm run ionic:info` | Mostrar información del entorno Ionic. |
| `npm run cap:sync` | Sincronizar el contenido web con Android. |
| `npm run android:run` | Ejecutar la aplicación Android mediante Ionic/Capacitor. |
| `npm run android:live` | Ejecutar Android con live reload externo. |

La API para un dispositivo físico se verificó en `http://192.168.1.102:3000` y para el emulador Android se utiliza `http://10.0.2.2:3000`.


### Ejecución Android normal

Para una ejecución Android normal se puede utilizar:

```powershell
cd mobile
npm run android:run
```

También puede utilizarse el flujo controlado `npm run build`, `npm run cap:sync` y posteriormente la compilación o ejecución desde Android.

En esta modalidad los recursos web se sirven desde el paquete de la aplicación y `server.url` debe permanecer ausente de la configuración Android generada.

### Hot reload en dispositivo físico

Para desarrollo interactivo se encuentra disponible:

```powershell
cd mobile
npm run android:live
```

Este script ejecuta Ionic/Capacitor con `--livereload --external`, por lo que el dispositivo físico debe poder alcanzar al equipo de desarrollo en la misma red local.

Durante la validación de Semana 9 se utilizó `http://192.168.1.102:8100` para el servidor de desarrollo y `http://192.168.1.102:3000` para la API.

El puerto 8100 corresponde al servidor de desarrollo con recarga en vivo y el puerto 3000 al backend de ZamoraFest.

El hot reload es una configuración temporal de desarrollo. Antes de una compilación Android normal se debe reconstruir el contenido web y ejecutar nuevamente la sincronización de Capacitor para comprobar que `server.url` no permanezca configurada.

Para el emulador Android, la API del equipo anfitrión se resuelve mediante `http://10.0.2.2:3000`; esta dirección no sustituye la IP LAN requerida por un dispositivo físico.

<!-- S9-T054-END -->


<!-- S9-T055-START -->
### Justificación del entorno móvil

ZamoraFest utiliza Ionic con React porque permite construir una interfaz móvil basada en componentes reutilizables manteniendo TypeScript como lenguaje principal del cliente. Esta elección facilita conservar una estructura modular y separar páginas, funcionalidades, configuración y servicios HTTP.

Capacitor actúa como puente entre la aplicación web y la plataforma Android. De esta forma, el mismo proyecto puede generar una aplicación Android instalable sin duplicar la lógica de interfaz ni la integración con la API REST.

Android se mantiene como plataforma inicial porque corresponde al alcance definido para la implementación móvil de ZamoraFest y permite validar directamente el comportamiento de la aplicación en el entorno de uso previsto.

La prueba en un dispositivo físico complementa las verificaciones web y de emulador. Permite comprobar aspectos que dependen de condiciones reales, entre ellos la comunicación con la API mediante la red local, la instalación del APK, el ciclo de vida de la aplicación, el comportamiento visual del sistema Android y la ejecución con live reload.

Durante Semana 9 la aplicación fue instalada y ejecutada correctamente en un dispositivo `SM-A305G` con Android 11 y SDK 30. Esta validación física no sustituye las pruebas automatizadas; ambas evidencias se utilizan de manera complementaria.

<!-- S9-T055-END -->


<!-- S9-T056-START -->
### Acceso al backend y restricciones del entorno local

La aplicación móvil consume la API REST de ZamoraFest mediante la URL configurada en `VITE_API_BASE_URL`.

Durante las pruebas con dispositivo físico se utilizó `http://192.168.1.102:3000`, correspondiente al backend ejecutado dentro de la red local de desarrollo.

El uso de HTTP en esta configuración se limita exclusivamente a pruebas locales controladas. No representa la configuración prevista para una publicación real de la aplicación.

En un despliegue de producción, la comunicación entre la aplicación móvil y la API debe utilizar HTTPS con TLS válido para proteger las credenciales, tokens y demás información intercambiada durante el transporte.

La dirección `192.168.1.102` pertenece al entorno LAN utilizado durante las pruebas y puede cambiar según la red o el equipo de desarrollo. Por esta razón no se encuentra escrita directamente en páginas ni componentes de la aplicación.

Para el emulador Android se utiliza `10.0.2.2`, que representa al equipo anfitrión desde el entorno virtual del emulador.

El dispositivo físico, en cambio, debe poder alcanzar directamente la dirección LAN del equipo donde se ejecuta el backend.

Las excepciones de red utilizadas para desarrollo deben mantenerse limitadas al entorno necesario y no deben convertirse en una configuración permanente de producción.

<!-- S9-T056-END -->


<!-- S9-T057-START -->
### Limitaciones, dificultades y soluciones de Semana 9

| Situación identificada | Solución aplicada |
| --- | --- |
| El dispositivo físico no puede utilizar `localhost` ni la dirección `10.0.2.2` propia del emulador para alcanzar el backend. | Se configuró `VITE_API_BASE_URL` con la dirección LAN del equipo de desarrollo durante las pruebas físicas. |
| El emulador y el dispositivo físico requieren direccionamiento diferente. | Se documentó `10.0.2.2:3000` para el emulador y la IP LAN del equipo para el teléfono físico. |
| El hot reload necesita que el teléfono pueda alcanzar al servidor Vite del equipo. | Se utilizó el puerto 8100 dentro de la red local y se verificó la comunicación antes de ejecutar la aplicación. |
| El backend debía aceptar el origen utilizado durante el desarrollo móvil. | Se comprobó CORS para el origen de desarrollo y las solicitudes reales desde el dispositivo. |
| La descarga inicial de Gradle podía agotarse con el tiempo de espera anterior. | El wrapper se mantuvo en Gradle 8.14.3 y se amplió `networkTimeout` a `600000` ms. |
| El modo claro del sistema Android podía modificar visualmente fondos y campos definidos por Ionic. | Se fijó la paleta oscura de la aplicación y se hicieron explícitos los fondos de los componentes del login. |
| En el dispositivo Samsung los iconos de las barras del sistema presentaban bajo contraste. | Se configuraron los colores nativos de status bar y navigation bar y se reaplicó la apariencia de iconos claros durante el ciclo de vida de la Activity. |

### Limitaciones vigentes del alcance académico

El inicio de sesión implementado en Semana 9 es funcional y consume el endpoint real de autenticación, pero mantiene deliberadamente un alcance reducido.

En esta etapa no se persisten access tokens ni refresh tokens en `localStorage`, `sessionStorage` u otro almacenamiento del cliente.

Tampoco se implementan todavía recuperación automática de sesión, refresh automático, guards globales, navegación final por roles ni un flujo completo de cierre de sesión con revocación en servidor.

Estas funciones pertenecen a una ampliación posterior de la arquitectura de autenticación y no son necesarias para demostrar el inicio de sesión solicitado en esta semana.

La comunicación HTTP utilizada actualmente también se limita al entorno local de desarrollo. Una publicación real debe utilizar HTTPS/TLS.

<!-- S9-T057-END -->


<!-- S9-T058-START -->
### Uso de inteligencia artificial como apoyo

Durante Semana 9 se utilizó inteligencia artificial generativa como herramienta de apoyo para análisis, revisión técnica, diagnóstico y documentación. Su uso no sustituyó la ejecución ni la verificación directa del proyecto.

Las consultas se concentraron principalmente en la estructura del entorno Ionic y Capacitor, integración con la API REST existente, validación del login, seguridad de contraseñas, diagnóstico de Gradle y Android, CORS, direccionamiento de red, hot reload y revisión de la interfaz móvil.

Las propuestas obtenidas fueron ajustadas al contexto real de ZamoraFest. No se incorporaron rutas, contratos, entidades ni funcionalidades que no estuvieran respaldadas por el backend vigente o por el alcance académico definido.

Entre los ajustes realizados estuvieron el uso de `VITE_API_BASE_URL` en lugar de direcciones escritas en componentes, la separación de llamadas HTTP en `src/services/api/`, la adaptación del login al contrato real de `/api/v1/auth/login` y la exclusión deliberada de persistencia de tokens en esta etapa.

También se descartaron o corrigieron propuestas cuando las pruebas reales mostraron un comportamiento diferente. Un ejemplo fue el tratamiento de las barras del sistema Android en el dispositivo Samsung, que requirió validación directa y ajustes nativos adicionales.

Cada cambio relevante se comprobó mediante una o varias evidencias: typecheck, ESLint, Vitest, build de Vite, sincronización de Capacitor, compilación Gradle, ADB, solicitudes reales al backend y ejecución en dispositivo físico.

Por tanto, la IA se utilizó como asistencia técnica y de revisión, mientras que la aceptación final de cada cambio dependió de la evidencia obtenida en el repositorio y en el entorno de ejecución.

<!-- S9-T058-END -->
