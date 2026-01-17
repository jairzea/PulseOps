# PulseOps – Documento de Conocimiento y Contexto

# Instrucción obligatoria para la IA

Este documento debe ser tratado como **memoria persistente del proyecto**.
Si existe conflicto entre este documento y una sugerencia de la IA, **prevalece este documento**.

---

## 1. Propósito de este documento

Este documento existe para **dar contexto persistente a la IA** durante todo el desarrollo del MVP de *PulseOps*. Debe ser usado como **fuente de verdad** para decisiones de producto, arquitectura y alcance.

La IA debe asumir que:

* El usuario actúa como **arquitecto / product owner**
* La IA escribe **casi todo el código**
* El objetivo es un **MVP presentable en vivo** ante arquitectos de software

---

## 2. Visión del producto

**PulseOps** es una plataforma que centraliza, normaliza y evalúa estadísticas operativas del equipo de desarrollo de software.

El producto:

* Ingiere datos desde múltiples fuentes
* Normaliza estadísticas bajo un dominio propio
* Analiza el **comportamiento de las estadísticas en el tiempo**
* Asigna **condiciones operativas** basadas en fórmulas empresariales
* Visualiza todo mediante una UI avanzada e interactiva

PulseOps **no es un dashboard simple** ni un CRUD. Es un **sistema de evaluación operativa basado en comportamiento**, con fuerte énfasis en arquitectura y visualización.

---

## 3. Problema que resuelve

Actualmente, las estadísticas semanales:

* Se reportan manualmente
* Dependen de Jira
* Usan fórmulas implícitas o documentadas externamente
* No consideran la **tendencia real** de los números
* No tienen visualización histórica clara
* Fallan si Jira no está disponible

PulseOps convierte ese proceso frágil en:

* Un sistema resiliente
* Extensible por contrato
* Basado en análisis temporal
* Visualmente comprensible
* Independiente de herramientas externas

---

## 4. Alcance del MVP

### Incluye

* Ingestión de datos desde:

  * Archivos CSV / JSON
* Normalización de datos bajo un modelo de dominio único
* Análisis de series temporales (semanas)
* Evaluación automática de condiciones
* Persistencia en MongoDB local
* Visualización avanzada con React Flow

### El MVP incluirá además:

#### 🔐 Autenticación

* Autenticación basada en JWT
* Roles básicos (admin, user)
* Protección de endpoints y vistas

#### 🔗 Integración real con Jira (si es posible)

* Conexión vía Jira REST API
* Autenticación con API Token
* Sincronización de estadísticas
* Modo fallback: importación manual (CSV / JSON)

#### ⚙️ Configuración avanzada de reglas

* Motor declarativo de condiciones
* Reglas basadas en **comportamiento de la estadística**, no en valores absolutos
* Umbrales configurables
* Versionado de reglas
* Simulación de impacto antes de aplicar reglas

### No incluye

* Gestión avanzada de usuarios
* Integraciones enterprise adicionales (Qlik real, SAP, etc.)
* Editor visual no‑code completo de reglas
* Multi‑tenant
* Hardening de seguridad productiva
* Observabilidad avanzada (APM, tracing distribuido)
* Deploy productivo definitivo (solo demo)

---

## 5. Fuentes de datos

### 5.1 Archivo (principal)

* CSV o JSON exportado de Jira u otra herramienta
* Es el fallback oficial

### 5.2 Jira (mock / real)

* Datos simulados o reales
* Mismo contrato que archivo

### 5.3 Estándar de integración

PulseOps define un contrato propio que cualquier fuente debe cumplir:

```json
{
  "source": "external-tool",
  "resourceId": "user-01",
  "week": "2026-W02",
  "metrics": {
    "story_points": 20,
    "performance": 75,
    "integrations": 3
  }
}
```

---

## 6. Modelo de dominio (conceptual)

### Recurso

Un recurso representa a una persona (ej. desarrollador, líder técnico).

* resourceId
* name
* role

### Serie temporal de métrica (**MetricSeries**)

Un recurso puede tener **una o más series temporales**, dependiendo de su rol.

Ejemplos:

* Developer:

  * Story Points
  * Desempeño
* Líder técnico:

  * Integraciones

```ts
MetricSeries {
  resourceId
  metricKey
  displayName
  history: [{ week, value }]
}
```

Todas las métricas comparten el mismo modelo:

* Eje X: tiempo (semanas)
* Eje Y: valor numérico

---

## 7. Análisis de comportamiento y fórmulas

PulseOps **no evalúa valores absolutos**, sino el **comportamiento de la estadística en el tiempo**.

### Variables base

* E_act: Estadística actual
* E_ant: Estadística anterior
* ΔE = E_act − E_ant

### Fórmula de inclinación (tendencia)

[ I = rac{E_{act} - E_{ant}}{E_{ant}} 	imes 100 ]

La inclinación representa:

* Dirección del cambio
* Intensidad del movimiento
* Comportamiento de la línea

### Casos especiales

* Si E_ant ≈ 0, la inclinación no es válida
* Una caída abrupta a 0 puede indicar **Inexistencia** o **Confusión**

---

## 8. Condiciones operativas

Las condiciones representan **estados de funcionamiento**, ordenados jerárquicamente:

1. Poder
2. Cambio de Poder
3. Afluencia
4. Funcionamiento Normal
5. Emergencia
6. Peligro
7. Inexistencia
8. Riesgo / Duda / Enemigo / Traición / Confusión (no puramente estadísticas)

### Asignación de condiciones

La condición se determina a partir de:

[ C = f(I, E_{act}, H) ]

Donde:

* I = inclinación
* E_act = valor actual
* H = historial de semanas

### Umbrales

Los conceptos de “ligero”, “pronunciado” o “casi vertical” se representan mediante **umbrales configurables**, no hardcodeados.

Ejemplo conceptual:

* Afluencia: I > umbral alto
* Normal: I > 0
* Emergencia: I ≈ 0
* Peligro: I negativo pronunciado
* Inexistencia: caída casi vertical

### Poder

* No se determina por una sola semana
* Requiere:

  * Varias semanas
  * Nivel alto sostenido
  * Estabilidad

---

## 9. Arquitectura técnica

### Frontend

* React + Vite
* TypeScript
* Tailwind CSS
* React Flow (núcleo semántico)

### Backend

* Node.js **v20.19.0** (requerido)
* NestJS 10.3.0
* TypeScript 5.3.3
* Arquitectura orientada a dominio
* WebSockets para eventos
* **Puerto**: `http://localhost:3000`

### Base de datos

* MongoDB 7.0 (Docker)
* **Puerto**: `27017`
* Persistencia de:
  * series temporales
  * evaluaciones
  * reglas versionadas

### Packages internos

* `@pulseops/analysis-engine`: Motor de análisis (CommonJS)
* `@pulseops/shared-types`: Tipos compartidos (CommonJS)

### Infraestructura (conceptual)

* AWS (ECS, S3, EventBridge)
* Docker / Docker Compose

### Herramientas de desarrollo

* **API Testing**:
  - `API_TESTING.md` - Guía con ejemplos curl de todos los endpoints
  - `PulseOps.postman_collection.json` - Colección Postman con 22 endpoints
  - Payloads corregidos y validados contra DTOs reales
* **Gestión de dependencias**:
  - npm workspaces (monorepo)
  - uuid v9.0.1 (compatibilidad CommonJS)

---

## 10. UX y visualización

* Dark mode
* UI animada
* React Flow usado **semánticamente**

Nodos representan:

* Recursos
* Series temporales
* Análisis de comportamiento
* Reglas
* Resultado

Edges representan:

* Flujo de evaluación

---

## 11. Uso de IA durante el desarrollo

* La IA genera código, componentes y lógica
* El humano valida intención y alcance
* El humano evita escribir código manualmente
* Las correcciones se hacen por prompts, no por edición directa

---

## 12. Objetivo del demo

Durante la presentación live:

* Mostrar ingestión
* Mostrar evolución temporal
* Aplicar fórmulas de inclinación
* Asignar condiciones
* Explicar el comportamiento de la línea

El foco no es cobertura funcional, sino **claridad conceptual, matemática y visual**.

---

## 13. Regla final

Si hay duda durante el desarrollo:

> Priorizar claridad arquitectónica, comportamiento de la estadística y demo en vivo sobre completitud funcional.

## 📚 14. Material de apoyo canónico del proyecto

Estos documentos complementan y extienden este context.md.
La IA debe leerlos y respetarlos antes de diseñar o implementar el motor de análisis.

Orden de prioridad semántica:
	1.	context.md (este documento)
	2.	**ESPECIFICACIÓN FORMAL DEL DOMINIO.md** (especificación oficial del motor)
	3.	Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md
	4.	Motor de análisis de inclinación y condiciones.md
	5.	Fórmulas de las condiciones.md

Reglas:
	•	Si hay ambigüedad → preferir especificación formal sobre implementación
	•	Si hay conflicto → prevalece ESPECIFICACIÓN FORMAL DEL DOMINIO.md
	•	Las fórmulas definen comportamiento, no valores fijos
	•	Las condiciones dependen de inclinación y tendencia histórica, no de thresholds absolutos
	•	La especificación formal define la jerarquía oficial de condiciones

---

## 📈 15. Motor de Análisis de Inclinación y Condiciones (Estado actual)

### ✅ Implementado (15 de enero, 2026)

El motor de análisis (`@pulseops/analysis-engine`) ahora cuenta con:

#### Arquitectura por capas

1. **Trend Layer** (Básica)
   - Análisis de dirección: UP, DOWN, FLAT, INSUFFICIENT_DATA
   - Cálculo de delta absoluto
   - Función: `analyze(series, config?)` → `TrendAnalysisResult`

2. **Inclination Layer** (Avanzada)
   - Cálculo de inclinación porcentual: `I = ((E_act - E_ant) / E_ant) × 100`
   - Manejo de casos especiales:
     - E_ant ≈ 0 (división por cero)
     - E_act ≈ 0 (caída crítica)
     - Ambos ≈ 0 (inexistencia/confusión)

3. **Condition Resolver Layer** (Jerarquía de condiciones Hubbard)
   - Evaluación jerárquica de condiciones operativas:
     1. INEXISTENCIA - Caída casi vertical o inicio desde cero
     2. PELIGRO - Descenso pronunciado
     3. EMERGENCIA - Sin cambio o descenso moderado
     4. PODER - Normal sostenido en nivel alto (≥3 períodos)
     5. AFLUENCIA - Crecimiento pronunciado
     6. NORMAL - Crecimiento gradual
     7. SIN_DATOS - Datos insuficientes

#### Funcionalidad disponible

- `analysisEngine.analyze()` - Análisis básico (compatible con versión inicial)
- `analysisEngine.analyzeWithConditions()` - Análisis completo con condiciones Hubbard
- `calculateInclination()` - Función standalone para cálculo de inclinación

#### Tipos extendidos (`@pulseops/shared-types`)

- `HubbardCondition` - Condiciones operativas jerárquicas
- `ConditionReason` - Explicación detallada de por qué se asignó una condición
- `InclinationResult` - Resultado del cálculo de inclinación porcentual
- `MetricConditionEvaluation` - Evaluación completa de una métrica

#### Características clave

- **Determinístico**: Mismos datos → mismo resultado
- **Puro**: Sin efectos secundarios, sin estado mutable
- **Parametrizable**: Umbrales configurables (no hardcoded)
- **Explicable**: Cada condición incluye código y explicación legible
- **Basado en comportamiento**: Evalúa tendencias, no valores absolutos
- **Histórico**: Analiza series completas para detectar Poder

### ⚠️ Auditoría realizada (15 de enero, 2026)

Se realizó auditoría lógica y semántica del motor. **Hallazgos críticos**:

1. **Jerarquía invertida**: PODER se evalúa después de AFLUENCIA (contradice filosofía Hubbard)
2. **EMERGENCIA demasiado amplia**: Cubre estancamiento (-5% a +5%) y descenso moderado (-20% a -50%)
3. **PODER con criterios débiles**: Permite -4.9% como "Normal sostenido"
4. **Zona muerta +5% a +10%**: No hay distinción clara
5. **CAMBIO_DE_PODER sin implementar**: Definido en tipos pero nunca asignado

### 📋 Definición formal del dominio (15 de enero, 2026)

**⚠️ ESTA ES LA ESPECIFICACIÓN OFICIAL - Pendiente de implementación**

#### Jerarquía oficial de condiciones (orden de evaluación)

1. **SIN_DATOS** - Condición técnica bloqueante
   - Menos períodos que los requeridos
   - Datos inválidos o no calculables
   - NO representa bajo rendimiento ni inicio de operación

2. **INEXISTENCIA** - Estado operativo bloqueante
   - Ambos valores ≈ 0
   - Paso de valor positivo a ≈ 0 (colapso)
   - Inicio desde 0 hacia un valor
   - NO representa caídas graduales

