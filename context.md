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

* Node.js
* NestJS
* TypeScript
* Arquitectura orientada a dominio
* WebSockets para eventos

### Base de datos

* MongoDB local
* Persistencia de:

  * series temporales
  * evaluaciones
  * reglas versionadas

### Infraestructura (conceptual)

* AWS (ECS, S3, EventBridge)
* Docker / Docker Compose

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
	2.	Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md
	3.	Motor de análisis de inclinación y condiciones.md
	4.	Fórmulas de las condiciones.md

Reglas:
	•	Si hay ambigüedad → preferir contratos sobre implementación
	•	Si hay conflicto → prevalece context.md
	•	Las fórmulas definen comportamiento, no valores fijos
	•	Las condiciones dependen de inclinación y tendencia histórica, no de thresholds absolutos
