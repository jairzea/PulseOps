🧠 Motor de Análisis de Inclinación y Condiciones

(Núcleo lógico de PulseOps)

⸻

1️⃣ Responsabilidad del motor (definición clara)

El motor NO:
	•	ingiere datos
	•	persiste datos
	•	renderiza UI
	•	conoce Jira
	•	conoce usuarios

El motor SÍ:
	•	recibe una serie temporal
	•	calcula la inclinación
	•	interpreta el comportamiento
	•	asigna una condición
	•	devuelve una explicación

👉 Es puro dominio.

⸻

2️⃣ Entrada y salida del motor

🔹 Entrada mínima

MetricSeries {
  resourceId
  metricKey
  history: [
    { week, value }
  ]
}

Requisitos:
	•	Al menos 2 semanas
	•	Ordenadas cronológicamente

⸻

🔹 Salida del motor

ConditionResult {
  condition
  inclination
  explanation
  confidence
}

Esto es importante:
	•	explanation → demo-friendly
	•	confidence → opcional, pero elegante

⸻

3️⃣ Fases internas del motor (pipeline)

El motor NO hace todo a la vez.
Tiene etapas claras.

Serie → Inclinación → Clasificación → Condición → Explicación


⸻

4️⃣ Fase 1: Selección del periodo evaluable

Por defecto:
	•	Se compara la última semana vs la anterior

E_ant → semana n-1
E_act → semana n

📌 En el futuro se puede extender, pero no ahora.

⸻

5️⃣ Fase 2: Cálculo matemático (inclinación)

Variables
	•	E_{act}
	•	E_{ant}
	•	\Delta E = E_{act} - E_{ant}

Fórmula base (única)

I = \frac{E_{act} - E_{ant}}{E_{ant}} \times 100

⸻

⚠️ Caso especial: E_{ant} \le 0

Este caso rompe porcentajes.

Regla del motor:
	•	Si E_ant <= 0 y E_act > 0 → inicio de existencia
	•	Si E_ant > 0 y E_act <= 0 → caída crítica
	•	Si ambos ≈ 0 → Confusión / Inexistencia

👉 Esto se evalúa antes de calcular I.

⸻

6️⃣ Fase 3: Clasificación de la inclinación

El motor traduce I a una categoría semántica:

InclinationType {
  direction: UP | FLAT | DOWN
  magnitude: SLIGHT | MODERATE | STEEP
}

Ejemplo conceptual:
	•	+5% → UP / SLIGHT
	•	+30% → UP / STEEP
	•	-12% → DOWN / MODERATE
	•	-70% → DOWN / STEEP

📌 Aquí ya se usan umbrales configurables.

⸻

7️⃣ Fase 4: Asignación de condición (jerárquica)

Las condiciones se evalúan de arriba hacia abajo:

Poder
Cambio de Poder
Afluencia
Funcionamiento Normal
Emergencia
Peligro
Inexistencia

Regla clave:

La primera condición que aplica, gana

⸻

Ejemplos de lógica (conceptual)
	•	Inexistencia
	•	caída casi vertical
	•	E_act ≈ 0
	•	Peligro
	•	inclinación negativa pronunciada
	•	Emergencia
	•	inclinación ≈ 0
	•	leve descenso
	•	Funcionamiento Normal
	•	leve crecimiento
	•	Afluencia
	•	crecimiento fuerte

⸻

Poder (caso especial)

No usa solo I.

Requiere:
	•	≥ N semanas
	•	Condición Normal sostenida
	•	Nivel alto relativo para el recurso

👉 El motor consulta el historial.

⸻

8️⃣ Fase 5: Generación de explicación (clave para el demo)

Ejemplo de explicación generada:

“La estadística pasó de 10 a 20 (+100%).
El crecimiento fue pronunciado, lo que indica una condición de Afluencia.”

Esto:
	•	no es UI
	•	no es hardcodeado
	•	es dominio

⸻

9️⃣ Decisiones importantes (explícitas)

✅ No ML
✅ No regresiones
✅ No promedios móviles (por ahora)
✅ No lógica por rol

Porque:

la inclinación ya explica el comportamiento

⸻

🔥 Qué acabamos de definir (y es enorme)

Con esto:
	•	Ya existe el core de PulseOps
	•	El resto es infraestructura
	•	El demo se vuelve trivial de armar
	•	El sistema es defendible ante arquitectos

⸻
