/**
 * MetricModal - Modal para crear/editar métricas
 */
import React from 'react';
import { MetricForm } from './MetricForm';
import { useMetricsStore } from '../stores/metricsStore';
import { Resource } from '../services/apiClient';
import { MetricFormData } from '../schemas/metricFormSchema';

interface MetricModalProps {
    resources: Resource[];
}

export const MetricModal: React.FC<MetricModalProps> = ({ resources }) => {
    const { isModalOpen, editingMetric, loading, error, setModalOpen, createMetric, updateMetric } =
        useMetricsStore();

    const handleSubmit = async (data: MetricFormData) => {
        try {
            if (editingMetric) {
                await updateMetric(editingMetric.id, data);
            } else {
                await createMetric(data);
            }
        } catch (err) {
            console.error('Error al guardar métrica:', err);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setModalOpen(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isModalOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingMetric ? 'Editar Métrica' : 'Nueva Métrica'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <MetricForm
                        onSubmit={handleSubmit}
                        initialMetric={editingMetric}
                        resources={resources}
                        loading={loading}
                    />
                </div>

                {/* Footer con loading indicator */}
                {loading && (
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-center text-gray-500">
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
                            <span className="text-sm">Guardando métrica...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
