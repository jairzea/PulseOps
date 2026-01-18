import { useState, useEffect } from 'react';
import { configurationApi } from '../services/configurationApi';
import type {
    AnalysisConfiguration,
    ConditionThresholds,
} from '@pulseops/shared-types';
import { useToast } from '../hooks/useToast';
import { PulseLoader } from '../components/PulseLoader';

// Step Components
interface StepProps {
    thresholds: ConditionThresholds;
    updateThreshold: (path: string[], value: any) => void;
    getValue: (path: string[]) => any;
}

// Paso 1: Fórmulas de Condiciones
function Step1Formulas({ thresholds, updateThreshold, getValue }: StepProps) {
    const conditions = [
        { key: 'afluencia', name: 'AFLUENCIA', color: 'purple' },
        { key: 'normal', name: 'NORMAL', color: 'green' },
        { key: 'emergencia', name: 'EMERGENCIA', color: 'yellow' },
        { key: 'peligro', name: 'PELIGRO', color: 'red' },
        { key: 'poder', name: 'PODER', color: 'cyan' },
        { key: 'inexistencia', name: 'INEXISTENCIA', color: 'gray' },
    ];

    const colorClasses = {
        purple: { border: 'border-purple-600/30', text: 'text-purple-400', bg: 'bg-purple-500' },
        green: { border: 'border-green-600/30', text: 'text-green-400', bg: 'bg-green-500' },
        yellow: { border: 'border-yellow-600/30', text: 'text-yellow-400', bg: 'bg-yellow-500' },
        red: { border: 'border-red-600/30', text: 'text-red-400', bg: 'bg-red-500' },
        cyan: { border: 'border-cyan-600/30', text: 'text-cyan-400', bg: 'bg-cyan-500' },
        gray: { border: 'border-gray-600/30', text: 'text-gray-400', bg: 'bg-gray-500' },
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Fórmulas de Condiciones</h2>
                <p className="text-gray-400 mb-8">
                    Define los pasos de acción para cada condición operativa
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {conditions.map(({ key, name, color }) => {
                    const formula = getValue([key, 'formula']);
                    const colors = colorClasses[color as keyof typeof colorClasses];
                    
                    if (!formula) return null;

                    return (
                        <div key={key} className={`bg-gray-800 rounded-lg p-6 border ${colors.border}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 ${colors.bg} rounded-full`}></div>
                                    <h3 className={`text-lg font-semibold ${colors.text}`}>
                                        {name}
                                    </h3>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formula.enabled ?? true}
                                        onChange={(e) => updateThreshold([key, 'formula', 'enabled'], e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                    />
                                    <span className="text-sm text-gray-300">Fórmula activa</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descripción de la fórmula
                                </label>
                                <textarea
                                    value={formula.description || ''}
                                    onChange={(e) => updateThreshold([key, 'formula', 'description'], e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-300 mb-3">
                                    Pasos de la fórmula
                                </h4>
                                {formula.steps?.map((step: any, index: number) => (
                                    <div key={index} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <input
                                                type="checkbox"
                                                checked={step.enabled ?? true}
                                                onChange={(e) => updateThreshold([key, 'formula', 'steps', index.toString(), 'enabled'], e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                            />
                                            <span className="text-sm font-medium text-gray-400">
                                                Paso {step.order}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={step.description || ''}
                                            onChange={(e) => updateThreshold([key, 'formula', 'steps', index.toString(), 'description'], e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Paso 2: Condiciones Principales
function Step2Conditions({ thresholds, updateThreshold, getValue }: StepProps) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Condiciones Principales</h2>
                <p className="text-gray-400 mb-8">
                    Define los umbrales de inclinación para cada condición operativa
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AFLUENCIA */}
                <div className="bg-gray-800 rounded-lg p-6 border border-purple-600/30">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        AFLUENCIA
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Inclinación mínima (%)
                        </label>
                        <input
                            type="number"
                            value={getValue(['afluencia', 'minInclination'])}
                            onChange={(e) => updateThreshold(['afluencia', 'minInclination'], Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            step="0.1"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Umbral para detectar crecimiento pronunciado y expansión acelerada (default: 50%)
                        </p>
                    </div>
                </div>

                {/* NORMAL */}
                <div className="bg-gray-800 rounded-lg p-6 border border-green-600/30">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        NORMAL
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación mínima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['normal', 'minInclination'])}
                                onChange={(e) => updateThreshold(['normal', 'minInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite inferior para crecimiento positivo real (default: 5%)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación máxima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['normal', 'maxInclination'])}
                                onChange={(e) => updateThreshold(['normal', 'maxInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite superior antes de entrar en AFLUENCIA (default: 50%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* EMERGENCIA */}
                <div className="bg-gray-800 rounded-lg p-6 border border-yellow-600/30">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        EMERGENCIA
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación mínima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['emergencia', 'minInclination'])}
                                onChange={(e) => updateThreshold(['emergencia', 'minInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite inferior para estancamiento o declive leve (default: -20%)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación máxima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['emergencia', 'maxInclination'])}
                                onChange={(e) => updateThreshold(['emergencia', 'maxInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite superior antes de entrar en rango NORMAL (default: 5%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* PELIGRO */}
                <div className="bg-gray-800 rounded-lg p-6 border border-red-600/30">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        PELIGRO
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación mínima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['peligro', 'minInclination'])}
                                onChange={(e) => updateThreshold(['peligro', 'minInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite inferior para caída crítica severa (default: -100%)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación máxima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['peligro', 'maxInclination'])}
                                onChange={(e) => updateThreshold(['peligro', 'maxInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Límite superior antes de entrar en EMERGENCIA (default: -20%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* PODER */}
                <div className="bg-gray-800 rounded-lg p-6 border border-cyan-600/30">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                        PODER
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Períodos consecutivos mínimos
                            </label>
                            <input
                                type="number"
                                value={getValue(['poder', 'minConsecutivePeriods'])}
                                onChange={(e) => updateThreshold(['poder', 'minConsecutivePeriods'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Cantidad de períodos consecutivos necesarios para confirmar PODER (default: 3)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación mínima (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['poder', 'minInclination'])}
                                onChange={(e) => updateThreshold(['poder', 'minInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Crecimiento mínimo sostenido - permite pequeñas variaciones (default: -5%)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Umbral de estabilidad
                            </label>
                            <input
                                type="number"
                                value={getValue(['poder', 'stabilityThreshold'])}
                                onChange={(e) => updateThreshold(['poder', 'stabilityThreshold'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Variación máxima permitida para mantener estabilidad (default: 0.1 = 10%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* INEXISTENCIA */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        INEXISTENCIA
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Umbral
                        </label>
                        <input
                            type="number"
                            value={getValue(['inexistencia', 'threshold'])}
                            onChange={(e) => updateThreshold(['inexistencia', 'threshold'], Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            step="0.1"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Valor máximo para considerar que no existe actividad (default: 0.01)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Paso 3: Configuración de Señales
function Step3Signals({ thresholds, updateThreshold, getValue }: StepProps) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Configuración de Señales</h2>
                <p className="text-gray-400 mb-8">
                    Ajusta los parámetros de detección de señales de alerta
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Volatility */}
                <div className="bg-gray-800 rounded-lg p-6 border border-orange-600/30">
                    <h3 className="text-lg font-semibold text-orange-400 mb-4">Volatilidad</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Cambios de dirección mínimos
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'volatility', 'minDirectionChanges'])}
                                onChange={(e) => updateThreshold(['signals', 'volatility', 'minDirectionChanges'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Cantidad mínima de cambios de tendencia para detectar volatilidad (default: 3)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tamaño mínimo de ventana
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'volatility', 'minWindowSize'])}
                                onChange={(e) => updateThreshold(['signals', 'volatility', 'minWindowSize'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Períodos necesarios para analizar volatilidad (default: 5)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Slow Decline */}
                <div className="bg-gray-800 rounded-lg p-6 border border-blue-600/30">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">Declive Lento</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Declives consecutivos mínimos
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'slowDecline', 'minConsecutiveDeclines'])}
                                onChange={(e) => updateThreshold(['signals', 'slowDecline', 'minConsecutiveDeclines'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Períodos consecutivos de declive para detectar tendencia lenta (default: 3)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación máxima por período (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'slowDecline', 'maxInclinationPerPeriod'])}
                                onChange={(e) => updateThreshold(['signals', 'slowDecline', 'maxInclinationPerPeriod'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Declive máximo permitido por período para ser considerado "lento" (default: -5%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Gaps */}
                <div className="bg-gray-800 rounded-lg p-6 border border-purple-600/30">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Gaps de Datos</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Días esperados entre puntos
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'dataGaps', 'expectedDaysBetweenPoints'])}
                                onChange={(e) => updateThreshold(['signals', 'dataGaps', 'expectedDaysBetweenPoints'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Frecuencia normal de registros de datos: 7 = semanal (default: 7)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tolerancia en días
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'dataGaps', 'toleranceDays'])}
                                onChange={(e) => updateThreshold(['signals', 'dataGaps', 'toleranceDays'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Días de retraso permitidos antes de considerar un gap (default: 2)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recovery Spike */}
                <div className="bg-gray-800 rounded-lg p-6 border border-green-600/30">
                    <h3 className="text-lg font-semibold text-green-400 mb-4">Pico de Recuperación</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Declives previos mínimos
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'recoverySpike', 'minPriorDeclines'])}
                                onChange={(e) => updateThreshold(['signals', 'recoverySpike', 'minPriorDeclines'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Número de declives previos necesarios para detectar recuperación (default: 2)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Inclinación mínima de recuperación (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'recoverySpike', 'minRecoveryInclination'])}
                                onChange={(e) => updateThreshold(['signals', 'recoverySpike', 'minRecoveryInclination'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Incremento mínimo para confirmar recuperación después de declives (default: 50%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Noise */}
                <div className="bg-gray-800 rounded-lg p-6 border border-yellow-600/30 md:col-span-2">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">Ruido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Variación máxima de inclinación (%)
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'noise', 'maxInclinationVariation'])}
                                onChange={(e) => updateThreshold(['signals', 'noise', 'maxInclinationVariation'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Variación máxima permitida para distinguir señal de ruido (default: 5%)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tamaño mínimo de ventana
                            </label>
                            <input
                                type="number"
                                value={getValue(['signals', 'noise', 'minWindowSize'])}
                                onChange={(e) => updateThreshold(['signals', 'noise', 'minWindowSize'], Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Períodos necesarios para analizar ruido en la señal (default: 4)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Paso 4: Revisión Final
interface Step4ReviewProps {
    thresholds: ConditionThresholds;
    configName: string;
}

function Step4Review({ thresholds, configName }: Step4ReviewProps) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Revisión Final</h2>
                <p className="text-gray-400 mb-8">
                    Revisa los cambios antes de guardar la configuración
                </p>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-2">
                            Información Importante
                        </h3>
                        <p className="text-gray-300 text-sm">
                            Al guardar, se creará una nueva versión de la configuración "{configName}".
                            Los cambios afectarán todos los análisis futuros.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard
                    title="AFLUENCIA"
                    color="purple"
                    items={[
                        { label: 'Inclinación mínima', value: `≥ ${thresholds.afluencia.minInclination}%` },
                    ]}
                />
                <SummaryCard
                    title="NORMAL"
                    color="green"
                    items={[
                        { label: 'Rango', value: `${thresholds.normal.minInclination}% a ${thresholds.normal.maxInclination}%` },
                    ]}
                />
                <SummaryCard
                    title="EMERGENCIA"
                    color="yellow"
                    items={[
                        { label: 'Rango', value: `${thresholds.emergencia.minInclination}% a ${thresholds.emergencia.maxInclination}%` },
                    ]}
                />
                <SummaryCard
                    title="PELIGRO"
                    color="red"
                    items={[
                        { label: 'Rango', value: `${thresholds.peligro.minInclination}% a ${thresholds.peligro.maxInclination}%` },
                    ]}
                />
                <SummaryCard
                    title="PODER"
                    color="cyan"
                    items={[
                        { label: 'Períodos consecutivos', value: thresholds.poder.minConsecutivePeriods.toString() },
                        { label: 'Inclinación mín.', value: `${thresholds.poder.minInclination}%` },
                    ]}
                />
                <SummaryCard
                    title="INEXISTENCIA"
                    color="gray"
                    items={[
                        { label: 'Umbral', value: thresholds.inexistencia.threshold.toString() },
                    ]}
                />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Señales Configuradas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-sm font-medium text-orange-400 mb-2">Volatilidad</h4>
                        <p className="text-xs text-gray-400">
                            Cambios de dirección: {thresholds.signals.volatility.minDirectionChanges} • Ventana: {thresholds.signals.volatility.minWindowSize}
                        </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-sm font-medium text-blue-400 mb-2">Declive Lento</h4>
                        <p className="text-xs text-gray-400">
                            Min: {thresholds.signals.slowDecline.minConsecutiveDeclines} períodos • Máx: {thresholds.signals.slowDecline.maxInclinationPerPeriod}%
                        </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-sm font-medium text-purple-400 mb-2">Gaps de Datos</h4>
                        <p className="text-xs text-gray-400">
                            Días esperados: {thresholds.signals.dataGaps.expectedDaysBetweenPoints} • Tolerancia: {thresholds.signals.dataGaps.toleranceDays}
                        </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-sm font-medium text-green-400 mb-2">Pico de Recuperación</h4>
                        <p className="text-xs text-gray-400">
                            Declives previos: {thresholds.signals.recoverySpike.minPriorDeclines} • Inclinación: {thresholds.signals.recoverySpike.minRecoveryInclination}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Paso 4: Fórmulas de Condiciones
function Step4Formulas({ thresholds, updateThreshold, getValue }: StepProps) {
    const conditions = [
        { key: 'afluencia', name: 'AFLUENCIA', color: 'purple' },
        { key: 'normal', name: 'NORMAL', color: 'green' },
        { key: 'emergencia', name: 'EMERGENCIA', color: 'yellow' },
        { key: 'peligro', name: 'PELIGRO', color: 'red' },
        { key: 'poder', name: 'PODER', color: 'cyan' },
        { key: 'inexistencia', name: 'INEXISTENCIA', color: 'gray' },
    ];

    const colorClasses = {
        purple: { border: 'border-purple-600/30', text: 'text-purple-400', bg: 'bg-purple-500' },
        green: { border: 'border-green-600/30', text: 'text-green-400', bg: 'bg-green-500' },
        yellow: { border: 'border-yellow-600/30', text: 'text-yellow-400', bg: 'bg-yellow-500' },
        red: { border: 'border-red-600/30', text: 'text-red-400', bg: 'bg-red-500' },
        cyan: { border: 'border-cyan-600/30', text: 'text-cyan-400', bg: 'bg-cyan-500' },
        gray: { border: 'border-gray-600/30', text: 'text-gray-400', bg: 'bg-gray-500' },
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Fórmulas de Condiciones</h2>
                <p className="text-gray-400 mb-8">
                    Define los pasos de acción para cada condición operativa
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {conditions.map(({ key, name, color }) => {
                    const formula = getValue([key, 'formula']);
                    const colors = colorClasses[color as keyof typeof colorClasses];
                    
                    if (!formula) return null;

                    return (
                        <div key={key} className={`bg-gray-800 rounded-lg p-6 border ${colors.border}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 ${colors.bg} rounded-full`}></div>
                                    <h3 className={`text-lg font-semibold ${colors.text}`}>
                                        {name}
                                    </h3>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formula.enabled ?? true}
                                        onChange={(e) => updateThreshold([key, 'formula', 'enabled'], e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                    />
                                    <span className="text-sm text-gray-300">Fórmula activa</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descripción de la fórmula
                                </label>
                                <textarea
                                    value={formula.description || ''}
                                    onChange={(e) => updateThreshold([key, 'formula', 'description'], e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-300 mb-3">
                                    Pasos de la fórmula
                                </h4>
                                {formula.steps?.map((step: any, index: number) => (
                                    <div key={index} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <input
                                                type="checkbox"
                                                checked={step.enabled ?? true}
                                                onChange={(e) => updateThreshold([key, 'formula', 'steps', index.toString(), 'enabled'], e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                            />
                                            <span className="text-sm font-medium text-gray-400">
                                                Paso {step.order}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={step.description || ''}
                                            onChange={(e) => updateThreshold([key, 'formula', 'steps', index.toString(), 'description'], e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface SummaryCardProps {
    title: string;
    color: 'purple' | 'green' | 'yellow' | 'red' | 'cyan' | 'gray';
    items: { label: string; value: string }[];
}

function SummaryCard({ title, color, items }: SummaryCardProps) {
    const colorClasses = {
        purple: 'border-purple-600/30 bg-purple-600/5',
        green: 'border-green-600/30 bg-green-600/5',
        yellow: 'border-yellow-600/30 bg-yellow-600/5',
        red: 'border-red-600/30 bg-red-600/5',
        cyan: 'border-cyan-600/30 bg-cyan-600/5',
        gray: 'border-gray-600/30 bg-gray-600/5',
    };

    const textColorClasses = {
        purple: 'text-purple-400',
        green: 'text-green-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400',
        cyan: 'text-cyan-400',
        gray: 'text-gray-400',
    };

    return (
        <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
            <h3 className={`text-sm font-semibold mb-3 ${textColorClasses[color]}`}>
                {title}
            </h3>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-400">{item.label}:</span>
                        <span className="text-white font-medium">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Página de configuración de umbrales y condiciones - Wizard de 3 pasos
 */
export function ConfigurationPage() {
    const [activeConfig, setActiveConfig] = useState<AnalysisConfiguration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
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
            setCurrentStep(1);
        }
    };

    const handleCancel = () => {
        setEditedThresholds(null);
        setCurrentStep(1);
    };

    const handleSave = async () => {
        if (!activeConfig || !editedThresholds) return;

        try {
            await configurationApi.updateConfiguration(activeConfig._id!, {
                thresholds: editedThresholds,
            });

            success('Configuración actualizada exitosamente');
            setEditedThresholds(null);
            setCurrentStep(1);
            loadConfigurations();
        } catch (error) {
            console.error('Error saving configuration:', error);
            showError('No se pudo guardar la configuración');
        }
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const updateThreshold = (path: string[], value: number) => {
        if (!editedThresholds) return;

        const newThresholds = { ...editedThresholds };
        let current: any = newThresholds;

        for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] = { ...current[path[i]] };
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;
        setEditedThresholds(newThresholds);
    };

    const getValue = (path: string[]): number => {
        if (!editedThresholds) return 0;

        let current: any = editedThresholds;

        for (const key of path) {
            if (current && typeof current === 'object') {
                current = current[key];
            } else {
                return 0;
            }
        }

        return current as number;
    };

    if (isLoading) {
        return <PulseLoader size="lg" variant="primary" text="Cargando configuración..." fullScreen />;
    }

    const isEditing = editedThresholds !== null;
    const thresholds = isEditing ? editedThresholds : activeConfig?.thresholds;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Configuración de Umbrales
                    </h1>
                    <p className="text-gray-400">
                        Ajusta los umbrales que determinan las condiciones operativas
                    </p>
                </div>

                {/* Active Configuration Info */}
                {activeConfig && (
                    <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">
                                    {activeConfig.name}
                                </h2>
                                {activeConfig.description && (
                                    <p className="text-gray-400 text-sm">{activeConfig.description}</p>
                                )}
                                <div className="mt-3 text-xs text-gray-500">
                                    <span>Versión: {activeConfig.version}</span>
                                    <span className="mx-3">•</span>
                                    <span>
                                        Actualizada:{' '}
                                        {new Date(activeConfig.updatedAt).toLocaleString('es-ES')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-600/30">
                                    Activa
                                </span>
                                {!isEditing ? (
                                    <button
                                        onClick={handleEdit}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Editar Configuración
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Wizard Steps */}
                {isEditing && (
                    <>
                        {/* Progress Indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step === currentStep
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : step < currentStep
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-600 bg-gray-800 text-gray-400'
                                                }`}
                                        >
                                            {step < currentStep ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <span className="font-semibold">{step}</span>
                                            )}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`w-32 h-0.5 mx-2 transition-all ${step < currentStep ? 'bg-green-500' : 'bg-gray-700'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-4">
                                <p className="text-sm text-gray-400">
                                    {currentStep === 1 && 'Paso 1: Fórmulas de Condiciones'}
                                    {currentStep === 2 && 'Paso 2: Condiciones Principales'}
                                    {currentStep === 3 && 'Paso 3: Configuración de Señales'}
                                    {currentStep === 4 && 'Paso 4: Revisión Final'}
                                </p>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="bg-gray-800/30 rounded-lg p-8 border border-gray-700/50 min-h-[500px]">
                            {currentStep === 1 && thresholds && (
                                <Step1Formulas
                                    thresholds={thresholds}
                                    updateThreshold={updateThreshold}
                                    getValue={getValue}
                                />
                            )}
                            {currentStep === 2 && thresholds && (
                                <Step2Conditions
                                    thresholds={thresholds}
                                    updateThreshold={updateThreshold}
                                    getValue={getValue}
                                />
                            )}
                            {currentStep === 3 && thresholds && (
                                <Step3Signals
                                    thresholds={thresholds}
                                    updateThreshold={updateThreshold}
                                    getValue={getValue}
                                />
                            )}
                            {currentStep === 4 && thresholds && activeConfig && (
                                <Step4Review
                                    thresholds={thresholds}
                                    configName={activeConfig.name}
                                />
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${currentStep === 1
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                            >
                                ← Anterior
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar Configuración
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* View Mode - Summary Cards */}
                {!isEditing && thresholds && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SummaryCard
                            title="AFLUENCIA"
                            color="purple"
                            items={[
                                { label: 'Inclinación mínima', value: `≥ ${thresholds.afluencia.minInclination}%` },
                            ]}
                        />
                        <SummaryCard
                            title="NORMAL"
                            color="green"
                            items={[
                                { label: 'Rango de inclinación', value: `${thresholds.normal.minInclination}% a ${thresholds.normal.maxInclination}%` },
                            ]}
                        />
                        <SummaryCard
                            title="EMERGENCIA"
                            color="yellow"
                            items={[
                                { label: 'Rango de inclinación', value: `${thresholds.emergencia.minInclination}% a ${thresholds.emergencia.maxInclination}%` },
                            ]}
                        />
                        <SummaryCard
                            title="PELIGRO"
                            color="red"
                            items={[
                                { label: 'Rango de inclinación', value: `${thresholds.peligro.minInclination}% a ${thresholds.peligro.maxInclination}%` },
                            ]}
                        />
                        <SummaryCard
                            title="PODER"
                            color="cyan"
                            items={[
                                { label: 'Períodos consecutivos', value: thresholds.poder.minConsecutivePeriods.toString() },
                                { label: 'Inclinación mínima', value: `${thresholds.poder.minInclination}%` },
                                { label: 'Estabilidad', value: thresholds.poder.stabilityThreshold.toString() },
                            ]}
                        />
                        <SummaryCard
                            title="INEXISTENCIA"
                            color="gray"
                            items={[
                                { label: 'Umbral', value: thresholds.inexistencia.threshold.toString() },
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
