/**
 * API Client - Facade de compatibilidad para servicios API
 * @deprecated Use servicios específicos: metricsApi, resourcesApi, recordsApi, etc.
 * Este facade se mantiene para compatibilidad con código existente.
 */

// Re-exportar tipos de los servicios específicos
export type { 
  Resource, 
  ResourceStats,
  CreateResourceDto, 
  UpdateResourceDto 
} from './api/resourcesApi';

export type { 
  Metric, 
  CreateMetricDto, 
  UpdateMetricDto 
} from './api/metricsApi';

export type { 
  Record, 
  CreateRecordDto, 
  UpdateRecordDto 
} from './api/recordsApi';

export type { 
  AnalysisResult, 
  EvaluateParams 
} from './api/analysisApi';

export type { 
  ConditionMetadata 
} from './api/conditionsApi';

export type { 
  Playbook, 
  UpdatePlaybookDto 
} from './api/playbooksApi';

// Importar servicios específicos
import { metricsApi } from './api/metricsApi';
import { resourcesApi } from './api/resourcesApi';
import { recordsApi } from './api/recordsApi';
import { analysisApi } from './api/analysisApi';
import { conditionsApi } from './api/conditionsApi';
import { playbooksApi } from './api/playbooksApi';
import type { PaginationParams } from '../types/pagination';


/**
 * API Client Facade - Mantiene compatibilidad con código existente
 * @deprecated Migrar gradualmente a servicios específicos
 */
export const apiClient = {
  // --------------------------------------------------------------------------
  // Resources
  // --------------------------------------------------------------------------
  
  getResources: async () => await resourcesApi.getAll(),
  
  getResourcesPaginated: async (params: PaginationParams) => 
    await resourcesApi.getPaginated(params),

  getResourcesStats: async () => {
    const stats = await resourcesApi.getStats();
    return {
      totalResources: stats.totalResources || 0,
      activeResources: stats.activeResources || 0,
      devResources: stats.devResources || 0,
      tlResources: stats.tlResources || 0,
    };
  },

  getResource: async (id: string) => await resourcesApi.getById(id),

  getResourceMetrics: async (id: string) => {
    return await metricsApi.getAll(id);
  },

  createResource: async (data: any) => await resourcesApi.create(data),

  updateResource: async (id: string, data: any) => await resourcesApi.update(id, data),

  deleteResource: async (id: string) => await resourcesApi.delete(id),

  // --------------------------------------------------------------------------
  // Metrics
  // --------------------------------------------------------------------------

  getMetrics: async (resourceId?: string) => await metricsApi.getAll(resourceId),

  getMetricsPaginated: async (params: PaginationParams) => 
    await metricsApi.getPaginated(params),

  getMetric: async (id: string) => await metricsApi.getById(id),

  createMetric: async (data: any) => await metricsApi.create(data),

  updateMetric: async (id: string, data: any) => await metricsApi.update(id, data),

  deleteMetric: async (id: string) => {
    await metricsApi.delete(id);
    return { deleted: true, id };
  },

  // --------------------------------------------------------------------------
  // Records
  // --------------------------------------------------------------------------

  getRecords: async (params?: { resourceId?: string; metricKey?: string }) => 
    await recordsApi.getAll(params?.resourceId, params?.metricKey),

  getRecordsPaginated: async (paginationParams: PaginationParams, filters?: any) =>
    await recordsApi.getPaginated({ ...paginationParams, ...filters }),

  createRecord: async (data: any) => await recordsApi.create(data),

  upsertRecord: async (data: any) => await recordsApi.create(data),

  deleteRecord: async (id: string) => {
    await recordsApi.delete(id);
    return { deleted: true };
  },

  // --------------------------------------------------------------------------
  // Analysis
  // --------------------------------------------------------------------------

  evaluate: async (params: { resourceId: string; metricKey: string; windowSize?: number }) =>
    await analysisApi.evaluate(params),

  // --------------------------------------------------------------------------
  // Conditions
  // --------------------------------------------------------------------------

  getConditionsMetadata: async () => await conditionsApi.getMetadata(),

  // --------------------------------------------------------------------------
  // Playbooks
  // --------------------------------------------------------------------------

  getAllPlaybooks: async () => await playbooksApi.getAll(),

  getPlaybookByCondition: async (condition: string) => 
    await playbooksApi.getByCondition(condition),

  updatePlaybook: async (condition: string, data: any) => 
    await playbooksApi.update(condition, data),

  seedPlaybooks: async () => await playbooksApi.seed(),
};

// Export specific APIs for direct usage (recommended)
export { 
  metricsApi, 
  resourcesApi, 
  recordsApi, 
  analysisApi, 
  conditionsApi, 
  playbooksApi 
};

