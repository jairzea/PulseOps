# PulseOps — Producto

PulseOps es un sistema de evaluación operativa basado en el **comportamiento temporal** de métricas, no en valores absolutos. Centraliza, normaliza y evalúa estadísticas operativas del equipo, analiza su tendencia en el tiempo (inclinación) y asigna **condiciones operativas** basadas en las fórmulas de Hubbard.

## Para quién

- **Product Owner operativo (Laura Corredor):** usa la plataforma a diario para evaluar la condición de producción de cada persona del equipo. Hoy lo hace manualmente (~1h por ciclo de graficado y cálculo). PulseOps debe automatizar ese proceso.
- **Arquitecto / dev (Jair Zea):** define alcance y arquitectura. La IA escribe la mayor parte del código.

## Qué resuelve

Reemplaza un proceso manual y frágil (conteo a mano, dependencia de Jira, fórmulas implícitas) por:
- Ingesta normalizada (CSV/JSON, futuro Jira).
- Análisis de series temporales semanales.
- Asignación automática de condiciones operativas con explicación.
- Visualización histórica + pipeline de análisis.
- Playbooks de acción por condición.

## Estado actual del objetivo

El objetivo **ya no es demo en vivo**: el producto avanza hacia **producción**. Esto eleva el listón en seguridad, estabilidad técnica, validación en fronteras de confianza y manejo de errores. Las decisiones deben priorizar robustez productiva sobre completitud de features de demo.

## Concepto clave: condiciones operativas

Jerarquía oficial (de mayor a menor nivel operativo): PODER, AFLUENCIA, NORMAL, EMERGENCIA, PELIGRO, INEXISTENCIA, SIN_DATOS. CAMBIO_DE_PODER existe en tipos pero **no es detectable por el motor** (requiere contexto externo). La condición depende de la **inclinación** y la **tendencia histórica**, nunca de umbrales absolutos fijos.

## Idioma

Producto, documentación, specs y comunicación en **español**. El código (identificadores, tipos) en inglés siguiendo la convención existente del repo.