3. **PODER** - Estado operativo superior sostenido
   - Mínimo N períodos consecutivos
   - Todos los períodos con inclinación: `+5% < I < +50%`
   - Sin caídas, estancamientos ni Afluencia reciente
   - Nivel actual ≥ promedio de ventana relevante
   - NO coexiste con AFLUENCIA

4. **AFLUENCIA** - Expansión acelerada
   - Inclinación positiva pronunciada (`I ≥ +50%`)
   - NO requiere sostenibilidad
   - Puede existir en un solo período
   - NO representa estabilidad

5. **NORMAL** - Funcionamiento esperado
   - Crecimiento positivo real: `+5% < I < +50%`
   - Sin señales de colapso ni estancamiento
   - NO incluye estancamiento (eso es EMERGENCIA)

6. **EMERGENCIA** - Pérdida de control incipiente
   - Estancamiento: `-5% ≤ I ≤ +5%`
   - Descenso leve/moderado: `-50% < I < -5%`
   - NO representa caídas abruptas (eso es PELIGRO)

7. **PELIGRO** - Deterioro pronunciado
   - Descenso fuerte: `-80% < I ≤ -50%`
   - NO representa crisis técnica (eso es INEXISTENCIA)

#### Reglas formales de inclinación

1. **La inclinación manda, pero no gobierna sola**
   - Inclinación define velocidad
   - Condición define estado
   - Una sola inclinación NO puede definir PODER

2. **AFLUENCIA puede existir en un solo período**
   - No requiere histórico
   - Un solo crecimiento pronunciado genera AFLUENCIA

3. **NORMAL requiere crecimiento positivo real**
   - Crecimientos ≤ +5% NO son NORMAL
   - Rango: `+5% < I < +50%`

4. **Estancamiento es EMERGENCIA**
   - Rango: `-5% ≤ I ≤ +5%`
   - Nunca es NORMAL

5. **Caídas leves no son normales**
   - Inclinaciones negativas (aunque pequeñas) rompen NORMAL
   - Requieren atención (EMERGENCIA)

#### CAMBIO_DE_PODER (decisión final)

**NO ES DETECTABLE por este motor**

Razón:
- Requiere contexto externo (cambio de responsable, cambio estructural)
- No puede inferirse solo con series numéricas
- Queda reservado para capas superiores (backend/negocio)
- Documentado como fuera del alcance del motor

#### Decisiones arbitrarias declaradas

**Umbrales numéricos**:
- Son valores iniciales basados en criterio experto
- NO representan verdad estadística
- Sujetos a calibración futura con datos reales

**Ventana de análisis**:
- El motor es reactivo (responde a último cambio)
- NO es predictivo
- NO suaviza oscilaciones
- ~~NO detecta volatilidad (pendiente)~~ ✅ **Implementado en E.4**

**Confianza**:
- Heurística, no probabilística
- Basada solo en cantidad de datos
- NO considera calidad ni variabilidad
- Puede cambiar en futuras versiones

### ✅ Alineación con especificación formal (16 de enero, 2026)

**Refactorización completada** - Commit: `0236efc`

El motor ahora cumple con la especificación formal del dominio:

1. **Jerarquía corregida**:
   - PODER se evalúa ANTES de AFLUENCIA (estado > velocidad)
   - Refleja la filosofía Hubbard de condiciones acumulativas vs puntuales

2. **PODER con criterios estrictos**:
   - Requiere 3+ períodos consecutivos
   - TODOS los períodos deben estar en rango Normal (+5% < I < +50%)
   - Última inclinación también debe ser Normal (sin AFLUENCIA reciente)
   - Nivel actual debe ser ≥ promedio de ventana relevante

3. **NORMAL estrictamente positivo**:
   - Rango ajustado: +5% < I < +50%
   - Ya NO incluye estancamiento (eso es EMERGENCIA)

4. **EMERGENCIA clarificada**:
   - Códigos de razón distintos para estancamiento vs descenso
   - `STAGNATION` para [-5%, +5%]
   - `MODERATE_DECLINE` para [-50%, -5%)

5. **Validación completa**:
   - TypeScript compilation: ✓ Sin errores
   - Monorepo completo validado (frontend, backend, packages)
   - Sin cambios en contratos públicos

### ✅ Meta-análisis y detección de patrones (16 de enero, 2026)

**Extensión completada** - Commit: `d69cdb3`

El motor ahora incluye **detección de patrones peligrosos y volatilidad**:

#### Nuevos tipos exportados

**`SignalType`**: 5 tipos de señales complementarias
- `VOLATILE`: Patrón de serrucho (alternancia frecuente)
- `SLOW_DECLINE`: Deterioro persistente (múltiples caídas pequeñas)
- `DATA_GAPS`: Faltan períodos esperados en la serie
- `RECOVERY_SPIKE`: Recuperación brusca tras deterioro
- `NOISE`: Cambios insignificantes sin señal real

**`AnalysisSignal`**: Estructura de señal
```typescript
{
  type: SignalType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  windowUsed: number;
  evidence?: Record<string, number | string>;
}
```

**`MetricConditionEvaluation`**: Ahora incluye campo `signals: AnalysisSignal[]`

#### Algoritmos implementados

1. **`detectSlowDecline()`**
   - Ventana: 4 períodos
   - Detecta: 3+ inclinaciones negativas + suma total negativa
   - **Refinamiento E.4.1**: Usa inclinación porcentual en lugar de delta absoluto
   - Severity: HIGH si 4/4 caídas, MEDIUM si 3/4
   - **Ejemplo**: [100, 95, 91, 87, 83] → SLOW_DECLINE (HIGH)
   - **Qué NO detecta**: Caídas no consecutivas, picos de volatilidad

2. **`detectVolatility()`**
   - Ventana: 5 puntos
   - Detecta: 3+ cambios de signo en deltas (ignora deltas = 0)
   - **Refinamiento E.4.1**: Filtra deltas cero para evitar falsos positivos
   - Severity: HIGH si alterna constantemente, MEDIUM si 3+
   - **Ejemplo**: [10, 20, 10, 20, 10] → VOLATILE (HIGH)
   - **Qué NO detecta**: Volatilidad de corto plazo dentro de períodos, tendencias sostenidas

3. **`detectDataGaps()`**
   - Asume periodicidad semanal (7 días ± 2)
   - Detecta saltos > 9 días entre timestamps
   - **Refinamiento E.4.1**: Calcula y reporta explícitamente el gap más grande (largestGapDays)
   - Severity basada en cantidad de gaps
   - **Qué NO detecta**: Duplicados, calidad de datos, gaps esperados (feriados)

4. **`detectRecoverySpike()`**
   - Detecta: 2+ caídas consecutivas + crecimiento ≥ +50%
   - **Refinamiento E.4.1**: Analiza desde penúltimo punto hacia atrás para caídas inmediatamente antes del spike
   - Severity: MEDIUM (patrón poco común)
   - **Qué NO detecta**: Recuperaciones graduales, rebounds parciales

5. **`detectNoise()`**
   - Ventana: 4 períodos
   - Detecta: Todos los cambios dentro de ±2%
   - **Refinamiento E.4.1**: Fallback con delta absoluto (< 1) cuando inclinación es inválida (E_ant ≈ 0)
   - Severity: LOW (no hay acción necesaria)
   - **Qué NO detecta**: Ruido estacional, ruido sistemático vs aleatorio

#### Coherencia de señales (E.4.1)

**Regla anti-contradicción**: 
- Si `NOISE` está presente → NO incluir `VOLATILE`
- Razón: Son mutuamente excluyentes (sin señal vs señal alternante)
- Prioriza claridad sobre exhaustividad

#### Integración con condición principal

- La **condición Hubbard** sigue siendo la salida principal
- Las **señales NO cambian la condición**, solo añaden contexto
- Permite evaluaciones tipo:
  - "EMERGENCIA + SLOW_DECLINE (HIGH)" → Deterioro confirmado
  - "NORMAL + VOLATILE (MEDIUM)" → Crecimiento inestable
  - "AFLUENCIA + RECOVERY_SPIKE" → Rebote tras caída
  - "SIN_DATOS + DATA_GAPS (HIGH)" → Problema de completitud

#### Limitaciones declaradas

**❌ NO es predictivo**
- Los detectores reaccionan a patrones pasados
- NO anticipan futuros movimientos
- NO aprenden de datos históricos

**❌ NO considera contexto externo**
- No sabe si un gap fue feriado o problema técnico
- No distingue ruido legítimo de falta de actividad
- No evalúa estacionalidad

**❌ NO reemplaza análisis humano**
- Son heurísticas simples, no ML
- Umbrales pueden requerir calibración por dominio
- Pueden generar falsos positivos/negativos

**✅ Qué SÍ hace bien**
- Identifica patrones básicos de riesgo
- Explicable y demo-friendly
- Sin dependencias externas
- Rápido y determinístico

#### Próximos pasos (UI)

- Mostrar `signals` como **badges** junto a condición principal
- Tooltip con `explanation` + `evidence`
- Filtrar por severity (mostrar solo MEDIUM/HIGH por defecto)
- Color coding: 🔴 HIGH, 🟡 MEDIUM, 🟢 LOW

### ✅ Refinamiento de detectores (16 de enero, 2026)

**Commit**: `3b5a188`

Refinamientos técnicos aplicados sin cambiar contratos públicos:

1. **SLOW_DECLINE**: Usa `inclinación porcentual` en lugar de delta absoluto (evita engaño en métricas grandes)
2. **VOLATILE**: Ignora deltas = 0 para contar solo cambios de signo reales
3. **DATA_GAPS**: Calcula y reporta explícitamente `largestGapDays` (no solo el primero)
4. **RECOVERY_SPIKE**: Detecta caídas consecutivas inmediatamente antes del spike (análisis desde penúltimo hacia atrás)
5. **NOISE**: Fallback con delta absoluto cuando inclinación inválida (E_ant ≈ 0)
6. **Coherencia**: Si NOISE presente → NO incluir VOLATILE (anti-contradicción)

**Validaciones**:
- ✅ TypeScript: Sin errores en monorepo
- ✅ Builds: Compilación exitosa
- ✅ Contratos: Sin breaking changes

### ✅ FASE F: Integración Visual - React Flow (16 de enero, 2026)

**Commit**: `19876e0`

**Objetivo cumplido**: Visualizar el análisis del motor en un grafo React Flow interactivo con UI profesional.

#### Arquitectura implementada

**Estructura de módulos**:
```
apps/frontend/src/
  modules/
    live-demo/
      LiveDemoPage.tsx       # Componente principal
      demoData.ts            # Series temporales mock
      flow/
        buildGraph.ts        # Construye nodos/edges desde resultado
        nodeTypes.tsx        # Componentes personalizados de nodos
  App.tsx                    # Entry point actualizado
```

#### Componentes creados

**1. LiveDemoPage** (Principal):
- Selector de métrica (3 series mock diferentes)
- Panel lateral con resultados:
  - Condición operativa (badge con color)
  - Inclinación porcentual
  - Razón explicativa
  - Señales detectadas (SLOW_DECLINE, VOLATILE, etc.)
  - Metadata (ventana, confianza, timestamp)
- Grafo React Flow semántico del pipeline de análisis
- Botón "Reanalizar" para forzar re-ejecución

**2. Nodos personalizados** (nodeTypes.tsx):
- `SourceNode`: Fuente de datos (mock)
- `MetricSeriesNode`: Serie temporal
- `InclinationNode`: Inclinación % (verde/rojo según signo)
- `ConditionNode`: Condición Hubbard (colores por tipo)
- `SignalsNode`: Lista de señales con severity badges

**3. buildGraph()**: 
- Convierte `MetricConditionEvaluation` → Nodos y Edges
- Pipeline visual: Source → MetricSeries → Inclination → Condition → Signals
- Edges animados con colores diferenciados

#### Datos mock (demoData.ts)

**3 series temporales** con patrones específicos:

1. **Story Points** (Desarrollador)
   - Patrón: SLOW_DECLINE
   - 8 semanas de deterioro gradual: 100 → 76

2. **Integraciones** (Líder Técnico)
   - Patrón: VOLATILE
   - 7 semanas alternando: 10 ↔ 25 ↔ 12...

3. **Performance Score** (Desarrollador)
   - Patrón: RECOVERY_SPIKE
   - 6 semanas: caídas seguidas de spike (60 → 110)

#### Integración con analysis-engine

✅ **Motor ejecutándose en frontend**:
```typescript
const result = analysisEngine.analyzeWithConditions(series);
// Retorna: MetricConditionEvaluation con:
// - condition (HUBBARD)
// - inclination (%)
// - signals (VOLATILE, SLOW_DECLINE, etc.)
// - reason (explicación)
```

✅ **Sin backend**: Funciona standalone con datos mock

#### UI/UX implementado

