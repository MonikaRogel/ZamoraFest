# Plan técnico: diseño UI móvil y componentes reutilizables (010)

## Estado

- **Rama:** `feat/010-diseno-ui-movil`
- **Especificación:** `spec.md`
- **Fase:** implementación controlada

## 1. Estrategia

La implementación se realizará de forma incremental y verificable, manteniendo la propuesta original de ZamoraFest y evitando adelantar funcionalidades de semanas posteriores.

## 2. Secuencia

1. Auditar la UI móvil existente.
2. Ejecutar baseline de typecheck, lint, tests y build.
3. Definir tokens del sistema de diseño.
4. Verificar contraste de colores conforme a WCAG 2.2 AA.
5. Implementar componentes reutilizables.
6. Documentar el catálogo de componentes, incluyendo propósito, interfaz pública, estados y justificación de reutilización.
7. Implementar `ExploreEventsPage`.
8. Conectar la página con `GET /api/v1/eventos`.
9. Resolver loading, empty y error.
10. Verificar comportamiento responsivo en al menos dos anchos.
11. Verificar comportamiento con fuente ampliada.
12. Realizar comprobaciones de accesibilidad y lector de pantalla en dispositivo.
13. Probar la pantalla contra el backend real.
14. Conservar capturas y evidencias de ejecución.
15. Registrar el uso de IA aplicado durante Feature 010.
16. Ejecutar verificaciones finales de typecheck, lint, tests y build.
17. Revisar cambios Git antes de stage, commit y push.

## 3. Reglas

- No instalar dependencias sin necesidad comprobada.
- No modificar backend salvo necesidad demostrada.
- No adelantar funcionalidades de semanas posteriores.
- No colocar llamadas HTTP dentro de componentes reutilizables.
- Los componentes deben consumir tokens del sistema de diseño.
- Los componentes reutilizables no deben conocer rutas ni autenticación global.
- No realizar commits sin superar las verificaciones correspondientes.
- No declarar como completada una evidencia que todavía no haya sido ejecutada.

## 4. Advertencias técnicas conocidas

Durante el build móvil aparecen advertencias no bloqueantes ya presentes en el entorno:

- `lightningcss` informa sobre `:host-context` dentro del CSS generado por Ionic.
- Vite informa que algunos chunks superan los 500 kB después de la minificación.

Estas advertencias no impiden el build y no se modificarán dentro de Feature 010 sin una necesidad funcional demostrada.