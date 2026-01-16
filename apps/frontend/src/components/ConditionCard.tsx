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

    return (
        <div
            className={`
                rounded-lg p-6 border-2 transition-all
                ${isActive ? `${color.bg} ${color.border}` : 'bg-gray-800 border-gray-700'}
            `}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{displayName.toUpperCase()}</h3>
                <div className="text-2xl">{icon}</div>
            </div>
            <div className={`text-sm uppercase font-semibold mb-1 ${isActive ? color.text : 'text-gray-400'}`}>
                {categoryLabel}
            </div>
            <div className={`text-3xl font-bold ${isActive ? color.text : 'text-gray-500'}`}>
                {isActive && confidence !== undefined ? `${Math.round(confidence * 100)}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-1">CONFIDENCE</div>
        </div>
    );
};