**Dark mode profesional**:
- Gradientes en nodos (blue → purple → green)
- Borders con glow sutil
- Animaciones suaves en edges
- Badges con color coding:
  - 🔴 HIGH (rojo)
  - 🟡 MEDIUM (amarillo)
  - 🔵 LOW (azul)

**Condiciones con colores semánticos**:
- PODER: Amarillo dorado
- AFLUENCIA: Verde brillante
- NORMAL: Azul
- EMERGENCIA: Naranja
- PELIGRO: Rojo intenso
- INEXISTENCIA/SIN_DATOS: Gris

**Interactividad**:
- Cambio de métrica dinámico (sin reload)
- Botón "Reanalizar" (simula actualización)
- React Flow controls (zoom, pan, minimap)
- Hover en nodos muestra detalles

#### Demo-ready statement

**Ahora se puede decir en demo**:

> "Aquí está la serie histórica de Story Points. El motor calcula inclinación porcentual, 
> detecta que es un deterioro lento persistente (SLOW_DECLINE HIGH), y asigna condición 
> de EMERGENCIA. Todo se explica visualmente en un grafo que representa el pipeline 
> del dominio: desde la fuente de datos hasta las señales de meta-análisis. Además, 
> tenemos un gráfico histórico tradicional con línea de tendencia (regresión lineal) 
> que muestra la trayectoria de los valores en el tiempo."

#### Gráfico Histórico con Trendline

**✅ Implementado en PROMPT F**:

**1. Utilidades matemáticas** (`src/utils/chartUtils.ts`):
- `calculateLinearRegression()`: Regresión lineal por mínimos cuadrados
  - Calcula pendiente (m) e intersección (b) para y = mx + b
  - Maneja casos edge (n=0)
- `buildChartData()`: Transforma `MetricPoint[]` → datos para Recharts
  - Genera labels de semana (S1, S2, S3...)
  - Incluye valores reales + valores de tendencia calculados

**2. Componente HistoricalChart** (`src/components/HistoricalChart.tsx`):
- Props: `points: MetricPoint[]`, `metricName: string`
- Visualización con Recharts:
  - LineChart con 2 líneas:
    - **Valor Real**: Línea sólida azul con dots
    - **Línea de Tendencia**: Línea punteada verde (dasharray)
  - Ejes X (semanas) e Y (valores numéricos)
  - Tooltip con detalles de cada punto
  - Legend para identificar las líneas
  - Tema dark mode (bg-gray-800, borders gray-700)
  - Altura fija: 300px responsiva

**3. Integración en LiveDemoPage**:
- Layout reorganizado:
  - Panel lateral izquierdo (w-80): Resultados (condición, inclinación, señales, metadata)
  - Columna principal derecha (flex-1): 
    - **Gráfico Histórico** (arriba, 300px)
    - **Grafo React Flow** (abajo, 550px)
- Ambas visualizaciones se actualizan al cambiar métrica
- Mismo flujo de datos: `getSeriesById()` → componentes

**Características técnicas**:
- ✅ Regresión lineal pura (least squares)
- ✅ TypeScript strict mode
- ✅ Zero dependencias extra (Recharts ya era común para este caso)
- ✅ Responsive container
- ✅ Integración fluida con UI existente
- ✅ Dark mode consistente

**Qué se puede mostrar en demo**:
> "Esta es la visualización tradicional: un gráfico de línea con los valores históricos 
> y la línea de tendencia calculada por regresión lineal. Los ejecutivos que prefieren 
> gráficos convencionales tienen esta vista. Los técnicos pueden usar el grafo React Flow 
> para entender el pipeline del análisis."

#### Qué es mock (temporalmente)

- ❌ Fuente de datos: Mock hardcoded (3 series)
- ❌ Timestamps: Generados algorítmicamente
- ❌ Backend: No conectado todavía

#### Qué es real (funcionando ahora)

- ✅ Motor de análisis: @pulseops/analysis-engine ejecutándose
- ✅ Cálculo de inclinación: Fórmula oficial
- ✅ Resolución de condiciones: Jerarquía Hubbard correcta
- ✅ Detección de señales: 5 detectores funcionando
- ✅ Explicaciones: Generadas automáticamente
- ✅ Visualización: Grafo React Flow con pipeline completo
- ✅ **Playbooks Hubbard**: Fórmulas configurables por condición (16 de enero, 2026)

### 📚 Playbooks (Fórmulas Hubbard) - 16 de enero, 2026

**¿Qué son los Playbooks?**

Los playbooks son las **fórmulas operativas de Hubbard** asociadas a cada condición. No modifican el cálculo de la condición (eso lo hace el motor), sino que proporcionan **guía de acción** cuando se detecta una condición específica.

**Arquitectura**:

- **Motor** (@pulseops/analysis-engine): Calcula la condición basándose en inclinación e histórico
- **Backend** (NestJS): Almacena y gestiona playbooks configurables
- **Frontend**: Muestra la fórmula correspondiente al usuario

**Implementación**:

- **Colección MongoDB**: `condition_playbooks`
- **Módulo NestJS**: `PlaybooksModule`
  - Schema: `ConditionPlaybook` (condition, title, steps[], version, isActive)
  - Service: CRUD + seed inicial
  - Controller: GET all, GET by condition, PUT upsert, POST seed
- **Integración con Analysis**: El endpoint `/analysis/evaluate` ahora retorna:
  ```typescript
  {
    series: MetricSeries,
    evaluation: MetricConditionEvaluation,
    appliedRuleConfig: {...},
    playbook: {
      condition: string,
      title: string,
      steps: string[],
      version: number
    }
  }
  ```

**Catálogo oficial seeded**:

Todas las condiciones tienen playbook por defecto:
- ✅ INEXISTENCIA (4 pasos)
- ✅ PELIGRO (6 pasos)
- ✅ EMERGENCIA (5 pasos)
- ✅ NORMAL (4 pasos)
- ✅ AFLUENCIA (4 pasos)
- ✅ PODER (2 pasos)
- ✅ CAMBIO_DE_PODER (7 pasos)
- ✅ SIN_DATOS (5 pasos técnicos)

**Endpoints disponibles**:
- `GET /playbooks` - Lista todos los playbooks activos
- `GET /playbooks/:condition` - Obtiene playbook específico
- `PUT /playbooks/:condition` - Crea o actualiza playbook (versionado automático)
- `POST /playbooks/seed` - Inicializa catálogo por defecto

**Demo-friendly**:

Cuando el análisis detecta una condición (ej: EMERGENCIA), el backend automáticamente adjunta la fórmula Hubbard correspondiente. El frontend puede mostrar:
- Condición detectada: "EMERGENCIA"
- Inclinación: "-3.5%"
- Qué hacer: [Promociona, Cambia tu forma de actuar, Economiza, ...]

**Separación de responsabilidades**:
- ✅ Motor: Puro, sin conocimiento de acciones (solo detecta)
- ✅ Backend: Almacena fórmulas como contenido configurable
- ✅ Frontend: Presenta guía al usuario

#### Próximos pasos

**Sustituir mock por backend**:
1. Crear endpoints REST/WebSocket en backend
2. Conectar con Jira/GitHub APIs
3. Persistir series temporales en MongoDB
4. Eliminar demoData.ts

**Mejorar visualización**:
5. Dashboard con múltiples métricas simultáneas
6. Histórico interactivo (slider temporal)
7. Comparación entre recursos/equipos
8. Exportar reportes (PDF/Excel)

### 🔜 Pendiente

- Conectar con backend (endpoints REST/WebSocket)
- ~~Visualizar en frontend con React Flow~~ ✅ **Completado en F**
  - ~~Mostrar `signals` como badges junto a condición~~ ✅
  - ~~Tooltip con explanation + evidence~~ ✅
- ~~Playbooks (Fórmulas Hubbard) por condición~~ ✅ **Completado en G.2**
  - ~~Motor calcula condición, backend adjunta fórmula~~ ✅
  - ~~CRUD básico de playbooks~~ ✅
  - ~~Seed con fórmulas oficiales Hubbard~~ ✅
  - ~~Integración con endpoint de análisis~~ ✅
- Crear dashboard histórico interactivo
- Implementar motor de reglas declarativo
- Versionado y simulación de reglas
- Calibrar umbrales con datos reales de operación
- Sustituir datos mock por integración con Jira/GitHub

---

## 📚 Playbooks (Fórmulas Hubbard)

**Implementación**: 16 de enero, 2026 (Prompt G.2)

### Arquitectura

El sistema de Playbooks complementa el motor de análisis **sin modificarlo**:

1. **Motor de análisis** (`@pulseops/analysis-engine`):
   - Calcula condición operativa (HubbardCondition)
   - Genera razón (ConditionReason) y señales (AnalysisSignal[])
   - **NO contiene fórmulas de acción** (mantiene pureza)

2. **Backend** (`/playbooks` module):
   - Almacena fórmulas Hubbard en MongoDB
   - Provee CRUD para gestionar playbooks
   - Adjunta playbook correspondiente al retornar análisis

3. **Frontend** (pendiente):
   - Mostrará pasos de acción al usuario
   - Interfaz para editar/actualizar playbooks

### Modelo de datos

**Colección**: `condition_playbooks`

```typescript
{
  condition: HubbardCondition;  // Único índice
  title: string;                 // "Fórmula de Emergencia"
  steps: string[];               // Lista de pasos Hubbard
  version: number;               // Versionado de fórmula
  isActive: boolean;             // Habilitado/deshabilitado
  updatedAt: string;             // ISO timestamp
}
```

### Endpoints disponibles

- `GET /playbooks` - Lista todos los playbooks activos
- `GET /playbooks/:condition` - Obtiene playbook por condición
- `PUT /playbooks/:condition` - Upsert (crear o actualizar)
- `POST /playbooks/seed` - Inicializar con fórmulas oficiales

### Catálogo oficial (8 condiciones)

Cada condición tiene su fórmula Hubbard completa:

1. **PODER** - 2 pasos (No te desconectes, Documenta tu puesto)
2. **CAMBIO_DE_PODER** - 7 pasos (Familiarízate antes de cambiar)
3. **AFLUENCIA** - 4 pasos (Economiza, Consolida, Refuerza)
4. **NORMAL** - 4 pasos (No cambies nada, Analiza mejoras)
5. **EMERGENCIA** - 5 pasos (Promociona, Cambia, Economiza)
6. **PELIGRO** - 6 pasos (Pasa por alto, Resuelve, Reorganiza)
7. **INEXISTENCIA** - 4 pasos (Comunica, Date a conocer, Produce)
8. **SIN_DATOS** - 5 pasos técnicos (Verificar medición, Recolectar)

### Integración con análisis

El endpoint `/analysis/evaluate` ahora retorna:

```typescript
{
  series: MetricSeries,
  evaluation: MetricConditionEvaluation,
  appliedRuleConfig: { id, version } | null,
  playbook: {                          // ← NUEVO
    condition: "EMERGENCIA",
    title: "Fórmula de Emergencia",
    steps: ["Promociona", "Cambia"...],
    version: 1
  } | null
}
```

### Filosofía de separación

**Motor puro** ≠ **Guía de acción**

- Motor: Detecta condición (matemática, automática)
- Playbook: Explica qué hacer (humano, contextual)
- Backend: Une ambos mundos sin contaminar el motor

Esta separación permite:
- Actualizar fórmulas sin redeployar motor
- Versionar cambios organizacionales
- Personalizar acciones por empresa/equipo
- Mantener trazabilidad de decisiones

**Nota**: CAMBIO_DE_PODER tiene fórmula documentada pero el motor NO lo detecta automáticamente (requiere contexto externo: cambio de responsable, restructuración). Queda reservado para asignación manual desde capas superiores.

---

## [16 Enero 2026] – Fase 3.1 – Frontend Dashboard Conectado

### Qué se implementó

**Dashboard del Recurso** completamente funcional y conectado al backend:

#### Capa de servicios
- ✅ `apiClient.ts` - Cliente HTTP centralizado con métodos tipados
- ✅ Manejo de errores con `HttpError`
- ✅ Tipado estricto para Resources, Metrics, Records, AnalysisResult

#### Hooks personalizados
- ✅ `useResources` - Gestión de recursos con estados loading/error
- ✅ `useMetrics` - Gestión de métricas
- ✅ `useRecords` - Filtrado por resourceId y metricKey con lazy loading
- ✅ `useAnalysis` - Evaluación de análisis con callback

#### Componentes UI
- ✅ `ResourceSelector` - Dropdown con loading states y transiciones
- ✅ `MetricSelector` - Selector de métricas con feedback visual
- ✅ `HistoricalChart` - Gráfico de series temporales con:
  - Línea de tendencia (regresión lineal)
  - Tooltips interactivos
  - Estados vacíos y loading
  - Animaciones suaves
- ✅ `ConditionSummary` - Cards de condición operativa con:
  - Color-coding por severidad
  - Inclinación porcentual
  - Señales detectadas
  - Confidence badge
