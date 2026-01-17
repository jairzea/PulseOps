import { useState, useEffect } from 'react';
import { configurationApi } from '../services/configurationApi';
import type {
  AnalysisConfiguration,
  ConditionThresholds,
} from '@pulseops/shared-types';
import { useToast } from '../hooks/useToast';

/**
 * Página de configuración de umbrales y condiciones
 */
export function ConfigurationPage() {
  const [activeConfig, setActiveConfig] = useState<AnalysisConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedThresholds, setEditedThresholds] =
    useState<ConditionThresholds | null>(null);

  const { success, error: showError } = useToast();

  // Cargar configuraciones al montar
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      const active = await configurationApi.getActiveConfiguration();
      setActiveConfig(active);
    } catch (error) {
      console.error('Error loading configurations:', error);
      showError('No se pudieron cargar las configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (activeConfig) {
      setEditedThresholds(activeConfig.thresholds);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditedThresholds(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!activeConfig || !editedThresholds) return;

    try {
      await configurationApi.updateConfiguration(activeConfig._id!, {
        thresholds: editedThresholds,
      });

      success('Configuración actualizada exitosamente');
      setIsEditing(false);
      loadConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
      showError('No se pudo guardar la configuración');
    }
  };

  const updateThreshold = (path: string, value: number) => {
    if (!editedThresholds) return;

    const keys = path.split('.');
    const newThresholds = { ...editedThresholds };
    let current: any = newThresholds;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setEditedThresholds(newThresholds);
  };

  const getValue = (path: string): number => {
    if (!editedThresholds) return 0;

    const keys = path.split('.');
    let current: any = editedThresholds;

    for (const key of keys) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return 0;
      }
    }

    return current as number;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando configuración...</div>
      </div>
    );
  }

  const thresholds = isEditing ? editedThresholds : activeConfig?.thresholds;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Configuración de Umbrales
            </h1>
            <p className="text-gray-400">
              Ajusta los umbrales que determinan las condiciones operativas
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Editar Configuración
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>

        {/* Active Configuration Info */}
        {activeConfig && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {activeConfig.name}
              </h2>
              <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                Activa
              </span>
            </div>
            {activeConfig.description && (
              <p className="text-gray-400">{activeConfig.description}</p>
            )}
            <div className="mt-4 text-sm text-gray-500">
              <span>Versión: {activeConfig.version}</span>
              <span className="mx-3">•</span>
              <span>
                Actualizada:{' '}
                {new Date(activeConfig.updatedAt).toLocaleString('es-ES')}
              </span>
            </div>
          </div>
        )}

        {thresholds && (
          <div className="space-y-6">
            {/* AFLUENCIA */}
            <ThresholdCard
              title="AFLUENCIA"
              description="Expansión acelerada - Crecimiento pronunciado"
              color="text-purple-400"
              isEditing={isEditing}
            >
              <ThresholdInput
                label="Inclinación mínima (%)"
                value={getValue('afluencia.minInclination')}
                onChange={(v) => updateThreshold('afluencia.minInclination', v)}
                disabled={!isEditing}
                helpText="Umbral para detectar crecimiento pronunciado (default: 50%)"
              />
            </ThresholdCard>

            {/* NORMAL */}
            <ThresholdCard
              title="NORMAL"
              description="Funcionamiento esperado - Crecimiento positivo real"
              color="text-green-400"
              isEditing={isEditing}
            >
              <div className="grid grid-cols-2 gap-4">
                <ThresholdInput
                  label="Inclinación mínima (%)"
                  value={getValue('normal.minInclination')}
                  onChange={(v) => updateThreshold('normal.minInclination', v)}
                  disabled={!isEditing}
                  helpText="Límite inferior (default: 5%)"
                />
                <ThresholdInput
                  label="Inclinación máxima (%)"
                  value={getValue('normal.maxInclination')}
                  onChange={(v) => updateThreshold('normal.maxInclination', v)}
                  disabled={!isEditing}
                  helpText="Límite superior (default: 50%)"
                />
              </div>
            </ThresholdCard>

            {/* EMERGENCIA */}
            <ThresholdCard
              title="EMERGENCIA"
              description="Pérdida de control incipiente - Estancamiento o descenso leve"
              color="text-yellow-400"
              isEditing={isEditing}
            >
              <div className="grid grid-cols-2 gap-4">
                <ThresholdInput
                  label="Inclinación mínima (%)"
                  value={getValue('emergencia.minInclination')}
                  onChange={(v) =>
                    updateThreshold('emergencia.minInclination', v)
                  }
                  disabled={!isEditing}
                  helpText="Límite inferior (default: -5%)"
                />
                <ThresholdInput
                  label="Inclinación máxima (%)"
                  value={getValue('emergencia.maxInclination')}
                  onChange={(v) =>
                    updateThreshold('emergencia.maxInclination', v)
                  }
                  disabled={!isEditing}
                  helpText="Límite superior (default: 5%)"
                />
              </div>
            </ThresholdCard>

            {/* PELIGRO */}
            <ThresholdCard
              title="PELIGRO"
              description="Deterioro pronunciado - Descenso fuerte"
              color="text-red-400"
              isEditing={isEditing}
            >
              <div className="grid grid-cols-2 gap-4">
                <ThresholdInput
                  label="Inclinación mínima (%)"
                  value={getValue('peligro.minInclination')}
                  onChange={(v) => updateThreshold('peligro.minInclination', v)}
                  disabled={!isEditing}
                  helpText="Límite inferior (default: -80%)"
                />
                <ThresholdInput
                  label="Inclinación máxima (%)"
                  value={getValue('peligro.maxInclination')}
                  onChange={(v) => updateThreshold('peligro.maxInclination', v)}
                  disabled={!isEditing}
                  helpText="Límite superior (default: -50%)"
                />
              </div>
            </ThresholdCard>

            {/* PODER */}
            <ThresholdCard
              title="PODER"
              description="Estado sostenido de excelencia - Normal en nivel estelar"
              color="text-cyan-400"
              isEditing={isEditing}
            >
              <div className="grid grid-cols-3 gap-4">
                <ThresholdInput
                  label="Períodos consecutivos"
                  value={getValue('poder.minConsecutivePeriods')}
                  onChange={(v) =>
                    updateThreshold('poder.minConsecutivePeriods', v)
                  }
                  disabled={!isEditing}
                  helpText="Mínimo de períodos en Normal (default: 3)"
                />
                <ThresholdInput
                  label="Inclinación mínima (%)"
                  value={getValue('poder.minInclination')}
                  onChange={(v) => updateThreshold('poder.minInclination', v)}
                  disabled={!isEditing}
                  helpText="Permite variaciones leves (default: -5%)"
                />
                <ThresholdInput
                  label="Estabilidad"
                  value={getValue('poder.stabilityThreshold')}
                  onChange={(v) =>
                    updateThreshold('poder.stabilityThreshold', v)
                  }
                  disabled={!isEditing}
                  helpText="Variación máxima permitida (default: 0.1)"
                  step={0.01}
                />
              </div>
            </ThresholdCard>

            {/* INEXISTENCIA */}
            <ThresholdCard
              title="INEXISTENCIA"
              description="Valores cercanos a cero - Inicio o caída casi vertical"
              color="text-gray-400"
              isEditing={isEditing}
            >
              <ThresholdInput
                label="Umbral de detección"
                value={getValue('inexistencia.threshold')}
                onChange={(v) => updateThreshold('inexistencia.threshold', v)}
                disabled={!isEditing}
                helpText="Valores menores se consideran ≈0 (default: 0.01)"
                step={0.001}
              />
            </ThresholdCard>

            {/* Señales de Meta-Análisis */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Configuración de Señales de Meta-Análisis
              </h2>

              <div className="space-y-6">
                {/* Volatilidad */}
                <div>
                  <h3 className="text-lg font-medium text-purple-400 mb-3">
                    Volatilidad (Serrucho)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ThresholdInput
                      label="Cambios de dirección mínimos"
                      value={getValue('signals.volatility.minDirectionChanges')}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.volatility.minDirectionChanges',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Cantidad de alternancias (default: 3)"
                    />
                    <ThresholdInput
                      label="Tamaño de ventana mínimo"
                      value={getValue('signals.volatility.minWindowSize')}
                      onChange={(v) =>
                        updateThreshold('signals.volatility.minWindowSize', v)
                      }
                      disabled={!isEditing}
                      helpText="Puntos a analizar (default: 5)"
                    />
                  </div>
                </div>

                {/* Deterioro Lento */}
                <div>
                  <h3 className="text-lg font-medium text-orange-400 mb-3">
                    Deterioro Lento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ThresholdInput
                      label="Caídas consecutivas mínimas"
                      value={getValue(
                        'signals.slowDecline.minConsecutiveDeclines',
                      )}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.slowDecline.minConsecutiveDeclines',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Cantidad de caídas seguidas (default: 3)"
                    />
                    <ThresholdInput
                      label="Inclinación máxima por período (%)"
                      value={getValue(
                        'signals.slowDecline.maxInclinationPerPeriod',
                      )}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.slowDecline.maxInclinationPerPeriod',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Caída máxima por período (default: -5%)"
                    />
                  </div>
                </div>

                {/* Data Gaps */}
                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-3">
                    Gaps de Datos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ThresholdInput
                      label="Días esperados entre puntos"
                      value={getValue(
                        'signals.dataGaps.expectedDaysBetweenPoints',
                      )}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.dataGaps.expectedDaysBetweenPoints',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Periodicidad normal (default: 7 días)"
                    />
                    <ThresholdInput
                      label="Tolerancia (días)"
                      value={getValue('signals.dataGaps.toleranceDays')}
                      onChange={(v) =>
                        updateThreshold('signals.dataGaps.toleranceDays', v)
                      }
                      disabled={!isEditing}
                      helpText="Margen de error (default: 2 días)"
                    />
                  </div>
                </div>

                {/* Recovery Spike */}
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-3">
                    Spike de Recuperación
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ThresholdInput
                      label="Caídas previas mínimas"
                      value={getValue('signals.recoverySpike.minPriorDeclines')}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.recoverySpike.minPriorDeclines',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Caídas antes del spike (default: 2)"
                    />
                    <ThresholdInput
                      label="Inclinación mínima de recuperación (%)"
                      value={getValue(
                        'signals.recoverySpike.minRecoveryInclination',
                      )}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.recoverySpike.minRecoveryInclination',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Crecimiento para detectar spike (default: 50%)"
                    />
                  </div>
                </div>

                {/* Noise */}
                <div>
                  <h3 className="text-lg font-medium text-gray-400 mb-3">
                    Ruido (Cambios Insignificantes)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ThresholdInput
                      label="Variación máxima de inclinación (%)"
                      value={getValue('signals.noise.maxInclinationVariation')}
                      onChange={(v) =>
                        updateThreshold(
                          'signals.noise.maxInclinationVariation',
                          v,
                        )
                      }
                      disabled={!isEditing}
                      helpText="Cambios menores se consideran ruido (default: 5%)"
                    />
                    <ThresholdInput
                      label="Tamaño de ventana mínimo"
                      value={getValue('signals.noise.minWindowSize')}
                      onChange={(v) =>
                        updateThreshold('signals.noise.minWindowSize', v)
                      }
                      disabled={!isEditing}
                      helpText="Puntos a analizar (default: 4)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para tarjetas de umbral
function ThresholdCard({
  title,
  description,
  color,
  isEditing,
  children,
}: {
  title: string;
  description: string;
  color: string;
  isEditing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border ${isEditing ? 'border-blue-500' : 'border-gray-700'} transition-colors`}
    >
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${color}`}>{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

// Componente auxiliar para inputs de umbral
function ThresholdInput({
  label,
  value,
  onChange,
  disabled,
  helpText,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  helpText?: string;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        step={step}
        className={`w-full px-4 py-2 rounded-lg border ${
          disabled
            ? 'bg-gray-900 border-gray-700 text-gray-500'
            : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        } transition-colors`}
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}
