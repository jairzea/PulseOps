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
- ❌ Formularios CRUD completos
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

1. Poblar backend con datos de prueba (seed scripts)
2. Implementar formularios de ingreso manual
3. Activar Auth0 para demo
4. Agregar WebSockets para updates en tiempo real

---