- ✅ `ConditionFormula` - Pasos de fórmula Hubbard

#### Dashboard principal
- ✅ `ResourceDashboard.tsx` - Orquestación completa
- ✅ Auto-selección de primer recurso/métrica
- ✅ Re-evaluación automática al cambiar selección
- ✅ Transiciones suaves entre estados
- ✅ Debug panel para desarrollo

### Decisiones técnicas

1. **Separación de concerns**:
   - Services: Comunicación HTTP pura
   - Hooks: Lógica de data fetching y estado
   - Components: Presentación pura con props tipadas
   - Pages: Orquestación y flujo

2. **Estados manejados**:
   - Loading (skeletons)
   - Empty (mensajes útiles)
   - Error (manejo con HttpError)
   - Success (renderizado normal)

3. **Transiciones**:
   - Fade-in con `transition-opacity duration-300`
   - Skeletons con `animate-pulse`
   - No parpadeos ni saltos bruscos

4. **TypeScript strict**:
   - 100% tipado
   - No `any`
   - Interfaces compartidas entre componentes

### Qué se pospone

- ❌ Autenticación Auth0 (preparado pero no activo)
- ~~❌ Formularios CRUD completos~~ ✅ **Completado: Formularios de registros manuales (16 enero 2026)**
- ❌ Importaciones externas (CSV/Jira)
- ❌ Editor visual de reglas
- ❌ Sistema de alertas
- ❌ WebSockets para real-time updates

### Impacto en arquitectura

- Frontend ahora consume todos los endpoints principales del backend
- Flujo completo: Resource → Metric → Records → Analysis
- UI alineada con diseño mockup entregado
- Base sólida para agregar features incrementales

### Validación completada

```bash
# TypeScript
✅ Frontend: npm run typecheck (0 errors)
✅ Backend: npm run typecheck (0 errors)

# Compilación
✅ No imports inválidos
✅ Componentes renderizables
✅ Estados manejados correctamente
```

### Archivos creados/modificados

**Nuevos**:
- `src/services/apiClient.ts`
- `src/hooks/useResources.ts`
- `src/hooks/useMetrics.ts`
- `src/hooks/useRecords.ts`
- `src/hooks/useAnalysis.ts`
- `src/components/ResourceSelector.tsx`
- `src/components/MetricSelector.tsx`
- `src/components/ConditionSummary.tsx`
- `src/components/ConditionFormula.tsx`
- `src/pages/ResourceDashboard.tsx`
- `apps/frontend/.env.example`
- `apps/frontend/DASHBOARD.md`

**Modificados**:
- `src/components/HistoricalChart.tsx` (actualizado para trabajar con Records)
- `src/App.tsx` (cambio a ResourceDashboard)
- `src/modules/live-demo/LiveDemoPage.tsx` (adaptado a nueva interfaz)

### Próximos pasos sugeridos

1. ~~Poblar backend con datos de prueba (seed scripts)~~ ✅ **Completado (16 enero 2026)**
   - Script `npm run seed:demo` con 8 recursos diversos
   - 5 métricas con ~80 records
   - Patrones que demuestran todas las condiciones Hubbard
2. ~~Implementar formularios de ingreso manual~~ ✅ **Completado (16 enero 2026)**
   - RecordForm con validaciones completas
   - RecordModal con animaciones y manejo de errores
   - Integración en ResourceDashboard
   - Auto-actualización de gráficos tras crear registro
3. Implementar formularios para Resources y Metrics
4. Activar Auth0 para demo
5. Agregar WebSockets para updates en tiempo real

---

## [16 Enero 2026] – Fase 3.2 – Sistema de Condiciones Parametrizables + Slider Horizontal

### Qué se implementó

**Sistema completo de metadata de condiciones** con renderizado dinámico:

#### Backend - ConditionsModule
- ✅ `ConditionsService` - Metadata estática de 8 condiciones Hubbard
- ✅ `ConditionsController` - Endpoint `GET /conditions/metadata`
- ✅ Estructura completa por condición:
  - `order`: Jerarquía (1-8)
  - `displayName`: Nombre legible
  - `description`: Explicación del estado
  - `color`: 4 variantes Tailwind (bg, badge, text, border)
  - `icon`: Emoji representativo
  - `category`: Clasificación (superior, normal, crisis, technical)

#### Frontend - Renderizado dinámico
- ✅ `useConditionsMetadata` hook - Fetch y cache con auto-sort
- ✅ `ConditionCard` componente genérico - Renderiza desde metadata
- ✅ ResourceDashboard refactorizado:
  - **Slider horizontal** con `flex` y `overflow-x-auto`
  - **Auto-scroll animado** a condición activa con `scrollIntoView()`
  - Tarjetas con `w-64` fijo para consistencia
  - Transiciones suaves (`transition-transform duration-300`)
  - Hover effect (`hover:scale-105`)
  - Scrollbar estilizada dark mode
  - Referencias dinámicas con `Map<string, HTMLDivElement>`

#### Script de seed con datos diversos
- ✅ `seed-demo-data.ts` - Comando: `npm run seed:demo`
- ✅ 8 recursos (6 DEV + 2 TL) con nombres reales
- ✅ 5 métricas diferentes
- ✅ ~80 records con patrones que demuestran:
  - **PODER**: Ana García (Story Points), Helena Vargas (Integraciones)
  - **AFLUENCIA**: Carlos Mendoza, Ana García (Performance)
  - **NORMAL**: Diana López (Performance), Carlos (Code Reviews)
  - **EMERGENCIA**: Eduardo Ruiz, Ignacio Morales (Bugs)
  - **PELIGRO**: Fernanda Torres (Performance)
  - **INEXISTENCIA**: Gabriel Santos (Code Reviews)

### Beneficios arquitectónicos

1. **Configuración sobre código**: Condiciones gestionadas desde backend
2. **Escalabilidad**: Sin rebuild para cambiar orden, colores o iconos
3. **Frontend agnóstico**: Solo renderiza lo que backend provee
4. **Todas las condiciones visibles**: 8 cards en lugar de 4 hardcoded
5. **UX mejorada**: Auto-scroll a condición activa con animaciones fluidas
6. **Demo-ready**: Datos diversos evidencian claramente el comportamiento dinámico

### Validación completada

```bash
# TypeScript
✅ Backend: 0 errores
✅ Frontend: 0 errores

# Funcionalidad
✅ Endpoint /conditions/metadata retorna 8 condiciones ordenadas
✅ Slider horizontal con scroll suave
✅ Auto-focus en condición activa al cambiar métrica
✅ Seed ejecuta sin errores y puebla MongoDB
✅ Git commits: fc582f5 (parametrización), c78957c (seed data)
```

---

## [16 Enero 2026] – Fase 3.3 – Optimización de Animaciones del Chart

### Problema identificado

El gráfico de series temporales presentaba **saltos bruscos** al cambiar de recurso o métrica, en lugar de transiciones suaves como en el demo original con datos mockeados.

**Causa raíz**: El estado de `loading` causaba que el componente se desmontara completamente y mostrara el skeleton, luego se volvía a montar con datos nuevos, rompiendo las animaciones de Recharts.

### Solución implementada

**1. Optimización del loading state** en `HistoricalChart`:
```tsx
// Antes: Skeleton bloqueaba siempre que loading=true
if (loading) return <Skeleton />

// Después: Solo skeleton en carga inicial
if (loading && records.length === 0) return <Skeleton />
```

**Resultado**: El gráfico permanece visible mientras carga nuevos datos, permitiendo que Recharts haga transiciones suaves.

**2. Memoización estratégica**:
- ✅ `React.memo()` en `HistoricalChart` - Solo re-renderiza si props cambian
- ✅ `useMemo()` para `selectedMetric` - Evita recalculaciones innecesarias
- ✅ `useCallback()` en `fetchRecords` - Estabiliza función fetch

**3. Simplificación del código**:
- ❌ Eliminadas animaciones explícitas innecesarias (Recharts las maneja por defecto)
- ❌ Eliminada key prop dinámica que causaba remounting
- ✅ Componente equivalente al demo original con datos mockeados

### Archivos modificados

```
apps/frontend/src/components/HistoricalChart.tsx
  - Agregado React.memo()
  - Mejorado loading condicional (solo skeleton inicial)
  - Simplificado código de animaciones

apps/frontend/src/hooks/useRecords.ts
  - Agregado useCallback para fetchRecords
  - Corregidas dependencias de useEffect

apps/frontend/src/pages/ResourceDashboard.tsx
  - Agregado useMemo para selectedMetric
  - Ajuste de branding (By Unlimitech)
```

### Validación completada

```bash
✅ Transiciones suaves al cambiar recursos
✅ Transiciones suaves al cambiar métricas
✅ Gráfico permanece visible durante carga
✅ Sin re-renders innecesarios (React.memo activo)
✅ Sin saltos bruscos
✅ 0 errores TypeScript
```

### Beneficios UX

1. **Experiencia refinada**: Igual al demo original con datos mockeados
2. **Performance optimizada**: Menos re-renders, menos trabajo DOM
3. **Feedback visual claro**: Usuario ve evolución de datos en tiempo real
4. **Profesional**: Animaciones fluidas mejoran percepción de calidad

---

## [16 Enero 2026] – Fase 3.4 – Formularios de Registros Manuales

### Qué se implementó

**Sistema completo de formularios** para crear registros manuales en el dashboard:

#### Componentes creados

- ✅ **RecordForm.tsx** - Formulario controlado con validaciones:
  - Campos: resourceId, metricKey, week, timestamp, value, source
  - Validación completa de campos requeridos
  - Auto-generación de semana actual (formato ISO: YYYY-Www)
  - Manejo de errores por campo
  - Deshabilitado de resource/metric al editar (previene cambios accidentales)
  - Estados: submitting, disabled, error
  
- ✅ **RecordModal.tsx** - Modal profesional con:
  - Overlay con blur y animaciones
  - Cierre por ESC key o backdrop click
  - Prevención de scroll del body
  - Manejo de errores con feedback visual
  - Reset automático de estado al cerrar
  - Estados de carga durante submit

#### Integración en dashboard

- ✅ Botón "Agregar Registro" en header (junto a search/notifications)
- ✅ Auto-refetch de records tras crear registro
- ✅ Re-evaluación automática de análisis
- ✅ Actualización en tiempo real del gráfico
- ✅ Actualización de condición operativa

#### Mejoras al API Client

- ✅ Método `upsertRecord()` agregado
- ✅ Tipado completo con timestamp y source
- ✅ Alias `MetricRecord` para evitar conflicto con tipo nativo Record

### Decisiones técnicas

1. **Upsert sobre Create**: Backend usa upsert (crea o actualiza por resourceId + metricKey + week)
2. **Auto-timestamp**: Formulario genera timestamp automáticamente (ISO 8601)
3. **Formato de semana**: ISO Week Date (YYYY-Www, ej: 2026-W02)
4. **Source por defecto**: "MANUAL" para distinguir de datos importados
5. **Tipo alias**: `Record as MetricRecord` para evitar conflicto con TypeScript Record<K,V>

### Flujo de usuario

1. Usuario hace clic en "Agregar Registro"
2. Modal se abre con formulario vacío
3. Selecciona recurso y métrica (listas pobladas desde backend)
4. Especifica semana (pre-llenada con semana actual)
5. Ingresa valor numérico
6. Opcionalmente modifica source
7. Click en "Crear"
8. Modal muestra "Guardando..."
9. Request POST a `/records`
10. Backend ejecuta upsert (crea o actualiza)
11. Frontend refetch records
12. Gráfico se actualiza con nuevo punto
13. Análisis se re-ejecuta automáticamente
14. Condición operativa se recalcula
15. Modal se cierra
16. Usuario ve cambios inmediatamente

### Validaciones implementadas

**Campos requeridos**:
- ✅ resourceId (debe existir)
- ✅ metricKey (debe existir)
- ✅ week (formato YYYY-Www)
- ✅ value (numérico válido, acepta decimales)

**Campos opcionales**:
- source (default: "MANUAL")
- timestamp (auto-generado si no se provee)

**Reglas de negocio**:
- No se permite cambiar resource/metric al editar (fields disabled)
- Week sigue formato ISO estricto
- Value acepta negativos y decimales (step="any")

### Archivos creados/modificados

**Nuevos**:
- `apps/frontend/src/components/RecordForm.tsx` (240 líneas)
- `apps/frontend/src/components/RecordModal.tsx` (143 líneas)

**Modificados**:
- `apps/frontend/src/services/apiClient.ts` - Agregado upsertRecord()
- `apps/frontend/src/pages/ResourceDashboard.tsx` - Integrado modal y lógica
- `apps/frontend/src/hooks/useRecords.ts` - Ya tenía refetch (sin cambios)

### Validación completada

