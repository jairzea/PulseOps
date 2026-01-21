/**
 * Metrics API - Servicio específico para gestión de métricas
 */
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination';

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

export interface CreateMetricDto {
  key: string;
  label: string;
  description?: string;
  unit?: string;
  periodType?: string;
  resourceIds?: string[];
}

export interface UpdateMetricDto {
  label?: string;
  description?: string;
  unit?: string;
  periodType?: string;
  resourceIds?: string[];
}

/**
 * Interface para el servicio de métricas
 */
export interface MetricsApi {
  getAll(resourceId?: string): Promise<Metric[]>;
  getPaginated(params: PaginationParams): Promise<PaginatedResponse<Metric>>;
  getById(id: string): Promise<Metric>;
  create(data: CreateMetricDto): Promise<Metric>;
  update(id: string, data: UpdateMetricDto): Promise<Metric>;
  delete(id: string): Promise<void>;
}

/**
 * Implementación del servicio de métricas
 */
class MetricsApiImpl implements MetricsApi {
  private readonly basePath = '/metrics';

  async getAll(resourceId?: string): Promise<Metric[]> {
    const query = resourceId ? `?resourceId=${resourceId}` : '';
    const response = await httpClient.get<PaginatedResponse<Metric>>(`${this.basePath}${query}`);
    return response.data;
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Metric>> {
    const query = buildQueryString(params);
    return httpClient.get<PaginatedResponse<Metric>>(`${this.basePath}${query}`);
  }

  async getById(id: string): Promise<Metric> {
    return httpClient.get<Metric>(`${this.basePath}/${id}`);
  }

  async create(data: CreateMetricDto): Promise<Metric> {
    return httpClient.post<Metric>(this.basePath, data);
  }

  async update(id: string, data: UpdateMetricDto): Promise<Metric> {
    return httpClient.patch<Metric>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }
}

/**
 * Instancia exportada del servicio de métricas
 */
export const metricsApi = new MetricsApiImpl();
