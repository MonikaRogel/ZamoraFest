# Auditoría de seguridad y dependencias - T066

## Objetivo

Auditar secretos, archivos generados, dependencias innecesarias y el tráfico HTTP utilizado durante el desarrollo móvil de ZamoraFest.

## Secretos y archivos de entorno

- No se detectaron patrones de claves privadas, tokens GitHub ni claves Google API en archivos versionados.
- `backend/.env` se encuentra ignorado por Git y no está versionado.
- `mobile/.env.local` se encuentra ignorado por Git y no está versionado.
- Los archivos `.env.example` permanecen versionados únicamente como plantillas de configuración.

## Autenticación móvil

- No se detectó uso de `localStorage` ni `sessionStorage` para persistir credenciales o tokens.
- `accessToken` y `refreshToken` aparecen únicamente en el contrato de respuesta, validación interna y pruebas.
- El servicio HTTP devuelve a la interfaz únicamente la información segura del usuario autenticado.
- La aplicación no persiste tokens durante el alcance de Semana 9.

## Direcciones y tráfico de desarrollo

- La URL de la API se obtiene mediante `VITE_API_BASE_URL`.
- Las direcciones HTTP encontradas en `src` corresponden a pruebas automatizadas o configuración de desarrollo.
- `capacitor.config.ts` no contiene una URL HTTP fija.
- El runtime Android final no conserva `server.url` de hot reload.
- El puerto 8100 quedó cerrado después de la validación física.
- No quedaron filtros temporales del firewall asociados a los puertos 3000 o 8100.
- El uso de HTTP se limita al entorno LAN de desarrollo; el README establece HTTPS/TLS como requisito para producción.

## Archivos generados y temporales

- No existen directorios generados de `dist`, `node_modules`, `build` o `.gradle` versionados en las rutas auditadas.
- El archivo temporal `LoginPage.css.v1-backup` fue identificado como no versionado y eliminado.

## Auditoría de dependencias mobile

- El árbol completo de desarrollo presentó 9 advisories: 3 low, 3 moderate, 2 high y 1 critical.
- Los advisories proceden principalmente de herramientas de desarrollo como Ionic CLI y Capacitor CLI y sus dependencias transitivas.
- `npm audit --omit=dev` sobre mobile finalizó con 0 vulnerabilidades de producción.
- No se utilizó `npm audit fix` ni `npm audit fix --force`.

## Auditoría de dependencias backend

- La auditoría inicial de producción presentó 8 advisories: 4 moderate y 4 high.
- Se trazó la cadena vulnerable hasta Prisma y sus dependencias transitivas.
- Se actualizó de forma coordinada `prisma`, `@prisma/client` y `@prisma/adapter-pg` de 7.8.0 a 7.10.0.
- La actualización es compatible con Node.js 24.14.0.
- Después de la actualización, el audit de producción se redujo de 8 a 3 vulnerabilidades high.
- Las 3 vulnerabilidades residuales pertenecen a la cadena `prisma -> @prisma/config -> deepmerge-ts`.
- `npm audit` propone resolverlas únicamente mediante `--force` instalando Prisma 6.12.0, lo que implica un cambio rompiente y un downgrade.
- Por seguridad y estabilidad del proyecto no se aplicó ese downgrade ni se forzaron overrides internos.

## Regresión después de Prisma 7.10.0

- `prisma generate`: correcto.
- TypeScript typecheck: correcto.
- ESLint: correcto.
- Build backend: correcto.
- Pruebas backend no integración: 33 archivos y 228 pruebas aprobadas.
- Pruebas de integración: 4 archivos y 21 pruebas aprobadas.
- Migraciones de la base `zamorafest_test`: sin pendientes.
- Seed de integración: ejecutado correctamente.
- Se mantiene una advertencia deprecada de `pg` relacionada con `client.query()` para una futura versión pg 9; no produjo fallos en Semana 9.

## Riesgo residual

El backend conserva 3 advisories high asociados a una dependencia transitiva interna de Prisma 7.10.0. Se mantienen documentados como riesgo residual porque la corrección automática disponible exige un downgrade rompiente a Prisma 6.12.0. La aplicación quedó funcionalmente validada con Prisma 7.10.0 y no se utilizaron correcciones forzadas.

## Resultado

T066 queda completada con auditoría de secretos, archivos generados, configuración HTTP de desarrollo, dependencias y residuos temporales. Los hallazgos corregibles dentro del alcance fueron saneados y los riesgos transitivos restantes quedaron identificados y documentados.