```bash
✅ TypeScript: 0 errores
✅ Formulario renderiza correctamente
✅ Validaciones funcionan
✅ Modal abre/cierra con animaciones
✅ Submit ejecuta upsert
✅ Gráfico se actualiza automáticamente
✅ Análisis se recalcula tras crear
✅ ESC key cierra modal
✅ Backdrop click cierra modal
✅ Body scroll bloqueado cuando modal abierto
```

### Próximos pasos

1. Formularios CRUD para Resources
2. Formularios CRUD para Metrics
3. Edición de registros existentes (pasar initialRecord al modal)
4. Eliminación de registros con confirmación
5. Importación masiva desde CSV/JSON

---
## [16 Enero 2026] – Fase 3.5 – Refactor React Hook Form + Yup + Zustand

### Qué se implementó

**Modernización completa de formularios** con stack profesional de manejo de estado y validaciones:

#### Stack tecnológico adoptado

- ✅ **React Hook Form** (v7.71.1) - Manejo declarativo de formularios
- ✅ **Yup** - Validación basada en schemas
- ✅ **@hookform/resolvers** - Integración RHF + Yup
- ✅ **Zustand** - State management global ligero

#### Arquitectura implementada

**1. Zustand Store** (`stores/recordsStore.ts`):
```typescript
interface RecordsState {
  records: MetricRecord[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingRecord: MetricRecord | null;
  
  // Actions
  setModalOpen: (isOpen: boolean) => void;
  setEditingRecord: (record: MetricRecord | null) => void;
  fetchRecords: (params: GetRecordsParams) => Promise<void>;
  createRecord: (data: RecordFormData) => Promise<MetricRecord>;
  deleteRecord: (id: string) => Promise<void>;
  reset: () => void;
}
```

**Características del store**:
- Estado global centralizado para records
- Auto-refetch tras mutaciones (create/delete)
- Manejo de loading/error states
- Control de modal (open/close)
- Gestión de editingRecord para modo edición

**2. Yup Schema** (`schemas/recordFormSchema.ts`):
```typescript
export const recordFormSchema = yup.object({
  resourceId: yup.string().required('Debes seleccionar un recurso'),
  metricKey: yup.string().required('Debes seleccionar una métrica'),
  week: yup.string().required().matches(/^\d{4}-W\d{2}$/),
  timestamp: yup.string().required(),
  value: yup.number().required(),
  source: yup.string().optional(),
});

export interface RecordFormData {
  resourceId: string;
  metricKey: string;
  week: string;
  timestamp: string;
  value: number;
  source?: string;
}
```

**Beneficios**:
- Validaciones centralizadas y reutilizables
- Mensajes de error personalizados
- Tipado fuerte con TypeScript
- Regex validation para formato de semana ISO

**3. RecordForm refactorizado**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
} = useForm<RecordFormData>({
  resolver: yupResolver(recordFormSchema) as any,
  defaultValues: { /* ... */ },
});
```

**Mejoras sobre versión anterior**:
- ❌ Eliminado: useState manual para cada campo
- ❌ Eliminado: Validación imperativa
- ✅ Agregado: register() para binding automático
- ✅ Agregado: Validación declarativa con Yup
- ✅ Agregado: formState.errors con mensajes contextuales
- ✅ Agregado: reset() para limpiar formulario

**4. RecordModal refactorizado**:
```typescript
// Antes (controlled props)
interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordFormData) => Promise<void>;
  initialRecord?: MetricRecord | null;
}

// Después (Zustand-powered)
interface RecordModalProps {
  resources: Resource[];
  metrics: Metric[];
  title?: string;
}

const { 
  isModalOpen, 
  editingRecord, 
  error,
  setModalOpen, 
  createRecord 
} = useRecordsStore();
```

**Simplificación lograda**:
- Props reducidas de 4 a 3 (solo datos necesarios)
- Estado global reemplaza props drilling
- Lógica de submit movida al store
- Error handling centralizado

**5. ResourceDashboard actualizado**:
```typescript
// Eliminado
const [isModalOpen, setIsModalOpen] = useState(false);
const { records, loading, refetch } = useRecords({ ... });
const handleCreateRecord = async (data) => { ... };

// Agregado
const { records, loading, fetchRecords, setModalOpen } = useRecordsStore();

useEffect(() => {
  if (selectedResourceId && selectedMetricKey) {
    fetchRecords({ resourceId, metricKey });
  }
}, [selectedResourceId, selectedMetricKey, fetchRecords]);

<RecordModal resources={resources} metrics={metrics} />
```

**Beneficios**:
- Estado compartido entre componentes sin props drilling
- Refetch automático tras mutaciones
- Lógica de negocio centralizada en el store
- Componentes más simples y enfocados

### Decisiones técnicas

1. **Zustand sobre MobX**: 
   - Más ligero (2.5 KB vs 16 KB)
   - API más simple y moderna
   - Mejor soporte TypeScript out-of-the-box
   - No requiere decoradores ni observers

2. **Interfaz manual sobre InferType**:
   - Yup's `InferType<>` genera `{ source: string | undefined }` (obligatorio pero nullable)
   - TypeScript espera `{ source?: string }` (opcional)
   - Solución: Definir `RecordFormData` manualmente
   - Type assertion en resolver: `yupResolver(recordFormSchema) as any`

3. **Auto-refetch en store**:
   - Tras `createRecord()` ejecuta `fetchRecords()` automático
   - Evita llamadas manuales a refetch en componentes
   - Garantiza sincronización inmediata

4. **getCurrentWeek() utility**:
   - Genera semana ISO actual (YYYY-Www)
   - Usado como defaultValue en formulario
   - Evita errores de formato por entrada manual

### Resolución de TypeScript

**Problema encontrado**:
```
El tipo '{ source?: string | undefined; ... }' no se puede asignar al tipo 
'{ resourceId: string; ...; source: string | undefined; }'.
La propiedad 'source' es opcional en el tipo X, pero obligatoria en el tipo Y.
```

**Causa raíz**: Incompatibilidad entre representación de campos opcionales en Yup vs TypeScript nativo.

**Solución aplicada**:
1. Definir `RecordFormData` interface manualmente (no InferType)
2. Type assertion en yupResolver: `as any`
3. Build exitoso confirmado: `npx vite build` ✅

### Archivos creados

- ✅ `apps/frontend/src/stores/recordsStore.ts` (107 líneas)
- ✅ `apps/frontend/src/schemas/recordFormSchema.ts` (48 líneas)

### Archivos refactorizados

- ✅ `apps/frontend/src/components/RecordForm.tsx` (187 líneas)
  - Reescrito con React Hook Form
  - Eliminado useState manual
  - Agregado yupResolver
  
- ✅ `apps/frontend/src/components/RecordModal.tsx` (141 líneas)
  - Eliminado estado local
  - Integrado con Zustand store
  - Props simplificadas
  
- ✅ `apps/frontend/src/pages/ResourceDashboard.tsx`
  - Eliminado useRecords hook
  - Agregado useRecordsStore
  - Simplificado manejo de modal

### Validación completada

```bash
✅ Dependencies instaladas: react-hook-form, yup, @hookform/resolvers, zustand
✅ Zustand store creado con 6 acciones
✅ Yup schema con 6 campos validados
✅ RecordForm refactorizado con useForm
✅ RecordModal integrado con store
✅ ResourceDashboard usando estado global
✅ Build exitoso: npx vite build (615 KB output)
✅ 0 errores de sintaxis
⚠️  TypeScript language server cache issue (no afecta compilación)
```

### Beneficios del refactor

**Developer Experience**:
- Menos código boilerplate (register vs onChange manual)
- Validaciones declarativas y legibles
- Estado global sin props drilling
- TypeScript types más precisos

**User Experience**:
- Mismo comportamiento visual
- Validaciones más rápidas (inline)
- Mensajes de error contextuales
- Sin cambios perceptibles (transparente)

**Mantenibilidad**:
- Lógica de negocio centralizada en store
- Validaciones reutilizables en múltiples forms
- Componentes más pequeños y enfocados
- Facilita testing unitario

**Escalabilidad**:
- Patrón replicable para otros forms (Resources, Metrics)
- Store extensible para nuevas acciones
- Schemas combinables y componibles

### Próximos pasos

1. Migrar formularios de Resources a RHF + Yup
2. Migrar formularios de Metrics a RHF + Yup
3. Crear store para Resources (resourcesStore.ts)
4. Crear store para Metrics (metricsStore.ts)
5. Implementar edición de registros existentes
6. Implementar eliminación con confirmación

---

## [16 Enero 2026] – Fase 3.6 – Sistema de Navegación con Menú Dropdown

### Qué se implementó

**Sistema completo de navegación** mediante menú dropdown en el header existente:

#### Componentes creados

- ✅ **Header.tsx** - Componente de navegación global (creado y luego removido)
- ✅ **ResourcesPage.tsx** - Vista dedicada para gestión de recursos
- ✅ **MetricsPage.tsx** - Vista dedicada para gestión de métricas  
- ✅ **RecordsPage.tsx** - Vista dedicada para gestión de registros

#### Arquitectura de navegación implementada

**Router configurado** (`App.tsx`):
```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ResourceDashboard />} />
    <Route path="/resources" element={<ResourcesPage />} />
    <Route path="/metrics" element={<MetricsPage />} />
    <Route path="/records" element={<RecordsPage />} />
  </Routes>
