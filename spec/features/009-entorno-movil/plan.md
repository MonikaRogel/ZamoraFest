# Plan técnico: entorno móvil e integración base (009)

## Estado

- **Rama:** `feat/009-entorno-movil`
- **Especificación:** `spec.md`
- **Fase:** plan y tareas aprobados; implementación autorizada
- **Implementación:** en curso

## 1. Objetivo del plan

Convertir la especificación aprobada de Semana 9 en una secuencia técnica controlada para crear el cliente móvil de ZamoraFest sin adelantar funcionalidades de interfaz, autenticación o persistencia que pertenecen a etapas posteriores.

El plan prioriza reproducibilidad, separación de responsabilidades, seguridad, diagnóstico previo y verificación después de cada cambio.

## 2. Principios de ejecución

Se aplicarán las siguientes reglas:

- primero verificar y después instalar;
- primero contrato y después consumo;
- una responsabilidad por capa;
- ninguna regla de negocio duplicada desde el backend;
- ninguna dependencia sin necesidad concreta;
- ninguna URL de backend dispersa en páginas o componentes;
- ninguna credencial o secreto dentro del repositorio;
- ningún cambio nativo Android sin justificación y verificación;
- ninguna funcionalidad de Semana 10 adelantada;
- cada fase debe superar su puerta antes de continuar.

## 3. Decisiones tecnológicas cerradas

- Framework: Ionic, manteniendo la línea mayor 8 exigida para esta feature.
- UI runtime: React.
- Lenguaje: TypeScript estricto.
- Bridge nativo: Capacitor 8.
- Plataforma inicial: Android.
- Build web: Vite.
- Gestor de paquetes: npm.
- Lockfile: `package-lock.json` versionado.
- Android SDK objetivo académico: API 36.
- JDK de proyecto: JDK 21 LTS.

No se adoptará automáticamente el tag `latest` de Ionic porque puede corresponder a una versión mayor distinta de la definida para el curso.

Antes del scaffold se consultará el registro npm y se fijarán versiones exactas compatibles de Ionic 8, React, TypeScript y Capacitor 8.

## 4. Ubicación del cliente

El cliente se creará en:

`ZamoraFest/mobile/`

El backend vigente permanecerá en `ZamoraFest/backend/`.

Ambos proyectos compartirán repositorio, pero conservarán dependencias, configuración y responsabilidades independientes.

No se trasladará código del backend al cliente ni se permitirá acceso directo del cliente a PostgreSQL.

## 5. Fronteras arquitectónicas iniciales

Las fronteras técnicas de Semana 9 serán:

- `src/config/`: configuración del entorno;
- `src/types/`: contratos observados de la API;
- `src/services/api/`: única salida HTTP;
- `src/pages/`: composición y estado de interfaz.

Las páginas no realizarán solicitudes HTTP directamente.
No se crearán capas, carpetas o abstracciones sin uso real.
Cada archivo incorporado deberá responder a una necesidad
verificable del alcance de Semana 9.
## 6. Decisiones verificadas

- Ionic React y Core: `8.8.19`.
- Capacitor Core, CLI y Android: `8.5.0`.
- Ionic CLI: `7.2.1`.
- `native-run`: `2.0.3`.
- React Router y React Router DOM: `5.3.4`.
- React y React DOM: `19.0.0`.
- TypeScript: `5.9.3`.
- Vite: `8.2.2`.
- Tipo de proyecto Ionic: `react-vite`.
- Destino principal: Samsung `SM_A305G`.
- Identificador ADB: `R28M41JD2QN`.
- Contingencia: AVD Android.
- API desde el Samsung: `http://192.168.1.102:3000`.
- API desde el AVD: `http://10.0.2.2:3000`.
- Configuración única: `VITE_API_BASE_URL`.
- Diagnóstico: `GET /api/v1/health`.
- Integración: `GET /api/v1/eventos?page=1&limit=5`.
- Cliente HTTP: `fetch`; no se incorporará Axios.
- Hot reload: Ionic CLI con `--livereload --external`.

Los contratos fueron observados directamente en el backend.
La respuesta de eventos utiliza `data` y `meta`.

Las pruebas CORS no devolvieron `Access-Control-Allow-Origin`
y el backend no contiene middleware CORS. Se planificará una
corrección mínima y probada antes del consumo desde la aplicación.

