# Guion verificado del video - Semana 9

## Objetivo

Demostrar de forma breve y verificable la preparación, diagnóstico, ejecución e integración del entorno móvil Android de ZamoraFest.

El video debe mostrar evidencias reales en pantalla. No se deben mostrar contraseñas, tokens, secretos JWT ni contenido de archivos `.env`.

## Secuencia del video

### 1. Proyecto y tecnología

- Mostrar el repositorio ZamoraFest y la rama `feat/009-entorno-movil`.
- Explicar que el cliente utiliza Ionic 8, React, TypeScript y Capacitor 8.
- Indicar que Android es el target móvil utilizado en Semana 9.

### 2. Versiones, editor y diagnóstico

- Mostrar las versiones principales de Node.js, npm, Ionic CLI, Capacitor, Java, Gradle y ADB.
- Mostrar Visual Studio Code y las extensiones relevantes utilizadas durante el desarrollo.
- Ejecutar o mostrar el diagnóstico de Ionic y confirmar que no existen hallazgos críticos que impidan continuar.

### 3. Estructura del proyecto móvil

- Mostrar `mobile/src/config/`.
- Mostrar `mobile/src/services/api/` como frontera de acceso HTTP.
- Mostrar `mobile/src/features/` y `mobile/src/pages/`.
- Mostrar `mobile/android/` como proyecto nativo generado mediante Capacitor.

### 4. Ejecución Android

- Mostrar el Samsung reconocido por ADB.
- Abrir ZamoraFest en el dispositivo físico.
- Mostrar la pantalla de inicio de sesión funcionando en Android.

### 5. Hot reload

- Ejecutar la modalidad de desarrollo con `--livereload --external`.
- Mostrar el computador y el Samsung en la misma red.
- Realizar un cambio visual controlado y demostrar que la aplicación se recarga.
- Restaurar el cambio temporal después de la demostración.

### 6. Backend y API propia

- Explicar que el dispositivo físico utiliza la dirección LAN `192.168.1.102:3000` durante el desarrollo local.
- Diferenciarla de `10.0.2.2:3000`, utilizada por el emulador Android.
- Mostrar una respuesta exitosa de `GET /api/v1/eventos?page=1&limit=5`.
- Demostrar durante T065 el consumo funcional desde la aplicación instalada en el Samsung.

### 7. Limitaciones y mitigaciones

- Explicar que HTTP se utiliza únicamente en desarrollo local y que producción requiere HTTPS/TLS.
- Explicar la diferencia de direccionamiento entre dispositivo físico y emulador.
- Mencionar como ejemplo adicional la ampliación del timeout de Gradle o la corrección de contraste de las barras Android.

### 8. Documentación y uso de IA

- Mostrar la sección de Semana 9 incorporada al README.
- Mostrar `docs/evidencias/semana-09/`.
- Explicar que la IA se utilizó para análisis, diagnóstico y revisión, pero que cada cambio fue validado mediante pruebas o ejecución real.

## Verificación contra los criterios de evaluación

| Criterio | Cubierto por el guion |
| --- | --- |
| Proyecto y framework seleccionados | Sí |
| Versiones del entorno | Sí |
| Editor y extensiones relevantes | Sí |
| Diagnóstico sin hallazgos críticos | Sí |
| Estructura del proyecto móvil | Sí |
| Aplicación ejecutándose en el target | Sí |
| Demostración de hot reload | Sí |
| Dirección del backend y justificación | Sí |
| Respuesta exitosa de GET /api/v1/eventos | Sí |
| Dos limitaciones reales y mitigaciones | Sí |
| Configuración documentada en el repositorio | Sí |
| Uso de inteligencia artificial y verificaciones | Sí |

## Regla de grabación

Los resultados finales de pruebas, build, instalación, hot reload y consumo desde el Samsung se mostrarán con las ejecuciones realizadas en T062, T063, T064 y T065. El guion no sustituye esas verificaciones.
