import { NestFactory } from '@nestjs/core';
import { HubbardCondition } from '@pulseops/shared-types';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { MetricsService } from '../metrics/metrics.service';
import { RecordsService } from '../records/records.service';

/**
 * Seed FIJO y DETERMINISTA para la suite E2E (Cypress).
 *
 * A diferencia de seed-demo-data.ts (que escribe en el ResourcesService LEGACY,
 * colección que la app actual NO lee), este seed escribe por el CAMINO CORRECTO:
 *   - recursos = usuarios con role 'user' + resourceProfile.resourceType vía AuthService.register
 *   - métricas vía MetricsService
 *   - records vía RecordsService.upsert
 *
 * Datos conocidos y sin valores aleatorios (Req 4.1, 4.5): emails, claves de
 * métrica y series fijas que reproducen condiciones conocidas para asertar el
 * Dashboard (Req 11.3). Idempotente (Req 4.3): upsert por claves conocidas.
 *
 * NO ejecutar desde el agente: requiere MongoDB y backend. El usuario corre
 * `npm run seed:e2e` en su checkpoint.
 */

// Contraseña fija de los usuarios-recurso del seed (>= 6, exigido por RegisterDto).
// La suite E2E inicia sesión SOLO como admin; estos usuarios no se usan para login.
const SEED_PASSWORD = 'e2eSeed123';

// Métricas fijas (mismas definiciones que el seed demo, periodType 'weekly').
const SEED_METRICS = [
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
];

// Un recurso por condición conocida. Series tomadas del seed demo (known-good).
interface SeedSeries {
  email: string;
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  metricKey: string;
  values: number[];
  expectedCondition: HubbardCondition;
}

const SEED_SERIES: SeedSeries[] = [
  {
    email: 'e2e.poder@pulseops.test',
    name: 'E2E Poder',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [45, 48, 50, 52, 54, 56, 58, 60],
    expectedCondition: 'PODER',
  },
  {
    email: 'e2e.afluencia@pulseops.test',
    name: 'E2E Afluencia',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [30, 32, 34, 35, 38, 42, 50, 78],
    expectedCondition: 'AFLUENCIA',
  },
  {
    email: 'e2e.normal@pulseops.test',
    name: 'E2E Normal',
    roleType: 'DEV',
    metricKey: 'performance',
    values: [65, 68, 70, 73, 76, 78, 81, 84],
    expectedCondition: 'NORMAL',
  },
  {
    email: 'e2e.emergencia@pulseops.test',
    name: 'E2E Emergencia',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [50, 51, 49, 50, 51, 50, 49, 50],
    expectedCondition: 'EMERGENCIA',
  },
  {
    email: 'e2e.peligro@pulseops.test',
    name: 'E2E Peligro',
    roleType: 'TL',
    metricKey: 'performance',
    values: [85, 80, 72, 65, 58, 50, 42, 35],
    expectedCondition: 'PELIGRO',
  },
  {
    email: 'e2e.inexistencia@pulseops.test',
    name: 'E2E Inexistencia',
    roleType: 'DEV',
    metricKey: 'code_reviews',
    values: [15, 12, 8, 5, 3, 1, 0, 0],
    expectedCondition: 'INEXISTENCIA',
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const metricsService = app.get(MetricsService);
  const recordsService = app.get(RecordsService);

  console.log('🌱 Seed E2E (fijo, determinista) iniciando...\n');

  // ============================================================================
  // 1. Métricas — idempotente: crear o recuperar existente por key
  // ============================================================================
  console.log('📊 Métricas...');
  for (const metric of SEED_METRICS) {
    try {
      await metricsService.create(metric, 'e2e-seed');
      console.log(`  ✓ ${metric.label}`);
    } catch (err: any) {
      if (err && err.errorCode === 'DUPLICATE_RESOURCE') {
        console.log(`  ⚠ ${metric.label} ya existe — ok`);
      } else {
        throw err;
      }
    }
  }

  // ============================================================================
  // 2. Recursos-usuario — idempotente: upsert por email conocido
  //    (registro con role 'user' + resourceProfile.resourceType, camino correcto)
  // ============================================================================
  console.log('\n👤 Recursos (usuarios role=user)...');
  const resourceIdByEmail = new Map<string, string>();
  for (const s of SEED_SERIES) {
    const existing = await usersService.findByEmail(s.email);
    if (existing) {
      // Reafirmar estado conocido (recupera de soft-delete y normaliza perfil).
      const updated = await usersService.update(existing._id.toString(), {
        name: s.name,
        isActive: true,
        role: UserRole.USER,
        resourceProfile: { resourceType: s.roleType },
      });
      resourceIdByEmail.set(s.email, updated._id.toString());
      console.log(`  ⚠ ${s.email} ya existe — actualizado`);
    } else {
      const result = await authService.register({
        email: s.email,
        password: SEED_PASSWORD,
        name: s.name,
        role: UserRole.USER,
        resourceProfile: { resourceType: s.roleType },
      });
      resourceIdByEmail.set(s.email, result.user.id);
      console.log(`  ✓ ${s.email} (${s.roleType})`);
    }
  }

  // ============================================================================
  // 3. Records — idempotente por (resourceId, metricKey, week) vía upsert.
  //    Semanas ancladas a "ahora" igual que el seed demo: 8 puntos consecutivos.
  // ============================================================================
  console.log('\n📈 Records (series fijas → condición conocida)...');
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

  for (const s of SEED_SERIES) {
    const resourceId = resourceIdByEmail.get(s.email)!;
    for (let i = 0; i < s.values.length; i++) {
      const weeksAgo = s.values.length - 1 - i;
      await recordsService.upsert(
        {
          resourceId,
          metricKey: s.metricKey,
          week: getWeek(weeksAgo),
          value: s.values[i],
          timestamp: new Date(
            now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        'e2e-seed',
      );
    }
    console.log(
      `  ✓ ${s.email} · ${s.metricKey} [${s.expectedCondition}]: ${s.values.join(' → ')}`,
    );
  }

  console.log('\n✅ Seed E2E completado.');
  console.log(`  • ${SEED_METRICS.length} métricas`);
  console.log(`  • ${SEED_SERIES.length} recursos (una condición conocida c/u)`);
  console.log(
    `  • ${SEED_SERIES.reduce((n, s) => n + s.values.length, 0)} records\n`,
  );

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Error durante el seed E2E:', error);
  process.exit(1);
});
