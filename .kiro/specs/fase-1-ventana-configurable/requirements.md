# Fase 1 — Ventana configurable y condición de tendencia

## Introducción

Hoy el motor (`@pulseops/analysis-engine`) decide la condición operativa comparando
**solo los últimos 2 registros**, aunque `windowSize` recorte una ventana mayor. Laura
necesita: (1) elegir cuántas semanas ver/analizar desde el dashboard, soportando
**≥ 8 semanas**; (2) además de la condición "temprana" (último cambio), una **condición
de tendencia** que evalúe el comportamiento sobre **todo el periodo** mediante regresión
lineal. La matemática de regresión ya existe en `frontend/utils/chartUtils.ts`
(`calculateLinearRegression`) pero solo se usa para dibujar; debe vivir en el motor para
**decidir condición**, no solo para graficar.

Cubre las features #1, #2 y #3 del roadmap.

## Glosario

- **Condición actual/temprana:** la de hoy; se decide por el cambio entre los últimos 2
  puntos de la ventana.
- **Condición de tendencia:** condición evaluada sobre la ventana completa usando la
  pendiente de la regresión lineal, normalizada a inclinación porcentual comparable.
- **Ventana (`windowSize`):** número de periodos (semanas) que se grafican y analizan.

## Requisitos

### Requisito 1 — Selector de ventana en el dashboard

**Historia:** Como Laura, quiero elegir cuántas semanas ver y analizar en el dashboard,
para revisar periodos cortos o largos (≥ 8 semanas) sin depender de un valor fijo.

#### Criterios de aceptación
1. CUANDO el dashboard carga ENTONCES el sistema DEBERÁ mostrar un selector de ventana
   con opciones que incluyan al menos 4, 6, 8 y 12 semanas.
2. CUANDO Laura cambia la ventana ENTONCES el sistema DEBERÁ re-evaluar usando el nuevo
   `windowSize` y actualizar gráfica, análisis y alertas de forma coherente (mismo periodo
   en los tres).
3. CUANDO la ventana seleccionada excede los puntos disponibles ENTONCES el sistema DEBERÁ
   usar todos los puntos existentes sin error y reflejar `windowUsed` real.
4. EL selector DEBERÁ tener un `data-testid` estable para E2E.
5. EL valor por defecto DEBERÁ ser 8 semanas (objetivo del PO), salvo que el recurso tenga
   menos historia.

### Requisito 2 — Condición de tendencia en el motor (regresión)

**Historia:** Como Laura, quiero una condición que refleje la tendencia de todo el periodo,
no solo el último salto, para no confundir un repunte puntual con una mejora real.

#### Criterios de aceptación
1. EL motor DEBERÁ exponer, además de la condición temprana actual, una **condición de
   tendencia** calculada sobre los puntos de la ventana mediante regresión lineal.
2. LA condición de tendencia DEBERÁ derivarse de la pendiente convertida a una inclinación
   porcentual comparable con los mismos `ConditionThresholds` ya existentes (sin nuevos
   umbrales de negocio hardcodeados).
3. EL motor DEBERÁ permanecer **puro y determinístico**: sin I/O, sin estado mutable, sin
   dependencias externas; mismos datos → mismo resultado.
4. CUANDO hay menos de 2 puntos válidos ENTONCES la condición de tendencia DEBERÁ ser
   `SIN_DATOS` (igual criterio técnico que hoy).
5. LA regla dura de cero se respeta: si el periodo colapsa a ≈ 0 aplica INEXISTENCIA según
   la jerarquía vigente (no se cambia la jerarquía de condiciones).
6. LA lógica no trivial DEBERÁ dejar **una verificación ejecutable** (assert/self-check sin
   framework) que falle si la regresión o el mapeo a condición se rompe.

### Requisito 3 — Exponer ambas condiciones end-to-end

**Historia:** Como Laura, quiero ver tanto la condición temprana como la de tendencia,
para distinguir "qué pasó la última semana" de "hacia dónde va el periodo".

#### Criterios de aceptación
1. EL resultado de evaluación DEBERÁ incluir la condición de tendencia (campo nuevo,
   aditivo) sin romper los consumidores actuales de `MetricConditionEvaluation`.
2. EL backend DEBERÁ propagar la condición de tendencia en la respuesta de `/analysis/evaluate`.
3. EL dashboard DEBERÁ mostrar ambas condiciones de forma legible, dejando claro cuál es
   temprana y cuál de tendencia.
4. LOS cambios de tipos DEBERÁN compilar limpio (`shared-types` → motor → backend → frontend).

### Requisito 4 — Compatibilidad y no-regresión

#### Criterios de aceptación
1. LA condición temprana existente NO DEBERÁ cambiar su comportamiento (los E2E del
   dashboard que asume la regla de últimos-2-puntos siguen pasando).
2. EL selfcheck del motor (`engine.selfcheck.ts`) DEBERÁ seguir pasando, ampliado con la
   tendencia.
3. `getDiagnostics` limpio en los archivos tocados y build de packages/backend sin errores.
