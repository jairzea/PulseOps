/**
 * Componentes personalizados de nodos para React Flow
 * Cada nodo representa una etapa del pipeline de análisis
 */

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';

/**
 * Nodo: Fuente de datos (mock)
 */
export function SourceNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg border-2 border-blue-400 min-w-[200px]">
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs font-mono text-blue-100">DATA SOURCE</span>
      </div>
      <div className="text-white font-semibold text-sm">
        {data.label}
      </div>
      <div className="text-blue-100 text-xs mt-1">
        {data.description}
      </div>
    </div>
  );
}

/**
 * Nodo: Serie de Métrica
 */
export function MetricSeriesNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg border-2 border-purple-400 min-w-[220px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <div className="text-xs font-mono text-purple-100 mb-1">METRIC SERIES</div>
      <div className="text-white font-bold">{data.metricId}</div>
      <div className="text-purple-100 text-xs mt-2">
        {data.pointsCount} períodos analizados
      </div>
    </div>
  );
}

/**
 * Nodo: Inclinación
 */
export function InclinationNode({ data }: NodeProps) {
  const isPositive = data.value !== null && data.value > 0;
  const isNegative = data.value !== null && data.value < 0;
  
  const bgColor = isPositive 
    ? 'from-green-500 to-green-700 border-green-400' 
    : isNegative 
    ? 'from-red-500 to-red-700 border-red-400'
    : 'from-gray-500 to-gray-700 border-gray-400';

  return (
    <div className={`px-6 py-4 rounded-lg bg-gradient-to-br ${bgColor} shadow-lg border-2 min-w-[200px]`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <div className="text-xs font-mono text-white/80 mb-1">INCLINACIÓN</div>
      <div className="text-white font-bold text-2xl">
        {data.value !== null ? `${data.value > 0 ? '+' : ''}${data.value.toFixed(1)}%` : 'N/A'}
      </div>
      <div className="text-white/80 text-xs mt-1">
        Δ {data.delta > 0 ? '+' : ''}{data.delta.toFixed(1)}
      </div>
    </div>
  );
}

/**
 * Nodo: Condición Hubbard
 */
export function ConditionNode({ data }: NodeProps) {
  const conditionColors: Record<string, string> = {
    PODER: 'from-yellow-400 to-yellow-600 border-yellow-300',
    AFLUENCIA: 'from-green-400 to-green-600 border-green-300',
    NORMAL: 'from-blue-400 to-blue-600 border-blue-300',
    EMERGENCIA: 'from-orange-400 to-orange-600 border-orange-300',
    PELIGRO: 'from-red-500 to-red-700 border-red-400',
    INEXISTENCIA: 'from-gray-600 to-gray-800 border-gray-500',
    SIN_DATOS: 'from-gray-500 to-gray-700 border-gray-400',
  };

  const bgColor = conditionColors[data.condition] || 'from-gray-500 to-gray-700 border-gray-400';

  return (
    <div className={`px-6 py-5 rounded-lg bg-gradient-to-br ${bgColor} shadow-xl border-2 min-w-[240px]`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <div className="text-xs font-mono text-white/90 mb-2">CONDICIÓN OPERATIVA</div>
      <div className="text-white font-bold text-lg mb-2">
        {data.condition}
      </div>
      <div className="text-white/80 text-xs">
        {data.reasonCode}
      </div>
      <div className="mt-2 text-white/70 text-xs italic">
        "{data.explanation}"
      </div>
    </div>
  );
}

/**
 * Nodo: Señales (meta-análisis)
 */
export function SignalsNode({ data }: NodeProps) {
  const severityColors: Record<string, string> = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-blue-500',
  };

  return (
    <div className="px-5 py-4 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg border-2 border-indigo-400 min-w-[260px] max-w-[300px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-xs font-mono text-indigo-100 mb-2">SEÑALES DETECTADAS</div>
      <div className="space-y-2">
        {data.signals.map((signal: any, idx: number) => (
          <div key={idx} className="bg-white/10 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${severityColors[signal.severity]}`}>
                {signal.severity}
              </span>
              <span className="text-white text-xs font-semibold">{signal.type}</span>
            </div>
            <div className="text-indigo-100 text-xs">
              {signal.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mapa de tipos de nodos para React Flow
 */
export const nodeTypes = {
  source: SourceNode,
  metricSeries: MetricSeriesNode,
  inclination: InclinationNode,
  condition: ConditionNode,
  signals: SignalsNode,
};
