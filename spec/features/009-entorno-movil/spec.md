# Especificación: entorno móvil e integración base (009)

## Estado

- **Rama:** `feat/009-entorno-movil`
- **Fase:** Semana 9
- **Estado:** propuesta para revisión antes del plan técnico
- **Proyecto:** ZamoraFest - Agenda Cultural y Festiva de Zamora Chinchipe

## 1. Propósito

Configurar, verificar y dejar reproducible el entorno de desarrollo móvil de ZamoraFest, crear una aplicación base multiplataforma y demostrar comunicación real desde el cliente móvil hacia el backend REST vigente del proyecto.

La Semana 9 debe cerrar con un entorno diagnosticado, una aplicación base ejecutable, hot reload comprobado, un target Android real o virtual operativo, conectividad con el backend y documentación suficiente para reproducir el entorno.

Esta feature no tiene como objetivo diseñar todavía la interfaz final de ZamoraFest.

## 2. Jerarquía de decisiones

Las decisiones de esta feature seguirán este orden:

1. Requerimientos académicos y rúbrica de Semana 9.
2. Modelo canónico y propuesta vigente de ZamoraFest.
3. Contratos reales del backend ya implementado.
4. Buenas prácticas observadas en el repositorio de referencia del docente.
5. Decisiones técnicas específicas necesarias para el equipo y el entorno de desarrollo.

El repositorio CanchaGo del docente se utilizará como referencia de disciplina arquitectónica, no como código ni dominio para copiar.

## 3. Stack móvil seleccionado

- Ionic 8.
- React.
- TypeScript estricto.
- Capacitor 8.
- Android como plataforma nativa inicial.
- Vite como herramienta de desarrollo web asociada al cliente Ionic.
- npm como administrador de paquetes del cliente móvil.
- `package-lock.json` obligatorio y versionado.

Se utilizará npm para mantener coherencia con el repositorio ZamoraFest existente y evitar combinar administradores de paquetes sin necesidad.

Las versiones exactas de Ionic, React, Capacitor y dependencias se verificarán y fijarán durante el plan técnico antes del scaffold.

## 4. Entorno Android validado

La estación de desarrollo dispone actualmente de:

- Node.js 24.
- npm 11.
- JDK 21 LTS.
- Android Studio Quail 3.
- Android SDK Platform 36.
- Android SDK Build-Tools 36.0.0.
- Android Platform-Tools y ADB.
- Android Command-line Tools.
- Android Emulator.
- aceleración WHPX operativa.

Android API 36 será la referencia académica mínima de configuración para esta feature.

## 5. Target de ejecución

Debe comprobarse al menos un target Android real de ejecución.

La prioridad será:

1. dispositivo Android físico cuando la conectividad ADB y los recursos disponibles lo permitan;
2. emulador Android ejecutado de forma independiente, con Android Studio cerrado cuando sea posible, como alternativa controlada.

El equipo de desarrollo utiliza Windows, por lo que iOS no constituye un destino compilable ni verificable localmente durante esta feature. Esta limitación deberá documentarse de forma explícita. Una compilación y firma futura para iOS requerirá macOS y Xcode; no se afirmará soporte iOS que no haya sido verificado.

La selección final deberá documentarse y justificarse con base en RAM, CPU, estabilidad y requisitos del taller.

No se creará un AVD pesado sin revisar previamente sus recursos.

## 6. Alcance funcional de Semana 9

La feature debe incluir únicamente lo necesario para demostrar el entorno y la integración:

- crear `mobile/` como cliente separado dentro del mismo repositorio;
- crear la aplicación base con Ionic + React + TypeScript;
- integrar Capacitor y Android;
- verificar ejecución del proyecto;
- comprobar hot reload;
- ejecutar el diagnóstico requerido por Ionic;
- verificar Visual Studio Code y las extensiones oficiales o necesarias para el stack seleccionado;
- revisar la estructura generada y el manifiesto real de dependencias;
- identificar las dependencias iniciales previstas para HTTP, navegación y almacenamiento seguro, sin instalarlas anticipadamente si Semana 9 no las necesita;
- centralizar la URL base del backend mediante variables de entorno;
- probar conectividad contra el backend real de ZamoraFest;
- documentar configuración, ejecución, target y limitaciones en README;
- conservar evidencia adecuada para el video académico.

## 7. Exclusiones explícitas

