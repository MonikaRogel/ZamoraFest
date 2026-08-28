# Política de seguridad

## Alcance

ZamoraFest es un proyecto académico desarrollado con prácticas de seguridad aplicables al ciclo de desarrollo de software. Esta política documenta el tratamiento de credenciales, secretos y reportes de seguridad dentro del repositorio.

## Información sensible

No deben almacenarse en Git ni publicarse en GitHub:

- Contraseñas de usuarios.
- Access tokens o refresh tokens.
- Secretos JWT.
- Credenciales reales de PostgreSQL o Redis.
- Archivos `.env` utilizados por un entorno concreto.
- Claves privadas, certificados privados o tokens de servicios externos.

El repositorio conserva únicamente archivos de referencia como `.env.example`, sin secretos reales.

## Configuración local

Cada desarrollador o evaluador debe crear sus propios archivos de entorno a partir de los ejemplos versionados y definir valores propios para las variables sensibles.

Los usuarios de desarrollo pueden generarse mediante las variables `SEED_*` y el seed de Prisma. Las contraseñas configuradas localmente se almacenan en la base de datos mediante hash y no deben documentarse en el repositorio.

## Credenciales para evaluación

Cuando una evaluación requiera una cuenta concreta de demostración, las credenciales deben proporcionarse mediante un canal privado autorizado por la institución o por el docente. No deben incorporarse al README, commits, issues, capturas públicas ni archivos versionados.

Un evaluador también puede definir sus propias credenciales `SEED_*`, ejecutar el seed y comprobar el flujo de autenticación de manera reproducible.

## Reporte de problemas de seguridad

No se deben publicar secretos ni detalles explotables en un issue público. Un posible problema de seguridad debe comunicarse mediante un canal privado al responsable del proyecto o mediante el medio académico definido para la evaluación.

Si accidentalmente se expone una credencial, debe considerarse comprometida y sustituirse, aunque posteriormente se elimine del repositorio.

## Principios aplicados

- Separación entre configuración y código fuente.
- Principio de mínimo privilegio.
- Exclusión de secretos mediante `.gitignore`.
- Contraseñas almacenadas mediante hash, no en texto plano en la base de datos.
- Validación de entradas en cliente y servidor.
- Transporte HTTPS/TLS requerido para un despliegue de producción.
- Credenciales de desarrollo diferentes de credenciales reales de producción.

## Dependencias

Las dependencias deben revisarse periódicamente mediante las herramientas de auditoría del gestor de paquetes. Una corrección automática no debe aplicarse si introduce cambios incompatibles sin revisión técnica previa.