</BrowserRouter>
```

**Menú dropdown en tres puntos**:
- Ubicación: Header del dashboard, junto al avatar
- Trigger: Click en ícono de tres puntos verticales
- Opciones:
  1. 📊 Dashboard (/)
  2. 👥 Recursos (/resources)
  3. 📈 Métricas (/metrics)
  4. 📄 Registros (/records)
- Comportamiento:
  - Cierre automático al hacer click fuera (useEffect + mousedown event)
  - Cierre automático al seleccionar opción
  - Navegación con `useNavigate()` de react-router-dom

**Header restaurado** en ResourceDashboard:
- Logo PulseOps con ícono ECG
- Selectores de recurso y métrica
- Botón "Agregar Registro"
- Íconos de búsqueda y notificaciones
- Menú de tres puntos con dropdown
- Avatar del usuario

#### Páginas CRUD creadas

**1. ResourcesPage** (`/resources`):
- Tabla con columnas: Nombre, Rol, ID, Acciones
- Botón "Crear Recurso" en header de página
- Estadísticas: Total recursos, Desarrolladores (DEV), Líderes (TL)
- Estados manejados: loading, error, empty, success
- Modal placeholder para formulario

**2. MetricsPage** (`/metrics`):
- Tabla con columnas: Etiqueta, Clave, Descripción, Unidad, Acciones
- Botón "Crear Métrica" en header de página
- Estadísticas: Total métricas, Métricas configuradas
- Estados manejados: loading, error, empty, success
- Modal placeholder para formulario

**3. RecordsPage** (`/records`):
- Filtros: Selector de recurso + Selector de métrica
- Tabla: Semana, Valor, Fuente, Timestamp, Acciones
- Botón "Agregar Registro" en header de página
- RecordModal completamente funcional (movido del dashboard)
- Integrado con Zustand store (`useRecordsStore`)
- Estadísticas: Total registros, Promedio, Último valor

### Decisiones de diseño

1. **Menú en tres puntos (no barra de navegación)**:
   - Mantiene el header limpio y enfocado en el análisis
   - Contexto principal: Dashboard de análisis
   - Navegación a CRUD: Acceso secundario vía menú

2. **Header solo en Dashboard**:
   - Cada página CRUD tiene su propio layout independiente
   - No hay header global compartido
   - Permite flexibilidad en diseño por página

3. **Separación de responsabilidades**:
   - **Dashboard**: Visualización y análisis (gráficos, condiciones, fórmulas)
   - **CRUD Pages**: Gestión completa de entidades (tablas, formularios)
   - **Zustand stores**: Estado global compartido entre páginas

4. **Navegación con react-router-dom**:
   - SPA completa sin recargas de página
   - URLs semánticas (`/resources`, `/metrics`, `/records`)
   - Navigate programático con `useNavigate()`

### Flujo de usuario

**Desde el Dashboard**:
1. Usuario hace click en **tres puntos** junto al avatar
2. Se despliega menú dropdown con 4 opciones
3. Click en opción deseada (ej: "Recursos")
4. Navegación a `/resources`
5. Menú se cierra automáticamente

**En páginas CRUD**:
1. Usuario ve tabla con datos existentes
2. Click en "Crear [Entidad]" abre modal
3. Completa formulario y guarda
4. Tabla se actualiza automáticamente
5. Puede navegar de vuelta al Dashboard vía URL o botón atrás

### Archivos creados

- ✅ `apps/frontend/src/components/Header.tsx` (71 líneas) - Creado y luego removido
- ✅ `apps/frontend/src/pages/ResourcesPage.tsx` (145 líneas)
- ✅ `apps/frontend/src/pages/MetricsPage.tsx` (137 líneas)
- ✅ `apps/frontend/src/pages/RecordsPage.tsx` (222 líneas)

### Archivos modificados

- ✅ `apps/frontend/src/App.tsx`
  - Configurado BrowserRouter
  - 4 rutas definidas
  - Header global removido (no necesario)

- ✅ `apps/frontend/src/pages/ResourceDashboard.tsx`
  - Agregado `useNavigate` de react-router-dom
  - Agregado estado `isMenuOpen` para dropdown
  - Agregado `menuRef` para detectar clicks fuera
  - Implementado menú dropdown en tres puntos
  - Header completamente restaurado
  - RecordModal reintegrado

- ✅ `package.json` (frontend)
  - Agregado `react-router-dom@7.12.0`

### Validación completada

```bash
✅ react-router-dom instalado
✅ 4 rutas configuradas
✅ Menú dropdown funcional
✅ Navegación entre vistas operativa
✅ Header restaurado completamente
✅ RecordModal reintegrado en dashboard
✅ Click fuera cierra menú (useEffect)
✅ Build exitoso: 669 KB
✅ TypeScript: 0 errores críticos
✅ Commits: 43aebd9, 2f304a3
✅ Push completado
```

### Beneficios de la arquitectura

**UX**:
- Navegación contextual sin saturar el header
- Dashboard enfocado en análisis
- CRUD separado y organizado

**Mantenibilidad**:
- Cada página es independiente
- Fácil agregar nuevas vistas
- No hay coupling entre layouts

**Escalabilidad**:
- Patrón replicable para nuevas secciones
- Router fácilmente extensible
- Stores pueden compartirse entre páginas

### Próximos pasos

1. **Implementar formularios completos**:
   - ResourceForm + ResourceModal (RHF + Yup + Zustand)
   - MetricForm + MetricModal (RHF + Yup + Zustand) ✅ **COMPLETADO en Fase 3.7**
   - Edición y eliminación en RecordsPage

2. **Mejorar tablas**:
   - Paginación
   - Ordenamiento
   - Búsqueda/filtros
   - Acciones inline (editar/eliminar)

3. **Navegación mejorada**:
   - Breadcrumbs
   - Indicador de página activa en menú
   - Animaciones de transición entre rutas

4. **Integración completa**:
   - Stores para Resources y Metrics ✅ **metricsStore completado en Fase 3.7**
   - Auto-refetch tras mutaciones
   - Optimistic updates

---

## [16 Enero 2026] – Fase 3.7 – Formulario de Métricas con Asociación a Recursos

### Qué se implementó

Sistema completo de CRUD para métricas siguiendo el patrón moderno establecido en Fase 3.5 (React Hook Form + Yup + Zustand), con la capacidad de asociar múltiples recursos a cada métrica.

**Componentes creados**:
- `schemas/metricFormSchema.ts` - Validaciones con Yup para formulario de métricas
- `stores/metricsStore.ts` - Estado global con Zustand para métricas
- `components/MetricForm.tsx` - Formulario con RHF y validación en tiempo real
- `components/MetricModal.tsx` - Modal reutilizable para crear/editar métricas
- Integración completa en `pages/MetricsPage.tsx`

**Funcionalidad API agregada**:
- `apiClient.deleteMetric()` - Eliminar métrica por ID (faltaba en apiClient)

### Schema de validación (metricFormSchema.ts)

**Campos validados**:

```typescript
{
  key: string;        // Obligatorio, formato: lowercase + números + underscores, 2-50 chars
  label: string;      // Obligatorio, 2-100 caracteres
  description: string; // Opcional, máx 500 caracteres
  unit: string;       // Opcional, máx 20 caracteres (ej: "commits", "horas")
  periodType: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'; // Opcional, default: WEEK
  resourceIds: string[]; // Obligatorio, array de IDs de recursos (mínimo 1)
}
```

**Reglas especiales**:
- `key`: Solo letras minúsculas, números y underscores (regex: `/^[a-z0-9_]+$/`)
- `periodType`: Enum con 4 opciones (WEEK, MONTH, QUARTER, YEAR)
- `resourceIds`: Array con al menos 1 recurso seleccionado

**Workaround de tipos**:
- Se usa interfaz manual (`MetricFormData`) en lugar de `yup.InferType`
- Type assertion `as any` en `yupResolver` por problemas con campos opcionales
- Patrón consistente con `recordFormSchema.ts`

### Store de métricas (metricsStore.ts)

**Estado**:
```typescript
{
  metrics: Metric[];           // Array de métricas
  loading: boolean;           // Indicador de carga
  error: string | null;       // Mensaje de error
  isModalOpen: boolean;       // Control de modal
  editingMetric: Metric | null; // Métrica en edición (null = crear nuevo)
}
```

**Acciones**:
- `setModalOpen(isOpen)` - Abrir/cerrar modal, limpia editingMetric al cerrar
- `setEditingMetric(metric)` - Preparar métrica para edición
- `fetchMetrics()` - GET /metrics
- `createMetric(data)` - POST /metrics, auto-refetch tras éxito
- `updateMetric(id, data)` - PATCH /metrics/:id, auto-refetch tras éxito
- `deleteMetric(id)` - DELETE /metrics/:id, auto-refetch tras éxito
- `reset()` - Resetear todo el estado

**Patrón de auto-refetch**:
Después de cada mutación (create/update/delete), se ejecuta automáticamente `fetchMetrics()` para mantener la UI sincronizada.

### Componente MetricForm

**Props**:
```typescript
{
  onSubmit: (data: MetricFormData) => void;
  initialMetric?: Metric | null;  // null = crear, Metric = editar
  resources: Resource[];           // Lista de recursos para asociación
}
```

**Características**:
- Usa `useForm` con `yupResolver(metricFormSchema) as any`
- Campo `key` deshabilitado en modo edición (no editable después de crear)
- Select para `periodType` con 4 opciones (Semanal, Mensual, Trimestral, Anual)
- **Selector de recursos**: Lista scrolleable con checkboxes para multi-select
- Reseteo automático del formulario cuando cambia `initialMetric` (useEffect)
- Validación en tiempo real con mensajes de error debajo de cada campo
- Botón dinámico: "Crear Métrica" o "Actualizar Métrica" según modo

**UI de asociación de recursos**:
```tsx
<div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
  {resources.map(resource => (
    <label className="flex items-center space-x-2">
      <input type="checkbox" value={resource.id} {...register('resourceIds')} />
      <span>{resource.name} ({resource.roleType})</span>
    </label>
  ))}
</div>
```

### Componente MetricModal

**Props simplificadas**:
```typescript
{
  resources: Resource[];  // Solo recursos necesarios
}
```

**Integración con Zustand**:
- Lee `isModalOpen`, `editingMetric`, `loading`, `error` del store
- Usa `setModalOpen()`, `createMetric()`, `updateMetric()` del store
- NO recibe callbacks externos (todo manejado por el store)

**Flujo**:
1. Usuario abre modal → `setModalOpen(true)` o `setEditingMetric(metric)`
2. Usuario llena formulario y envía
3. Modal llama `createMetric()` o `updateMetric()` según `editingMetric`
4. Store ejecuta API call, auto-refetch y cierra modal
5. Tabla se actualiza automáticamente

**Manejo de errores**:
- Banner rojo con mensaje de error si `error !== null`
- Loading spinner en footer mientras `loading === true`
- Cierre deshabilitado durante loading

### Integración en MetricsPage

**Cambios**:
- Reemplazado `useState` local por `useMetricsStore()`
- Agregado `useResources()` para obtener lista de recursos
- useEffect para `fetchMetrics()` al montar
- Botones "Editar" y "Eliminar" ahora funcionales:
  - Editar → `setEditingMetric(metric)`
  - Eliminar → `deleteMetric(id)` con confirmación
- Modal al final del componente: `<MetricModal resources={resources} />`
- Eliminado modal placeholder de líneas 166-182

**Tabla de métricas**:
```tsx
<tbody>
  {metrics.map(metric => (
    <tr>
      <td>{metric.label}</td>
      <td><code>{metric.key}</code></td>
      <td>{metric.description || 'Sin descripción'}</td>
      <td>{metric.unit || '-'}</td>
      <td>
        <button onClick={() => handleEdit(metric)}>Editar</button>
        <button onClick={() => handleDelete(metric.id)}>Eliminar</button>
      </td>
    </tr>
  ))}
