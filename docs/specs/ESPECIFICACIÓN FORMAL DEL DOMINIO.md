# 📐 ESPECIFICACIÓN FORMAL DEL DOMINIO

**Motor de Análisis de Inclinación y Condiciones Operativas (Hubbard)**

**Versión**: 1.0  
**Fecha**: 15 de enero, 2026  
**Estado**: Definido formalmente - Pendiente de implementación

---

## 🎯 Propósito de este documento

Este documento es la **especificación canónica** del dominio del motor de análisis.

- Define semántica precisa de cada condición
- Establece jerarquía oficial de evaluación
- Formaliza reglas de inclinación
- Declara explícitamente decisiones arbitrarias

**Regla**: Si hay conflicto entre código y este documento, **prevalece este documento**.

---

## 1️⃣ JERARQUÍA OFICIAL DE CONDICIONES

Orden de evaluación (la primera que aplique, gana):

| # | Condición | Tipo | Descripción breve |
|---|-----------|------|-------------------|
| 1 | **SIN_DATOS** | Técnica bloqueante | Imposibilidad de análisis |
| 2 | **INEXISTENCIA** | Operativa bloqueante | Colapso o inicio |
| 3 | **PODER** | Operativa superior | Normal sostenido en nivel alto |
| 4 | **AFLUENCIA** | Operativa expansiva | Crecimiento pronunciado |
| 5 | **NORMAL** | Operativa esperada | Funcionamiento sano |
| 6 | **EMERGENCIA** | Operativa deterioro leve | Estancamiento o descenso leve |
| 7 | **PELIGRO** | Operativa deterioro grave | Descenso pronunciado |

### Reglas de precedencia

- **SIN_DATOS e INEXISTENCIA** se evalúan primero (bloqueantes técnicos)
- **PODER** se evalúa antes que AFLUENCIA (estado acumulativo vs puntual)
- **AFLUENCIA** representa velocidad, no estabilidad
- **PELIGRO** es el último nivel evaluable

---

## 2️⃣ DEFINICIÓN SEMÁNTICA DE CADA CONDICIÓN

### 🔴 SIN_DATOS

**Qué representa**:
Imposibilidad técnica de análisis por falta de información.

**Cuándo aplica**:
- Menos períodos que los requeridos por la ventana de análisis
- Datos inválidos o no calculables (ej: inclinación no válida)

**Qué NO representa**:
- Bajo rendimiento operativo
- Inicio de operación con valor 0

**Ejemplo**:
Serie con 1 dato cuando se requieren 2 → `SIN_DATOS`

---

### 🟠 INEXISTENCIA

**Qué representa**:
Una estadística que no existe aún o ha colapsado casi por completo.

**Cuándo aplica**:
- Ambos valores (anterior y actual) ≈ 0
- Paso de valor positivo a ≈ 0 (colapso total)
- Inicio desde 0 hacia un valor (emergencia de existencia)
- Caída > 80% (casi vertical)

**Qué NO representa**:
- Caídas graduales o moderadas
- Bajo desempeño operativo normal

**Ejemplo**:
- Serie: `[25, 0.001]` → `INEXISTENCIA` (colapso)
- Serie: `[0.001, 10]` → `INEXISTENCIA` (inicio de existencia)
- Serie: `[100, 5]` → `INEXISTENCIA` (-95%, caída casi vertical)

---

### 🟢 PODER

**Qué representa**:
Estado más alto del sistema. Funcionamiento Normal sostenido en nivel alto durante varios períodos consecutivos.

**Cuándo aplica** (todos los criterios simultáneamente):
1. Mínimo `POWER_MIN_PERIODS` períodos consecutivos (default: 3)
2. Todos los períodos con inclinación en rango Normal real: `+5% < I < +50%`
3. Ningún período presenta:
   - Estancamiento (`-5% ≤ I ≤ +5%`)
   - Caída (I < 0)
   - Afluencia (I ≥ +50%)
4. Nivel actual ≥ promedio de la ventana relevante (no toda la historia)
5. Sin Afluencia puntual reciente

**Qué NO representa**:
- Crecimientos explosivos aislados
- Afluencias no sostenidas
- Recuperaciones recientes sin historial

**Ejemplo**:
- Serie: `[100, 108, 115, 122]` (últimos 3: +8%, +6.5%, +6.1%) → `PODER` ✓
- Serie: `[10, 15, 23, 70]` (últimos 3: +50%, +53%, +204%) → `AFLUENCIA` ✗ (no es Poder)

**REGLA CLAVE**: PODER NO coexiste con AFLUENCIA.

---

### 🔵 AFLUENCIA

**Qué representa**:
Expansión acelerada. Crecimiento fuerte en un corto período.