Queda fuera del alcance de esta feature:

- diseño visual definitivo de Semana 10;
- sistema de diseño completo;
- navegación funcional completa de toda la aplicación;
- CRUD móvil completo;
- implementación completa de login y manejo de sesión;
- favoritos, recordatorios y administración desde interfaz;
- geolocalización y mapas;
- notificaciones push;
- publicación en Google Play;
- soporte iOS;
- incorporación preventiva de librerías que todavía no sean necesarias.

No se instalarán TanStack Query, Zustand, React Hook Form u otras librerías solo porque existan en el proyecto CanchaGo. Cada dependencia deberá tener una necesidad concreta en ZamoraFest.

## 8. Reglas anti-espagueti

La arquitectura móvil debe respetar desde su creación las siguientes fronteras:

- `src/config/`: configuración y lectura centralizada del entorno.
- `src/services/api/`: única puerta de salida HTTP hacia el backend.
- `src/features/`: lógica de cada capacidad funcional del cliente.
- `src/pages/`: composición y orquestación de pantallas.
- `src/components/`: componentes presentacionales reutilizables cuando sean necesarios.

Está prohibido:

- ejecutar `fetch` o Axios directamente desde páginas o componentes;
- hardcodear direcciones IP o URLs del backend en pantallas;
- duplicar reglas de negocio existentes en el backend;
- inventar endpoints, campos o envelopes de respuesta;
- mezclar responsabilidades de UI, transporte HTTP y dominio en un mismo archivo;
- utilizar `any` como salida rápida ante problemas de tipado;
- incorporar secretos al bundle móvil;
- usar almacenamiento local inseguro para tokens cuando posteriormente se implemente autenticación.

La simplicidad estructurada tiene prioridad sobre la sobrearquitectura.

## 9. Configuración de API

El cliente dispondrá de una única variable pública de configuración para la base del backend:

`VITE_API_BASE_URL`

No se codificarán URLs alternativas en componentes, páginas o servicios individuales.

La dirección efectiva dependerá del target utilizado:

- navegador de desarrollo: host local o proxy justificado;
- emulador Android: alias de host correspondiente al emulador cuando aplique;
- dispositivo físico: dirección LAN del equipo de desarrollo cuando aplique.

La selección de dirección se realizará por configuración y no mediante cambios manuales dispersos en el código.

## 10. Tráfico HTTP local

Las excepciones de tráfico HTTP sin TLS serán exclusivamente para desarrollo local.

Si Android necesita cleartext para alcanzar el backend local, deberá configurarse mediante una excepción limitada al host de desarrollo usando `network_security_config.xml` o un mecanismo equivalente correctamente acotado.

No se habilitará cleartext global de forma indiscriminada para producción.

La excepción deberá poder retirarse antes de distribución.

## 11. Contratos backend verificados

La aplicación no inventará contratos ni trasladará al cliente reglas que correspondan al servidor.

### 11.1. Diagnóstico de transporte

Para comprobar primero la comunicación básica entre cliente y servidor se utilizará:

`GET /api/v1/health`

Respuesta real esperada del backend actual:

```json
{
  "status": "ok",
  "service": "zamorafest-backend"
}
```

Este endpoint se utilizará únicamente como prueba de disponibilidad, direccionamiento y transporte.

### 11.2. Evidencia funcional principal de integración

La demostración funcional principal de Semana 9 utilizará el contrato público real:

`GET /api/v1/eventos`

Esta solicitud demostrará que el cliente móvil puede alcanzar el backend propio de ZamoraFest y consumir información perteneciente al dominio real del proyecto.

Antes de implementar el consumo, el shape exacto de la respuesta deberá verificarse directamente contra el backend vigente. No se inventarán interfaces TypeScript, campos, parámetros ni envelopes de respuesta.

`GET /api/v1/health` permanecerá como diagnóstico previo de transporte y disponibilidad, pero no sustituirá la prueba funcional mediante `/eventos`.
### 11.3. Reglas de validación del login móvil futuro

Cuando se implemente la interfaz funcional de autenticación, el cliente deberá validar para mejorar la experiencia de usuario, sin sustituir nunca las validaciones del backend.

El formulario de login respetará el contrato real vigente:

