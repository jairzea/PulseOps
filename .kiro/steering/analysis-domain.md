# PulseOps — Dominio del Análisis (Motor)

Documento canónico del comportamiento del motor (`@pulseops/analysis-engine`). Ante ambigüedad, prevalece la especificación formal en `docs/specs/ESPECIFICACIÓN FORMAL DEL DOMINIO.md` y `context.md`.

## Principios del motor

- **Puro y determinístico:** mismos datos → mismo resultado. Sin I/O, sin estado mutable, sin dependencias externas.
- **Basado en comportamiento, no en valores absolutos:** evalúa cómo se mueve la métrica en el tiempo.
- **Parametrizable:** los umbrales viven en `ConditionThresholds`, configurables; nunca hardcodear umbrales de negocio.
- **Explicable:** cada condición devuelve un `ConditionReason` con código y explicación legible.

## Inclinación

`I = ((E_act − E_ant) / E_ant) × 100`. Casos especiales: ambos ≈ 0 → inválido (INEXISTENCIA/confusión); E_ant ≈ 0 y E_act > 0 → inválido (inicio); E_ant > 0 y E_act ≈ 0 → −100% (caída crítica). Umbral de "cero" configurable.

## Jerarquía de condiciones (orden de evaluación oficial)

1. **SIN_DATOS** — datos insuficientes o cálculo inválido (técnico, no es bajo rendimiento).
2. **INEXISTENCIA** — ambos ≈ 0, colapso a ≈ 0, o inicio desde 0; caída casi vertical (≤ umbral peligro).
3. **PODER** — Normal sostenido en nivel alto (≥ N períodos, todos positivos en rango normal, nivel ≥ promedio). Se evalúa **antes** que AFLUENCIA (estado acumulativo > velocidad puntual).
4. **AFLUENCIA** — crecimiento pronunciado (I ≥ +50%), puede ser puntual.
5. **NORMAL** — crecimiento real +5% < I < +50%. No incluye estancamiento.
6. **EMERGENCIA** — estancamiento (−5% ≤ I ≤ +5%) o descenso leve/moderado (−50% < I < −5%).
7. **PELIGRO** — descenso pronunciado (−80% < I ≤ −50%).

## Señales (meta-análisis)

Complementan la condición, **no la cambian**: `VOLATILE`, `SLOW_DECLINE`, `DATA_GAPS`, `RECOVERY_SPIKE`, `NOISE`. Regla anti-contradicción: si hay `NOISE` no se incluye `VOLATILE`. Son heurísticas, no predicción ni ML.

## Decisiones de diseño acordadas (sesión PO — pendientes de implementar)

Estas decisiones rigen las features en curso. Documentarlas en la spec correspondiente antes de implementar.

1. **Dos condiciones por métrica:**
   - **Condición actual/temprana:** se decide por el **cambio último** (últimos 2 registros), como hoy.
   - **Condición de tendencia:** se evalúa sobre el **periodo completo configurado** (regresión lineal sobre la ventana). La matemática de regresión ya existe en `frontend/utils/chartUtils.ts`; debe trasladarse al motor para decidir condición, no solo para dibujar.

2. **Condición consolidada (global del recurso):**
   - Es la condición operativa de producción de la persona, combinando sus métricas de **producción** (las de estudio NO cuentan para el consolidado).
   - **Método real (confirmado por Laura/Merce, 2026-06-22) — el motor se aplica en DOS niveles:**
     1. **Nivel métrica:** cada métrica de producción obtiene su condición (motor actual) → puntaje fijo: `PODER=10, AFLUENCIA=7, NORMAL=5, EMERGENCIA=3, PELIGRO=1, INEXISTENCIA=0`.
     2. **Suma semanal:** por cada semana se suman los puntajes de las métricas de producción → un **total semanal**.
     3. **Nivel consolidado:** la serie de totales semanales se vuelve a pasar por el **mismo análisis de inclinación** del motor. La condición general sale de comparar el total de esta semana vs el anterior (sube fuerte → AFLUENCIA, sube leve → NORMAL, igual → EMERGENCIA, baja → PELIGRO/etc.). No hay tabla de rangos estática; es la misma lógica de inclinación reutilizada.
     - Ejemplo de Laura: total 9 → 13 = +44% → Afluencia; 9 → 9 = sin cambio → Emergencia; 9 → 8 = descenso → Emergencia.
   - **Regla dura:** si la producción de la semana es **0 → INEXISTENCIA siempre**, aunque iguale a la semana anterior (un cero fuerza Inexistencia sin importar la inclinación).
   - Todas las métricas **pesan igual**. La tabla de puntajes es el único parámetro (debe ser configurable, no hardcodeada).
   - **Configurable por recurso:** al asignar métricas a un recurso se marca cuáles son de **producción** (cuentan para el consolidado) y cuáles de **estudio**. El nº de métricas varía por rol (División 4: 2 producción + 1 estudio; ejecutivos: 3-5). NO es fijo.
   - **SIN_DATOS:** Laura no maneja "datos faltantes" como concepto; para ella "no produjo" = 0 = Inexistencia. Distinguir en implementación: un **0 registrado** → Inexistencia; un período **genuinamente ausente** → excluir o SIN_DATOS (decisión de implementación, no de negocio).
   - **Métrica organizacional futura (fuera de alcance inmediato):** "staff en Normal/Afluencia" = cuántas personas quedaron en Normal o Afluencia en producción **y** cumplieron su tiempo de estudio mínimo de la semana. Es un agregado de equipo, no por persona.

3. **Ventana configurable por el usuario:** el número de semanas visibles y analizadas lo define el usuario (objetivo: soportar ≥ 8 semanas). `windowSize` ya fluye end-to-end; falta exponerlo en UI y que recorte gráfica + análisis + alertas.

## Fuentes de defaults de umbrales (deuda a unificar)

Hoy los umbrales por defecto están duplicados en: `analysis-engine/engine.ts` (`DEFAULT_CONDITION_THRESHOLDS`), `backend/configuration.service.ts` (`createDefaultConfiguration`) y comentarios de `shared-types`. **Objetivo:** una única fuente de verdad. No agregar una cuarta copia; al tocar defaults, tender a consolidar.
