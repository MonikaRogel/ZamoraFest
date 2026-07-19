# Misión y alcance de ZamoraFest

## Identidad del proyecto

ZamoraFest es un proyecto académico orientado a la gestión y consulta de eventos culturales y festivos de la provincia de Zamora Chinchipe.

El proyecto busca ofrecer una base tecnológica organizada, segura y verificable para publicar información de eventos y permitir que las personas interesadas consulten sus principales características.

## Misión

Construir un backend documentado, funcional, medible y defendible académicamente que permita gestionar y consultar eventos culturales y festivos, aplicando buenas prácticas de desarrollo de software y los contenidos estudiados en la asignatura de Aplicaciones Móviles.

## Problema que se busca atender

La información sobre eventos culturales y festivos puede encontrarse dispersa, incompleta o presentada sin una estructura uniforme. ZamoraFest propone centralizar esta información mediante una API que pueda ser utilizada posteriormente por una aplicación móvil.

Durante la fase actual no se desarrollará todavía la aplicación móvil. El backend deberá quedar preparado para que una futura aplicación Ionic pueda consumirlo.

## Objetivo de la fase actual

El objetivo inmediato es completar un backend funcional hasta los requerimientos académicos de la Semana 8.

La entrega deberá reunir:

- Especificaciones previamente aprobadas.
- Código ejecutable.
- Pruebas verificables.
- Documentación de la API.
- Evidencias de funcionamiento.
- Mediciones comparables antes y después de las optimizaciones.
- Registro transparente del uso de inteligencia artificial.

## Alcance funcional hasta la Semana 8

El backend deberá incorporar progresivamente:

- Modelo relacional en PostgreSQL.
- Migraciones controladas mediante Prisma.
- Creación, consulta, actualización y eliminación de eventos.
- Listado paginado y consulta individual de eventos.
- Validaciones de entrada.
- Manejo centralizado de errores.
- Registro e inicio de sesión de usuarios.
- Contraseñas almacenadas mediante hash seguro.
- Autenticación mediante tokens de acceso y renovación.
- Renovación, rotación y revocación de refresh tokens.
- Autorización basada en roles.
- Endpoints públicos y protegidos.
- Documentación mediante OpenAPI y Swagger.
- Pruebas unitarias y de integración.
- Caché con Redis.
- Prevención del problema N+1.
- Estrategias de carga básica y detallada.
- Procesamiento asíncrono de recordatorios mediante BullMQ.
- Medición y documentación de las optimizaciones.

Los detalles de cada elemento deberán definirse en su correspondiente `spec.md`, `plan.md` y `tasks.md` antes de implementarse.

## Fuera del alcance actual

Durante esta fase no se desarrollarán:

- Aplicación móvil con Ionic y Capacitor.
- Integración con Android Studio.
- Publicación en tiendas de aplicaciones.
- Arquitectura multiempresa.
- Organizaciones o sedes deportivas.
- Funcionalidades específicas del dominio de Canchago.
- Keycloak.
- OAuth 2.0 con PKCE.
- Next.js.
- Integraciones externas de notificaciones que no sean exigidas académicamente.

Redis y BullMQ se incorporarán únicamente cuando el backend base esté funcionando y pueda medirse correctamente.

## Principios rectores

### Desarrollo guiado por especificaciones

Ninguna funcionalidad comenzará a implementarse sin una especificación, un plan y una lista de tareas previamente revisados.

### Alcance controlado

No se ampliará el alcance sin una exigencia académica o una razón técnica comprobable y documentada.

### Simplicidad justificable

Se seleccionará la solución más sencilla que satisfaga correctamente los requisitos. No se introducirán patrones o componentes sin una necesidad verificable.

### Seguridad desde el inicio

Las contraseñas, secretos, tokens y variables de entorno no deberán incluirse en el repositorio. Los endpoints protegidos deberán aplicar autenticación y autorización explícitas.

### Base de datos como fuente de verdad

PostgreSQL será la fuente de verdad de la información. Los mecanismos de caché y colas no reemplazarán la persistencia principal.

### Optimización basada en evidencia

Las mejoras de rendimiento deberán compararse bajo condiciones equivalentes. No se afirmará que existe una optimización sin métricas o evidencia reproducible.

### Trazabilidad académica

Los requisitos, decisiones, pruebas, commits y evidencias deberán permitir explicar cómo se construyó cada parte del proyecto.

## Criterios generales de éxito

La fase se considerará satisfactoria cuando:

1. El backend pueda instalarse y ejecutarse siguiendo el README.
2. Las migraciones permitan reproducir la estructura de la base de datos.
3. Los endpoints implementados cumplan sus criterios de aceptación.
4. Las validaciones y autorizaciones sean comprobables.
5. Las pruebas automatizadas se ejecuten correctamente.
6. Swagger documente la API disponible.
7. Las optimizaciones de la Semana 8 cuenten con mediciones antes y después.
8. El repositorio no contenga credenciales ni información secreta.
9. Cada funcionalidad pueda relacionarse con su especificación y sus commits.

## Control de cambios

Esta constitución representa la línea base oficial de ZamoraFest. Cualquier modificación deberá:

1. Identificar el requisito académico o problema técnico que la motiva.
2. Explicar el impacto sobre el alcance y la arquitectura.
3. Actualizar los documentos afectados.
4. Ser revisada antes de comenzar la implementación relacionada.