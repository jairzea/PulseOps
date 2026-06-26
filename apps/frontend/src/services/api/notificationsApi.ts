/**
 * Notifications API — notificación por correo de un clic (Fase 3).
 */
import { httpClient } from './httpClient';

export interface NotifyConditionParams {
  resourceId: string;
  condition: string;
  explanation?: string;
  kind?: 'metric' | 'consolidated';
}

export interface NotifyResult {
  sent: boolean;
  to: string;
  condition: string;
}

class NotificationsApiImpl {
  private readonly basePath = '/notifications';

  async notifyCondition(params: NotifyConditionParams): Promise<NotifyResult> {
    return httpClient.post<NotifyResult>(`${this.basePath}/condition`, params);
  }
}

export const notificationsApi = new NotificationsApiImpl();
