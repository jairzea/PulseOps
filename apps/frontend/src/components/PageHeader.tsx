/**
 * PageHeader - Componente de header reutilizable para todas las páginas
 */
import React from 'react';

export interface PageHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
    };
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    {action.icon || (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                    )}
                    {action.label}
                </button>
            )}
        </div>
    );
};
