import { useState, useEffect, useRef, useMemo } from 'react';
import { useResources } from '../hooks/useResources';
import { useMetrics } from '../hooks/useMetrics';
import { useRecords } from '../hooks/useRecords';
import { useAnalysis } from '../hooks/useAnalysis';
import { useConditionsMetadata } from '../hooks/useConditionsMetadata';
import { ResourceSelector } from '../components/ResourceSelector';
import { MetricSelector } from '../components/MetricSelector';
import { HistoricalChart } from '../components/HistoricalChart';
import { ConditionFormula } from '../components/ConditionFormula';
import { ConditionCard } from '../components/ConditionCard';

export function ResourceDashboard() {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const conditionsContainerRef = useRef<HTMLDivElement>(null);
  const conditionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { resources, loading: loadingResources } = useResources();
  const { metrics, loading: loadingMetrics } = useMetrics({ resourceId: selectedResourceId });
  const { conditions, loading: loadingConditions } = useConditionsMetadata();
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
      console.log("select", selectedMetricKey)
    }
  }, [selectedResourceId, selectedMetricKey, evaluate]);

  // Auto-scroll to active condition
  useEffect(() => {
    if (analysis?.evaluation?.condition) {
      const activeConditionElement = conditionRefs.current.get(analysis.evaluation.condition);
      if (activeConditionElement) {
        activeConditionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [analysis?.evaluation?.condition]);

  const selectedMetric = useMemo(
    () => metrics.find((m) => m.key === selectedMetricKey),
    [metrics, selectedMetricKey]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Selectors */}
            <div className="flex items-center gap-6">
              {/* Logo with ECG icon */}
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-xl font-bold text-white">PulseOps</span>
                    <small className="text-[9px] text-gray-400/60">
                      By Unlimitech
                    </small>
                  </div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Live</span>
                </div>

              </div>

              {/* Selectors */}
              <div className="flex items-center gap-3">
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

            {/* Right side: Search, Notifications, Menu, Avatar */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Notifications Icon */}
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Menu Icon (3 dots) */}
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                JZ
              </div>
            </div>
          </div>

        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Condition Cards - Horizontal Slider */}
        <div className="mb-6 relative">
          <div
            ref={conditionsContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
            style={{ scrollbarWidth: 'thin' }}
          >
            {loadingConditions ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 bg-gray-800 border-2 border-gray-700 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              conditions.map((conditionMeta) => (
                <div
                  key={conditionMeta.condition}
                  ref={(el) => {
                    if (el) {
                      conditionRefs.current.set(conditionMeta.condition, el);
                    } else {
                      conditionRefs.current.delete(conditionMeta.condition);
                    }
                  }}
                  className="flex-shrink-0 w-64 transition-transform duration-300 ease-out hover:scale-105"
                >
                  <ConditionCard
                    metadata={conditionMeta}
                    isActive={analysis?.evaluation?.condition === conditionMeta.condition}
                    confidence={
                      analysis?.evaluation?.condition === conditionMeta.condition
                        ? analysis.evaluation.confidence
                        : undefined
                    }
                  />
                </div>
              ))
            )}
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
