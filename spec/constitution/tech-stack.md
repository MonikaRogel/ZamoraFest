# Constitución tecnológica de ZamoraFest

## Propósito

Este documento establece las tecnologías y criterios técnicos aprobados para ZamoraFest. Su objetivo es mantener una base coherente y evitar cambios de herramientas sin una justificación académica o técnica.

## Plataforma de ejecución

### Node.js

Se utilizará Node.js 24 LTS como entorno de ejecución del backend.

Las dependencias seleccionadas deberán ser compatibles con esta versión.

### TypeScript

Todo el código del backend se desarrollará con TypeScript y comprobaciones estrictas.

No se utilizará `any` sin una justificación concreta y localizada.

### npm

npm será el único gestor de paquetes.

El archivo `package-lock.json` deberá versionarse para garantizar instalaciones reproducibles. No se utilizará Yarn durante esta fase.

## API y servidor HTTP

### Express

Express será el framework del backend.

Se utilizará para:

- Definir rutas HTTP.
- Incorporar middlewares.
- Gestionar solicitudes y respuestas.
- Centralizar el manejo de errores.
- Exponer la documentación de la API.

La API seguirá un enfoque REST, utilizará JSON y tendrá el prefijo `/api/v1`.

## Arquitectura

El backend utilizará una arquitectura por capas con responsabilidades separadas:

- Rutas: definición de endpoints y middlewares.
- Controladores: traducción entre HTTP y los casos de uso.
- Servicios: reglas y operaciones de negocio.
- Acceso a datos: consultas y persistencia mediante Prisma.
- Esquemas: validaciones de entrada y salida.
- Middlewares: autenticación, autorización y manejo de errores.
- Configuración: lectura y validación de variables de entorno.
- Colas y workers: procesamiento asíncrono de la Semana 8.
- Pruebas: verificación unitaria y de integración.

La estructura definitiva de carpetas se aprobará en el plan técnico de la primera funcionalidad. No se añadirán capas sin una responsabilidad concreta.

## Base de datos

### PostgreSQL

PostgreSQL será la base de datos relacional y la fuente de verdad de ZamoraFest.

El entorno local utilizará PostgreSQL 18. Las conexiones se configurarán mediante variables de entorno.

No se incluirán usuarios, contraseñas ni cadenas de conexión reales en el repositorio.

### Prisma ORM

Prisma se utilizará para:

- Definir el esquema de datos.
- Generar migraciones.
- Consultar y modificar la base de datos.
- Seleccionar explícitamente los campos necesarios.
- Gestionar relaciones evitando consultas N+1.

La carpeta de migraciones de Prisma deberá versionarse porque representa el historial reproducible de la base de datos.

El cliente generado por Prisma no se versionará porque puede regenerarse durante la instalación.

## Validación

### Zod

Zod validará:

- Parámetros de ruta.
- Parámetros de consulta.
- Cuerpos de solicitudes.
- Variables de entorno.
- Estructuras que requieran comprobación explícita.

Las entradas inválidas deberán rechazarse antes de ejecutar la lógica de negocio.

## Autenticación y autorización

La autenticación se implementará mediante JWT.

Se utilizarán:

- Access tokens de duración corta.
- Refresh tokens de mayor duración.
- Rotación de refresh tokens.
- Revocación de sesiones.
- Almacenamiento seguro de refresh tokens.
- Autorización basada en roles.

Como línea base, el access token tendrá una duración de 15 minutos y el refresh token una duración máxima de 7 días. Estos valores deberán configurarse mediante variables de entorno.

Las contraseñas se almacenarán con una función de hash segura proporcionada por una biblioteca mantenida. El algoritmo y sus parámetros se aprobarán en la especificación de autenticación.

Los secretos JWT nunca se escribirán directamente en el código ni se incorporarán al repositorio.

## Documentación de la API

### OpenAPI y Swagger

La API se describirá mediante OpenAPI y se visualizará con Swagger.

La documentación incluirá:

- Endpoints disponibles.
- Parámetros y cuerpos de solicitud.
- Respuestas esperadas.
- Errores relevantes.
- Requisitos de autenticación.
- Ejemplos sin información sensible.

Swagger deberá mantenerse sincronizado con el comportamiento real de la API.

## Pruebas

### Vitest

Vitest será el ejecutor principal de pruebas unitarias.

### Supertest

Supertest permitirá realizar pruebas de integración sobre los endpoints de Express.

Las pruebas deberán cubrir progresivamente:

- Casos exitosos.
- Entradas inválidas.
- Recursos inexistentes.
- Autenticación.
- Autorización.
- Paginación.
- Errores controlados.
- Invalidación de caché.
- Colas y workers cuando corresponda.

## Calidad del código

### ESLint

ESLint detectará problemas de calidad y posibles errores en TypeScript.

### Prettier

Prettier establecerá un formato consistente.

Las reglas de ESLint y Prettier deberán ser compatibles. Sus comprobaciones se incorporarán a los scripts de npm.

## Optimización de la Semana 8

### Redis

Redis se incorporará después de tener un backend base funcional y medible.

Se aplicará cache-aside sobre:

- Eventos publicados.
- Listados paginados de eventos.
- Categorías.

Las claves considerarán filtros y paginación. También utilizarán TTL e invalidación controlada.

La invalidación no utilizará búsquedas masivas con `KEYS`. Se preferirá versionado de claves y expiración.

PostgreSQL continuará siendo la fuente de verdad.

### Prevención de N+1

Las consultas relacionadas con eventos deberán mantener una cantidad estable de consultas independientemente de la cantidad de elementos de una página.

La mejora se comprobará con diferentes tamaños de página. No se asumirá que una única consulta SQL siempre sea la mejor solución.

### Carga básica y detallada

La consulta individual admitirá:

- `GET /api/v1/eventos/{id}?detailLevel=basic`.
- `GET /api/v1/eventos/{id}?detailLevel=detailed`.

`basic` devolverá información esencial.

`detailed` incorporará la información ampliada y las relaciones aprobadas.

El patrón Strategy se aplicará de manera limitada, sin construir una jerarquía innecesariamente compleja.

### BullMQ

BullMQ utilizará Redis para procesar recordatorios mediante una cola y un worker.

El endpoint registrará el recordatorio y añadirá un trabajo. El worker procesará el trabajo sin bloquear la solicitud HTTP y administrará sus estados y reintentos.

No se afirmará que una notificación externa fue entregada si no existe un proveedor que confirme la entrega.

## Versionamiento obligatorio

Deberán incorporarse al repositorio:

- `package.json`.
- `package-lock.json`.
- Archivos de configuración.
- Esquema de Prisma.
- Migraciones de Prisma.
- Código fuente.
- Pruebas.
- Especificaciones.
- Documentación y evidencias válidas.

No deberán incorporarse:

- `node_modules`.
- Archivos `.env` reales.
- Contraseñas, tokens o claves.
- Cliente generado por Prisma.
- Resultados de compilación.
- Cobertura generada.
- Logs temporales.

## Tecnologías descartadas durante esta fase

No forman parte del stack aprobado:

- Next.js.
- Yarn.
- Keycloak.
- OAuth 2.0 con PKCE.
- Arquitectura multiempresa.
- Tecnologías específicas de Canchago.
- Ionic y Capacitor durante el backend.
- Android Studio durante esta fase.

## Política de cambios tecnológicos

Una tecnología solamente podrá añadirse o reemplazarse cuando:

1. Resuelva un requisito académico o técnico identificado.
2. Se compare con la solución vigente.
3. Su impacto sea documentado.
4. Se actualicen las especificaciones relacionadas.
5. El cambio sea aprobado antes de implementarse.