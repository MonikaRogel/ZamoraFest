# Tareas: entorno móvil e integración base (009)

## Estado

- **Rama:** `feat/009-entorno-movil`
- **Especificación:** `spec.md`
- **Plan técnico:** `plan.md`
- **Fase:** tareas aprobadas; implementación autorizada
- **Implementación:** en curso

## Convenciones de ejecución

- Las tareas se ejecutarán en orden, salvo que se indique una independencia verificable.
- Cada casilla se marcará únicamente después de completar su comprobación técnica.
- Solo se incorporará el login mínimo autorizado; persistencia de sesión e interfaz definitiva de Semana 10 continúan fuera del alcance.
- Los comandos, versiones y resultados relevantes se conservarán como evidencia reproducible.
- No se registrarán credenciales, secretos ni datos privados del entorno.
- Cada cambio deberá superar su puerta de calidad antes de continuar.

## 1. Control inicial

- [x] T001 Verificar la rama `feat/009-entorno-movil` y registrar el estado de Git.
- [x] T002 Confirmar la integridad de `spec.md`, `plan.md` y `tasks.md` antes de implementar.
- [x] T003 Comprobar que `mobile/` todavía no existe y que no hay artefactos parciales del scaffold.
- [x] T004 Revisar las reglas de exclusión del repositorio para evitar secretos y archivos generados.

## 2. Diagnóstico del entorno

- [x] T005 Registrar las versiones reales de Node.js, npm, Git y Visual Studio Code.
- [x] T006 Registrar JDK, Android Studio, Android SDK y Android Build Tools.
- [x] T007 Verificar ADB y la disponibilidad del Samsung `SM_A305G` con serial `R28M41JD2QN`.
- [x] T008 Ejecutar el diagnóstico con Ionic CLI `7.2.1` y conservar la salida completa.
- [x] T009 Resolver o documentar cualquier hallazgo que afecte la plataforma Android prevista.
- [x] T010 Documentar la elección del dispositivo físico según los recursos disponibles.

## 3. Contrato y acceso al backend

- [x] T011 Verificar PostgreSQL, Redis y el backend de ZamoraFest antes de probar conectividad.
- [x] T012 Confirmar `GET /api/v1/health` mediante la dirección LAN del computador.
- [x] T013 Confirmar `GET /api/v1/eventos` y registrar la estructura real de la respuesta.
- [x] T014 Revisar la configuración actual de CORS y confirmar la ausencia de apertura global.
- [x] T015 Implementar en el backend una política CORS mínima para los orígenes de desarrollo requeridos.
- [x] T016 Verificar orígenes permitidos, origen no autorizado y regresión de las pruebas del backend.

## 4. Scaffold y dependencias reproducibles

- [x] T017 Crear `mobile/` con la plantilla oficial Ionic React `blank` y el comando aprobado.
- [x] T018 Inspeccionar el scaffold, `package.json`, scripts, configuración y reglas de exclusión antes de instalar.
- [x] T019 Fijar las versiones exactas del stack aprobado sin incorporar dependencias ajenas al alcance.
- [x] T020 Ejecutar la instalación inicial con npm y versionar el `package-lock.json` resultante.
- [x] T021 Incorporar scripts locales para desarrollo, build, typecheck, lint, pruebas, Capacitor y Android.
- [x] T022 Verificar una instalación reproducible mediante `npm ci` y el lockfile.
- [x] T023 Superar build, typecheck, lint y pruebas del proyecto base.

## 5. Configuración e integración mínima

- [x] T024 Crear el acceso centralizado y validado a `VITE_API_BASE_URL` en `src/config/`.
- [x] T025 Crear `.env.example` y excluir los archivos de entorno locales del control de versiones.
- [x] T026 Definir en `src/types/` únicamente los contratos reales de health y eventos.
- [x] T027 Implementar en `src/services/api/` el cliente HTTP basado en `fetch` y errores controlados.
- [x] T028 Implementar los servicios de health y eventos sin solicitudes HTTP desde la página.
- [x] T029 Crear una pantalla mínima que muestre ejecución, conectividad y respuesta verificable de ZamoraFest.
- [x] T030 Añadir pruebas enfocadas en configuración, transporte y manejo de respuestas inválidas.
- [x] T031 Confirmar que no se incorporaron autenticación, almacenamiento local ni interfaz de Semana 10.

