import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ResourcesService } from '../resources/resources.service';
import { MetricsService } from '../metrics/metrics.service';
import { RecordsService } from '../records/records.service';

/**
 * Script de seed con datos de prueba diversos para demostrar
 * el comportamiento dinámico del dashboard con diferentes condiciones.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const resourcesService = app.get(ResourcesService);
  const metricsService = app.get(MetricsService);
  const recordsService = app.get(RecordsService);

  console.log('🌱 Iniciando seed de datos de prueba...\n');

  // ============================================================================
  // 1. Crear recursos (6 desarrolladores + 2 líderes técnicos)
  // ============================================================================
  console.log('📋 Creando recursos...');
  
  const resources = [
    { name: 'Ana García', roleType: 'DEV' as const },
    { name: 'Carlos Mendoza', roleType: 'DEV' as const },
    { name: 'Diana López', roleType: 'DEV' as const },
    { name: 'Eduardo Ruiz', roleType: 'DEV' as const },
    { name: 'Fernanda Torres', roleType: 'DEV' as const },
    { name: 'Gabriel Santos', roleType: 'DEV' as const },
    { name: 'Helena Vargas', roleType: 'TL' as const },
    { name: 'Ignacio Morales', roleType: 'TL' as const },
  ];

  const createdResources = [];
  for (const resource of resources) {
    const created = await resourcesService.create(
      {
        ...resource,
        isActive: true,
      },
      'system-seed',
    );
    createdResources.push(created);
    console.log(`  ✓ ${created.name} (${created.roleType})`);
  }

  // ============================================================================
  // 2. Crear métricas
  // ============================================================================
  console.log('\n📊 Creando métricas...');

  const metrics = [
    {
      key: 'story_points',
      label: 'Story Points',
      description: 'Puntos de historia completados',
      unit: 'points',
      periodType: 'weekly',
    },
    {
      key: 'performance',
      label: 'Performance Score',
      description: 'Puntuación de desempeño general',
      unit: 'percentage',
      periodType: 'weekly',
    },
    {
      key: 'code_reviews',
      label: 'Code Reviews',
      description: 'Revisiones de código realizadas',
      unit: 'count',
      periodType: 'weekly',
    },
    {
      key: 'integrations',
      label: 'Integraciones',
      description: 'Integraciones completadas',
      unit: 'count',
      periodType: 'weekly',
    },
    {
      key: 'bugs_fixed',
      label: 'Bugs Fixed',
      description: 'Bugs corregidos',
      unit: 'count',
      periodType: 'weekly',
    },
  ];

  const createdMetrics = [];
  for (const metric of metrics) {
    const created = await metricsService.create(metric, 'system-seed');
    createdMetrics.push(created);
    console.log(`  ✓ ${created.label}`);
  }

  // ============================================================================
  // 3. Crear records con patrones diversos
  // ============================================================================
  console.log('\n📈 Creando records con patrones diversos...\n');

  const now = new Date();
  const getWeek = (weeksAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - weeksAgo * 7);
    const year = date.getFullYear();
    const week = Math.ceil(
      ((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  // Patrones para demostrar diferentes condiciones:
  
  // Ana García - PODER (crecimiento sostenido)
  console.log('  Ana García - Story Points (PODER):');
  const anaStoryPoints = [45, 48, 50, 52, 54, 56, 58, 60];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[0].id,
        metricKey: 'story_points',
        week: getWeek(7 - i),
        value: anaStoryPoints[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${anaStoryPoints.join(' → ')}`);

  // Carlos Mendoza - AFLUENCIA (crecimiento explosivo reciente)
  console.log('  Carlos Mendoza - Story Points (AFLUENCIA):');
  const carlosStoryPoints = [30, 32, 34, 35, 38, 42, 50, 78];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[1].id,
        metricKey: 'story_points',
        week: getWeek(7 - i),
        value: carlosStoryPoints[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${carlosStoryPoints.join(' → ')}`);

  // Diana López - NORMAL (crecimiento moderado)
  console.log('  Diana López - Performance (NORMAL):');
  const dianaPerformance = [65, 68, 70, 73, 76, 78, 81, 84];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[2].id,
        metricKey: 'performance',
        week: getWeek(7 - i),
        value: dianaPerformance[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${dianaPerformance.join(' → ')}`);

  // Eduardo Ruiz - EMERGENCIA (estancamiento)
  console.log('  Eduardo Ruiz - Story Points (EMERGENCIA):');
  const eduardoStoryPoints = [50, 51, 49, 50, 51, 50, 49, 50];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[3].id,
        metricKey: 'story_points',
        week: getWeek(7 - i),
        value: eduardoStoryPoints[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${eduardoStoryPoints.join(' → ')}`);

  // Fernanda Torres - PELIGRO (caída pronunciada)
  console.log('  Fernanda Torres - Performance (PELIGRO):');
  const fernandaPerformance = [85, 80, 72, 65, 58, 50, 42, 35];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[4].id,
        metricKey: 'performance',
        week: getWeek(7 - i),
        value: fernandaPerformance[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${fernandaPerformance.join(' → ')}`);

  // Gabriel Santos - INEXISTENCIA (caída a cero)
  console.log('  Gabriel Santos - Code Reviews (INEXISTENCIA):');
  const gabrielCodeReviews = [15, 12, 8, 5, 3, 1, 0, 0];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[5].id,
        metricKey: 'code_reviews',
        week: getWeek(7 - i),
        value: gabrielCodeReviews[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${gabrielCodeReviews.join(' → ')}`);

  // Helena Vargas (TL) - PODER (integraciones sostenidas)
  console.log('  Helena Vargas (TL) - Integraciones (PODER):');
  const helenaIntegrations = [8, 9, 10, 11, 12, 13, 14, 15];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[6].id,
        metricKey: 'integrations',
        week: getWeek(7 - i),
        value: helenaIntegrations[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${helenaIntegrations.join(' → ')}`);

  // Ignacio Morales (TL) - EMERGENCIA con volatilidad
  console.log('  Ignacio Morales (TL) - Bugs Fixed (EMERGENCIA + VOLATILE):');
  const ignacioBugs = [20, 15, 22, 18, 21, 17, 19, 20];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[7].id,
        metricKey: 'bugs_fixed',
        week: getWeek(7 - i),
        value: ignacioBugs[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }
  console.log(`    ✓ ${ignacioBugs.join(' → ')}`);

  // Agregar más métricas a algunos recursos para mayor diversidad
  console.log('\n  Agregando métricas adicionales...');
  
  // Ana también tiene performance en AFLUENCIA
  const anaPerformance = [60, 62, 65, 68, 72, 78, 86, 95];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[0].id,
        metricKey: 'performance',
        week: getWeek(7 - i),
        value: anaPerformance[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }

  // Carlos tiene code reviews en NORMAL
  const carlosCodeReviews = [8, 9, 10, 11, 12, 13, 14, 15];
  for (let i = 0; i < 8; i++) {
    await recordsService.upsert(
      {
        resourceId: createdResources[1].id,
        metricKey: 'code_reviews',
        week: getWeek(7 - i),
        value: carlosCodeReviews[i],
        timestamp: new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'system-seed',
    );
  }

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`  • ${createdResources.length} recursos`);
  console.log(`  • ${createdMetrics.length} métricas`);
  console.log('  • ~80 records con patrones diversos\n');
  console.log('🎯 Condiciones representadas:');
  console.log('  • PODER: Ana García (Story Points), Helena Vargas (Integraciones)');
  console.log('  • AFLUENCIA: Carlos Mendoza (Story Points), Ana García (Performance)');
  console.log('  • NORMAL: Diana López (Performance), Carlos (Code Reviews)');
  console.log('  • EMERGENCIA: Eduardo Ruiz (Story Points), Ignacio Morales (Bugs)');
  console.log('  • PELIGRO: Fernanda Torres (Performance)');
  console.log('  • INEXISTENCIA: Gabriel Santos (Code Reviews)\n');

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Error durante el seed:', error);
  process.exit(1);
});
