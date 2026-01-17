/**
 * MetricModal - Modal para crear/editar métricas
 */
import React, { useState } from 'react';
import { MetricForm } from './MetricForm';
import { useMetricsStore } from '../stores/metricsStore';
import { Resource, Metric } from '../services/apiClient';
import { MetricFormData } from '../schemas/metricFormSchema';
import { PulseLoader } from './PulseLoader';
import { useToast } from '../hooks/useToast';

interface MetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingMetric: Metric | null;
    resources: Resource[];
}

export const MetricModal: React.FC<MetricModalProps> = ({ isOpen, onClose, editingMetric, resources }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error, createMetric, updateMetric } = useMetricsStore();
    const { success, error: showError } = useToast();

    const handleSubmit = async (data: MetricFormData) => {
        setIsSubmitting(true);
        try {
            if (editingMetric) {
                await updateMetric(editingMetric.id, data);
                success('Métrica actualizada correctamente');
            } else {
                await createMetric(data);
                success('Métrica creada correctamente');
            }
            onClose();
        } catch (err) {
            console.error('Error al guardar métrica:', err);
            showError(err instanceof Error ? err.message : 'Error al guardar la métrica');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">
                        {editingMetric ? 'Editar Métrica' : 'Nueva Métrica'}
                    </h2>
                    <button
                        onClick={handleClose}
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
                    {error && (
                        <div className="mb-4 bg-red-900/20 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <MetricForm
                        onSubmit={handleSubmit}
                        initialMetric={editingMetric}
                        resources={resources}
                        loading={isSubmitting}
                    />
                </div>

                {/* Footer con loading indicator */}
                {isSubmitting && (
                    <div className="px-6 pb-6">
                        <PulseLoader size="md" variant="primary" text="Guardando métrica..." />
                    </div>
                )}
            </div>
        </div>
    );
};