- correo obligatorio;
- eliminación de espacios laterales antes del envío;
- formato de correo válido;
- longitud máxima de correo de 254 caracteres;
- contraseña obligatoria;
- contraseña con longitud máxima de 72 caracteres;
- no imponer en login el mínimo de 8 caracteres utilizado para registro, porque son contratos distintos;
- impedir envíos duplicados mientras una solicitud de autenticación se encuentre en curso;
- mostrar errores de autenticación sin revelar si la cuenta existe o cuál dato concreto falló.

Las validaciones del cliente son una barrera de experiencia y calidad, no una frontera de seguridad. El backend continuará siendo la autoridad para credenciales, estado del usuario, rol, permisos y generación de tokens.

### 11.4. Reglas de seguridad de autenticación

Desde esta feature quedan establecidas las siguientes invariantes:

- nunca registrar contraseñas en consola, archivos, telemetría o mensajes de error;
- nunca registrar `accessToken` ni `refreshToken` completos;
- nunca incluir contraseñas, tokens ni secretos en Git;
- nunca colocar secretos en variables `VITE_*`, porque forman parte del bundle del cliente;
- nunca utilizar `localStorage` ni `sessionStorage` para persistir tokens de autenticación;
- no utilizar almacenamiento genérico de preferencias como sustituto de almacenamiento seguro de secretos;
- cuando la persistencia de sesión entre en alcance, utilizar almacenamiento seguro adecuado para credenciales o tokens en el dispositivo;
- utilizar mensajes de error genéricos para credenciales inválidas;
- mantener autorización y control de roles exclusivamente como decisiones finales del backend;
- no confiar en ocultar botones o rutas del frontend como mecanismo de autorización;
- utilizar HTTPS en entornos de producción;
- limitar cualquier excepción HTTP sin TLS al host estrictamente necesario durante desarrollo local;
- retirar las excepciones de cleartext antes de una distribución de producción.

El backend actual no deberá considerarse protegido contra fuerza bruta o credential stuffing salvo que se verifique expresamente una política de rate limiting para autenticación. Si esa protección no existe, quedará registrada como endurecimiento de seguridad pendiente antes de una exposición productiva.

Semana 9 no ampliará el backend con controles de seguridad no requeridos por el taller sin una revisión y una feature específica. No se afirmará que una protección existe cuando no haya sido verificada.

### 11.5. Autenticación reservada para una feature posterior

El backend vigente dispone del contrato real:

`POST /api/v1/auth/login`

Este contrato y sus reglas de seguridad permanecen documentados desde Semana 9 para evitar decisiones inseguras cuando se implemente la autenticación móvil.

Sin embargo, esta feature no implementará todavía:

- formulario definitivo de login;
- persistencia de access token o refresh token;
- almacenamiento seguro de sesión;
- renovación automática de tokens;
- recuperación de sesión;
- guards de navegación autenticada;
- logout funcional;
- autorización de interfaz basada en roles.

Cuando la autenticación móvil entre formalmente en alcance deberá desarrollarse como una feature independiente y respetar las reglas de validación y seguridad definidas en las secciones 11.3 y 11.4.

Esta separación evita implementar parcialmente una responsabilidad sensible que requiere diseño, almacenamiento seguro, manejo de errores y pruebas coherentes.
## 12. Conectividad del backend

Antes de ejecutar la aplicación sobre un dispositivo físico se verificará cómo escucha actualmente el servidor Express y si es accesible desde la LAN.

No se modificará el backend preventivamente.

Si el target físico requiere una escucha explícita en todas las interfaces, cualquier ajuste deberá:

- ser mínimo;
- estar configurado y documentado;
- no cambiar reglas de negocio;
- mantener compatibilidad con desarrollo y pruebas;
- aprobar las puertas del backend después del cambio.

## 13. Diagnóstico requerido

Antes de declarar el entorno listo se deben comprobar como mínimo:

- versiones de Node.js y npm;
- JDK y variables de entorno;
- Android SDK Platform 36;
- Build-Tools;
- estado de las licencias requeridas del Android SDK;
- Visual Studio Code y extensiones requeridas para el flujo seleccionado;
- ADB;
- target conectado;
- diagnóstico `ionic info`;
- build del cliente;
- sincronización Capacitor Android;
- ejecución real sobre el target seleccionado;
- hot reload;
- conexión satisfactoria con el backend.

Los errores de diagnóstico se resuelven antes de continuar con nuevas funcionalidades.

## 14. Reproducibilidad

