/**
 * Metrics Store - Estado global para métricas con Zustand
 */
import { create } from 'zustand';
import { Metric, apiClient } from '../services/apiClient';

interface MetricsState {
  // Estado
  metrics: Metric[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingMetric: Metric | null;

  // Acciones
  setModalOpen: (isOpen: boolean) => void;
  setEditingMetric: (metric: Metric | null) => void;
  
  // Operaciones CRUD
  fetchMetrics: () => Promise<void>;
  createMetric: (data: {
    key: string;
    label: string;
    description?: string;
    unit?: string;
    periodType?: string;
    resourceIds: string[];
  }) => Promise<Metric>;
  updateMetric: (id: string, data: {
    key: string;
    label: string;
    description?: string;
    unit?: string;
    periodType?: string;
    resourceIds: string[];
  }) => Promise<Metric>;
  deleteMetric: (id: string) => Promise<void>;
  reset: () => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  // Estado inicial
  metrics: [],
  loading: false,
  error: null,
  isModalOpen: false,
  editingMetric: null,

  // Acciones
  setModalOpen: (isOpen: boolean) => {
    set({ isModalOpen: isOpen });
    if (!isOpen) {
      set({ editingMetric: null, error: null });
    }
  },

  setEditingMetric: (metric: Metric | null) => {
    set({ editingMetric: metric, isModalOpen: !!metric });
  },

  // Fetch de métricas
  fetchMetrics: async () => {
    set({ loading: true, error: null });
    try {
      const metrics = await apiClient.getMetrics();
      set({ metrics, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar métricas',
        loading: false,
      });
    }
  },

  // Crear métrica
  createMetric: async (data) => {
    set({ loading: true, error: null });
    try {
      const newMetric = await apiClient.createMetric({
        key: data.key,
        label: data.label,
        description: data.description,
        unit: data.unit,
        periodType: data.periodType,
        // TODO: Manejar resourceIds - puede requerir endpoint adicional
      });
      
      // Auto-refetch después de crear
      await get().fetchMetrics();
      set({ loading: false, isModalOpen: false });
      return newMetric;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear métrica';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Actualizar métrica
  updateMetric: async (id: string, data) => {
    set({ loading: true, error: null });
    try {
      const updatedMetric = await apiClient.updateMetric(id, {
        key: data.key,
        label: data.label,
        description: data.description,
        unit: data.unit,
        periodType: data.periodType,
        // TODO: Manejar resourceIds - puede requerir endpoint adicional
      });
      
      // Auto-refetch después de actualizar
      await get().fetchMetrics();
      set({ loading: false, isModalOpen: false, editingMetric: null });
      return updatedMetric;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar métrica';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Eliminar métrica
  deleteMetric: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.deleteMetric(id);
      
      // Auto-refetch después de eliminar
      await get().fetchMetrics();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar métrica',
        loading: false,
      });
    }
  },

  // Reset del store
  reset: () => {
    set({
      metrics: [],
      loading: false,
      error: null,
      isModalOpen: false,
      editingMetric: null,
    });
  },
}));
