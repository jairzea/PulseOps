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

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title" 
            role="dialog" 
            aria-modal="true"
        >
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Modal panel */}
                <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-white">
                        {resource ? 'Editar Recurso' : 'Nuevo Recurso'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
            </div>
        </div>
    );
};
