/**
 * Conditions API - Servicio específico para gestión de condiciones operativas
 */
import { httpClient } from './httpClient';

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
    glow: string;
  };
  icon: string;
  category: 'superior' | 'normal' | 'crisis' | 'technical';
}

/**
 * Interface para el servicio de condiciones
 */
export interface ConditionsApi {
  getMetadata(): Promise<ConditionMetadata[]>;
}

/**
 * Implementación del servicio de condiciones
 */
class ConditionsApiImpl implements ConditionsApi {
  private readonly basePath = '/conditions';

  async getMetadata(): Promise<ConditionMetadata[]> {
    return httpClient.get<ConditionMetadata[]>(`${this.basePath}/metadata`);
  }
}

/**
 * Instancia exportada del servicio de condiciones
 */
export const conditionsApi = new ConditionsApiImpl();
