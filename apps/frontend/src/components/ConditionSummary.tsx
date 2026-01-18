import { AnalysisResult } from '../services/apiClient';

interface ConditionSummaryProps {
    analysis: AnalysisResult | null;
    loading?: boolean;
}

const conditionColors: Record<string, { bg: string; text: string; badge: string; icon: string }> = {
    PODER: { bg: 'bg-green-900/30', text: 'text-green-400', badge: 'bg-green-500', icon: '⚡' },
    AFLUENCIA: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', badge: 'bg-emerald-500', icon: '📈' },
    NORMAL: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', badge: 'bg-yellow-500', icon: '↔️' },
    EMERGENCIA: { bg: 'bg-orange-900/30', text: 'text-orange-400', badge: 'bg-orange-500', icon: '⚠️' },
    PELIGRO: { bg: 'bg-red-900/30', text: 'text-red-400', badge: 'bg-red-500', icon: '🔴' },
    SIN_DATOS: { bg: 'bg-gray-900/30', text: 'text-gray-400', badge: 'bg-gray-500', icon: '❓' },
};

export function ConditionSummary({ analysis, loading = false }: ConditionSummaryProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
                        <div className="h-8 bg-gray-700 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                <p className="text-gray-400">Select a resource and metric to view analysis</p>
            </div>
        );
    }

    const theme = conditionColors[analysis.evaluation.condition] || conditionColors.SIN_DATOS;

    return (
        <div className="space-y-4 transition-all duration-300">
            {/* Condición Principal */}
            <div className={`${theme.bg} rounded-lg p-6 border-2 ${theme.badge} border-opacity-50 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Condición Operativa</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{theme.icon}</span>
                            <h2 className={`text-3xl font-bold ${theme.text}`}>{analysis.evaluation.condition}</h2>
                        </div>
                    </div>
                    <div className={`px-4 py-2 ${theme.badge} rounded-full`}>
                        <p className="text-gray-900 dark:text-white font-semibold">{Math.round(analysis.evaluation.confidence * 100)}% Confianza</p>
                    </div>
                </div>
                <p className="text-gray-300 text-lg">{analysis.evaluation.reason.explanation}</p>
            </div>

            {/* Métricas Clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inclinación */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 transition-all duration-300 hover:border-gray-600">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Inclinación</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-bold ${getInclinationColor(analysis.evaluation.inclination.value)}`}>
                            {analysis.evaluation.inclination.value > 0 ? '+' : ''}{analysis.evaluation.inclination.value.toFixed(1)}%
                        </p>
                        <span className="text-2xl">{analysis.evaluation.inclination.value > 0 ? '↗' : analysis.evaluation.inclination.value < 0 ? '↘' : '→'}</span>
                    </div>
                </div>

                {/* Señales Detectadas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 transition-all duration-300 hover:border-gray-600">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Señales Detectadas</p>
                    <p className="text-3xl font-bold text-blue-400">{analysis.evaluation.signals.length}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {analysis.evaluation.signals.slice(0, 3).map((signal, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs bg-blue-900/30 text-blue-300 rounded-full"
                            >
                                {signal.type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Timestamp */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 transition-all duration-300 hover:border-gray-600">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Última Evaluación</p>
                    <p className="text-lg font-semibold text-gray-300">
                        {new Date(analysis.evaluation.evaluatedAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

function getInclinationColor(inclination: number): string {
    if (inclination > 10) return 'text-green-400';
    if (inclination > 0) return 'text-emerald-400';
    if (inclination < -10) return 'text-red-400';
    if (inclination < 0) return 'text-orange-400';
    return 'text-yellow-400';
}
