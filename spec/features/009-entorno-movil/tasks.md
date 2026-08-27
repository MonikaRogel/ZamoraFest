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
- Ninguna tarea incorporará autenticación, persistencia local o interfaz de Semana 10.
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
- [ ] T038 Instalar y ejecutar la aplicación en el Samsung `SM_A305G` mediante ADB.

## 7. Ejecución y hot reload

- [ ] T039 Ejecutar el cliente web con la CLI local y comprobar el proyecto base.
- [ ] T040 Ejecutar la aplicación Android sin hot reload y verificar el arranque nativo.
- [ ] T041 Ejecutar hot reload con acceso externo y el target ADB `R28M41JD2QN`.
- [ ] T042 Confirmar desde el dispositivo el consumo de health y eventos mediante la IP LAN.
- [ ] T043 Revisar consola, Logcat y red para descartar errores de CORS, transporte o ejecución.

## 8. Documentación y evidencia

- [ ] T044 Documentar en el README requisitos, versiones exactas, instalación y diagnóstico.
- [ ] T045 Documentar variables de entorno, scripts, Android, direccionamiento y hot reload.
- [ ] T046 Fundamentar la elección de Ionic, Capacitor, Android y el dispositivo físico.
- [ ] T047 Explicar la dirección usada para alcanzar el backend y las restricciones de HTTP local.
- [ ] T048 Documentar limitaciones, dificultades encontradas y soluciones aplicadas.
- [ ] T049 Registrar el uso de inteligencia artificial, consultas aprovechadas, ajustes y verificaciones.
- [ ] T050 Preparar evidencias de versiones, diagnóstico completo, estructura, ejecución y recarga.
- [ ] T051 Preparar evidencias de la solicitud exitosa hacia la API propia y su respuesta.
- [ ] T052 Verificar el guion del video contra todos los criterios de evaluación de Semana 9.

## 9. Puertas finales y publicación

- [ ] T053 Ejecutar `npm ci`, build, typecheck, lint y pruebas del cliente móvil.
- [ ] T054 Ejecutar las pruebas del backend y confirmar que la política CORS no produjo regresiones.
- [ ] T055 Repetir build, sincronización y compilación Android desde un estado reproducible.
- [ ] T056 Repetir instalación, ejecución, hot reload y consumo de la API en el Samsung.
- [ ] T057 Auditar secretos, archivos generados, dependencias innecesarias y tráfico HTTP de desarrollo.
- [ ] T058 Revisar el diff completo, actualizar estados y publicar la feature con el enlace funcional.

## Criterio de cierre

La feature podrá cerrarse únicamente cuando todas las tareas estén verificadas,
el entorno sea reproducible, la aplicación funcione en el dispositivo físico,
la API propia responda correctamente y la documentación permita repetir el proceso.
