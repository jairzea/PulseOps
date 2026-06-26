# Diseño — Fase 2: Condición consolidada por persona

## Visión general

Orquestación en 3 niveles que **reutiliza el motor**, sin reglas de inclinación nuevas:

```
métricas de producción del recurso
   │  (cada una: serie de valores por semana)
   ▼
Nivel 1 — por semana, por métrica: condición (cambio w-1 → w) → puntaje (tabla configurable)
   ▼
Nivel 2 — por semana: suma de puntajes de las métricas de producción → total semanal
   ▼
Nivel 3 — serie de totales semanales → análisis de inclinación del motor → CONDICIÓN CONSOLIDADA
            + regla dura: total semana actual == 0 → INEXISTENCIA
```

El cálculo puro vive en el motor (`@pulseops/analysis-engine`); el backend solo arma las series
desde Mongo y llama al motor.

## Decisión de dominio RESUELTA (arquitecto, 2026-06-26)

**Categorías de métrica → TRES valores (`MetricCategory`):**
- `PRODUCTION`: cuenta en el consolidado.
- `STUDY`: estudio; no cuenta en el consolidado (sí en métricas de equipo futuras).
- `TRACKING`: solo seguimiento; no cuenta ni como producción ni estudio.

**Dónde vive la categoría → categoría base + override por recurso:**
- Base global en `Metric.category` (default `PRODUCTION`).
- Override opcional por recurso en `Metric.categoryByResource: { [resourceId]: MetricCategory }`,
  para casos como "Integraciones es producción salvo para Helena".
- Resolución: `efectiva = categoryByResource[resourceId] ?? category ?? 'PRODUCTION'`.

`ponytail:` override como mapa embebido en la métrica, sin colección nueva; solo se llena
cuando un recurso difiere del default. Upgrade futuro a colección `metric-resource` indexada si
el volumen lo pide.

## Método del consolidado: NIVEL, no inclinación de totales (revisado 2026-06-26)

El método inicial (inclinación de la serie de totales) producía resultados ilógicos: una métrica
en NORMAL/PODER sostenido tiene puntaje plano (5,5,5) → inclinación 0 → EMERGENCIA, aunque la
persona produzca bien. **Corregido a método por NIVEL:**

1. Cada métrica de producción → su condición actual sobre la ventana (`analyzeWithConditions`)
   → puntaje (`scoreTable`).
2. Nivel = Σ puntajes / (nº métricas × puntaje máximo). Ratio 0..1.
3. El ratio se mapea a condición vía **umbrales de nivel configurables** (`consolidatedLevels`),
   calibrados para que una sola métrica dé su propia condición.
4. Regla dura: producción nula (puntaje total 0) → INEXISTENCIA.

Esto sí es coherente: una persona con una única métrica en PODER → consolidado PODER. La tabla
`consolidatedLevels` (ratios poder/afluencia/normal/emergencia/peligro) es el parámetro
configurable que reemplaza a la idea previa de "umbrales de inclinación del consolidado".

## A. Tipos compartidos (`shared-types`)

```ts
// Tabla de puntajes, configurable, junto a los umbrales.
export type ConditionScoreTable = Record<HubbardCondition, number>;
// default Laura: PODER:10, AFLUENCIA:7, NORMAL:5, EMERGENCIA:3, PELIGRO:1, INEXISTENCIA:0,
//                SIN_DATOS:0, CAMBIO_DE_PODER:0

export interface ConsolidatedWeek {
  week: string;            // "2026-W02"
  total: number;           // suma de puntajes de producción esa semana
  perMetric: Array<{ metricKey: string; condition: HubbardCondition; score: number }>;
}

export interface ConsolidatedEvaluation {
  resourceId: string;
  condition: HubbardCondition;     // condición consolidada (nivel 3)
  reason: ConditionReason;
  weeks: ConsolidatedWeek[];       // serie de totales + desglose
  windowUsed: number;
  evaluatedAt: string;
}
```

`ConditionThresholds` gana `scoreTable?: ConditionScoreTable` (opcional/aditivo).

**Umbrales propios del consolidado (decisión PO 2026-06-26):** el nivel 3 (re-análisis de la
serie de totales) puede usar su PROPIA tabla de umbrales (`consolidatedThresholds`), distinta de
la de métricas individuales. Motivo: Laura considera un +44% de producción como AFLUENCIA, aunque
a nivel métrica +44% sea NORMAL. Si no se provee, el consolidado cae a los umbrales de métrica.
El motor acepta `config.consolidatedThresholds`; el backend lo tomará de la configuración activa
(campo aparte de `thresholds`).

## B. Motor — función pura nueva

`analyzeConsolidated(metrics, config)` donde `metrics: Array<{ metricKey; points: MetricPoint[] }>`
(solo producción), `config` trae `scoreTable`, `thresholds`, `size`.

