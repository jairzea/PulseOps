/**
 * Resources API - Servicio específico para gestión de recursos
 */
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination';

export interface Resource {
  id: string;
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceStats {
  total: number;
  active: number;
  inactive: number;
  byRoleType: Record<string, number>;
}

export interface CreateResourceDto {
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  isActive?: boolean;
}

export interface UpdateResourceDto {
  name?: string;
  roleType?: 'DEV' | 'TL' | 'OTHER';
  isActive?: boolean;
}

/**
 * Interface para el servicio de recursos
 */
export interface ResourcesApi {
  getAll(): Promise<Resource[]>;
  getPaginated(params: PaginationParams): Promise<PaginatedResponse<Resource>>;
  getStats(): Promise<ResourceStats>;
  getById(id: string): Promise<Resource>;
  create(data: CreateResourceDto): Promise<Resource>;
  update(id: string, data: UpdateResourceDto): Promise<Resource>;
  delete(id: string): Promise<void>;
}

/**
 * Implementación del servicio de recursos
 */
class ResourcesApiImpl implements ResourcesApi {
  private readonly basePath = '/resources';

  async getAll(): Promise<Resource[]> {
    const response = await httpClient.get<PaginatedResponse<Resource>>(this.basePath);
    return response.data;
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Resource>> {
    const query = buildQueryString(params);
    return httpClient.get<PaginatedResponse<Resource>>(`${this.basePath}${query}`);
  }

  async getStats(): Promise<ResourceStats> {
    return httpClient.get<ResourceStats>(`${this.basePath}/stats`);
  }

  async getById(id: string): Promise<Resource> {
    return httpClient.get<Resource>(`${this.basePath}/${id}`);
  }

  async create(data: CreateResourceDto): Promise<Resource> {
    return httpClient.post<Resource>(this.basePath, data);
  }

  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    return httpClient.patch<Resource>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }
}

/**
 * Instancia exportada del servicio de recursos
 */
export const resourcesApi = new ResourcesApiImpl();
