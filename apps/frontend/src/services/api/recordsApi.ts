/**
 * Records API - Servicio específico para gestión de registros de métricas
 */
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination';

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

export interface CreateRecordDto {
  resourceId: string;
  metricKey: string;
  week: string;
  timestamp: string;
  value: number;
  source?: string;
}

export interface UpdateRecordDto {
  value?: number;
  source?: string;
}

/**
 * Interface para el servicio de registros
 */
export interface RecordsApi {
  getAll(resourceId?: string, metricKey?: string): Promise<Record[]>;
  getPaginated(params: PaginationParams & { resourceId?: string; metricKey?: string }): Promise<PaginatedResponse<Record>>;
  getById(id: string): Promise<Record>;
  create(data: CreateRecordDto): Promise<Record>;
  update(id: string, data: UpdateRecordDto): Promise<Record>;
  delete(id: string): Promise<void>;
  bulkCreate(data: CreateRecordDto[]): Promise<Record[]>;
}

/**
 * Implementación del servicio de registros
 */
class RecordsApiImpl implements RecordsApi {
  private readonly basePath = '/records';

  async getAll(resourceId?: string, metricKey?: string): Promise<Record[]> {
    const params: any = {};
    if (resourceId) params.resourceId = resourceId;
    if (metricKey) params.metricKey = metricKey;
    
    const query = buildQueryString(params);
    const response = await httpClient.get<PaginatedResponse<Record>>(`${this.basePath}${query}`);
    return response.data;
  }

  async getPaginated(params: PaginationParams & { resourceId?: string; metricKey?: string }): Promise<PaginatedResponse<Record>> {
    const query = buildQueryString(params);
    return httpClient.get<PaginatedResponse<Record>>(`${this.basePath}${query}`);
  }

  async getById(id: string): Promise<Record> {
    return httpClient.get<Record>(`${this.basePath}/${id}`);
  }

  async create(data: CreateRecordDto): Promise<Record> {
    return httpClient.post<Record>(this.basePath, data);
  }

  async update(id: string, data: UpdateRecordDto): Promise<Record> {
    return httpClient.patch<Record>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }

  async bulkCreate(data: CreateRecordDto[]): Promise<Record[]> {
    return httpClient.post<Record[]>(`${this.basePath}/bulk`, data);
  }
}

/**
 * Instancia exportada del servicio de registros
 */
export const recordsApi = new RecordsApiImpl();