Algoritmo:
1. **Alinear por semana.** Unir los `timestamp/week` de todas las métricas. Para cada semana,
   cada métrica aporta su valor (si existe registro). Semana sin registro en NINGUNA métrica →
   ausente (se excluye). (Req 3.4)
2. **Nivel 1 — condición por métrica por semana.** Para la semana `w` (desde la 2ª disponible de
   esa métrica), condición = `resolveCondition(calculateInclination(valor[w-1], valor[w]), ...)`.
   Es la regla "temprana" actual aplicada al par consecutivo. → `score = scoreTable[condition]`.
3. **Nivel 2 — total semanal** = Σ scores de las métricas de producción con dato esa semana.
4. **Nivel 3 — consolidado.** Construir serie `points = weeks.map(total)` y pasarla por
   `analyzeWithConditions({ size, thresholds })`. La condición resultante es la consolidada.
5. **Regla dura (Req 3.3):** si `weeks[last].total === 0` → condición = `INEXISTENCIA` (override
   explícito tras el paso 4).

Reutiliza `calculateInclination` y `resolveCondition` (hoy privadas) y `analyzeWithConditions`
(pública). Se **exportan** `calculateInclination` y un helper de condición por par, o se expone
`analyzeConsolidated` como única superficie pública nueva (preferido: menos API expuesta).

`ponytail:` alineación por semana O(semanas × métricas); trivial para ≤ ~52 semanas y pocas
métricas por persona. Si crece, indexar por week.

## C. Backend

`AnalysisService.consolidated(resourceId, windowSize?)`:
1. `metricsService.findByResource(resourceId)` → filtrar a `category === 'PRODUCTION'` (las no
   marcadas cuentan como producción por defecto).
2. Para cada métrica de producción: `recordsService.findMany({resourceId, metricKey})` → puntos.
3. `getActiveConfiguration()` → `thresholds` + `scoreTable` (default si falta).
4. `analysisEngine.analyzeConsolidated(metrics, { size, scoreTable, thresholds })`.
5. Endpoint `GET /analysis/consolidated` en `AnalysisController` (guard `DemoOrJwtAuthGuard`).

Sin cambios en `evaluate`/`overview` salvo, opcionalmente, enriquecer `overview` con la condición
consolidada en una iteración futura.

## D. Frontend
- `analysisApi.getConsolidated(resourceId, windowSize)`.
- Mostrar la condición consolidada en el dashboard del recurso (badge destacado "Condición de
  producción") y `data-testid` estable. Desglose semanal opcional (tabla de totales).
- Marca producción/estudio: en la pantalla donde se asignan métricas al recurso, un toggle por
  métrica. (Depende de la decisión A/B.)

## Archivos afectados (estimado)

| Archivo | Cambio |
|---|---|
| `packages/shared-types/src/types.ts` | + `ConditionScoreTable`, `ConsolidatedEvaluation`, `scoreTable?` en thresholds |
| `packages/analysis-engine/src/engine.ts` | + `analyzeConsolidated` puro |
| `packages/analysis-engine/src/engine.selfcheck.ts` | + asserts ejemplo de Laura |
| `apps/backend/src/configuration/configuration.service.ts` | + default `scoreTable` (consolidar, no 4ª copia) |
| `apps/backend/src/metrics/schemas/metric.schema.ts` | + `category: 'PRODUCTION'\|'STUDY'` (default PRODUCTION) |
| `apps/backend/src/analysis/analysis.service.ts` | + `consolidated()` |
| `apps/backend/src/analysis/analysis.controller.ts` | + ruta `/consolidated` |
| `apps/frontend/src/services/api/analysisApi.ts` | + `getConsolidated` + tipos |
| `apps/frontend/src/pages/ResourceDashboard.tsx` | + badge consolidado |
| (UI de asignación de métricas) | + toggle producción/estudio |

## Verificación
1. Selfcheck del motor reproduce el ejemplo de Laura (9→13 AFLUENCIA, 9→9 EMERGENCIA, total 0 →
   INEXISTENCIA) y un caso con métrica de estudio que NO altera el total.
2. `getDiagnostics` + build packages/backend + typecheck frontend.
3. Runtime: consolidado de un recurso del seed coincide con el cálculo manual.

## Riesgos / notas para el PO
- **Fórmula de consolidación: VALIDADA** con las notas de la reunión (2026-06-22) y
  analysis-domain.md: "suma de puntajes semanales → re-análisis de inclinación", con el ejemplo
  9→13 AFLUENCIA. El diseño la implementa tal cual.
- **Default producción vs estudio** (Req 1.2): una métrica sin marcar cuenta como **producción**
  (conservador). Confirmado implícitamente: estudio es la excepción explícita.
- **Métrica organizacional de equipo** ("staff en Normal/Afluencia" que mezcla producción +
  cumplimiento de estudio): fuera de alcance de esta fase.
