/**
 * Playbooks API - Servicio específico para gestión de playbooks
 */
import { httpClient } from './httpClient';

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

export interface UpdatePlaybookDto {
  title: string;
  steps: string[];
  version?: number;
  isActive?: boolean;
}

/**
 * Interface para el servicio de playbooks
 */
export interface PlaybooksApi {
  getAll(): Promise<Playbook[]>;
  getByCondition(condition: string): Promise<Playbook | null>;
  update(condition: string, data: UpdatePlaybookDto): Promise<Playbook>;
  seed(): Promise<{ message: string; created: number }>;
}

/**
 * Implementación del servicio de playbooks
 */
class PlaybooksApiImpl implements PlaybooksApi {
  private readonly basePath = '/playbooks';

  async getAll(): Promise<Playbook[]> {
    return httpClient.get<Playbook[]>(this.basePath);
  }

  async getByCondition(condition: string): Promise<Playbook | null> {
    return httpClient.get<Playbook | null>(`${this.basePath}/${condition}`);
  }

  async update(condition: string, data: UpdatePlaybookDto): Promise<Playbook> {
    return httpClient.put<Playbook>(`${this.basePath}/${condition}`, data);
  }

  async seed(): Promise<{ message: string; created: number }> {
    return httpClient.post<{ message: string; created: number }>(`${this.basePath}/seed`);
  }
}

/**
 * Instancia exportada del servicio de playbooks
 */
export const playbooksApi = new PlaybooksApiImpl();
