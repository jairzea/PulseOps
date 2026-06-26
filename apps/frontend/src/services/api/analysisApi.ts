/**
 * Analysis API - Evaluación de métricas y panorama del equipo.
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
    trend?: {
      condition: string;
      reason: { code: string; explanation: string; threshold?: number };
      inclination: {
        value: number | null;
        previousValue: number;
        currentValue: number;
        delta: number;
        isValid: boolean;
      };
      slope: number;
    };
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

export interface OverviewResource {
  resourceId: string;
  name: string;
  roleType: string;
  metricKey: string | null;
  condition: string | null;
  inclination: number | null;
}

export interface TeamOverview {
  totalResources: number;
  evaluated: number;
  byCondition: Record<string, number>;
  resources: OverviewResource[];
}

export interface ConsolidatedContribution {
  metricKey: string;
  condition: string;
  score: number;
}

export interface ConsolidatedEvaluation {
  resourceId: string;
  condition: string;
  reason: { code: string; explanation: string; threshold?: number };
  levelRatio: number;
  maxScore: number;
  metrics: ConsolidatedContribution[];
  windowUsed: number;
  evaluatedAt: string;
}

class AnalysisApiImpl {
  private readonly basePath = '/analysis';

  async evaluate(params: EvaluateParams): Promise<AnalysisResult> {
    const query = buildQueryString({
      resourceId: params.resourceId,
      metricKey: params.metricKey,
      ...(params.windowSize && { windowSize: params.windowSize }),
    });
    return httpClient.get<AnalysisResult>(`${this.basePath}/evaluate${query}`);
  }

  async getOverview(windowSize?: number): Promise<TeamOverview> {
    const qs = windowSize ? `?windowSize=${windowSize}` : '';
    return httpClient.get<TeamOverview>(`${this.basePath}/overview${qs}`);
  }

  async getConsolidated(resourceId: string, windowSize?: number): Promise<ConsolidatedEvaluation> {
    const query = buildQueryString({
      resourceId,
      ...(windowSize && { windowSize }),
    });
    return httpClient.get<ConsolidatedEvaluation>(`${this.basePath}/consolidated${query}`);
  }
}

export const analysisApi = new AnalysisApiImpl();
