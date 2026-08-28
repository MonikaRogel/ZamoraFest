# Build reproducible Android - T064

## Contexto

Fecha y hora: 2026-08-28 00:39:41 -05:00
Rama: feat/009-entorno-movil
HEAD base: da01c11

## Secuencia ejecutada

```text
cd mobile
npm run build
npm run cap:sync
cd android
gradlew.bat --version
gradlew.bat clean assembleDebug
```

## Resultado

- Build web: aprobado
- Sincronización Capacitor Android: aprobada
- Runtime normal sin server.url: aprobado
- Limpieza Gradle: aprobada
- Compilación assembleDebug: aprobada
- APK: mobile\android\app\build\outputs\apk\debug\app-debug.apk
- Tamaño en bytes: 4929324
- SHA-256: 4F87AE7AA2566334053CE402DFF6F7378FFEBE02AD1D48AEC07F598E099FB00F

La compilación fue repetida desde una limpieza Gradle y produjo un APK de depuración válido.

La sincronización normal de Capacitor confirmó que no quedó configurada una URL temporal de hot reload.