**Cuándo aplica**:
- Inclinación positiva pronunciada: `I ≥ +50%`
- NO cumple criterios de PODER (falta sostenibilidad o tiene picos)

**Qué NO representa**:
- Estabilidad operativa
- Poder sostenido
- Crecimiento saludable a largo plazo

**Ejemplo**:
- Serie: `[20, 35]` (+75%) → `AFLUENCIA`
- Serie: `[10, 10, 10, 50]` (+400% en último período) → `AFLUENCIA`

**REGLA CLAVE**: Puede existir en un solo período. No requiere histórico.

---

### 🟡 NORMAL

**Qué representa**:
Funcionamiento esperado, sano y estable del sistema.

**Cuándo aplica**:
- Crecimiento positivo real en rango: `+5% < I < +50%`
- Sin señales de colapso, estancamiento ni crisis

**Qué NO representa**:
- Estancamiento (eso es EMERGENCIA)
- Crisis o deterioro
- Expansión acelerada (eso es AFLUENCIA)

**Ejemplo**:
- Serie: `[50, 55]` (+10%) → `NORMAL`
- Serie: `[100, 103]` (+3%) → **NO es NORMAL** (es EMERGENCIA por estancamiento)

**REGLA CLAVE**: Crecimientos ≤ +5% NO son NORMAL.

---

### 🟠 EMERGENCIA

**Qué representa**:
Pérdida de control operativo incipiente. Requiere acción correctiva.

**Cuándo aplica**:
- **Estancamiento**: `-5% ≤ I ≤ +5%`
- **Descenso leve/moderado**: `-50% < I < -5%`
- Crecimiento insuficiente para ser NORMAL

**Qué NO representa**:
- Caídas abruptas (eso es PELIGRO o INEXISTENCIA)
- Estabilidad sana (eso sería NORMAL)

**Ejemplo**:
- Serie: `[100, 102]` (+2%) → `EMERGENCIA` (estancamiento)
- Serie: `[100, 85]` (-15%) → `EMERGENCIA` (descenso moderado)
- Serie: `[100, 60]` (-40%) → `EMERGENCIA` (descenso fuerte pero no crítico)

**REGLA CLAVE**: Estancamiento es siempre EMERGENCIA, nunca NORMAL.

---

### 🔴 PELIGRO

**Qué representa**:
Deterioro pronunciado que amenaza la continuidad operativa.

**Cuándo aplica**:
- Descenso pronunciado: `-80% < I ≤ -50%`
- Tendencia claramente negativa y grave

**Qué NO representa**:
- Ajustes menores o descensos leves
- Estancamiento (eso es EMERGENCIA)
- Crisis técnica o colapso (eso es INEXISTENCIA)

**Ejemplo**:
- Serie: `[100, 40]` (-60%) → `PELIGRO`
- Serie: `[100, 18]` (-82%) → `INEXISTENCIA` (no PELIGRO, por caída casi vertical)

**REGLA CLAVE**: Requiere que ninguna condición superior aplique.

---

## 3️⃣ REGLAS FORMALES DE INCLINACIÓN

### Regla 1: La inclinación manda, pero no gobierna sola

- La **inclinación** define la **velocidad** del cambio
- La **condición** define el **estado operativo**
- Una sola inclinación NO puede definir PODER

### Regla 2: AFLUENCIA puede existir en un solo período

- Un solo crecimiento pronunciado (≥ +50%) genera AFLUENCIA
- AFLUENCIA NO requiere histórico ni sostenibilidad

### Regla 3: NORMAL requiere crecimiento positivo real

- Rango válido: `+5% < I < +50%`
- Crecimientos ≤ +5% NO son NORMAL
- Crecimientos ≥ +50% NO son NORMAL (son AFLUENCIA)

### Regla 4: Estancamiento es EMERGENCIA

- Rango de estancamiento: `-5% ≤ I ≤ +5%`
- Siempre es EMERGENCIA
- Nunca es NORMAL

### Regla 5: Caídas leves no son normales

- Cualquier inclinación negativa (I < 0) rompe NORMAL
- Descensos leves (-5% a -20%) son EMERGENCIA
- Descensos pronunciados (<-50%) son PELIGRO
- Descensos casi verticales (<-80%) son INEXISTENCIA

---

## 4️⃣ UMBRALES NUMÉRICOS DEFINIDOS

