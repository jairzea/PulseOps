/**
 * Records Store - Manejo de estado global con Zustand
 */
import { create } from 'zustand';
import { apiClient, Record as MetricRecord } from '../services/apiClient';

interface RecordsState {
  // State
  records: MetricRecord[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingRecord: MetricRecord | null;
  lastCreatedRecord: { resourceId: string; metricKey: string } | null;

  // Actions
  setModalOpen: (isOpen: boolean) => void;
  setEditingRecord: (record: MetricRecord | null) => void;
  fetchRecords: (params?: {
    resourceId?: string;
    metricKey?: string;
    fromWeek?: string;
    toWeek?: string;
  }) => Promise<void>;
  createRecord: (data: {
    resourceId: string;
    metricKey: string;
    week: string;
    timestamp: string;
    value: number;
    source?: string;
  }) => Promise<MetricRecord>;
  deleteRecord: (id: string) => Promise<void>;
  reset: () => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  // Initial state
  records: [],
  loading: false,
  error: null,
  isModalOpen: false,
  editingRecord: null,
  lastCreatedRecord: null,

  // Actions
  setModalOpen: (isOpen) => {
    set({ isModalOpen: isOpen });
    if (!isOpen) {
      set({ editingRecord: null, error: null });
    }
  },

  setEditingRecord: (record) => {
    set({ editingRecord: record });
    if (record) {
      set({ isModalOpen: true });
    }
  },

  fetchRecords: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.getRecords(params);
      set({ records: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al cargar registros',
        loading: false,
      });
    }
  },

  createRecord: async (data) => {
    set({ error: null });
    try {
      const newRecord = await apiClient.upsertRecord(data);
      // Guardar el último registro creado
      set({ 
        lastCreatedRecord: {
          resourceId: data.resourceId,
          metricKey: data.metricKey
        }
      });
      // Refetch con los mismos parámetros si existen
      const currentParams = {
        resourceId: data.resourceId,
        metricKey: data.metricKey,
      };
      await get().fetchRecords(currentParams);
      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear registro';
      set({ error: errorMessage });
      throw err;
    }
  },

  deleteRecord: async (id) => {
    set({ error: null });
    try {
      await apiClient.deleteRecord(id);
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al eliminar registro',
      });
      throw err;
    }
  },

  reset: () => {
    set({
      records: [],
      loading: false,
      error: null,
      isModalOpen: false,
      editingRecord: null,
      lastCreatedRecord: null,
    });
  },
}));
