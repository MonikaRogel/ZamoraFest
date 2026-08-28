# Evidencias de la Semana 9

## Propósito

Este directorio conserva evidencia reproducible del entorno móvil de ZamoraFest correspondiente a Semana 9.

No se registran resultados que no hayan sido obtenidos mediante verificaciones reales del repositorio o del dispositivo Android.

## Evidencias preparadas

- `versiones-entorno.txt`: versiones exactas del entorno utilizado.
- `diagnostico-entorno.txt`: Java, ADB, dispositivo Android y configuración runtime de Capacitor.
- `estructura-mobile.txt`: estructura principal y archivos relevantes del cliente móvil.

## Ejecución en dispositivo

La aplicación fue compilada, instalada y ejecutada correctamente en el dispositivo físico SM-A305G mediante ADB.

La evidencia final de repetición de instalación y ejecución se realizará nuevamente durante T065.

## Hot reload

El hot reload fue comprobado previamente mediante Ionic/Capacitor con `--livereload --external`, utilizando el computador y el Samsung dentro de la misma red local.

La repetición final de esta comprobación se realizará durante T065 para obtener evidencia actualizada antes de publicar la feature.

## Evidencia visual sugerida para el video

El video académico deberá mostrar, como mínimo:

1. versiones principales del entorno;
2. diagnóstico de Ionic y Android;
3. estructura de `mobile/`;
4. aplicación ejecutándose en el Samsung;
5. demostración de hot reload;
6. dirección utilizada para alcanzar el backend;
7. respuesta funcional de la API propia de ZamoraFest.

La evidencia del consumo exitoso de la API se documenta específicamente en T060.

## Seguridad

Las evidencias no deben mostrar contraseñas, access tokens, refresh tokens, secretos JWT, cadenas de conexión ni contenido real de archivos `.env`.
- `auditoria-seguridad-t066.md`: auditoría de secretos, dependencias, HTTP de desarrollo y riesgo residual.
- `api-eventos-exitosa.md`: evidencia de solicitud exitosa hacia la API propia y respuesta de eventos.
- `guion-video.md`: guion de demostración verificado contra los criterios de evaluación de Semana 9.
- `validacion-cliente-t062.md`: evidencia de instalación limpia, build, typecheck, lint y pruebas del cliente móvil.
- `validacion-backend-cors-t063.md`: evidencia de pruebas backend, integración y política CORS.
- `build-android-t064.md`: evidencia del build, sincronización y compilación Android reproducible.
- `validacion-samsung-t065.md`: evidencia de instalación, ejecución, hot reload y login real desde el Samsung.
