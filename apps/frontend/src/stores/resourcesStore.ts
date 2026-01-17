/**
 * Resources Store - Zustand store para gestión de recursos (solo datos globales)
 */
import { create } from 'zustand';
import { apiClient, Resource } from '../services/apiClient';
import { AppError } from '../utils/errors';

interface ResourcesState {
    resources: Resource[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchResources: () => Promise<void>;
    createResource: (data: {
        name: string;
        roleType: 'DEV' | 'TL' | 'OTHER';
        isActive?: boolean;
        metricIds?: string[];
    }) => Promise<Resource>;
    updateResource: (
        id: string,
        data: {
            name?: string;
            roleType?: 'DEV' | 'TL' | 'OTHER';
            isActive?: boolean;
            metricIds?: string[];
        }
    ) => Promise<Resource>;
    deleteResource: (id: string) => Promise<void>;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
    resources: [],
    loading: false,
    error: null,

    // Fetch resources
    fetchResources: async () => {
        set({ loading: true, error: null });
        try {
            const resources = await apiClient.getResources();
            set({ resources, loading: false });
        } catch (error) {
            const errorMessage = error instanceof AppError ? error.getUserMessage() : 'Error al cargar recursos';
            set({ error: errorMessage, loading: false });
        }
    },

    // Create resource
    createResource: async (data) => {
        set({ loading: true, error: null });
        try {
            const newResource = await apiClient.createResource({
                name: data.name,
                roleType: data.roleType,
                isActive: data.isActive ?? true,
            });

            // Auto-refetch después de crear
            await get().fetchResources();
            set({ loading: false });
            return newResource;
        } catch (error) {
            const errorMessage = error instanceof AppError ? error.getUserMessage() : 'Error al crear recurso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Update resource
    updateResource: async (id: string, data) => {
        set({ loading: true, error: null });
        try {
            const updatedResource = await apiClient.updateResource(id, {
                name: data.name,
                roleType: data.roleType,
                isActive: data.isActive,
            });

            // Auto-refetch después de actualizar
            await get().fetchResources();
            set({ loading: false });
            return updatedResource;
        } catch (error) {
            const errorMessage = error instanceof AppError ? error.getUserMessage() : 'Error al actualizar recurso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Delete resource (soft delete)
    deleteResource: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await apiClient.updateResource(id, { isActive: false });
            // Auto-refetch después de eliminar
            await get().fetchResources();
            set({ loading: false });
        } catch (error) {
            const errorMessage = error instanceof AppError ? error.getUserMessage() : 'Error al eliminar recurso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },
}));
