import { useState, useEffect } from 'react';
import { useResources } from '../hooks/useResources';
import { useMetrics } from '../hooks/useMetrics';
import { useRecords } from '../hooks/useRecords';
import { useAnalysis } from '../hooks/useAnalysis';
import { ResourceSelector } from '../components/ResourceSelector';
import { MetricSelector } from '../components/MetricSelector';
import { HistoricalChart } from '../components/HistoricalChart';
import { ConditionFormula } from '../components/ConditionFormula';

export function ResourceDashboard() {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);

  const { resources, loading: loadingResources } = useResources();
  const { metrics, loading: loadingMetrics } = useMetrics();
  const {
    records,
    loading: loadingRecords,
  } = useRecords({
    resourceId: selectedResourceId || undefined,
    metricKey: selectedMetricKey || undefined,
    enabled: !!selectedResourceId && !!selectedMetricKey,
  });

  const { result: analysis, loading: loadingAnalysis, evaluate } = useAnalysis();

  // Auto-select first resource and metric when loaded
  useEffect(() => {
    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  useEffect(() => {
    if (!selectedMetricKey && metrics.length > 0) {
      setSelectedMetricKey(metrics[0].key);
    }
  }, [metrics, selectedMetricKey]);

  // Trigger analysis when resource or metric changes
  useEffect(() => {
    if (selectedResourceId && selectedMetricKey) {
      evaluate({
        resourceId: selectedResourceId,
        metricKey: selectedMetricKey,
      });
    }
  }, [selectedResourceId, selectedMetricKey, evaluate]);

  const selectedMetric = metrics.find((m) => m.key === selectedMetricKey);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-400">⚡ PulseOps</div>
              <span className="text-gray-400">Live</span>
            </div>

            <div className="flex items-center gap-4">
              <ResourceSelector
                resources={resources}
                selectedId={selectedResourceId}
                onSelect={setSelectedResourceId}
                loading={loadingResources}
              />
              <MetricSelector
                metrics={metrics}
                selectedKey={selectedMetricKey}
                onSelect={setSelectedMetricKey}
                loading={loadingMetrics}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Condition Cards - Horizontal Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* PODER Card */}
          <div className={`rounded-lg p-6 border-2 transition-all ${analysis?.evaluation?.condition === 'PODER' ? 'bg-green-900/50 border-green-500' : 'bg-gray-800 border-gray-700'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">PODER</h3>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="text-sm text-green-400 uppercase font-semibold mb-1">GROWTH</div>
            <div className="text-3xl font-bold text-green-300">
              {analysis?.evaluation?.condition === 'PODER' ? `${Math.round((analysis?.evaluation?.confidence || 0) * 100)}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-1">CONFIDENCE</div>
          </div>

          {/* NORMAL Card */}
          <div className={`rounded-lg p-6 border-2 transition-all ${analysis?.evaluation?.condition === 'NORMAL' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-gray-800 border-gray-700'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">NORMAL</h3>
              <div className="text-2xl">↔️</div>
            </div>
            <div className="text-sm text-yellow-400 uppercase font-semibold mb-1">STAGNATION</div>
            <div className="text-3xl font-bold text-yellow-300">
              {analysis?.evaluation?.condition === 'NORMAL' ? `${Math.round((analysis?.evaluation?.confidence || 0) * 100)}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-1">CONFIDENCE</div>
          </div>

          {/* EMERGENCIA Card */}
          <div className={`rounded-lg p-6 border-2 transition-all ${analysis?.evaluation?.condition === 'EMERGENCIA' ? 'bg-orange-900/50 border-orange-500' : 'bg-gray-800 border-gray-700'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">EMERGENCIA</h3>
              <div className="text-2xl">⚠️</div>
            </div>
            <div className="text-sm text-orange-400 uppercase font-semibold mb-1">DECLINE</div>
            <div className="text-3xl font-bold text-orange-300">
              {analysis?.evaluation?.condition === 'EMERGENCIA' ? `${Math.round((analysis?.evaluation?.confidence || 0) * 100)}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-1">CONFIDENCE</div>
          </div>

          {/* PELIGRO Card */}
          <div className={`rounded-lg p-6 border-2 transition-all ${analysis?.evaluation?.condition === 'PELIGRO' ? 'bg-red-900/50 border-red-500' : 'bg-gray-800 border-gray-700'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">PELIGRO</h3>
              <div className="text-2xl">📉</div>
            </div>
            <div className="text-sm text-red-400 uppercase font-semibold mb-1">CRASH</div>
            <div className="text-3xl font-bold text-red-300">
              {analysis?.evaluation?.condition === 'PELIGRO' ? `${Math.round((analysis?.evaluation?.confidence || 0) * 100)}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-1">CONFIDENCE</div>
          </div>
        </div>

        {/* Chart + Analysis Panel */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Chart - 8 columns */}
          <div className="col-span-8">
            <HistoricalChart
              records={records}
              metricName={selectedMetric?.label || 'Metric'}
              loading={loadingRecords}
            />
          </div>

          {/* Analysis Panel - 4 columns */}
          <div className="col-span-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-between">
                <span>Análisis</span>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </h3>

              {loadingAnalysis ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
                  <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
                  <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
                </div>
              ) : analysis?.evaluation?.inclination?.value != null ? (
                <div className="space-y-6">
                  {/* Inclinación */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Inclinación</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${analysis.evaluation.inclination.value > 0 ? 'text-green-400' : analysis.evaluation.inclination.value < 0 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                        {analysis.evaluation.inclination.value > 0 ? '+' : ''}{analysis.evaluation.inclination.value.toFixed(1)}%
                      </span>
                      <span className="text-2xl">{analysis.evaluation.inclination.value > 0 ? '↗' : analysis.evaluation.inclination.value < 0 ? '↘' : '→'}</span>
                    </div>
                  </div>

                  {/* Cambio */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cambio</div>
                    <div className="text-xl font-semibold text-white">
                      {records.length >= 2 ? (
                        <>
                          {records[records.length - 2].value} → {records[records.length - 1].value}
                          <span className="text-blue-400 ml-2">
                            ({records[records.length - 1].value > records[records.length - 2].value ? '+' : ''}
                            {(records[records.length - 1].value - records[records.length - 2].value).toFixed(0)})
                          </span>
                        </>
                      ) : '--'}
                    </div>
                  </div>

                  {/* Alertas */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Alertas</div>
                    <div className="space-y-2">
                      {analysis.evaluation?.signals && analysis.evaluation.signals.length > 0 ? (
                        analysis.evaluation.signals.slice(0, 2).map((signal, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${signal.severity === 'HIGH' ? 'bg-red-900/50 text-red-300' :
                                signal.severity === 'MEDIUM' ? 'bg-orange-900/50 text-orange-300' :
                                  'bg-yellow-900/50 text-yellow-300'
                              }`}>
                              {signal.severity || 'INFO'}
                            </span>
                            <span className="text-sm text-gray-300">{signal.explanation || signal.type}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No alerts</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a resource and metric to view analysis
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formula */}
        <ConditionFormula analysis={analysis} loading={loadingAnalysis} />
      </main>
    </div>
  );
}
