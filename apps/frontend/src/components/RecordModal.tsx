/**
 * RecordModal - Modal con integración a Zustand store
 */
import { useEffect, useState } from 'react';
import { Resource, Metric } from '../services/apiClient';
import { RecordForm } from './RecordForm';
import { RecordFormData } from '../schemas/recordFormSchema';
import { useRecordsStore } from '../stores/recordsStore';

interface RecordModalProps {
  resources: Resource[];
  metrics: Metric[];
  title?: string;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  resources,
  metrics,
  title,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    isModalOpen, 
    editingRecord, 
    error: storeError,
    setModalOpen, 
    createRecord 
  } = useRecordsStore();

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

  const handleSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      await createRecord(data);
      setModalOpen(false);
    } catch (err) {
      console.error('Error submitting record:', err);
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
        className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-gray-700 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {title || (editingRecord ? 'Editar Registro' : 'Nuevo Registro Manual')}
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
          {storeError && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-sm text-red-400">{storeError}</p>
            </div>
          )}

          <RecordForm
            resources={resources}
            metrics={metrics}
            initialRecord={editingRecord}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
