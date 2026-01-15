/**
 * Construye el grafo (nodos y edges) para React Flow
 * a partir del resultado del analysis-engine
 */

import type { Node, Edge } from 'reactflow';
import type { MetricConditionEvaluation, MetricSeries } from '@pulseops/shared-types';
import { getMetricInfo } from '../demoData';

/**
 * Convierte resultado de análisis en estructura de grafo React Flow
 */
export function buildGraph(
  evaluation: MetricConditionEvaluation,
  series: MetricSeries
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const metricInfo = getMetricInfo(series.metricId);

  // Nodo 1: Source (origen de datos - mock)
  nodes.push({
    id: 'source',
    type: 'source',
    position: { x: 50, y: 100 },
    data: {
      label: 'Mock Data Source',
      description: metricInfo?.description || 'Serie temporal demo',
    },
  });

  // Nodo 2: MetricSeries
  nodes.push({
    id: 'metric-series',
    type: 'metricSeries',
    position: { x: 350, y: 100 },
    data: {
      metricId: series.metricId,
      pointsCount: series.points.length,
    },
  });

  // Edge: Source → MetricSeries
  edges.push({
    id: 'e-source-series',
    source: 'source',
    target: 'metric-series',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 2 },
  });

  // Nodo 3: Inclination
  nodes.push({
    id: 'inclination',
    type: 'inclination',
    position: { x: 680, y: 100 },
    data: {
      value: evaluation.inclination.value,
      delta: evaluation.inclination.delta,
      previousValue: evaluation.inclination.previousValue,
      currentValue: evaluation.inclination.currentValue,
    },
  });

  // Edge: MetricSeries → Inclination
  edges.push({
    id: 'e-series-inclination',
    source: 'metric-series',
    target: 'inclination',
    animated: true,
    style: { stroke: '#a78bfa', strokeWidth: 2 },
  });

  // Nodo 4: Condition
  nodes.push({
    id: 'condition',
    type: 'condition',
    position: { x: 1000, y: 100 },
    data: {
      condition: evaluation.condition,
      reasonCode: evaluation.reason.code,
      explanation: evaluation.reason.explanation,
    },
  });

  // Edge: Inclination → Condition
  edges.push({
    id: 'e-inclination-condition',
    source: 'inclination',
    target: 'condition',
    animated: true,
    style: { stroke: '#34d399', strokeWidth: 2 },
  });

  // Nodo 5: Signals (si existen)
  if (evaluation.signals && evaluation.signals.length > 0) {
    nodes.push({
      id: 'signals',
      type: 'signals',
      position: { x: 1050, y: 350 },
      data: {
        signals: evaluation.signals,
      },
    });

    // Edge: Condition → Signals
    edges.push({
      id: 'e-condition-signals',
      source: 'condition',
      target: 'signals',
      animated: true,
      style: { stroke: '#818cf8', strokeWidth: 2 },
    });
  }

  return { nodes, edges };
}
