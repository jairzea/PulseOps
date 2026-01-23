import React from 'react';
import { ConditionMetadata } from '../services/apiClient';

interface ConditionCardProps {
    metadata: ConditionMetadata;
    isActive: boolean;
    confidence?: number;
}

// Mapeo de categorías a labels de estado
const CATEGORY_LABELS: Record<string, string> = {
    superior: 'GROWTH',
    normal: 'STABLE',
    crisis: 'DECLINE',
    technical: 'NO DATA',
};

/**
 * Card genérico de condición operativa.
 * Renderiza dinámicamente basado en metadata del backend.
 * Mantiene el estilo visual original con título grande, subtítulo y valor destacado.
 */
export const ConditionCard: React.FC<ConditionCardProps> = ({
    metadata,
    isActive,
    confidence,
}) => {
    const { displayName, icon, color, category } = metadata;
    const categoryLabel = CATEGORY_LABELS[category] || 'STATUS';

    // Debug: Log color object when active
    React.useEffect(() => {
        if (isActive) {
            console.log('🎨 Active condition color:', displayName, color);
        }
    }, [isActive, displayName, color]);

    return (
        <div
            className={`
                rounded-lg p-6 border-2 transition-all duration-700 h-[180px] flex flex-col
                ${isActive ? `${color.bg} ${color.border}` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
            `}
            style={{
                boxShadow: isActive && color.glow
                    ? `0 0 30px ${color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.5)')}, 0 0 60px ${color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.25)')}, 0 10px 40px ${color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.2)')}`
                    : 'none',
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayName.toUpperCase()}</h3>
                <div className="text-2xl">{icon}</div>
            </div>
            <div className={`text-sm uppercase font-semibold mb-1 ${isActive ? color.text : 'text-gray-600 dark:text-gray-400'}`}>
                {categoryLabel}
            </div>
            <div className={`text-3xl font-bold ${isActive ? color.text : 'text-gray-600 dark:text-gray-500'}`}>
                {isActive && confidence !== undefined ? `${Math.round(confidence * 100)}%` : '--'}
            </div>
        </div>
    );
};