## 6. Plataforma Android

- [x] T032 Añadir la plataforma Android con Capacitor `8.5.0` y revisar los archivos nativos generados.
- [x] T033 Verificar `appId`, nombre de la aplicación, `webDir` y configuración de Capacitor.
- [x] T034 Confirmar el permiso de Internet requerido por la aplicación.
- [x] T035 Configurar en la variante debug el tráfico HTTP únicamente para los hosts locales necesarios.
- [x] T036 Evitar permisos globales de tráfico sin cifrar en la configuración principal de Android.
- [x] T037 Ejecutar build web, sincronización de Capacitor y compilación Android con API 36 y JDK 21.

## 7. Extensión académica: login mínimo funcional

- [x] T038 Verificar el contrato exacto de `POST /api/v1/auth/login` y la estructura segura del usuario retornado.
- [x] T039 Confirmar un usuario de demostración válido sin versionar ni mostrar credenciales.
- [x] T040 Incorporar los tipos mínimos necesarios para el contrato de login.
- [x] T041 Ampliar `src/services/api/` con el login y descartar los tokens antes de entregar datos a la UI.
- [x] T042 Implementar normalización y validaciones del formulario según el contrato real.
- [x] T043 Crear la pantalla mínima de login y bloquear envíos duplicados.
- [x] T044 Mostrar una confirmación posterior al acceso con información segura del usuario.
- [x] T045 Añadir pruebas de contrato, validaciones, errores y ausencia de persistencia o exposición de tokens.
- [x] T046 Ejecutar lint, typecheck, pruebas y build después de implementar el login.
- [x] T047 Instalar y ejecutar la aplicación en el Samsung `SM_A305G` mediante ADB.

## 8. Ejecución y hot reload

- [x] T048 Ejecutar el cliente web con la CLI local y comprobar el proyecto base.
- [x] T049 Ejecutar la aplicación Android sin hot reload y verificar el arranque nativo.
- [x] T050 Ejecutar hot reload con acceso externo y el target ADB `R28M41JD2QN`.
- [x] T051 Confirmar desde el dispositivo el consumo de health y eventos mediante la IP LAN.
- [x] T052 Revisar consola, Logcat y red para descartar errores de CORS, transporte o ejecución.

## 9. Documentación y evidencia

- [x] T053 Documentar en el README requisitos, versiones exactas, instalación y diagnóstico.
- [x] T054 Documentar variables de entorno, scripts, Android, direccionamiento y hot reload.
- [x] T055 Fundamentar la elección de Ionic, Capacitor, Android y el dispositivo físico.
- [x] T056 Explicar la dirección usada para alcanzar el backend y las restricciones de HTTP local.
- [x] T057 Documentar limitaciones, dificultades encontradas y soluciones aplicadas.
- [x] T058 Registrar el uso de inteligencia artificial, consultas aprovechadas, ajustes y verificaciones.
- [x] T059 Preparar evidencias de versiones, diagnóstico completo, estructura, ejecución y recarga.
- [x] T060 Preparar evidencias de la solicitud exitosa hacia la API propia y su respuesta.
- [x] T061 Verificar el guion del video contra todos los criterios de evaluación de Semana 9.

## 10. Puertas finales y publicación

- [x] T062 Ejecutar `npm ci`, build, typecheck, lint y pruebas del cliente móvil.
- [x] T063 Ejecutar las pruebas del backend y confirmar que la política CORS no produjo regresiones.
- [x] T064 Repetir build, sincronización y compilación Android desde un estado reproducible.
- [x] T065 Repetir instalación, ejecución, hot reload y consumo de la API en el Samsung.
- [x] T066 Auditar secretos, archivos generados, dependencias innecesarias y tráfico HTTP de desarrollo.
- [x] T067 Revisar el diff completo, actualizar estados y publicar la feature con el enlace funcional.

## Criterio de cierre

La feature podrá cerrarse únicamente cuando todas las tareas estén verificadas,
el entorno sea reproducible, la aplicación funcione en el dispositivo físico,
la API propia responda correctamente y la documentación permita repetir el proceso.