</tbody>
```

### Decisiones técnicas

**1. Asociación de recursos**

**Problema**: La interfaz `Metric` del backend NO tiene campo `resourceIds`.

```typescript
// Backend actual (apiClient.ts)
export interface Metric {
  id: string;
  key: string;
  label: string;
  description?: string;
  unit?: string;
  periodType?: string;
  // ❌ No existe resourceIds
}
```

**Solución temporal**:
- Frontend incluye `resourceIds` en el formulario (validación obligatoria)
- Se envía en `createMetric()` y `updateMetric()` pero backend aún no lo procesa
- TODO marcado en `metricsStore.ts` líneas 76 y 112: "Manejar resourceIds - puede requerir endpoint adicional"

**Próximo paso**: Agregar soporte en backend para asociación métrica-recursos:
- Opción A: Extender DTO de métrica con `resourceIds?: string[]`
- Opción B: Crear endpoint separado POST `/metrics/:id/resources` con body `{ resourceIds: string[] }`
- Opción C: Tabla intermedia `metric_resources` con relación many-to-many

**2. Uso de apiClient existente**

Ya existían funciones CRUD para métricas en `apiClient.ts`:
- `getMetrics(resourceId?)` - línea 179
- `getMetric(id)` - línea 184
- `createMetric(data)` - línea 188
- `updateMetric(id, data)` - línea 194

Solo se agregó:
- `deleteMetric(id)` - línea 200 (faltaba)

**Nota**: Evitar duplicados. Inicialmente se intentó crear `upsertMetric()` pero ya existían funciones separadas.

**3. Diferencia con Records**

| Aspecto | RecordsStore | MetricsStore |
|---------|--------------|--------------|
| Función crear | `upsertRecord()` | `createMetric()` |
| Función editar | `upsertRecord()` | `updateMetric()` |
| Backend | POST /records (upsert) | POST /metrics + PATCH /metrics/:id |

Ambos siguen el mismo patrón de auto-refetch después de mutaciones.

### Archivos modificados

**Nuevos archivos (4)**:
```
apps/frontend/src/schemas/metricFormSchema.ts      (48 líneas)
apps/frontend/src/stores/metricsStore.ts          (143 líneas)
apps/frontend/src/components/MetricForm.tsx       (218 líneas)
apps/frontend/src/components/MetricModal.tsx       (98 líneas)
```

**Archivos modificados (2)**:
```
apps/frontend/src/services/apiClient.ts           (+7 líneas, deleteMetric)
apps/frontend/src/pages/MetricsPage.tsx           (eliminado placeholder, +integración)
```

### Validación

**Build exitoso**:
```bash
✓ 871 modules transformed
dist/assets/index-BXLZb2Uf.js  680.68 kB │ gzip: 197.21 kB
✓ built in 2.43s
```

**Commits**:
```
51f882b - feat(frontend): implementar formulario de métricas con asociación a recursos
```

**Funcionalidad probada**:
- ✅ Compilación sin errores TypeScript
- ✅ Validación de Yup en tiempo real
- ✅ Modal se abre/cierra correctamente
- ✅ Zustand store funcional (crear/editar/eliminar)
- ✅ Multi-select de recursos con checkboxes
- ✅ Auto-refetch después de mutaciones
- ⏳ **Pendiente**: Integración backend para `resourceIds` (TODO en código)

### Patrón establecido

Este es el **patrón definitivo** para todos los formularios CRUD en PulseOps:

1. **Schema de validación** (`schemas/[entity]FormSchema.ts`):
   - Yup schema con validaciones
   - Interfaz manual (no `InferType`) para compatibilidad
   - Type assertion `as any` en resolver

2. **Store de Zustand** (`stores/[entity]Store.ts`):
   - Estado: items, loading, error, isModalOpen, editing[Entity]
   - Acciones: setModalOpen, setEditing[Entity], fetch, create, update, delete, reset
   - Auto-refetch después de mutaciones

3. **Formulario** (`components/[Entity]Form.tsx`):
   - useForm con yupResolver
   - Props: onSubmit, initial[Entity], dependencies
   - useEffect para reset cuando cambia initial[Entity]
   - Validación en tiempo real con mensajes de error

4. **Modal** (`components/[Entity]Modal.tsx`):
   - Props mínimas (solo dependencias externas)
   - Integración total con store (no callbacks externos)
   - Manejo de loading y errores desde store

5. **Página** (`pages/[Entity]Page.tsx`):
   - useEffect para fetch al montar
   - Tabla con botones edit/delete
   - Modal al final del componente

### Beneficios del patrón

- **Consistencia**: Mismo flujo en todos los formularios
- **Mantenibilidad**: Stores centralizados y reutilizables
- **Type safety**: TypeScript + Yup + interfaces manuales
- **UX**: Auto-refetch mantiene UI sincronizada
- **Escalabilidad**: Fácil agregar nuevas entidades

### Próximos pasos

1. **Backend - Asociación de recursos**: ✅ **COMPLETADO en commit c8f5636**
   - Extender DTO de métricas con `resourceIds` ✅
   - Crear/modificar tabla `metric_resources` ✅
   - Endpoint para asociar/desasociar recursos ✅

2. **ResourceForm + ResourceModal**:
   - Aplicar mismo patrón (RHF + Yup + Zustand)
   - resourceFormSchema.ts
   - resourcesStore.ts
   - ResourceForm.tsx
   - ResourceModal.tsx
   - Integrar en ResourcesPage

3. **Edición de registros**:
   - Botón "Editar" en RecordsPage
   - Poblar RecordForm con datos existentes
   - `setEditingRecord()` en recordsStore

4. **Funcionalidad de eliminación mejorada**:
   - Confirmación modal personalizada (no `confirm()` nativo)
   - Toast notifications (success/error)
   - Undo capability (opcional)

5. **Mejoras de tabla**: ✅ **PARCIALMENTE COMPLETADO en Fase 3.8**
   - Skeleton loaders reutilizables ✅
   - Paginación (react-table o TanStack Table)
   - Sorting por columnas
   - Búsqueda/filtros avanzados
   - Bulk actions (seleccionar múltiples y eliminar)

---

## [16 Enero 2026] – Fase 3.8 – Componentes de Loading y Skeleton Loaders

### Qué se implementó

Sistema de componentes reutilizables para mejorar la UX durante operaciones asíncronas y carga de datos.

**Componentes creados**:
- `components/TableSkeleton.tsx` - Skeleton loader reutilizable para tablas
- `components/LoadingButton.tsx` - Botón con spinner integrado
- Integración en MetricsPage y MetricForm

**Fix aplicado**:
- Backend: asegurar que `resourceIds` siempre sea array vacío si no se provee

### TableSkeleton - Componente reutilizable

**Props configurables**:
```typescript
{
  columns: number;      // Número de columnas a renderizar
  rows?: number;        // Número de filas (default: 5)
  showActions?: boolean; // Mostrar columna de acciones (default: true)
}
```

**Características**:
- Animación de pulso con Tailwind (`animate-pulse`)
- Header con barras de carga en gris oscuro
- Filas con anchos variables para simular contenido real
- Última columna renderiza botones skeleton si `showActions=true`
- Responsive: anchos adaptativos según posición de columna
- Tema oscuro integrado (bg-gray-700, bg-gray-800)

**Ejemplo de uso**:
```tsx
<TableSkeleton columns={5} rows={6} showActions={true} />
```

**Anchos generados automáticamente**:
```typescript
const widths = ['w-32', 'w-24', 'w-48', 'w-20', 'w-28'];
// Se rotan según índice de columna para variedad visual
```

### LoadingButton - Botón con estado de carga

**Props**:
```typescript
{
  loading?: boolean;     // Estado de carga
  children: ReactNode;   // Contenido del botón
  variant?: 'primary' | 'secondary' | 'danger'; // Estilo
  ...HTMLButtonAttributes; // Props nativas de button
}
```

**Variantes de estilo**:
```typescript
{
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'bg-gray-600 hover:bg-gray-700',
  danger: 'bg-red-600 hover:bg-red-700'
}
```

**Características**:
- Spinner SVG con animación de rotación (`animate-spin`)
- Deshabilita automáticamente cuando `loading=true`
- Opacity reducida cuando disabled (`disabled:opacity-50`)
- Cursor not-allowed cuando disabled
- Gap automático entre spinner e ícono
- Focus ring configurable por variante

**SVG Spinner**:
- Circle con opacity 25% (fondo)
- Path con opacity 75% (segmento giratorio)
- Tamaño: 20x20px (h-5 w-5)
- Color: inherit del botón

### Integración en MetricsPage

**Antes**:
```tsx
{loading && (
  <div className="p-8 text-center">
    <div className="animate-spin ..."></div>
    <p>Cargando métricas...</p>
  </div>
)}
```

**Después**:
```tsx
{loading && <TableSkeleton columns={5} rows={6} showActions={true} />}
```

**Beneficios**:
- Mantiene estructura visual de la tabla
- Usuario ve exactamente qué se está cargando
- Reduce sensación de espera
- Profesional y moderno

### Integración en MetricForm

**Cambios**:
1. Agregada prop `loading?: boolean` a MetricFormProps
2. Reemplazado `<button>` por `<LoadingButton>`
3. Pasado `loading` desde MetricModal
4. Texto dinámico: "Crear Métrica" / "Actualizar Métrica"

**Flujo completo**:
```
Usuario submit form
  → MetricModal.handleSubmit()
  → loading=true (Zustand)
  → LoadingButton muestra spinner
  → apiClient.createMetric() / updateMetric()
  → Auto-refetch
  → loading=false
  → Modal se cierra
```

### Fix backend - resourceIds

**Problema**: 
Error 500 al crear métrica porque `resourceIds` llegaba como `undefined` y MongoDB no lo manejaba bien.

**Solución**:
```typescript
async create(dto: CreateMetricDto, createdBy: string): Promise<Metric> {
  const metric = new this.metricModel({
    ...dto,
    resourceIds: dto.resourceIds || [], // ← Siempre array
    createdBy,
  });
  return metric.save();
}
```

**Resultado**: Métricas se crean correctamente incluso sin recursos asociados.

### Patrones establecidos

**1. Skeleton loaders**:
- Componente base reutilizable
- Props para personalizar columnas/filas/acciones
- Anchos variables para realismo
- Integrar en cualquier tabla del proyecto

**2. Loading buttons**:
- Componente wrapper de button
- Props nativas + loading + variant
- Deshabilita y muestra spinner automáticamente
- Reutilizable en todos los formularios

**3. Estados de carga consistentes**:
- Zustand store maneja loading global
- Componentes leen directamente del store
- No props drilling de estados de carga
- UX consistente en toda la app

### Archivos modificados/creados

**Nuevos (2)**:
```
apps/frontend/src/components/TableSkeleton.tsx     (62 líneas)
apps/frontend/src/components/LoadingButton.tsx     (57 líneas)
```

**Modificados (4)**:
```
apps/frontend/src/components/MetricForm.tsx        (+2 líneas: prop loading)
apps/frontend/src/components/MetricModal.tsx       (+1 línea: pass loading)
apps/frontend/src/pages/MetricsPage.tsx           (-7 líneas: usa TableSkeleton)
apps/backend/src/metrics/metrics.service.ts       (+1 línea: resourceIds default)
```

### Validación

**Build exitoso**:
```bash
✓ 873 modules transformed
dist/assets/index-ByH4RO1d.js  684.10 kB │ gzip: 198.06 kB
✓ built in 2.89s
```

**Commits**:
```
de6fcb1 - feat(frontend): agregar componentes de loading y skeleton
```

**Funcionalidad probada**:
- ✅ TableSkeleton renderiza correctamente con diferentes props
- ✅ LoadingButton muestra spinner cuando loading=true
- ✅ MetricsPage usa skeleton durante carga
- ✅ MetricForm deshabilita botón durante submit
- ✅ Backend crea métricas sin error 500

### Próximos usos de estos componentes

**TableSkeleton puede usarse en**:
- ResourcesPage (cuando se implemente)
- RecordsPage (reemplazar spinner actual)
- Cualquier tabla futura del dashboard
- Configuración: ajustar `columns` según tabla

**LoadingButton puede usarse en**:
- ResourceForm (botones crear/editar)
- RecordForm (botón guardar)
- Botones de eliminación con confirmación
- Cualquier acción async en formularios
- Diferentes variantes según contexto

### Beneficios de UX

**Sin skeleton**:
- Pantalla vacía o spinner genérico
- Usuario no sabe qué esperar
- Sensación de demora mayor

**Con skeleton**:
- Usuario ve estructura de la tabla
- Comprensión inmediata de qué se carga
- Percepción de velocidad mejorada
- Experiencia más profesional

**Sin LoadingButton**:
- Botón clickeable múltiples veces
- Sin feedback visual de progreso
- Posibles requests duplicados

**Con LoadingButton**:
- Botón se deshabilita automáticamente
- Spinner indica progreso claramente
- Previene clicks duplicados
- UX estándar de aplicaciones modernas

### Próximos pasos (actualizados)

1. **Aplicar LoadingButton en RecordForm**:
   - Reemplazar botón submit actual
   - Usar variant="primary"

2. **Aplicar TableSkeleton en RecordsPage**:
   - Reemplazar spinner de carga
   - columns={5} (Semana, Valor, Fuente, Timestamp, Acciones)

3. **ResourceForm completo con loading states**:
   - resourceFormSchema.ts
   - resourcesStore.ts
   - ResourceForm con LoadingButton
   - ResourceModal
   - ResourcesPage con TableSkeleton

4. **Confirmación modal de eliminación**:
   - Componente ConfirmDialog reutilizable
   - LoadingButton en botones de confirmar
   - Integrar en delete de todas las entidades

5. **Toast notifications**:
   - Biblioteca: react-hot-toast o similar
   - Success toast después de create/update
   - Error toast con mensaje específico
   - Info toast para acciones relevantes

---

## [16 Enero 2026] – Fase 3.9 – Sistema Centralizado de Manejo de Errores

### Contexto y motivación

Durante la implementación de la Fase 3.8, se detectó un error 500 al crear métricas que exponía la necesidad de un sistema robusto de manejo de errores. Los errores se manejaban de forma inconsistente:

- **Backend**: Errores genéricos sin contexto
- **Frontend**: `console.error()` disperso, sin centralización
- **UX**: Mensajes técnicos expuestos al usuario
- **Debugging**: Difícil rastrear origen de errores

Se decidió implementar un **sistema centralizado de manejo de errores** siguiendo principios SOLID, específicamente:

- ✅ **Responsabilidad Única**: Cada clase tiene una única razón para cambiar
- ✅ **Abierto/Cerrado**: Abierto a extensión, cerrado a modificación
- ✅ **Patrón Factory**: Para crear instancias de errores
- ✅ **Arquitectura por contratos**: Respuestas estandarizadas

### Qué se implementó

#### Backend - Sistema de excepciones

**Estructura creada**:
```
apps/backend/src/common/
├── exceptions/
│   └── app.exception.ts        # Excepciones personalizadas
└── filters/
    └── global-exception.filter.ts  # Filtro global
```

**Excepciones disponibles**:
- `AppException` - Clase base abstracta
- `ValidationException` (400) - Errores de validación
- `ResourceNotFoundException` (404) - Recurso no encontrado
- `DuplicateResourceException` (409) - Recurso duplicado
- `BusinessLogicException` (422) - Error de lógica de negocio
- `DatabaseException` (500) - Error de base de datos
- `UnauthorizedException` (401) - No autorizado
- `ForbiddenException` (403) - Acceso prohibido

**Respuesta estandarizada**:
```json
{
  "statusCode": 409,
  "message": "Métrica con key 'commits' ya existe",
  "errorCode": "DUPLICATE_RESOURCE",
  "details": {
    "resource": "Métrica",
    "field": "key",
    "value": "commits"
  },
  "timestamp": "2026-01-16T12:34:56.789Z",
  "path": "/metrics"
}
```

**GlobalExceptionFilter**:
- Intercepta todas las excepciones
- Formatea respuestas de error
- Logging diferencial (5xx vs 4xx)
- Preserva stack traces en desarrollo

#### Frontend - Sistema de errores

**Estructura creada**:
```
apps/frontend/src/utils/errors/
├── AppError.ts          # Clases de error base
├── ErrorFactory.ts      # Factory (Patrón Factory)
├── ErrorHandler.ts      # Handler centralizado
└── index.ts            # Barrel export
```

**Clases de error disponibles**:
- `AppError` - Clase base abstracta
- `ValidationError` (400)
- `NotFoundError` (404)
- `ConflictError` (409)
- `BusinessError` (422)
- `NetworkError` (0)
- `ServerError` (500)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `UnknownError` (0)

**Métodos abstractos**:
```typescript
abstract getUserMessage(): string;    // Mensaje user-friendly
abstract isRecoverable(): boolean;    // Indica si es recuperable
```

**ErrorFactory - Patrón Factory**:
```typescript
// Crea errores desde respuestas del backend
ErrorFactory.fromBackendResponse(response: BackendErrorResponse): AppError

// Crea errores desde códigos HTTP
ErrorFactory.fromStatusCode(statusCode: number, message: string): AppError

// Crea errores desde excepciones de fetch
ErrorFactory.fromFetchError(error: unknown): AppError

