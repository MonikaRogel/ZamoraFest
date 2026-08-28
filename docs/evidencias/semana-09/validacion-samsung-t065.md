# Validación física final en Samsung - T065

## Contexto

Fecha y hora de cierre: 2026-08-28 00:59:52 -05:00
Rama: feat/009-entorno-movil
HEAD base: da01c11
- Dispositivo: SM-A305G
- Android: 11
- SDK: 30

## Instalación y ejecución

- APK de T064 verificado mediante SHA-256.
- Instalación ADB: Success.
- Arranque en frío de MainActivity: aprobado.
- Aplicación mantenida activa durante las verificaciones.

## Hot reload

- Servidor Vite accesible mediante http://192.168.1.102:8100.
- Vite registró HMR sobre /src/pages/LoginPage.tsx.
- El cambio visual temporal fue observado y después restaurado.
- SHA-256 de LoginPage.tsx antes y después: idéntico.
- No quedó modificación temporal en el diseño.

## Consumo de API desde Samsung

- VITE_API_BASE_URL utilizada: http://192.168.1.102:3000.
- Login ejecutado manualmente desde la aplicación instalada.
- POST /api/v1/auth/login: funcional.
- Estado autenticado confirmado mediante rol seguro ADMINISTRADOR.
- No se conservaron contraseña, access token ni refresh token.

## Restauración final

- Servidor temporal de hot reload detenido.
- Puerto 8100 cerrado.
- Capacitor sincronizado nuevamente en modo normal.
- server.url no configurada después de la sincronización.
- Backend continúa respondiendo por la LAN.
