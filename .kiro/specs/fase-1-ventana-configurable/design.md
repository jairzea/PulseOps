# Diseño — Fase 1: Ventana configurable y condición de tendencia

## Visión general

Dos piezas: (A) **motor** gana una "condición de tendencia" por regresión lineal sobre la
ventana, expuesta de forma aditiva; (B) **dashboard** gana un selector de `windowSize` que
ya fluye end-to-end (solo falta exponerlo) y muestra ambas condiciones.

Principio rector: **reusar, no inventar**. La inclinación, la jerarquía de condiciones
(`resolveCondition`) y los `ConditionThresholds` ya existen. La regresión ya existe en
`chartUtils`. Solo movemos/portamos la matemática al motor y la conectamos a la jerarquía
ya escrita.

## A. Motor (`@pulseops/analysis-engine`)

### A.1 Regresión portada (pura)

`chartUtils.calculateLinearRegression` (mínimos cuadrados, `x = índice 0..n-1`) se porta al
motor como helper puro. Es idéntica matemática; no se añade dependencia.

```
slope, intercept  =  leastSquares(points.map((p,i) => [i, p.value]))
```

### A.2 De pendiente a inclinación comparable

La jerarquía (`resolveCondition`) razona en **inclinación porcentual** `I`, no en pendiente
absoluta. Para reutilizarla sin nuevos umbrales, convertimos la pendiente de la recta a una
inclinación porcentual **equivalente sobre el periodo**:

```
fit(i) = slope * i + intercept           // recta ajustada
E_ant_fit = fit(0)                         // valor ajustado al inicio de la ventana
E_act_fit = fit(n-1)                       // valor ajustado al final
I_tendencia = calculateInclination(E_ant_fit, E_act_fit).value
```

Racional: usar los **extremos de la recta ajustada** (no los puntos crudos) hace que la
condición de tendencia dependa de TODOS los puntos (vía slope/intercept), no de dos
muestras. Reutiliza `calculateInclination` (mismos casos especiales: cero, inicio, caída) y
luego `resolveCondition(I_tendencia, points, thresholds)` — **misma jerarquía, mismos
umbrales**. Cumple "parametrizable, no hardcodeado".

`ponytail:` regresión lineal simple O(n) sobre la ventana; suficiente para ≤ ~52 semanas.
Si en el futuro se requiere ponderar puntos recientes, el upgrade es una regresión ponderada
en el mismo helper.

### A.3 API del motor (aditiva)

`analyzeWithConditions` añade al `MetricConditionEvaluation` un bloque de tendencia. No se
toca la condición temprana (`condition`/`reason`/`inclination` actuales se mantienen).

Nuevo en `shared-types`:
```ts
export interface TrendEvaluation {
  condition: HubbardCondition;     // condición sobre el periodo
  reason: ConditionReason;
  inclination: InclinationResult;  // I_tendencia (extremos de la recta)
  slope: number;                   // pendiente cruda (para UI/depuración)
}
// MetricConditionEvaluation gana, opcional para no romper consumidores:
trend?: TrendEvaluation;
```

`trend` es **opcional** → consumidores actuales no rompen (Req 3.1, 4.1).

### A.4 Casos límite
- `points.length < 2` → `trend` con `SIN_DATOS` (no se calcula recta).
- Todos los `x` iguales es imposible (índices distintos); denominador de slope solo es 0 con
  n<2, ya cubierto.
- Periodo colapsado a ≈ 0 → `calculateInclination` + `resolveCondition` ya devuelven
  INEXISTENCIA por la jerarquía (Req 2.5).

### A.5 Selfcheck (sin framework)
Ampliar `engine.selfcheck.ts`:
- Serie linealmente creciente fuerte → tendencia AFLUENCIA/NORMAL coherente.
- Serie **serrucho con repunte final** (último salto +, pendiente global ≈ 0 o negativa) →
  **temprana ≠ tendencia**: temprana puede dar NORMAL/AFLUENCIA, tendencia da EMERGENCIA.
  Este es el caso que justifica la feature y el assert clave.
- Serie plana → temprana y tendencia ambas EMERGENCIA.

## B. Backend

`AnalysisService.evaluate` ya llama `analyzeWithConditions` y retorna `evaluation` completa.
Como `trend` viaja dentro de `MetricConditionEvaluation`, **no hay cambios de lógica**; solo
se propaga al recompilar contra los nuevos tipos. `windowSize` ya se acepta en el controller
(`/analysis/evaluate?windowSize=`).

## C. Frontend

### C.1 Selector de ventana
- Nuevo control en la barra de `ResourceDashboard` (junto a los selectores), estado
  `windowSize` (default 8). `data-testid = tid('dashboard','window-select')`.
- Opciones: 4, 6, 8, 12 (Req 1.1).
- `windowSize` se pasa a `useAnalysis.evaluate({...})` y a `fetchRecords` para que **gráfica,
  análisis y alertas** usen el mismo recorte (Req 1.2). El recorte de gráfica es
  `records.slice(-windowSize)`.

### C.2 Mostrar ambas condiciones
- El panel de Análisis ya muestra la condición (temprana). Se añade una línea/badge
  "Tendencia del periodo: <condición>" cuando `evaluation.trend` existe.
- `analysisApi.AnalysisResult` gana `trend?` en el tipo (espejo de shared-types).

### C.3 chartUtils
- `calculateLinearRegression` permanece en frontend para dibujar la línea de tendencia (no
  se borra; el motor tiene su propia copia portada). Se evita acoplar el frontend al motor
  para algo puramente visual. (Duplicación mínima y consciente; ambas son la fórmula estándar
  de mínimos cuadrados.)

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `packages/shared-types/src/types.ts` | + `TrendEvaluation`, `trend?` en `MetricConditionEvaluation` |
| `packages/analysis-engine/src/engine.ts` | + helper regresión, + cálculo de `trend` en `analyzeWithConditions` |
| `packages/analysis-engine/src/engine.selfcheck.ts` | + asserts de tendencia |
| `apps/frontend/src/services/api/analysisApi.ts` | + `trend?` en `AnalysisResult` |
| `apps/frontend/src/pages/ResourceDashboard.tsx` | + selector windowSize, + recorte coherente, + badge tendencia |

Backend: recompila contra tipos nuevos, sin cambios de código.

## Verificación
1. `getDiagnostics` en los 5 archivos.
2. Build de `shared-types` y `analysis-engine`; recompilar backend.
3. `node` corriendo el selfcheck del motor (assert temprana≠tendencia en serrucho).
4. Runtime: dashboard, cambiar ventana, ver gráfica+análisis+tendencia coherentes.