React, React DOM, Vite y TypeScript fueron aceptados después
de inspeccionar el manifiesto generado y verificar su compatibilidad.

## 7. Arquitectura inicial adaptada a ZamoraFest

- `src/config/env.ts`: única lectura de `VITE_API_BASE_URL`.
- `src/types/api.ts`: contratos reales de salud y eventos.
- `src/services/api/zamorafest-api.ts`: única salida HTTP.
- `src/pages/EnvironmentStatusPage.tsx`: carga, error y respuesta.
- `src/App.tsx`: montaje de la página técnica.

La página no ejecutará `fetch` ni contendrá IP o reglas de negocio.
El servicio no conocerá componentes React y no utilizará `any`.
No se crearán carpetas, capas o dependencias para funciones futuras.
La estructura conserva fronteras claras entre configuración,
contratos, transporte HTTP y presentación.

Esta estructura cubre Semana 9 y permite crecer después sin
adelantar autenticación, navegación o interfaz de Semana 10.

## 8. Scaffold y reproducibilidad

El cliente partirá de la plantilla oficial Ionic React `blank`
con Vite y Capacitor.

Comando planificado:

`npx --yes @ionic/cli@7.2.1 start mobile blank --type=react --capacitor --package-id=com.monikarogel.zamorafest --no-deps --no-git`

El scaffold se generará sin dependencias para inspeccionar primero
`package.json`, scripts, versiones, configuración e ignore rules.

El proyecto conservará npm y versionará `package-lock.json`.
La instalación inicial se ejecutará con `npm install` después de
inspeccionar el scaffold; una vez generado el lockfile, las
instalaciones reproducibles se realizarán con `npm ci`.
La CLI quedará fijada y no dependerá de una instalación global.

Se dispondrá de scripts para desarrollo, build, typecheck, lint,
pruebas, sincronización Capacitor y ejecución Android.

No se crearán módulos vacíos ni infraestructura sin uso.
La validación incluirá compilación, instalación y ejecución real
en el dispositivo Android seleccionado.

## 9. Integración con el backend

`VITE_API_BASE_URL` será la única dirección base de la API.
Se versionará `.env.example` y el valor real permanecerá en
un archivo local ignorado por Git. Ninguna variable `VITE_*`
contendrá contraseñas, tokens o secretos.

La aplicación comprobará primero `GET /api/v1/health` y después
consumirá `GET /api/v1/eventos?page=1&limit=5`.

El servicio HTTP validará `response.ok` y distinguirá errores
HTTP, respuestas inválidas y fallos de red.

## 10. CORS y tráfico HTTP de desarrollo

El backend incorporará una política CORS mínima con orígenes
permitidos mediante configuración. No se utilizará origen comodín.

Se probarán el preflight permitido, el origen rechazado y la
continuidad de los endpoints existentes.

Android autorizará HTTP únicamente en la variante de depuración
y para `192.168.1.102` y `10.0.2.2` mediante
`network_security_config.xml`.

La variante de distribución conservará HTTPS obligatorio.
No se habilitará cleartext global en el manifiesto principal.

## 11. Secuencia de implementación

1. Aprobar `plan.md` y crear `tasks.md`.
2. Generar e inspeccionar el scaffold sin dependencias.
3. Instalar las versiones aprobadas y generar el lockfile.
4. Configurar TypeScript, scripts y variables de entorno.
5. Implementar tipos, servicio HTTP y página técnica.
6. Corregir y probar CORS sin cambiar reglas de negocio.
7. Agregar Android y limitar el tráfico HTTP de depuración.
8. Compilar, instalar y ejecutar en el Samsung.
9. Demostrar hot reload y consumo de la API.
10. Documentar el entorno, dificultades y evidencias.

Cada paso se verificará antes de continuar. Un fallo se corregirá
en la capa donde se originó, sin modificar varias capas a la vez.

## 12. Puertas de calidad

Cliente:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `npx ionic info`;
- `npx cap sync android`;
- `adb devices -l`;
- ejecución real mediante el script `android:run`.

Si se modifica CORS, el backend deberá superar typecheck, lint,
formato, pruebas unitarias, integración y build.

No se declarará completada la integración hasta observar la
respuesta de la API dentro de la aplicación instalada.

## 13. Ejecución, hot reload y evidencia

El Samsung físico será el destino principal por su fidelidad y
por reducir la carga de CPU y memoria frente al emulador.