```typescript
const INCLINATION_THRESHOLDS = {
  CRITICAL_NEGATIVE: -80,  // Caída casi vertical (INEXISTENCIA)
  STEEP_NEGATIVE: -50,     // Descenso pronunciado (PELIGRO)
  MODERATE_NEGATIVE: -5,   // Descenso leve / límite inferior estancamiento (EMERGENCIA)
  FLAT_UPPER: 5,           // Límite superior estancamiento (EMERGENCIA)
  MODERATE_POSITIVE: 5,    // Límite inferior crecimiento normal (NORMAL)
  STEEP_POSITIVE: 50,      // Crecimiento pronunciado (AFLUENCIA)
};
```

### Rangos por condición

| Condición | Rango de inclinación | Notas |
|-----------|---------------------|-------|
| INEXISTENCIA | I ≤ -80% | Caída casi vertical |
| PELIGRO | -80% < I ≤ -50% | Descenso pronunciado |
| EMERGENCIA | -50% < I ≤ +5% | Estancamiento o descenso leve |
| NORMAL | +5% < I < +50% | Crecimiento esperado |
| AFLUENCIA | I ≥ +50% | Expansión acelerada |
| PODER | Histórico: todos +5% < I < +50% | Requiere sostenibilidad |

---

## 5️⃣ CAMBIO_DE_PODER (DECISIÓN FINAL)

### Estado: NO DETECTABLE por este motor

**Razón**:
CAMBIO_DE_PODER requiere **contexto externo** que no puede inferirse de series numéricas:
- Cambio de responsable (persona)
- Cambio estructural del sistema
- Asunción de nuevo puesto

**Decisión arquitectónica**:
- Se mantiene en el tipo `HubbardCondition` (dominio conceptual)
- NO se asigna en `resolveCondition`
- Queda reservado para capas superiores (backend/lógica de negocio)
- Backend puede asignar CAMBIO_DE_PODER basado en eventos externos

**Documentación**:
Explícitamente marcado como **fuera del alcance del motor de análisis**.

---

## 6️⃣ DECISIONES ARBITRARIAS DECLARADAS

### Umbrales numéricos

**Estado**: Valores iniciales basados en criterio experto

**Justificación**:
- No provienen de análisis estadístico
- No están en documentos originales de Hubbard
- Son "razonables intuitivamente"

**Implicaciones**:
- Sujetos a calibración futura con datos reales
- Pueden ajustarse sin romper la arquitectura
- Deben documentarse como "configurables, no absolutos"

**Para el demo**: Son defendibles como "valores iniciales conservadores basados en criterio experto, sujetos a calibración con datos operativos reales".

---

### Ventana de análisis

**Decisión**: El motor es **reactivo**, no **predictivo**

**Comportamiento**:
- Analiza último cambio (período n vs n-1)
- NO suaviza oscilaciones
- NO detecta volatilidad (pendiente)
- NO hace proyecciones

**Implicación**:
Una serie oscilante (`[10, 20, 10, 20, 10]`) generará condiciones cambiantes según el último par evaluado.

**Justificación**: Simplicidad arquitectónica y alineación con filosofía Hubbard (reacción inmediata a cambios).

---

### Cálculo de confianza

**Fórmula actual**:
```typescript
confidence = Math.min(series.points.length / 10, 1)
```

**Características**:
- Heurística simple
- NO probabilística
- Basada solo en cantidad de datos
- NO considera calidad ni variabilidad

**Implicaciones**:
- Confianza 100% con 10+ datos históricos
- No penaliza series volátiles
- No detecta gaps o inconsistencias

**Justificación**: Placeholder razonable. Puede evolucionar a modelos más sofisticados (ej: penalización por volatilidad, detección de outliers).

---

## 7️⃣ CASOS ESPECIALES FORMALIZADOS

### Valores cercanos a cero

**Umbral**: `ZERO_THRESHOLD = 0.001`

**Casos**:

1. **Ambos ≈ 0**: `E_ant ≈ 0` y `E_act ≈ 0`
   - Condición: `INEXISTENCIA`
   - Razón: "Estadística inexistente o cercana a cero"

2. **De 0 a valor**: `E_ant ≈ 0` y `E_act > 0`
   - Condición: `INEXISTENCIA`
   - Razón: "Inicio de actividad"
   - Inclinación: `null` (no calculable)

3. **De valor a 0**: `E_ant > 0` y `E_act ≈ 0`
   - Condición: `INEXISTENCIA`
   - Razón: "Colapso"
   - Inclinación: `-100%`

---

### Series muy cortas

**Requisito mínimo**: `windowSize` períodos (default: 2)

**Comportamiento**:
Si `series.length < windowSize` → `SIN_DATOS`

**Razón**: "Se requieren al menos N períodos para el análisis"

---

### Inclinación no válida

**Cuándo ocurre**:
- E_ant ≈ 0 (división por cero)
- Datos corruptos o inconsistentes

