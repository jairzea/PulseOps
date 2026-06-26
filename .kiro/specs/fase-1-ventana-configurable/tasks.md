# Plan de implementación — Fase 1

- [x] 1. Tipos compartidos: condición de tendencia (aditiva)
  - Añadir `TrendEvaluation` y campo opcional `trend?` en `MetricConditionEvaluation` en `packages/shared-types/src/types.ts`.
  - Build de `shared-types`. `getDiagnostics` limpio.
  - _Requisitos: 2.1, 3.1, 3.4, 4.1_

- [x] 2. Motor: regresión lineal portada (pura)
  - Portar `calculateLinearRegression` (mínimos cuadrados) como helper puro en `engine.ts`, sin dependencias nuevas.
  - _Requisitos: 2.2, 2.3_

- [x] 3. Motor: cálculo de condición de tendencia
  - En `analyzeWithConditions`, sobre `relevantPoints` (la ventana), calcular slope/intercept, derivar `I_tendencia` desde los extremos de la recta vía `calculateInclination`, resolver con `resolveCondition` (mismos thresholds) y poblar `trend`.
  - Manejar `< 2` puntos → `trend` SIN_DATOS. No alterar la condición temprana.
  - _Requisitos: 2.1, 2.2, 2.4, 2.5, 4.1_

- [x] 4. Motor: selfcheck ampliado (verificación ejecutable)
  - En `engine.selfcheck.ts`: serie creciente → tendencia coherente; **serrucho con repunte final → temprana ≠ tendencia** (assert clave); serie plana → ambas EMERGENCIA.
  - Ejecutar con `node` (tras build); debe pasar.
  - _Requisitos: 2.6, 4.2_

- [x] 5. Backend: recompilar y verificar propagación
  - Rebuild de `analysis-engine` y backend. Confirmar que `/analysis/evaluate` devuelve `trend` (sin cambios de lógica en `AnalysisService`).
  - _Requisitos: 3.2, 4.3_

- [x] 6. Frontend: tipo y selector de ventana
  - Añadir `trend?` en `AnalysisResult` (`analysisApi.ts`).
  - En `ResourceDashboard`: estado `windowSize` (default 8), selector con opciones 4/6/8/12 y `tid('dashboard','window-select')`; pasar `windowSize` a `evaluate` y recortar records (`slice(-windowSize)`) para gráfica/análisis/alertas coherentes.
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 3.3_

- [x] 7. Frontend: mostrar condición de tendencia
  - En el panel de Análisis, badge/línea "Tendencia del periodo" cuando `evaluation.trend` existe, diferenciada de la temprana.
  - _Requisitos: 3.3_

- [x] 8. Verificación de cierre
  - `getDiagnostics` en los archivos tocados; build packages + backend limpio.
  - Validación runtime: cambiar ventana en el dashboard y confirmar gráfica + análisis + tendencia coherentes; condición temprana sin regresión.
  - Actualizar `roadmap.md` marcando Fase 1 y la deuda "Condición de tendencia" como resuelta.
  - _Requisitos: 1.2, 4.1, 4.2, 4.3_

## Notas de implementación

- **Decisión de dominio clave (validada en selfcheck):** la condición de tendencia normaliza la
  pendiente de la regresión a una inclinación porcentual usando los **extremos de la recta
  ajustada** (`fit(0)` vs `fit(n-1)`), y la pasa por la **misma** `resolveCondition` y los
  mismos `ConditionThresholds`. Sin umbrales nuevos. El motor sigue puro/determinístico.
- **Caso que justifica la feature (assert del selfcheck):** serrucho con repunte final →
  temprana AFLUENCIA (ve el último salto +50%), tendencia EMERGENCIA (la regresión ve el
  periodo plano/declinante). La divergencia es el valor de negocio.
- **Pendiente de validación runtime:** el entorno tuvo disco al 100% (causa del "Failed to
  fetch" y timeouts). Se liberó ~1.1Gi limpiando el cache de npm. Falta probar en navegador
  el selector de ventana con backend+frontend arriba.
