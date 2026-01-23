import { useState, useEffect } from 'react';
import { useConditionsMetadata } from '../hooks/useConditionsMetadata';
import { ConditionMetadata } from '../services/apiClient';
import { useToast } from '../hooks/useToast';

export function ConditionColorsConfig() {
  const { conditions, loading } = useConditionsMetadata();
  const [editedConditions, setEditedConditions] = useState<ConditionMetadata[]>([]);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (conditions) {
      setEditedConditions(JSON.parse(JSON.stringify(conditions)));
    }
  }, [conditions]);

  const updateColor = (conditionKey: string, colorValue: string) => {
    setEditedConditions(prev =>
      prev.map(c =>
        c.condition === conditionKey
          ? { ...c, color: { ...c.color, glow: colorValue } }
          : c
      )
    );
  };

  const handleSave = () => {
    // Por ahora solo mostramos un mensaje
    // En una implementación completa, esto llamaría a un endpoint del backend
    success('Colores guardados (funcionalidad en desarrollo - cambios no persistentes)');
    showError('Nota: Los cambios de color no se persisten aún. Esta funcionalidad requiere un endpoint en el backend.');
  };

  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0, 0, 0)';
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Configuración de Colores
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Personaliza los colores de resplandor (glow) para cada condición. Estos colores se aplicarán a las tarjetas de condiciones y las líneas del gráfico.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editedConditions.map((condition) => (
          <div
            key={condition.condition}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{condition.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {condition.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {condition.category.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color de Resplandor (Glow)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={rgbToHex(condition.color.glow)}
                    onChange={(e) => updateColor(condition.condition, hexToRgb(e.target.value))}
                    className="h-10 w-16 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={condition.color.glow}
                    onChange={(e) => updateColor(condition.condition, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white"
                    placeholder="rgb(255, 255, 255)"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg border-2 transition-all duration-300"
                style={{
                  borderColor: condition.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.5)'),
                  boxShadow: `0 0 20px ${condition.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.4)')}, 0 0 40px ${condition.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.2)')}`,
                  backgroundColor: condition.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.05)')
                }}
              >
                <p className="text-xs text-center font-medium text-gray-600 dark:text-gray-400">
                  Vista Previa del Resplandor
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
