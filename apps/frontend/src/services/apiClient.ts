/**
 * API Client - Servicio centralizado para comunicación con el backend
 */
import { ErrorHandler } from '../utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Tipos compartidos
// ============================================================================

export interface Resource {
  id: string;
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  id: string;
  key: string;
  label: string;
  description?: string;
  unit?: string;
  periodType?: string;
  resourceIds?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Record {
  id: string;
  resourceId: string;
  metricKey: string;
  week: string;
  timestamp: string;
  value: number;
  source?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  series: {
    metricId: string;
    points: Array<{ timestamp: string; value: number }>;
  };
  evaluation: {
    metricId: string;
    windowUsed: number;
    periodType: string;
    inclination: {
      value: number;
      previousValue: number;
      currentValue: number;
      delta: number;
      isValid: boolean;
    };
    direction: string;
    condition: string;
    reason: {
      code: string;
      explanation: string;
      threshold?: number;
    };
    signals: Array<{
      type: string;
      severity: string;
      explanation: string;
      windowUsed?: number;
      evidence?: any;
    }>;
    evaluatedAt: string;
    confidence: number;
  };
  appliedRuleConfig: any | null;
  playbook: {
    condition: string;
    title: string;
    steps: string[];
    version: number;
  } | null;
}

export interface ConditionMetadata {
  condition: string;
  order: number;
  displayName: string;
  description: string;
  color: {
    bg: string;
    badge: string;
    text: string;
    border: string;
  };
  icon: string;
  category: 'superior' | 'normal' | 'crisis' | 'technical';
}

export interface Playbook {
  _id?: string;
  condition: string;
  title: string;
  steps: string[];
  version: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Utilidades HTTP
// ============================================================================

async function fetchJSON<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as HeadersInit;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Delegar al ErrorHandler para procesar errores HTTP
      return await ErrorHandler.handleHttpError(response);
    }

    // Manejar respuestas sin cuerpo (204 No Content) o cuerpos vacíos
    const text = await response.text();
    if (!text) {
      return undefined as unknown as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      // Si ocurre un error al parsear, delegamos al manejador genérico
      return ErrorHandler.handleGenericError(err);
    }
  } catch (error) {
    // Delegar al ErrorHandler para procesar errores genéricos (network, etc)
    return ErrorHandler.handleGenericError(error);
  }
}

// ============================================================================
// API Client
// ============================================================================

export const apiClient = {
  // --------------------------------------------------------------------------
  // Resources
  // --------------------------------------------------------------------------
  
  async getResources(): Promise<Resource[]> {
    return fetchJSON<Resource[]>('/resources');
  },

  async getResource(id: string): Promise<Resource> {
    return fetchJSON<Resource>(`/resources/${id}`);
  },

  async getResourceMetrics(id: string): Promise<Metric[]> {
    return fetchJSON<Metric[]>(`/resources/${id}/metrics`);
  },

  async createResource(data: Partial<Resource>): Promise<Resource> {
    return fetchJSON<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    return fetchJSON<Resource>(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteResource(id: string): Promise<void> {
    return fetchJSON<void>(`/resources/${id}`, {
      method: 'DELETE',
    });
  },

  // --------------------------------------------------------------------------
  // Metrics
  // --------------------------------------------------------------------------

  async getMetrics(resourceId?: string): Promise<Metric[]> {
    const query = resourceId ? `?resourceId=${resourceId}` : '';
    return fetchJSON<Metric[]>(`/metrics${query}`);
  },

  async getMetric(id: string): Promise<Metric> {
    return fetchJSON<Metric>(`/metrics/${id}`);
  },

  async createMetric(data: Partial<Metric>): Promise<Metric> {
    return fetchJSON<Metric>('/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMetric(id: string, data: Partial<Metric>): Promise<Metric> {
    return fetchJSON<Metric>(`/metrics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteMetric(id: string): Promise<{ deleted: boolean; id: string }> {
    return fetchJSON<{ deleted: boolean; id: string }>(`/metrics/${id}`, {
      method: 'DELETE',
    });
  },

  // --------------------------------------------------------------------------
  // Records
  // --------------------------------------------------------------------------

  async getRecords(params?: {
    resourceId?: string;
    metricKey?: string;
    fromWeek?: string;
    toWeek?: string;
  }): Promise<Record[]> {
    const query = new URLSearchParams();
    if (params?.resourceId) query.set('resourceId', params.resourceId);
    if (params?.metricKey) query.set('metricKey', params.metricKey);
    if (params?.fromWeek) query.set('fromWeek', params.fromWeek);
    if (params?.toWeek) query.set('toWeek', params.toWeek);

    const queryString = query.toString();
    const endpoint = queryString ? `/records?${queryString}` : '/records';
    
    return fetchJSON<Record[]>(endpoint);
  },

  async createRecord(data: {
    resourceId: string;
    metricKey: string;
    week: string;
    timestamp: string;
    value: number;
    source?: string;
  }): Promise<Record> {
    return fetchJSON<Record>('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async upsertRecord(data: {
    resourceId: string;
    metricKey: string;
    week: string;
    timestamp: string;
    value: number;
    source?: string;
  }): Promise<Record> {
    return fetchJSON<Record>('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteRecord(id: string): Promise<{ deleted: boolean }> {
    return fetchJSON<{ deleted: boolean }>(`/records/${id}`, {
      method: 'DELETE',
    });
  },

  // --------------------------------------------------------------------------
  // Analysis
  // --------------------------------------------------------------------------

  async evaluate(params: {
    resourceId: string;
    metricKey: string;
    windowSize?: number;
  }): Promise<AnalysisResult> {
    const query = new URLSearchParams();
    query.set('resourceId', params.resourceId);
    query.set('metricKey', params.metricKey);
    if (params.windowSize) query.set('windowSize', params.windowSize.toString());

    return fetchJSON<AnalysisResult>(`/analysis/evaluate?${query.toString()}`);
  },

  // --------------------------------------------------------------------------
  // Conditions
  // --------------------------------------------------------------------------

  async getConditionsMetadata(): Promise<ConditionMetadata[]> {
    return fetchJSON<ConditionMetadata[]>('/conditions/metadata');
  },

  // --------------------------------------------------------------------------
  // Playbooks
  // --------------------------------------------------------------------------

  async getAllPlaybooks(): Promise<Playbook[]> {
    return fetchJSON<Playbook[]>('/playbooks');
  },

  async getPlaybookByCondition(condition: string): Promise<Playbook | null> {
    return fetchJSON<Playbook | null>(`/playbooks/${condition}`);
  },

  async updatePlaybook(condition: string, data: {
    title: string;
    steps: string[];
    version?: number;
    isActive?: boolean;
  }): Promise<Playbook> {
    return fetchJSON<Playbook>(`/playbooks/${condition}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async seedPlaybooks(): Promise<{ message: string; created: number }> {
    return fetchJSON<{ message: string; created: number }>('/playbooks/seed', {
      method: 'POST',
    });
  },
};