**Comportamiento**:
- `isValid = false`
- `value = null`
- Condición: `SIN_DATOS` o `INEXISTENCIA` según contexto

---

## 8️⃣ CASOS LÍMITE Y ESCENARIOS COMPLEJOS

### Escenario 1: Crecimiento brutal tras estancamiento

**Serie**: `[10, 10, 10, 50]`

**Análisis**:
- Inclinación último período: `(50-10)/10 = +400%`
- Condición: `AFLUENCIA` ✓
- NO es `PODER` (solo 1 período de crecimiento)

**Justificación**: AFLUENCIA representa velocidad puntual, no sostenibilidad.

---

### Escenario 2: Caídas lentas pero persistentes

**Serie**: `[100, 95, 91, 87, 83]` (≈-4% cada semana)

**Análisis actual** (solo último par):
- Inclinación: `(83-87)/87 = -4.6%`
- Condición: `EMERGENCIA` ✓

**Limitación**: NO detecta la tendencia acumulativa peligrosa.

**Pendiente**: Análisis multi-período para detectar deterioro sostenido.

---

### Escenario 3: Oscilación constante

**Serie**: `[10, 20, 10, 20, 10]`

**Análisis**:
- Par 1: `(20-10)/10 = +100%` → `AFLUENCIA`
- Par 2: `(10-20)/20 = -50%` → `EMERGENCIA/PELIGRO`
- Par 3: `(20-10)/10 = +100%` → `AFLUENCIA`
- Par 4: `(10-20)/20 = -50%` → `EMERGENCIA/PELIGRO`

**Limitación**: Motor reactivo no detecta patrón oscilatorio.

**Pendiente**: Detección de volatilidad (análisis de varianza).

---

## 9️⃣ VALIDACIÓN DE COHERENCIA

### ✅ Coherencia lógica

- No hay solapamientos entre rangos de inclinación
- Cada rango mapea a exactamente una condición
- La jerarquía es estricta (primera que aplica, gana)

### ✅ Coherencia semántica

- Nombres de condiciones reflejan su comportamiento
- Explicaciones son consistentes con lógica implementada
- No hay contradicciones entre definición y evaluación

### ✅ Coherencia con filosofía Hubbard

- PODER es el estado superior (evaluado primero entre operativas)
- INEXISTENCIA representa colapso, no bajo rendimiento
- EMERGENCIA requiere acción, no es "normal malo"
- AFLUENCIA es transitoria, no sostenible

---

## 🔟 PLAN DE IMPLEMENTACIÓN

### Fase 1: Refactorización del motor (PROMPT E.3)

1. Reordenar jerarquía en `resolveCondition`:
   - SIN_DATOS → INEXISTENCIA → PODER → AFLUENCIA → NORMAL → EMERGENCIA → PELIGRO

2. Refinar criterios de PODER:
   - Todos períodos en `+5% < I < +50%`
   - Promedio de ventana relevante (no toda la serie)

3. Ajustar rangos:
   - NORMAL: `+5% < I < +50%`
   - EMERGENCIA: `-50% < I ≤ +5%`
   - PELIGRO: `-80% < I ≤ -50%`

4. Documentar umbrales con `THRESHOLD_JUSTIFICATION`

### Fase 2: Testing exhaustivo

- Test de cada condición con casos límite
- Validación de jerarquía
- Pruebas con series reales

### Fase 3: Calibración (futuro)

- Análisis de datos históricos
- Ajuste de umbrales basado en estadísticas reales
- Validación con expertos de dominio

---

## ✅ CRITERIOS DE ACEPTACIÓN

El motor cumple con la especificación si:

1. ✅ Evalúa condiciones en el orden oficial
2. ✅ PODER se detecta antes que AFLUENCIA
3. ✅ NORMAL requiere crecimiento > +5%
4. ✅ Estancamiento (-5% a +5%) siempre es EMERGENCIA
5. ✅ PODER requiere todos períodos en rango Normal
6. ✅ Explicaciones son consistentes con condiciones asignadas
7. ✅ Casos especiales (valores ≈ 0) se manejan correctamente
8. ✅ No hay contradicciones lógicas

---

## 📚 REFERENCIAS

- `context.md` - Memoria persistente del proyecto
- `Motor de analisis de inclinación y condiciones.md` - Diseño conceptual
- `Fórmulas de las condiciones.md` - Filosofía Hubbard
- `Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md` - Contratos técnicos
- Auditoría de PROMPT E.1 - Análisis de problemas conceptuales

---

**FIN DE LA ESPECIFICACIÓN FORMAL**

Esta especificación es la fuente de verdad para el dominio del motor.  
Cualquier implementación debe cumplir con esta definición.
