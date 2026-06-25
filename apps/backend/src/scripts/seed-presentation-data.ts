import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { MetricsService } from '../metrics/metrics.service';
import { RecordsService } from '../records/records.service';

/**
 * Seed NARRATIVO para la presentación al comité (demo en vivo).
 *
 * Escribe por el CAMINO CORRECTO (UsersService role 'user' + resourceProfile,
 * MetricsService, RecordsService) — el mismo modelo que la app actual lee.
 *
 * Pensado para contar una historia clara en el dashboard: cada persona del
 * equipo muestra una condición operativa distinta y reconocible (crecimiento
 * sostenido, despegue, estancamiento, caída, colapso, recuperación).
 *
 * Las series son determini­stas; las condiciones reales que arroja el motor se
 * verifican aparte (script de verificación) para que la narrativa de la demo
 * coincida 1:1 con lo que se muestra en pantalla.
 *
 * Idempotente: upsert por email/clave conocidos.
 */

const DEMO_PASSWORD = 'Demo1234!';

// Métricas de la demo (semanal). Reutiliza claves existentes donde aplica.
const DEMO_METRICS = [
  { key: 'story_points', label: 'Story Points', description: 'Puntos de historia completados', unit: 'points', periodType: 'weekly' },
  { key: 'performance', label: 'Performance Score', description: 'Puntuación de desempeño general', unit: 'percentage', periodType: 'weekly' },
  { key: 'code_reviews', label: 'Code Reviews', description: 'Revisiones de código realizadas', unit: 'count', periodType: 'weekly' },
  { key: 'integrations', label: 'Integraciones', description: 'Integraciones completadas', unit: 'count', periodType: 'weekly' },
];

interface DemoSeries {
  email: string;
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  metricKey: string;
  values: number[];
  narrative: string; // qué condición se espera contar en la demo
}

// 8 semanas por serie. Curvas con FORMAS distintas para que la demo sea vistosa.
const DEMO_SERIES: DemoSeries[] = [
  {
    email: 'ana.garcia@pulseops.demo',
    name: 'Ana García',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [40, 44, 47, 50, 54, 58, 63, 70],
    narrative: 'PODER — crecimiento Normal sostenido',
  },
  {
    email: 'carlos.mendoza@pulseops.demo',
    name: 'Carlos Mendoza',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [30, 34, 40, 46, 52, 60, 50, 78],
    narrative: 'AFLUENCIA — despegue puntual (+56% final)',
  },
  {
    email: 'diana.lopez@pulseops.demo',
    name: 'Diana López',
    roleType: 'DEV',
    metricKey: 'performance',
    values: [60, 63, 66, 69, 72, 70, 64, 72],
    narrative: 'NORMAL — crecimiento moderado (+12.5% final)',
  },
  {
    email: 'eduardo.ruiz@pulseops.demo',
    name: 'Eduardo Ruiz',
    roleType: 'DEV',
    metricKey: 'story_points',
    values: [50, 52, 49, 51, 50, 52, 48, 50],
    narrative: 'EMERGENCIA — estancamiento (meseta)',
  },
  {
    email: 'fernanda.torres@pulseops.demo',
    name: 'Fernanda Torres',
    roleType: 'DEV',
    metricKey: 'performance',
    values: [85, 80, 74, 68, 62, 60, 58, 25],
    narrative: 'PELIGRO — caída pronunciada (−57% final)',
  },
  {
    email: 'gabriel.santos@pulseops.demo',
    name: 'Gabriel Santos',
    roleType: 'DEV',
    metricKey: 'code_reviews',
    values: [14, 11, 8, 5, 3, 1, 0, 0],
    narrative: 'INEXISTENCIA — colapso a cero',
  },
  {
    email: 'helena.vargas@pulseops.demo',
    name: 'Helena Vargas',
    roleType: 'TL',
    metricKey: 'integrations',
    values: [9, 10, 11, 12, 13, 14, 15, 16],
    narrative: 'PODER — líder técnica, crecimiento sostenido',
  },
  {
    email: 'ignacio.morales@pulseops.demo',
    name: 'Ignacio Morales',
    roleType: 'TL',
    metricKey: 'performance',
    values: [70, 55, 48, 52, 60, 50, 44, 72],
    narrative: 'AFLUENCIA — recuperación con rebote (+64% final)',
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const metricsService = app.get(MetricsService);
  const recordsService = app.get(RecordsService);

  console.log('🎬 Seed de PRESENTACIÓN iniciando...\n');

  // 1) Métricas (idempotente)
  console.log('📊 Métricas...');
  for (const m of DEMO_METRICS) {
    try {
      await metricsService.create(m, 'demo-seed');
      console.log(`  ✓ ${m.label}`);
    } catch (err: any) {
      if (err && err.errorCode === 'DUPLICATE_RESOURCE') {
        console.log(`  ⚠ ${m.label} ya existe — ok`);
      } else {
        throw err;
      }
    }
  }

  // 2) Recursos-usuario (idempotente por email)
  console.log('\n👤 Recursos (usuarios role=user)...');
  const resourceIdByEmail = new Map<string, string>();
  for (const s of DEMO_SERIES) {
    const existing = await usersService.findByEmail(s.email);
    if (existing) {
      const updated = await usersService.update(existing._id.toString(), {
        name: s.name,
        isActive: true,
        role: UserRole.USER,
        resourceProfile: { resourceType: s.roleType },
      });
      resourceIdByEmail.set(s.email, updated._id.toString());
      console.log(`  ⚠ ${s.name} ya existe — actualizado`);
    } else {
      const result = await authService.register({
        email: s.email,
        password: DEMO_PASSWORD,
        name: s.name,
        role: UserRole.USER,
        resourceProfile: { resourceType: s.roleType },
      });
      resourceIdByEmail.set(s.email, result.user.id);
      console.log(`  ✓ ${s.name} (${s.roleType})`);
    }
  }

  // 3) Records (8 semanas, ancladas a "ahora")
  console.log('\n📈 Records (series narrativas)...');
  const now = new Date();
  const getWeek = (weeksAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - weeksAgo * 7);
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  for (const s of DEMO_SERIES) {
    const resourceId = resourceIdByEmail.get(s.email)!;
    for (let i = 0; i < s.values.length; i++) {
      const weeksAgo = s.values.length - 1 - i;
      await recordsService.upsert(
        {
          resourceId,
          metricKey: s.metricKey,
          week: getWeek(weeksAgo),
          value: s.values[i],
          timestamp: new Date(now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'demo-seed',
      );
    }
    console.log(`  ✓ ${s.name} · ${s.metricKey}: ${s.values.join(' → ')}  [${s.narrative}]`);
  }

  console.log('\n✅ Seed de presentación completado.');
  console.log(`  • ${DEMO_METRICS.length} métricas`);
  console.log(`  • ${DEMO_SERIES.length} recursos`);
  console.log(`  • ${DEMO_SERIES.reduce((n, s) => n + s.values.length, 0)} records\n`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Error durante el seed de presentación:', error);
  process.exit(1);
});
