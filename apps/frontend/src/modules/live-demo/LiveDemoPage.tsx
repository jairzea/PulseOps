/**
 * PulseOps Live Demo - Página principal
 * 
 * Visualiza el análisis de series temporales usando el analysis-engine
 * y muestra el resultado en un grafo React Flow
 */

import { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import { analysisEngine } from '@pulseops/analysis-engine';
import type { MetricConditionEvaluation } from '@pulseops/shared-types';

import { DEMO_METRICS, getSeriesById, getMetricInfo } from './demoData';
import { buildGraph } from './flow/buildGraph';
import { nodeTypes } from './flow/nodeTypes';
import { HistoricalChart } from '../../components/HistoricalChart';

export function LiveDemoPage() {
    const [selectedMetricId, setSelectedMetricId] = useState<string>(DEMO_METRICS[0].id);
    const [analysisKey, setAnalysisKey] = useState(0); // Para forzar re-análisis

    // Ejecutar análisis con el motor
    const result: MetricConditionEvaluation | null = useMemo(() => {
        const series = getSeriesById(selectedMetricId);
        if (!series) return null;

        return analysisEngine.analyzeWithConditions(series);
    }, [selectedMetricId, analysisKey]);

    // Construir grafo
    const { nodes, edges } = useMemo(() => {
        if (!result) return { nodes: [], edges: [] };

        const series = getSeriesById(selectedMetricId)!;
        return buildGraph(result, series);
    }, [result, selectedMetricId]);

    const metricInfo = getMetricInfo(selectedMetricId);

    // Colores para badges de severity
    const severityColors: Record<string, string> = {
        HIGH: 'bg-red-500 text-white',
        MEDIUM: 'bg-yellow-500 text-black',
        LOW: 'bg-blue-500 text-white',
    };

    // Colores para condiciones
    const conditionColors: Record<string, string> = {
        PODER: 'bg-yellow-400 text-black',
        AFLUENCIA: 'bg-green-400 text-black',
        NORMAL: 'bg-blue-400 text-white',
        EMERGENCIA: 'bg-orange-500 text-white',
        PELIGRO: 'bg-red-600 text-white',
        INEXISTENCIA: 'bg-gray-700 text-white',
        SIN_DATOS: 'bg-gray-600 text-white',
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            PulseOps Live
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Análisis operativo en tiempo real con detección de patrones
                        </p>
                    </div>
                    <button
                        onClick={() => setAnalysisKey(k => k + 1)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                    >
                        🔄 Reanalizar
                    </button>
                </div>

                {/* Selector de métrica */}
                <div className="flex items-center gap-4">
                    <label className="text-gray-300 font-semibold">Métrica:</label>
                    <select
                        value={selectedMetricId}
                        onChange={(e) => setSelectedMetricId(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {DEMO_METRICS.map(metric => (
                            <option key={metric.id} value={metric.id}>
                                {metric.name} ({metric.owner})
                            </option>
                        ))}
                    </select>
                </div>

                {metricInfo && (
                    <div className="mt-2 text-sm text-gray-400 italic">
                        {metricInfo.description}
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                {/* Panel lateral: Resultados */}
                <div className="w-80 space-y-4">
                    {result && (
                        <>
                            {/* Condición */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
                                <div className="text-xs font-mono text-gray-400 mb-2">CONDICIÓN OPERATIVA</div>
                                <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${conditionColors[result.condition] || 'bg-gray-600 text-white'}`}>
                                    {result.condition}
                                </div>
                                <div className="mt-3 text-sm text-gray-300">
                                    <span className="font-semibold">Razón:</span> {result.reason.code}
                                </div>
                                <div className="mt-2 text-xs text-gray-400 italic">
                                    "{result.reason.explanation}"
                                </div>
                            </div>

                            {/* Inclinación */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
                                <div className="text-xs font-mono text-gray-400 mb-2">INCLINACIÓN</div>
                                <div className="text-3xl font-bold">
                                    {result.inclination.value !== null
                                        ? `${result.inclination.value > 0 ? '+' : ''}${result.inclination.value.toFixed(1)}%`
                                        : 'N/A'}
                                </div>
                                <div className="mt-2 text-sm text-gray-400">
                                    <div>Anterior: {result.inclination.previousValue.toFixed(1)}</div>
                                    <div>Actual: {result.inclination.currentValue.toFixed(1)}</div>
                                    <div>Delta: {result.inclination.delta > 0 ? '+' : ''}{result.inclination.delta.toFixed(1)}</div>
                                </div>
                            </div>

                            {/* Señales */}
                            {result.signals && result.signals.length > 0 && (
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
                                    <div className="text-xs font-mono text-gray-400 mb-3">SEÑALES DETECTADAS</div>
                                    <div className="space-y-3">
                                        {result.signals.map((signal, idx) => (
                                            <div key={idx} className="border-l-4 border-indigo-500 pl-3 py-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityColors[signal.severity]}`}>
                                                        {signal.severity}
                                                    </span>
                                                    <span className="text-white font-semibold text-sm">{signal.type}</span>
                                                </div>
                                                <div className="text-gray-300 text-xs">
                                                    {signal.explanation}
                                                </div>
                                                {signal.evidence && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Evidencia: {JSON.stringify(signal.evidence)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
                                <div className="text-xs font-mono text-gray-400 mb-2">METADATA</div>
                                <div className="text-xs text-gray-300 space-y-1">
                                    <div>Ventana: {result.windowUsed} períodos</div>
                                    <div>Tipo: {result.periodType}</div>
                                    <div>Confianza: {(result.confidence * 100).toFixed(0)}%</div>
                                    <div className="text-gray-500 text-xs">
                                        Evaluado: {new Date(result.evaluatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Columna principal: Gráfico + Grafo */}
                <div className="flex-1 space-y-6">
                    {/* Gráfico histórico */}
                    {result && (
                        <HistoricalChart
                            records={getSeriesById(selectedMetricId)!.points.map((point, idx) => ({
                                id: `${selectedMetricId}-${idx}`,
                                resourceId: 'team-alpha',
                                metricKey: selectedMetricId,
                                week: point.timestamp,
                                timestamp: point.timestamp,
                                value: point.value,
                                createdBy: 'demo',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            }))}
                            metricName={metricInfo?.name || 'Métrica'}
                        />
                    )}

                    {/* Grafo React Flow */}
                    <div className="h-[550px] bg-gray-800 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            fitView
                            minZoom={0.5}
                            maxZoom={1.5}
                            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                            className="bg-gray-900"
                        >
                            <Background color="#374151" gap={16} />
                            <Controls className="bg-gray-800 border border-gray-700" />
                            <MiniMap
                                className="bg-gray-800 border border-gray-700"
                                nodeColor={(node) => {
                                    if (node.type === 'condition') return '#10b981';
                                    if (node.type === 'signals') return '#818cf8';
                                    return '#6366f1';
                                }}
                            />
                        </ReactFlow>
                    </div>
                </div>
            </div>

            {/* Footer con instrucciones */}
            <div className="mt-6 text-center text-gray-500 text-sm">
                <p>💡 Cambia la métrica para ver diferentes patrones detectados por el motor de análisis</p>
                <p className="text-xs mt-1">
                    Los datos son mock - En producción se integrarán con Jira y otras fuentes
                </p>
            </div>
        </div>
    );
}
