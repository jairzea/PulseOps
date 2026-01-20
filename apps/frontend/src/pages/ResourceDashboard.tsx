import { useState, useEffect, useRef, useMemo } from 'react';
import { useResources } from '../hooks/useResources';
import { useMetrics } from '../hooks/useMetrics';
import { useAnalysis } from '../hooks/useAnalysis';
import { useConditionsMetadata } from '../hooks/useConditionsMetadata';
import { ResourceSelector } from '../components/ResourceSelector';
import { MetricSelector } from '../components/MetricSelector';
import { HistoricalChart } from '../components/HistoricalChart';
import { ConditionFormula } from '../components/ConditionFormula';
import { ConditionCard } from '../components/ConditionCard';
import { RecordModal } from '../components/RecordModal';
import { useRecordsStore } from '../stores/recordsStore';
import { useAuth } from '../contexts/AuthContext';

export function ResourceDashboard() {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const conditionsContainerRef = useRef<HTMLDivElement>(null);
  const conditionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { resources, loading: loadingResources } = useResources();
  const { user } = useAuth();
  const { metrics, loading: loadingMetrics } = useMetrics({ resourceId: selectedResourceId });
  const { conditions, loading: loadingConditions } = useConditionsMetadata();

  // Usar Zustand store para fetch de records
  const {
    records,
    loading: loadingRecords,
    fetchRecords,
    setModalOpen,
    isModalOpen,
    lastCreatedRecord
  } = useRecordsStore();

  const { result: analysis, loading: loadingAnalysis, evaluate } = useAnalysis();

  // Fetch records cuando cambian resource/metric
  useEffect(() => {
    if (selectedResourceId && selectedMetricKey) {
      fetchRecords({
        resourceId: selectedResourceId,
        metricKey: selectedMetricKey,
      });
    }
  }, [selectedResourceId, selectedMetricKey, fetchRecords]);

  // Auto-select first resource and metric when loaded
  useEffect(() => {
    // If user is not admin, force their own resource and skip auto-select
    if (user && user.role !== 'admin') {
      if (user.id && user.id !== selectedResourceId) {
        setSelectedResourceId(user.id);
      }
      return;
    }

    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId, user]);

  // Auto-select first metric when metrics change or resource changes
  useEffect(() => {
    if (metrics.length > 0) {
      // Si no hay métrica seleccionada O la métrica actual no está en la lista de métricas del recurso
      const currentMetricExists = metrics.some(m => m.key === selectedMetricKey);
      if (!selectedMetricKey || !currentMetricExists) {
        setSelectedMetricKey(metrics[0].key);
      }
    } else {
      // Si no hay métricas, limpiar la selección
      setSelectedMetricKey(null);
    }
  }, [metrics]);

  // Detectar cuando se cierra el modal (indica que se creó un registro)
  const prevModalOpen = useRef(isModalOpen);
  useEffect(() => {
    // Si el modal se cerró (de true a false), verificar si hay un registro recién creado
    if (prevModalOpen.current && !isModalOpen && lastCreatedRecord) {
      // Actualizar la selección al recurso y métrica del registro creado
      setSelectedResourceId(lastCreatedRecord.resourceId);
      // La métrica se actualizará automáticamente cuando cambien las métricas del recurso
      // pero podemos forzarla aquí también
      setSelectedMetricKey(lastCreatedRecord.metricKey);
    }
    prevModalOpen.current = isModalOpen;
  }, [isModalOpen, lastCreatedRecord]);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Dashboard Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Selectors */}
            <div className="flex items-center gap-3">
              {user && user.role === 'admin' && (
                <ResourceSelector
                  resources={resources}
                  selectedId={selectedResourceId}
                  onSelect={setSelectedResourceId}
                  loading={loadingResources}
                />
              )}
              <MetricSelector
                metrics={metrics}
                selectedKey={selectedMetricKey}
                onSelect={setSelectedMetricKey}
                loading={loadingMetrics}
              />
            </div>

            {/* Add Record Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Agregar Registro</span>
            </button>
          </div>
        </div>
      </div>

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
                  className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse transition-colors duration-300"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 h-full transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                <span>Análisis</span>
                <button className="text-gray-400 hover:text-gray-900 dark:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </h3>

              {loadingAnalysis ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : analysis?.evaluation?.inclination?.value != null ? (
                <div className="space-y-6">
                  {/* Inclinación */}
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inclinación</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${analysis.evaluation.inclination.value > 0 ? 'text-green-600 dark:text-green-400' : analysis.evaluation.inclination.value < 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                        {analysis.evaluation.inclination.value > 0 ? '+' : ''}{analysis.evaluation.inclination.value.toFixed(1)}%
                      </span>
                      <span className="text-2xl">{analysis.evaluation.inclination.value > 0 ? '↗' : analysis.evaluation.inclination.value < 0 ? '↘' : '→'}</span>
                    </div>
                  </div>

                  {/* Cambio */}
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cambio</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {records.length >= 2 ? (
                        <>
                          {records[records.length - 2].value} → {records[records.length - 1].value}
                          <span className="text-blue-600 dark:text-blue-400 ml-2">
                            ({records[records.length - 1].value > records[records.length - 2].value ? '+' : ''}
                            {(records[records.length - 1].value - records[records.length - 2].value).toFixed(0)})
                          </span>
                        </>
                      ) : '--'}
                    </div>
                  </div>

                  {/* Alertas */}
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Alertas</div>
                    <div className="space-y-2">
                      {analysis.evaluation?.signals && analysis.evaluation.signals.length > 0 ? (
                        analysis.evaluation.signals.slice(0, 2).map((signal, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${signal.severity === 'HIGH' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                              signal.severity === 'MEDIUM' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                                'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                              }`}>
                              {signal.severity || 'INFO'}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{signal.explanation || signal.type}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-500">No alerts</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-500 py-8">
                  Select a resource and metric to view analysis
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formula */}
        <ConditionFormula analysis={analysis} loading={loadingAnalysis} />
      </main>

      {/* Record Modal */}
      <RecordModal
        resources={resources}
      />
    </div>
  );
}
