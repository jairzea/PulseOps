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
  
  getResources: () => resourcesApi.getAll(),
  
  getResourcesPaginated: (params: PaginationParams) => 
    resourcesApi.getPaginated(params),

  getResourcesStats: async () => {
    const stats = await resourcesApi.getStats();
    return {
      totalResources: stats.total,
      activeResources: stats.active,
      devResources: stats.byRoleType['DEV'] || 0,
      tlResources: stats.byRoleType['TL'] || 0,
    };
  },

  getResource: (id: string) => resourcesApi.getById(id),

  getResourceMetrics: async (id: string) => {
    return metricsApi.getAll(id);
  },

  createResource: (data: any) => resourcesApi.create(data),

  updateResource: (id: string, data: any) => resourcesApi.update(id, data),

  deleteResource: (id: string) => resourcesApi.delete(id),

  // --------------------------------------------------------------------------
  // Metrics
  // --------------------------------------------------------------------------

  getMetrics: (resourceId?: string) => metricsApi.getAll(resourceId),

  getMetricsPaginated: (params: PaginationParams) => 
    metricsApi.getPaginated(params),

  getMetric: (id: string) => metricsApi.getById(id),

  createMetric: (data: any) => metricsApi.create(data),

  updateMetric: (id: string, data: any) => metricsApi.update(id, data),

  deleteMetric: async (id: string) => {
    await metricsApi.delete(id);
    return { deleted: true, id };
  },

  // --------------------------------------------------------------------------
  // Records
  // --------------------------------------------------------------------------

  getRecords: (params?: { resourceId?: string; metricKey?: string }) => 
    recordsApi.getAll(params?.resourceId, params?.metricKey),

  getRecordsPaginated: (paginationParams: PaginationParams, filters?: any) =>
    recordsApi.getPaginated({ ...paginationParams, ...filters }),

  createRecord: (data: any) => recordsApi.create(data),

  upsertRecord: (data: any) => recordsApi.create(data),

  deleteRecord: async (id: string) => {
    await recordsApi.delete(id);
    return { deleted: true };
  },

  // --------------------------------------------------------------------------
  // Analysis
  // --------------------------------------------------------------------------

  evaluate: (params: { resourceId: string; metricKey: string; windowSize?: number }) =>
    analysisApi.evaluate(params),

  // --------------------------------------------------------------------------
  // Conditions
  // --------------------------------------------------------------------------

  getConditionsMetadata: () => conditionsApi.getMetadata(),

  // --------------------------------------------------------------------------
  // Playbooks
  // --------------------------------------------------------------------------

  getAllPlaybooks: () => playbooksApi.getAll(),

  getPlaybookByCondition: (condition: string) => 
    playbooksApi.getByCondition(condition),

  updatePlaybook: (condition: string, data: any) => 
    playbooksApi.update(condition, data),

  seedPlaybooks: () => playbooksApi.seed(),
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

