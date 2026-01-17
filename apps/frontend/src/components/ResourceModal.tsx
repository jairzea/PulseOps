/**
 * ResourceModal - Modal reutilizable para crear/editar recursos
 */
import React from 'react';
import { ResourceForm } from './ResourceForm';
import { Resource, Metric } from '../services/apiClient';
import { ResourceFormData } from '../schemas/resourceFormSchema';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource?: Resource | null;
    onSubmit: (data: ResourceFormData) => void | Promise<void>;
    isSubmitting?: boolean;
    metrics?: Metric[];
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
    isOpen,
    onClose,
    resource,
    onSubmit,
    isSubmitting = false,
    metrics = [],
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-700 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">
                        {resource ? 'Editar Recurso' : 'Nuevo Recurso'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <ResourceForm
                        resource={resource}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                        metrics={metrics}
                    />
                </div>

                {/* Footer con loading indicator */}
                {isSubmitting && (
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-center text-gray-400">
                            <svg
                                className="animate-spin h-5 w-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span className="text-sm">Guardando recurso...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};