El repositorio deberá permitir reconstruir el cliente móvil desde una instalación limpia mediante dependencias versionadas y documentación suficiente.

Se debe:

- versionar `package.json`;
- versionar `package-lock.json`;
- documentar versiones relevantes;
- documentar el editor, extensiones relevantes y herramientas de diagnóstico utilizadas;
- documentar variables requeridas sin incluir secretos;
- proporcionar `.env.example` cuando corresponda;
- documentar comandos de instalación, desarrollo, build y Android;
- evitar dependencias globales no documentadas.

## 15. Criterios de aceptación

La feature se considerará aprobada únicamente si:

1. `mobile/` existe como cliente independiente del backend.
2. Ionic + React + TypeScript + Capacitor están configurados de forma reproducible.
3. Android API 36 forma parte de la cadena utilizada por el proyecto.
4. `ionic info` no presenta hallazgos críticos sin resolver.
5. la aplicación base compila.
6. la aplicación se ejecuta en el target Android seleccionado.
7. hot reload se demuestra de forma verificable.
8. `VITE_API_BASE_URL` centraliza la dirección del backend.
9. `GET /api/v1/health` responde correctamente desde la aplicación.
10. el cliente realiza al menos una consulta funcional real a `GET /api/v1/eventos`.
11. cualquier excepción HTTP local está limitada al entorno de desarrollo.
12. el README explica instalación, diagnóstico, ejecución y conectividad.
13. no existen secretos versionados.
14. no se introducen reglas de negocio duplicadas en el cliente.
15. no se adelanta trabajo de interfaz correspondiente a Semana 10.
16. el backend existente continúa superando sus puertas de calidad si resulta necesario modificar configuración de conectividad.
17. Visual Studio Code y las extensiones necesarias para el stack quedan verificadas y documentadas.
18. `GET /api/v1/eventos` se consume desde la aplicación y demuestra integración funcional real con el backend propio de ZamoraFest.
19. ninguna contraseña, token o secreto queda codificado en el repositorio, variables VITE o logs.
20. Semana 9 no persiste ni gestiona tokens de autenticación porque la sesión móvil queda fuera del alcance funcional de esta feature.
21. las validaciones previstas para login respetan el contrato real del backend y distinguen login de registro.
22. el frontend no se considera una frontera de autorización; roles y permisos continúan siendo responsabilidad del backend.
23. se identifican al menos dos limitaciones reales del entorno y se documenta la estrategia de mitigación adoptada para cada una.
24. cualquier ausencia verificada de rate limiting de autenticación queda documentada como endurecimiento pendiente antes de producción.
25. el uso de herramientas de inteligencia artificial queda registrado con las verificaciones técnicas realizadas sobre sus resultados.
26. la limitación de compilación iOS desde Windows queda documentada sin afirmar capacidades no verificadas.

## 16. Evidencia para el taller

La evidencia final deberá permitir mostrar de forma clara:

- proyecto y framework seleccionados;
- versiones del entorno;
- editor y extensiones relevantes utilizadas;
- diagnóstico sin hallazgos críticos;
- estructura del proyecto móvil;
- aplicación ejecutándose en el target;
- demostración de hot reload;
- dirección del backend y justificación de su valor;
- respuesta exitosa de `GET /api/v1/eventos`, demostrando consumo funcional de la API propia de ZamoraFest;
- al menos dos limitaciones reales del entorno y sus respectivas medidas de mitigación;
- configuración documentada en el repositorio.
- registro del uso de inteligencia artificial, incluyendo instrucciones utilizadas, decisiones adoptadas y verificaciones técnicas realizadas.

## 17. Puertas de control

No se avanzará de forma automática entre etapas.

Orden obligatorio:

1. aprobar esta especificación;
2. crear y aprobar `plan.md`;
3. crear y aprobar `tasks.md`;
4. preparar herramientas Ionic necesarias;
5. crear el cliente base;
6. diagnosticar;
7. preparar target;
8. integrar backend;
9. validar;
10. documentar y cerrar.

Si una etapa falla, se corrige antes de continuar.

## 18. Criterio arquitectónico final

Semana 9 debe terminar con una base pequeña, comprensible y extensible.

La estructura debe permitir que Semana 10 agregue ingeniería de interfaz y componentes sin tener que reorganizar un cliente creado apresuradamente.

La calidad se medirá tanto por lo que se implementa como por lo que deliberadamente se evita implementar antes de tiempo.
