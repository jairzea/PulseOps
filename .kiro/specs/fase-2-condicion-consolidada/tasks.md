# Plan de implementación — Fase 2

> **Decisiones resueltas (2026-06-26):** marca producción/estudio = flag global `Metric.category`
> (default PRODUCTION); fórmula del agregador validada con las notas de Laura. Listo para
> implementar. Ver design.md.

- [ ] 1. Tipos compartidos: scoreTable y consolidado
  - `ConditionScoreTable`, `ConsolidatedWeek`, `ConsolidatedEvaluation` y `scoreTable?` en `ConditionThresholds` (aditivo) en `packages/shared-types/src/types.ts`. Build de shared-types.
  - _Requisitos: 2.1, 3.1, 6.2_

- [ ] 2. Motor: `analyzeConsolidated` (puro) + niveles 1-3
  - Implementar alineación por semana, condición por métrica por semana (par consecutivo), total semanal, y re-análisis de la serie de totales reutilizando `analyzeWithConditions`.
  - Aplicar regla dura (total actual 0 → INEXISTENCIA) y exclusión de semanas ausentes.
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Motor: selfcheck del ejemplo de Laura
  - Asserts: 9→13 → AFLUENCIA; 9→9 → EMERGENCIA; total semana actual 0 → INEXISTENCIA; una métrica de estudio no altera el total. Ejecutar con node, debe pasar.
  - _Requisitos: 3.6_

- [ ] 4. Config: default scoreTable (consolidar defaults)
  - Añadir `scoreTable` por defecto en la fuente de defaults sin crear una 4ª copia; tender a unificar las existentes.
  - _Requisitos: 2.1, 2.2, 2.3_

- [ ] 5. Modelo: flag `category` en Metric
  - Añadir `category: 'PRODUCTION'|'STUDY'` (default PRODUCTION) al schema y DTOs de Metric. Migración implícita: documentos existentes sin campo → producción.
  - _Requisitos: 1.1, 1.2, 1.3_

- [ ] 6. Backend: servicio + endpoint consolidado
  - `AnalysisService.consolidated()` y `GET /analysis/consolidated` con guard. Filtrar a métricas de producción, armar series, llamar al motor.
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Frontend: API + badge consolidado
  - `analysisApi.getConsolidated()` + tipos; badge "Condición de producción" en el dashboard con `data-testid`. Desglose semanal opcional.
  - _Requisitos: 5.1, 5.2, 5.3_

- [ ] 8. Frontend: toggle producción/estudio
  - En la pantalla de asignación de métricas al recurso, control para marcar cada métrica. (Depende de tarea 5.)
  - _Requisitos: 1.4_

- [ ] 9. Verificación de cierre
  - `getDiagnostics`, build packages + backend, typecheck frontend. Validación runtime con un recurso del seed. Actualizar roadmap marcando Fase 2.
  - _Requisitos: 6.1, 6.2_
