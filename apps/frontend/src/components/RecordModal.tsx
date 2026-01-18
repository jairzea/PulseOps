/**
 * RecordModal - Modal con integración a Zustand store
 */
import { useEffect, useState } from 'react';
import { Resource } from '../services/apiClient';
import { RecordForm } from './RecordForm';
import { useRecordsStore } from '../stores/recordsStore';
import { useToast } from '../hooks/useToast';

interface RecordModalProps {
    resources: Resource[];
    title?: string;
}

export const RecordModal: React.FC<RecordModalProps> = ({
    resources,
    title,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        isModalOpen,
        error: storeError,
        setModalOpen,
        createRecord
    } = useRecordsStore();

    const { success, error: showError } = useToast();

    // Prevenir scroll del body cuando modal está abierto
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Crear múltiples registros, uno por cada métrica con valor
            const metricValues = data.metricValues || {};
            const promises = Object.entries(metricValues)
                .filter(([_, value]) => value !== null && value !== undefined && value !== 0)
                .map(([metricKey, value]) => {
                    return createRecord({
                        resourceId: data.resourceId,
                        metricKey,
                        week: data.week,
                        timestamp: data.timestamp,
                        value: value as number,
                        source: 'MANUAL',
                    });
                });

            if (promises.length === 0) {
                showError('Debes ingresar al menos un valor de métrica');
                return;
            }

            await Promise.all(promises);
            success(`${promises.length} registro(s) creado(s) correctamente`);
            setModalOpen(false);
        } catch (err) {
            console.error('Error submitting record:', err);
            showError('Error al crear los registros');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setModalOpen(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
        }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
            handleClose();
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [isModalOpen, isSubmitting]);

    if (!isModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl transition-colors duration-300 shadow-2xl w-full max-w-lg mx-4 border border-gray-700 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title || 'Nuevo Registro Manual'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-900 dark:text-white transition-colors disabled:opacity-50"
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
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {storeError && (
                        <div className="mb-4 bg-red-900/20 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
                            <p className="text-sm">{storeError}</p>
                        </div>
                    )}

                    <RecordForm
                        resources={resources}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
};