El hot reload se demostrará con el dispositivo y el computador
en la misma red, usando `--livereload --external` y el target
ADB `R28M41JD2QN`.

El video de evidencia mostrará versiones, diagnóstico completo,
estructura, ejecución, recarga, dirección utilizada y respuesta de la API.

## 14. Documentación reproducible

El README registrará requisitos, versiones exactas, instalación,
variables, scripts, configuración Android, direccionamiento,
diagnóstico, hot reload, dificultades y solución de problemas.

También declarará la herramienta de inteligencia artificial usada,
el propósito de las consultas, resultados utilizados, ajustes
realizados y verificaciones técnicas efectuadas.

Limitaciones documentadas:

- iOS requiere macOS y Xcode;
- la IP LAN puede cambiar;
- el dispositivo y el computador deben compartir red;
- HTTP local se admite únicamente durante desarrollo.

## 15. Criterios de aceptación

- entorno diagnosticado sin hallazgos críticos;
- proyecto reproducible mediante npm y lockfile;
- build web y Android satisfactorios;
- aplicación instalada en el Samsung;
- hot reload demostrado;
- health y eventos consumidos desde la aplicación;
- CORS y tráfico HTTP limitados a desarrollo;
- video explicativo con la demostración completa del entorno;
- README reproducible y enlace de GitHub funcional;
- ausencia de secretos y funcionalidades de Semana 10.

## 16. Extensión técnica: login mínimo funcional

Esta extensión implementa únicamente el login necesario para la demostración académica de Semana 9, manteniendo fuera del alcance la gestión completa de sesión.

### 16.1. Contrato utilizado

Se utilizará exclusivamente:

`POST /api/v1/auth/login`

La solicitud enviará únicamente:

- `email`;
- `password`.

La respuesta real contiene tokens y un objeto `usuario`. La capa de presentación utilizará únicamente los datos seguros del usuario.

### 16.2. Arquitectura

La implementación conservará las fronteras existentes:

- `src/types/`: tipos mínimos del contrato de login;
- `src/services/api/`: solicitud HTTP y validación de respuesta;
- `src/features/auth/`: validación y normalización del formulario cuando corresponda;
- `src/pages/`: formulario y confirmación mínima posterior al acceso;
- `src/App.tsx`: orquestación del estado volátil del usuario.

Ninguna página o componente ejecutará `fetch` directamente.

### 16.3. Estado de autenticación

La aplicación conservará únicamente en memoria la información segura del usuario autenticado.

No se persistirán `accessToken` ni `refreshToken`.

No se incorporará:

- almacenamiento persistente;
- refresh automático;
- recuperación de sesión;
- guards;
- logout de servidor;
- RBAC completo en interfaz.

Al reiniciar la aplicación, el usuario volverá al formulario de login.

### 16.4. Validaciones

Antes de enviar la solicitud se aplicará:

- `trim` del correo;
- formato válido de correo;
- máximo 254 caracteres para correo;
- contraseña obligatoria;
- máximo 72 bytes UTF-8 para contraseña;
- ninguna longitud mínima de 8 caracteres en login;
- bloqueo de doble submit.

La respuesta `401` se presentará mediante un mensaje genérico.

### 16.5. Pruebas

Se verificarán como mínimo:

- normalización y validación de correo;
- contraseña vacía;
- contraseña mayor a 72 bytes UTF-8;
- ausencia deliberada del mínimo de 8 caracteres;
- request `POST` correcto;
- header `Content-Type: application/json`;
- body exacto `{ email, password }`;
- respuesta válida;
- respuesta incompatible;
- error HTTP;
- credenciales inválidas;
- ausencia de tokens en los datos entregados a la UI;
- prevención de doble submit.

### 16.6. Secuencia de implementación

1. Verificar nuevamente el contrato local del backend.
2. Confirmar un usuario de demostración válido sin versionar credenciales.
3. Definir tipos mínimos.
4. Extender el servicio HTTP existente.
5. Implementar validaciones de formulario.
6. Crear pantalla mínima de login.
7. Crear confirmación posterior al acceso.
8. Añadir pruebas.
9. Auditar logs y persistencia.
10. Ejecutar lint, typecheck, pruebas y build.
11. Sincronizar Android.
12. Verificar login real en el dispositivo físico.

No se añadirán Axios, Zustand, TanStack Query, React Hook Form, Zod u otras dependencias mientras el alcance pueda resolverse con el stack ya instalado.
