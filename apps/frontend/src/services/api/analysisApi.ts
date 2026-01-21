/**
 * Analysis API - Servicio específico para análisis de métricas
 */
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';

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

export interface EvaluateParams {
  resourceId: string;
  metricKey: string;
  windowSize?: number;
}

/**
 * Interface para el servicio de análisis
 */
export interface AnalysisApi {
  evaluate(params: EvaluateParams): Promise<AnalysisResult>;
}

/**
 * Implementación del servicio de análisis
 */
class AnalysisApiImpl implements AnalysisApi {
  private readonly basePath = '/analysis';

  async evaluate(params: EvaluateParams): Promise<AnalysisResult> {
    const query = buildQueryString({
      resourceId: params.resourceId,
      metricKey: params.metricKey,
      ...(params.windowSize && { windowSize: params.windowSize }),
    });
    return httpClient.get<AnalysisResult>(`${this.basePath}/evaluate${query}`);
  }
}

/**
 * Instancia exportada del servicio de análisis
 */
export const analysisApi = new AnalysisApiImpl();
