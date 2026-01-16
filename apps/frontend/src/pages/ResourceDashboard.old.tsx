import { useState, useEffect } from 'react';
import { useResources } from '../hooks/useResources';
import { useMetrics } from '../hooks/useMetrics';
import { useRecords } from '../hooks/useRecords';
import { useAnalysis } from '../hooks/useAnalysis';
import { ResourceSelector } from '../components/ResourceSelector';
import { MetricSelector } from '../components/MetricSelector';
import { HistoricalChart } from '../components/HistoricalChart';
import { ConditionSummary } from '../components/ConditionSummary';
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

  const selectedResource = resources.find((r) => r.id === selectedResourceId);
  const selectedMetric = metrics.find((m) => m.key === selectedMetricKey);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">PulseOps</h1>
                <p className="text-sm text-gray-400">Live Dashboard</p>
              </div>
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

          {selectedResource && (
            <div className="mt-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                {selectedResource.roleType}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-300 font-medium">{selectedResource.name}</span>
              {selectedMetric && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-300 font-medium">{selectedMetric.label}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Analysis Summary */}
          <section className="transition-opacity duration-300">
            <ConditionSummary analysis={analysis} loading={loadingAnalysis} />
          </section>

          {/* Chart */}
          <section className="transition-opacity duration-300">
            <HistoricalChart
              records={records}
              metricName={selectedMetric?.label || 'Metric'}
              loading={loadingRecords}
            />
          </section>

          {/* Formula */}
          <section className="transition-opacity duration-300">
            <ConditionFormula analysis={analysis} loading={loadingAnalysis} />
          </section>

          {/* Debug Info (Development only) */}
          {import.meta.env.DEV && (
            <section className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <details>
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Debug Info
                </summary>
                <div className="mt-4 space-y-2 text-xs font-mono text-gray-400">
                  <div>Resources loaded: {resources.length}</div>
                  <div>Metrics loaded: {metrics.length}</div>
                  <div>Records loaded: {records.length}</div>
                  <div>
                    Selected: {selectedResourceId} / {selectedMetricKey}
                  </div>
                  <div>Analysis: {analysis ? 'Available' : 'Not available'}</div>
                </div>
              </details>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
