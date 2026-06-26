# Plan de implementación — Fase 2

> **Decisiones (2026-06-26):**
> - Tres categorías de métrica: PRODUCTION / STUDY / TRACKING. Base en `Metric.category` +
>   override por recurso `categoryByResource`. Solo PRODUCTION cuenta para el consolidado.
> - Consolidado por **NIVEL** (no por inclinación de totales): puntaje promedio normalizado
>   contra el techo (nº métricas × PODER) → ratio → condición vía `consolidatedLevels`.
> - `scoreTable`, `consolidatedLevels` y `defaultWindowSize` configurables en la config activa.

- [x] 1. Tipos compartidos
  - `ConditionScoreTable`, `ConsolidatedLevelThresholds`, `MetricCategory`, `ConsolidatedMetricInput`, `ConsolidatedContribution`, `ConsolidatedEvaluation`; `scoreTable?`, `consolidatedLevels?`, `defaultWindowSize?` en `ConditionThresholds`. Build de shared-types.
  - _Requisitos: 2.1, 3.1, 6.2_

- [x] 2. Motor: `analyzeConsolidated` (puro) por nivel
  - Cada métrica → condición sobre la ventana → puntaje; nivel = Σ/(n×máx); ratio → condición vía umbrales de nivel. Regla dura (producción 0 → INEXISTENCIA). `windowSize` como tope (no mínimo): fix del guard que daba SIN_DATOS con pocos puntos.
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Motor: selfcheck
  - Asserts: una métrica en PODER → consolidado PODER; producción 0 → INEXISTENCIA; nivel mixto; umbrales de nivel configurables cambian el resultado; 2 puntos con ventana 8 ≠ SIN_DATOS. Pasa (exit 0).
  - _Requisitos: 3.6_

- [x] 4. Config: defaults consolidados
  - `scoreTable` + `consolidatedLevels` + `defaultWindowSize` en `createDefaultConfiguration`, schema y DTO. Aditivo, sin 4ª copia.
  - _Requisitos: 2.1, 2.2, 2.3_

- [x] 5. Modelo: categoría en Metric
  - `category: 'PRODUCTION'|'STUDY'|'TRACKING'` (default PRODUCTION) + `categoryByResource` (override) en schema y DTOs.
  - _Requisitos: 1.1, 1.2, 1.3_

- [x] 6. Backend: servicio + endpoint consolidado
  - `AnalysisService.consolidated()` + `GET /analysis/consolidated` con guard. Filtra producción (override ?? base ?? PRODUCTION), arma series, ventana efectiva = request ?? defaultWindowSize.
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Frontend: API + badge consolidado con desglose
  - `analysisApi.getConsolidated()` + tipos; banda "Condición de producción de la persona" con nivel %, `pts/techo`, desglose por métrica y tooltip de la fórmula. Refresco al crear registro (`lastCreatedRecord`). Ventana inicial = `defaultWindowSize` de la config.
  - _Requisitos: 5.1, 5.2, 5.3_

- [x] 8. Frontend: categoría + configuración del consolidado
  - Selector de 3 categorías en `MetricForm`. Paso "Consolidado de Producción" en `ConfigurationPage` (puntajes + umbrales de nivel + ventana por defecto), resumen en Revisión Final, y `InfoTooltip` reutilizable (ayuda general por grupo y por campo).
  - _Requisitos: 1.4, 2.1_

- [x] 9. Verificación de cierre
  - `getDiagnostics` limpio; build shared-types + motor; typecheck backend y frontend en verde; selfcheck del motor pasa. Validación runtime: hecha por el arquitecto (caso Helena, refresco, configuración).
  - _Requisitos: 6.1, 6.2_
