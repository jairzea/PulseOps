import React from 'react';
import { ConditionMetadata } from '../services/apiClient';

interface ConditionCardProps {
  metadata: ConditionMetadata;
  isActive: boolean;
  confidence?: number;
}

/**
 * Card genérico de condición operativa.
 * Renderiza dinámicamente basado en metadata del backend.
 */
export const ConditionCard: React.FC<ConditionCardProps> = ({
  metadata,
  isActive,
  confidence,
}) => {
  const { displayName, icon, color, description } = metadata;

  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all duration-300
        ${isActive ? `${color.bg} ${color.border}` : 'bg-gray-800 border-gray-700'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3
          className={`
            text-sm font-semibold
            ${isActive ? color.text : 'text-gray-400'}
          `}
        >
          {displayName.toUpperCase()}
        </h3>
        <div className="text-2xl">{icon}</div>
      </div>

      {isActive && confidence !== undefined && (
        <div className="mt-3">
          <span
            className={`
              text-xs px-2 py-1 rounded border
              ${color.badge}
            `}
          >
            Confianza: {Math.round(confidence * 100)}%
          </span>
        </div>
      )}

      {isActive && (
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
