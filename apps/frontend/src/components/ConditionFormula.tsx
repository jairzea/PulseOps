import { AnalysisResult } from '../services/apiClient';

interface ConditionFormulaProps {
    analysis: AnalysisResult | null;
    loading?: boolean;
}

export function ConditionFormula({ analysis, loading = false }: ConditionFormulaProps) {
    if (loading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse transition-colors duration-300">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!analysis || !analysis.playbook || !analysis.playbook.steps || analysis.playbook.steps.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📋</span>
                    <span>{analysis.playbook.title}</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Fórmula aplicada para la condición: <span className="text-blue-600 dark:text-blue-400 font-semibold">{analysis.playbook.condition}</span>
                </p>
            </div>

            <div className="space-y-3">
                {analysis.playbook.steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:dark:border-gray-600 transition-all duration-200"
                    >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 flex-1 pt-1">{step}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Nota:</strong> Esta fórmula está basada en las condiciones operativas de Hubbard,
                    aplicada al comportamiento de la métrica analizada.
                </p>
            </div>
        </div>
    );
}
