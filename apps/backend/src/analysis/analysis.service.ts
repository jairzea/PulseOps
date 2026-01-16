import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordsService } from '../records/records.service';
import { RulesService } from '../rules/rules.service';
import { PlaybooksService } from '../playbooks/playbooks.service';
import { analysisEngine } from '@pulseops/analysis-engine';
import {
  MetricSeries,
  MetricConditionEvaluation,
} from '@pulseops/shared-types';

export interface EvaluationResponse {
  series: MetricSeries;
  evaluation: MetricConditionEvaluation;
  appliedRuleConfig?: { id: string; version: number } | null;
  playbook?: {
    condition: string;
    title: string;
    steps: string[];
    version: number;
  } | null;
}

@Injectable()
export class AnalysisService {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly rulesService: RulesService,
    private readonly playbooksService: PlaybooksService,
  ) {}

  async evaluate(
    resourceId: string,
    metricKey: string,
    windowSize?: number,
  ): Promise<EvaluationResponse> {
    // 1. Cargar histórico desde records
    const records = await this.recordsService.findMany({
      resourceId,
      metricKey,
    });

    if (records.length === 0) {
      throw new NotFoundException(
        `No records found for resourceId=${resourceId}, metricKey=${metricKey}`,
      );
    }

    // 2. Convertir a MetricSeries
    const series: MetricSeries = {
      metricId: metricKey,
      points: records.map((r) => ({
        timestamp: r.timestamp,
        value: r.value,
      })),
    };

    // 3. Obtener config activa (si existe)
    const activeRule = await this.rulesService.findActive(metricKey);

    // 4. Determinar windowSize final
    const finalWindowSize = windowSize || activeRule?.windowSize || 2;

    // 5. Invocar motor de análisis
    const evaluation = analysisEngine.analyzeWithConditions(series, {
      size: finalWindowSize,
    });

    // 6. Obtener playbook para la condición detectada
    const playbook = await this.playbooksService.findByCondition(
      evaluation.condition as any,
    );

    // 7. Retornar resultado
    return {
      series,
      evaluation,
      appliedRuleConfig: activeRule
        ? { id: activeRule.id, version: activeRule.version }
        : null,
      playbook: playbook
        ? {
            condition: playbook.condition,
            title: playbook.title,
            steps: playbook.steps,
            version: playbook.version,
          }
        : null,
    };
  }
}