// Permite extensión sin modificar código base
ErrorFactory.registerErrorCreator(errorCode: string, creator: ErrorCreator)
```

**ErrorHandler - Handler centralizado**:
```typescript
// Procesa errores HTTP
ErrorHandler.handleHttpError(response: Response, callbacks?: ErrorHandlerCallbacks)

// Procesa errores genéricos
ErrorHandler.handleGenericError(error: unknown, callbacks?: ErrorHandlerCallbacks)

// Wrapper try-catch automático
ErrorHandler.tryCatch<T>(fn: () => Promise<T>, callbacks?: ErrorHandlerCallbacks)

// Configura callbacks globales
ErrorHandler.setDefaultCallbacks(callbacks: ErrorHandlerCallbacks)
```

### Integración

#### Backend - MetricsService

**Antes**:
```typescript
async create(dto: CreateMetricDto): Promise<Metric> {
  const metric = new this.metricModel(dto);
  return metric.save();
}
```

**Después**:
```typescript
async create(dto: CreateMetricDto, createdBy: string): Promise<Metric> {
  try {
    const existing = await this.metricModel.findOne({ key: dto.key }).exec();
    if (existing) {
      throw new DuplicateResourceException('Métrica', 'key', dto.key);
    }

    const metric = new this.metricModel({
      ...dto,
      resourceIds: dto.resourceIds || [],
      createdBy,
    });
    return await metric.save();
  } catch (error) {
    if (error instanceof DuplicateResourceException) {
      throw error; // Re-lanzar excepciones conocidas
    }
    throw new DatabaseException('Error al crear la métrica', {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}
```

**Beneficios**:
- Validación de duplicados antes de insertar
- Mensajes de error descriptivos
- Detalles contextuales en `details`
- Stack traces preservados

#### Frontend - apiClient

**Antes**:
```typescript
async function fetchJSON<T>(endpoint: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, 'Error');
  }
  return response.json();
}
```

**Después**:
```typescript
async function fetchJSON<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return await ErrorHandler.handleHttpError(response);
    }

    return response.json();
  } catch (error) {
    return ErrorHandler.handleGenericError(error);
  }
}
```

**Beneficios**:
- Manejo centralizado de errores HTTP
- Transformación automática a AppError
- Mensajes user-friendly
- Callbacks configurables

#### Frontend - metricsStore

**Antes**:
```typescript
fetchMetrics: async () => {
  try {
    const metrics = await apiClient.getMetrics();
    set({ metrics });
  } catch (error) {
    set({ error: error.message }); // Mensaje técnico expuesto
  }
}
```

**Después**:
```typescript
fetchMetrics: async () => {
  set({ loading: true, error: null });
  try {
    const metrics = await apiClient.getMetrics();
    set({ metrics, loading: false });
  } catch (error) {
    const errorMessage = error instanceof AppError 
      ? error.getUserMessage() 
      : 'Error al cargar métricas';
    set({ error: errorMessage, loading: false });
  }
}
```

**Beneficios**:
- Mensajes user-friendly separados de técnicos
- Consistencia en manejo de errores
- Recuperabilidad explícita

### Principios SOLID aplicados

#### 1. Responsabilidad Única (SRP)

**Cada clase tiene una única responsabilidad**:
- `AppException`: Representar un tipo de error específico
- `GlobalExceptionFilter`: Interceptar y formatear errores
- `ErrorFactory`: Crear instancias de errores
- `ErrorHandler`: Procesar errores y ejecutar callbacks
- `AppError`: Representar errores del frontend con mensajes user-friendly

#### 2. Abierto/Cerrado (OCP)

**Sistema extensible sin modificar código base**:

```typescript
// Agregar nuevo tipo de error sin modificar ErrorFactory
export class RateLimitError extends AppError {
  constructor(message: string, retryAfter: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
  }

  getUserMessage(): string {
    return `Demasiadas solicitudes. Intenta en ${this.details.retryAfter}s`;
  }

  isRecoverable(): boolean {
    return true;
  }
}

// Registrar dinámicamente en el factory
ErrorFactory.registerErrorCreator(
  'RATE_LIMIT_EXCEEDED',
  (response) => new RateLimitError(response.message, response.details.retryAfter)
);
```

**No se modifica**:
- ErrorFactory core
- ErrorHandler core
- GlobalExceptionFilter

**Se extiende**:
- Nuevas clases de error
- Nuevos error creators
- Nuevos callbacks

#### 3. Sustitución de Liskov (LSP)

Todas las subclases de `AppError` pueden sustituir a la clase base:

```typescript
function handleError(error: AppError) {
  console.log(error.getUserMessage());  // Funciona con cualquier subclase
  if (error.isRecoverable()) {
    // Reintentar
  }
}
```

#### 4. Segregación de Interfaces (ISP)

Callbacks específicos en lugar de una interfaz genérica:

```typescript
interface ErrorHandlerCallbacks {
  onValidationError?: (error: AppError) => void;
  onNotFoundError?: (error: AppError) => void;
  onServerError?: (error: AppError) => void;
  onNetworkError?: (error: AppError) => void;
  onAnyError?: (error: AppError) => void;
}
```

Cada callback es opcional, permitiendo implementar solo lo necesario.

#### 5. Inversión de Dependencias (DIP)

```typescript
// Alto nivel depende de abstracción (ErrorHandler)
// Bajo nivel implementa abstracción (AppError subclasses)

// Alto nivel
async fetchMetrics() {
  try {
    return await apiClient.getMetrics();
  } catch (error) {
    if (error instanceof AppError) {  // Abstracción
      return error.getUserMessage();
    }
  }
}

// Bajo nivel
class ValidationError extends AppError {
  getUserMessage(): string {  // Implementa abstracción
    return 'Los datos no son válidos';
  }
}
```

### Archivos modificados/creados

**Nuevos (7)**:
```
apps/backend/src/common/exceptions/app.exception.ts           (101 líneas)
apps/backend/src/common/filters/global-exception.filter.ts    (109 líneas)
apps/frontend/src/utils/errors/AppError.ts                    (167 líneas)
apps/frontend/src/utils/errors/ErrorFactory.ts                (95 líneas)
apps/frontend/src/utils/errors/ErrorHandler.ts                (103 líneas)
apps/frontend/src/utils/errors/index.ts                       (6 líneas)
ERROR_HANDLING.md                                             (452 líneas)
```

**Modificados (4)**:
```
apps/backend/src/main.ts                          (+4 líneas: GlobalExceptionFilter)
apps/backend/src/metrics/metrics.service.ts       (+60 líneas: manejo de errores)
apps/frontend/src/services/apiClient.ts           (+8 líneas: ErrorHandler)
apps/frontend/src/stores/metricsStore.ts          (+16 líneas: AppError checks)
```

### Validación

**Build backend**:
```bash
✓ Compilación exitosa
✓ 0 errores TypeScript
✓ GlobalExceptionFilter registrado en main.ts
```

**Build frontend**:
```bash
✓ 877 modules transformed
dist/assets/index-DwBlsOH7.js  688.36 kB │ gzip: 199.51 kB
✓ built in 3.57s
```

**Commits**:
```
951a964 - feat: implementar sistema centralizado de manejo de errores
```

**Funcionalidad validada**:
- ✅ Backend lanza DuplicateResourceException al crear métrica con key existente
- ✅ GlobalExceptionFilter formatea respuesta con errorCode y details
- ✅ Frontend transforma respuesta HTTP a AppError correctamente
- ✅ getUserMessage() retorna mensajes user-friendly
- ✅ metricsStore muestra mensajes amigables en lugar de técnicos
- ✅ Stack traces preservados en desarrollo

### Beneficios obtenidos

#### 1. Centralización

**Antes**:
- 9 lugares con `console.error()` dispersos
- Cada catch block con lógica diferente
- Sin formato estándar de respuestas

**Después**:
- Un único punto de entrada: ErrorHandler
- Un único filtro global: GlobalExceptionFilter
- Respuestas estandarizadas en toda la app

#### 2. Type Safety

```typescript
// IntelliSense completo
const error = ErrorFactory.fromStatusCode(400, 'Invalid');
error.getUserMessage();  // ✅ TypeScript conoce el método
error.isRecoverable();   // ✅ TypeScript conoce el método
error.statusCode;        // ✅ number
error.code;             // ✅ string
```

#### 3. Extensibilidad

**Sin modificar código existente**:
```typescript
// 1. Crear nueva clase de error
class CustomError extends AppError { ... }

// 2. Registrar en factory
ErrorFactory.registerErrorCreator('CUSTOM_CODE', creator);

// 3. Usar automáticamente en toda la app
```

#### 4. UX Mejorada

**Antes**:
```
Error: Request failed
```

**Después**:
```
Métrica con key 'commits' ya existe
Los datos ingresados no son válidos
Error de conexión. Verifica tu internet.
```

#### 5. Debugging

**Contexto completo en errores**:
```json
{
  "statusCode": 409,
  "message": "Métrica con key 'commits' ya existe",
  "errorCode": "DUPLICATE_RESOURCE",
  "details": {
    "resource": "Métrica",
    "field": "key",
    "value": "commits"
  },
  "timestamp": "2026-01-16T12:34:56.789Z",
  "path": "/metrics"
}
```

### Casos de uso

#### 1. Validación de duplicados

```typescript
// Backend
const existing = await this.metricModel.findOne({ key: dto.key });
if (existing) {
  throw new DuplicateResourceException('Métrica', 'key', dto.key);
}

// Frontend recibe
{
  "statusCode": 409,
  "message": "Métrica con key 'commits' ya existe",
  "errorCode": "DUPLICATE_RESOURCE"
}

// Store muestra
"El recurso ya existe"
```

#### 2. Recurso no encontrado

```typescript
// Backend
const metric = await this.metricModel.findOne({ key });
if (!metric) {
  throw new ResourceNotFoundException('Métrica', key);
}

// Frontend recibe
{
  "statusCode": 404,
  "message": "Métrica con identificador 'commits' no encontrado",
  "errorCode": "RESOURCE_NOT_FOUND"
}

// Store muestra
"El recurso solicitado no fue encontrado"
```

#### 3. Error de red

```typescript
// Frontend detecta error de fetch
try {
  const response = await fetch(url);
} catch (error) {
  // ErrorHandler crea NetworkError
  return ErrorHandler.handleGenericError(error);
}

// Usuario ve
"Error de conexión. Por favor, verifica tu conexión a internet."
```

### Documentación

Archivo **ERROR_HANDLING.md** (452 líneas):

**Contenido**:
1. Arquitectura del sistema
2. Backend - Excepciones y filtro
3. Frontend - Errores, factory y handler
4. Ejemplos de uso en services y stores
5. Guía de extensibilidad
6. Configuración de callbacks globales
7. Testing patterns
8. Próximos pasos

**Formato**:
- Diagramas de arquitectura
- Código de ejemplo
- Casos de uso reales
- Guías paso a paso

### Próximos pasos

1. **Toast notifications** ✅ **SIGUIENTE**:
   - Biblioteca: react-hot-toast
   - Integrar con ErrorHandler.setDefaultCallbacks()
   - Success toast después de create/update
   - Error toast con getUserMessage()
   - Configurar colores según severity

2. **Aplicar en resourcesStore y recordsStore**:
   - Replicar patrón de metricsStore
   - Usar AppError en todos los catch blocks
   - Mensajes user-friendly consistentes

3. **Aplicar en otros services del backend**:
   - ResourcesService con manejo de errores
   - RecordsService con validaciones
   - AnalysisService con errores de negocio

4. **Tests unitarios**:
   - Backend: Tests de excepciones personalizadas
   - Backend: Tests de GlobalExceptionFilter
   - Frontend: Tests de ErrorFactory
   - Frontend: Tests de ErrorHandler
   - Cobertura > 80%

5. **Logging centralizado** (opcional):
   - Integrar con servicio de logging (Sentry, LogRocket)
   - Trackear errores en producción
   - Métricas de error rates
   - Alertas automáticas

### Lecciones aprendidas

1. **Errores son ciudadanos de primera clase**: Merecen la misma atención arquitectónica que features
2. **SOLID no es overhead**: Facilita extensión y mantenimiento a largo plazo
3. **Mensajes user-friendly son críticos**: Separar mensajes técnicos de UX
4. **Type safety reduce bugs**: TypeScript detecta errores en tiempo de desarrollo
5. **Documentación es esencial**: ERROR_HANDLING.md asegura consistencia en el equipo

### Impacto en arquitectura

**Antes**: Sistema reactivo a errores (handling ad-hoc)
**Después**: Sistema proactivo (arquitectura de errores bien definida)

**Beneficios a largo plazo**:
- ✅ Fácil agregar nuevos tipos de error
- ✅ Consistencia en toda la aplicación
- ✅ Debugging más rápido
- ✅ UX profesional
- ✅ Preparado para monitoreo en producción

