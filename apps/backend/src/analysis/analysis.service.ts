import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordsService } from '../records/records.service';
import { RulesService } from '../rules/rules.service';
import { PlaybooksService } from '../playbooks/playbooks.service';
import { analysisEngine } from '@pulseops/analysis-engine';
import { ConfigurationService } from '../configuration/configuration.service';
import { UsersService } from '../users/users.service';
import { MetricsService } from '../metrics/metrics.service';
import { UserRole } from '../users/schemas/user.schema';
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

export interface OverviewResponse {
  totalResources: number;
  evaluated: number;
  byCondition: Record<string, number>;
  resources: Array<{
    resourceId: string;
    name: string;
    roleType: string;
    metricKey: string | null;
    condition: string | null;
    inclination: number | null;
  }>;
}

@Injectable()
export class AnalysisService {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly rulesService: RulesService,
    private readonly playbooksService: PlaybooksService,
    private readonly configurationService: ConfigurationService,
    private readonly usersService: UsersService,
    private readonly metricsService: MetricsService,
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

    // 5. Obtener configuración activa y pasar umbrales al motor
    const activeConfig =
      await this.configurationService.getActiveConfiguration();

    const evaluation = analysisEngine.analyzeWithConditions(series, {
      size: finalWindowSize,
      thresholds: activeConfig.thresholds,
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

  /**
   * Panorama del equipo: evalúa la primera métrica de cada recurso (usuario role
   * 'user') y agrega el conteo por condición operativa. Pensado para una vista
   * de overview; calcula todo en el backend para evitar N llamadas desde el front.
   */
  async overview(windowSize?: number): Promise<OverviewResponse> {
    const users = await this.usersService.findAll(false);
    const resources = users.filter((u) => u.role === UserRole.USER);

    const byCondition: Record<string, number> = {};
    const rows: OverviewResponse['resources'] = [];
    let evaluated = 0;

    for (const u of resources) {
      const resourceId = u._id.toString();
      const name = u.name;
      const roleType = u.resourceProfile?.resourceType ?? 'OTHER';

      // Métricas asociadas al recurso; tomamos la primera con histórico evaluable.
      let metricKey: string | null = null;
      let condition: string | null = null;
      let inclination: number | null = null;

      try {
        const metrics = await this.metricsService.findByResource(resourceId);
        for (const m of metrics) {
          try {
            const res = await this.evaluate(resourceId, m.key, windowSize);
            metricKey = m.key;
            condition = res.evaluation.condition;
            inclination = res.evaluation.inclination?.value ?? null;
            break; // primera métrica evaluable
          } catch {
            // sin records para esa métrica; probar la siguiente
          }
        }
      } catch {
        // recurso sin métricas asociadas
      }

      if (condition) {
        evaluated++;
        byCondition[condition] = (byCondition[condition] ?? 0) + 1;
      }

      rows.push({ resourceId, name, roleType, metricKey, condition, inclination });
    }

    return {
      totalResources: resources.length,
      evaluated,
      byCondition,
      resources: rows,
    };
  }
}
