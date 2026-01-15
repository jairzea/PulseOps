🧠 Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2)

🎯 Objetivo del motor

Analizar series históricas de métricas operativas y determinar, para un período dado, una condición operativa basada en su inclinación (tendencia) dentro de una ventana configurable.

⸻

🧩 Conceptos clave (congelados)

1️⃣ Serie histórica
	•	Conjunto ordenado de valores en el tiempo
	•	No se muta, solo se extiende
	•	Es la fuente única de verdad

2️⃣ Ventana de análisis
	•	Subconjunto de la serie histórica
	•	Determina qué puntos se usan para evaluar la condición actual
	•	Por defecto: últimos 2 períodos
	•	Parametrizable

3️⃣ Condición operativa

Estado cualitativo derivado del cambio entre períodos:
	•	MEJORANDO
	•	ESTABLE
	•	DETERIORANDO
	•	SIN_DATOS

⸻

🏗️ Interfaz Técnica – Tipos compartidos (shared-types)

📄 MetricPoint

export interface MetricPoint {
  timestamp: string;        // ISO date (ej: inicio de semana)
  value: number;            // valor de la métrica
}


⸻

📄 MetricSeries

export interface MetricSeries {
  metricId: string;         // ej: "velocity", "bugs", "coverage"
  points: MetricPoint[];    // ordenados ascendentemente por tiempo
}


⸻

📄 AnalysisWindowConfig

export interface AnalysisWindowConfig {
  size: number;             // número de períodos a analizar (default: 2)
}


⸻

📄 TrendDirection

export type TrendDirection =
  | 'UP'
  | 'DOWN'
  | 'FLAT'
  | 'INSUFFICIENT_DATA';


⸻

📄 OperationalCondition

export type OperationalCondition =
  | 'MEJORANDO'
  | 'ESTABLE'
  | 'DETERIORANDO'
  | 'SIN_DATOS';


⸻

📄 TrendAnalysisResult

export interface TrendAnalysisResult {
  metricId: string;

  windowUsed: number;               // períodos realmente analizados
  direction: TrendDirection;

  delta: number | null;             // diferencia entre último y anterior
  condition: OperationalCondition;

  evaluatedAt: string;              // timestamp de evaluación
}


⸻

⚙️ Interfaz del Motor (analysis-engine)

📄 AnalysisEngine

export interface AnalysisEngine {
  analyze(
    series: MetricSeries,
    config?: AnalysisWindowConfig
  ): TrendAnalysisResult;
}


⸻

🔁 Responsabilidad del motor (MUY CLARO)

El motor:

✔️ NO persiste datos
✔️ NO grafica
✔️ NO decide periodicidad
✔️ NO muta la serie

El motor solo:
	•	toma una serie histórica
	•	aplica una ventana
	•	calcula inclinación
	•	devuelve una condición

⸻

📊 Relación con la gráfica (Frontend)
	•	El frontend:
	•	consume la serie completa
	•	grafica el histórico
	•	resalta el punto actual
	•	El resultado del motor:
	•	se muestra como estado (badge, color, etiqueta)
	•	se asocia al último punto

⸻

🧪 Ejemplo concreto (realista)

Serie:

[
  { timestamp: "2025-01-01", value: 22 },
  { timestamp: "2025-01-08", value: 25 }
]

Resultado:

{
  metricId: "velocity",
  windowUsed: 2,
  direction: "UP",
  delta: 3,
  condition: "MEJORANDO",
  evaluatedAt: "2025-01-08T23:59:59Z"
}


⸻

🧠 Por qué este diseño es correcto
	•	Escalable (más métricas)
	•	Parametrizable (ventanas, reglas futuras)
	•	Compatible con backend y frontend
	•	Fácil de testear
	•	Fácil de explicar en comité

⸻
