# Fase 2 — Condición consolidada por persona

## Introducción

Hoy PulseOps evalúa la condición de **una métrica** a la vez. Laura necesita la **condición
operativa de producción de la persona**: un veredicto único por recurso que combine todas sus
métricas **de producción** (las de **estudio** no cuentan). Es la feature de mayor valor del
roadmap y automatiza el cálculo manual que hoy le toma ~1h por ciclo.

Método confirmado con Laura/Merce (2026-06-22), en analysis-domain.md. El motor se aplica en
**dos niveles**, reutilizando la misma lógica de inclinación:

1. **Nivel métrica (por semana):** cada métrica de producción obtiene una condición por semana
   (cambio semana-vs-semana, motor actual) → puntaje fijo por condición:
   `PODER=10, AFLUENCIA=7, NORMAL=5, EMERGENCIA=3, PELIGRO=1, INEXISTENCIA=0`.
2. **Suma semanal:** por cada semana se suman los puntajes de las métricas de producción → un
   **total semanal**.
3. **Nivel consolidado:** la serie de totales semanales se pasa por el **mismo análisis de
   inclinación** del motor. La condición general sale de comparar el total de la semana vs el
   anterior. Ejemplo de Laura: 9→13 = +44% → AFLUENCIA; 9→9 = sin cambio → EMERGENCIA; 9→8 →
   EMERGENCIA.

Cubre la feature #4 del roadmap.

## Decisiones de dominio (de analysis-domain.md)

- Todas las métricas de producción **pesan igual**.
- La **tabla de puntajes** es el único parámetro nuevo; debe ser **configurable**, no
  hardcodeada (vive junto a los umbrales en la configuración activa).
- **Regla dura:** si el total de producción de la **semana actual es 0 → INEXISTENCIA siempre**,
  sin importar la inclinación (un cero fuerza Inexistencia).
- **SIN_DATOS vs Inexistencia:** un **0 registrado** = Inexistencia; un período **genuinamente
  ausente** (sin registro) se excluye/`SIN_DATOS`. Distinción de implementación, no de negocio.
- Producción vs estudio es **configurable por recurso** (ver decisión abierta en design).

## Requisitos

### Requisito 1 — Marcar métricas como producción o estudio

**Historia:** Como Laura, quiero marcar, por recurso, qué métricas son de producción y cuáles de
estudio, para que solo las de producción cuenten en el consolidado.

#### Criterios de aceptación
1. EL sistema DEBERÁ permitir clasificar cada métrica asociada como `PRODUCTION` o `STUDY`.
2. POR DEFECTO una métrica sin clasificar DEBERÁ tratarse como `PRODUCTION` (comportamiento
   conservador: no perder métricas del consolidado por falta de marca) — decisión revisable.
3. EL número de métricas de producción/estudio por recurso es variable (no fijo).
4. LA UI DEBERÁ permitir cambiar la clasificación donde hoy se asignan métricas al recurso.

### Requisito 2 — Tabla de puntajes configurable

**Historia:** Como arquitecto, quiero que la tabla de puntajes por condición sea configurable,
para no hardcodear reglas de negocio.

#### Criterios de aceptación
1. LA tabla de puntajes (`PODER..INEXISTENCIA`) DEBERÁ vivir en la configuración activa junto a
   los `ConditionThresholds`, con los valores por defecto de Laura.
2. CUANDO no exista configuración previa ENTONCES se DEBERÁ usar la tabla por defecto.
3. NO se DEBERÁ crear una cuarta copia de defaults; al tocar defaults, tender a consolidar
   (deuda conocida de umbrales triplicados).

### Requisito 3 — Motor: consolidación por niveles (puro)

**Historia:** Como sistema, quiero calcular el consolidado reutilizando el motor, para que la
lógica de inclinación sea una sola y determinística.

#### Criterios de aceptación
1. EL motor DEBERÁ exponer una función pura que, dado un conjunto de series de métricas de
   producción (cada una con valores por semana), la tabla de puntajes y los umbrales, calcule:
   (a) el puntaje por métrica por semana, (b) el total semanal, (c) la condición consolidada
   re-analizando la serie de totales.
2. LA condición por métrica por semana DEBERÁ usar el cambio semana-vs-semana (misma regla
   "temprana" actual).
3. SI el total de la semana actual es 0 ENTONCES la condición consolidada DEBERÁ ser
   `INEXISTENCIA` (regla dura), sin importar la inclinación.
4. LAS semanas genuinamente ausentes (sin registro en ninguna métrica) DEBERÁN excluirse o
   marcarse, NO contarse como 0.
5. EL motor DEBERÁ permanecer **puro y determinístico** (sin I/O, sin estado, sin deps nuevas).
6. LA lógica no trivial DEBERÁ dejar **una verificación ejecutable** (assert/self-check sin
   framework) que reproduzca el ejemplo de Laura (9→13 AFLUENCIA, 9→9 EMERGENCIA, total 0 →
   INEXISTENCIA).

### Requisito 4 — Backend: endpoint de consolidado

**Historia:** Como frontend, quiero un endpoint que dé la condición consolidada de un recurso,
para mostrarla sin orquestar N llamadas.

#### Criterios de aceptación
1. EL backend DEBERÁ exponer `GET /analysis/consolidated?resourceId=X&windowSize=N` protegido por
   guard (como el resto de `/analysis`).
2. LA respuesta DEBERÁ incluir: condición consolidada, la serie de totales semanales, y un
   desglose por métrica de producción (su contribución).
3. EL servicio DEBERÁ usar la métricas de producción del recurso y sus records semanales.
4. EL `windowSize` DEBERÁ recortar el periodo igual que en el dashboard.

### Requisito 5 — UI: mostrar el consolidado

**Historia:** Como Laura, quiero ver la condición consolidada de la persona de un vistazo.

#### Criterios de aceptación
1. EL consolidado DEBERÁ mostrarse en el dashboard del recurso y/o en el Panorama del equipo.
2. DEBERÁ ser claro que es la condición **de producción de la persona**, distinta de la condición
   de una métrica individual.
3. LOS `data-testid` DEBERÁN ser estables para E2E.

### Requisito 6 — Compatibilidad y no-regresión
1. LA evaluación por métrica existente NO DEBERÁ cambiar.
2. Los tipos DEBERÁN compilar limpio end-to-end; `getDiagnostics` y build de packages/backend
   sin errores.
3. La métrica organizacional de equipo ("staff en Normal/Afluencia") queda **fuera de alcance**.
