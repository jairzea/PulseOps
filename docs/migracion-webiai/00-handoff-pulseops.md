# PulseOps — Documento maestro de handoff para migración a Webi.AI SDK

> **Propósito:** capturar TODO PulseOps (dominio, arquitectura, contratos, datos, integraciones)
> para reconstruirlo en un **repositorio nuevo** bajo la arquitectura estandarizada de Unlimitech
> (Webi.AI SDK — ver `.kiro/steering/webiai-infra.md`, reglas R01–R16).
> Este documento es la **entrada de la fase de planificación**, no el plan en sí.
>
> Fuente: repositorio PulseOps actual (monorepo npm). Fecha de captura: 2026-07.

## Índice
1. Qué es PulseOps (dominio y producto)
2. Stack actual y estructura
3. Backend — módulos, endpoints, servicios
4. Modelo de datos (colecciones MongoDB)
5. Packages compartidos (contratos + motor)
6. Frontend — estructura y responsabilidades
7. Autenticación y autorización
8. Integraciones externas (GitHub, SMTP)
9. Configuración, arranque, seeds
10. Testing
11. Mapa de brechas hacia el estándar Webi.AI (resumen; detalle en `docs/alineacion-webiai.md`)
12. Decisiones abiertas para planificación

---

## 1. Qué es PulseOps (dominio y producto)

Sistema de **evaluación operativa basada en el comportamiento temporal** de métricas (no en valores
absolutos). Centraliza estadísticas del equipo, analiza su **inclinación/tendencia** en el tiempo y
asigna **condiciones operativas** según las fórmulas de Hubbard.

- **PO operativo (Laura Corredor):** evalúa la condición de producción de cada persona (hoy manual, ~1h/ciclo).
- **Arquitecto/dev (Jair Zea):** define alcance; la IA escribe la mayor parte del código.

**Condiciones operativas (jerarquía oficial, mayor→menor):** PODER, AFLUENCIA, NORMAL, EMERGENCIA,
PELIGRO, INEXISTENCIA, SIN_DATOS. `CAMBIO_DE_PODER` existe en tipos pero no es detectable por el motor.

**Conceptos clave del motor:**
- **Inclinación** `I = ((E_act − E_ant) / E_ant) × 100` con casos especiales (colapso a 0 → INEXISTENCIA, etc.).
- **Dos condiciones por métrica:** temprana (últimos 2 puntos) y de tendencia (regresión lineal sobre la ventana).
- **Condición consolidada por persona:** combina métricas de PRODUCCIÓN por nivel (puntaje por condición → nivel normalizado → condición). Regla dura: producción 0 → INEXISTENCIA.
- **Ventana configurable** (semanas): recorta gráfica + análisis + alertas.
- **Señales (meta-análisis):** VOLATILE, SLOW_DECLINE, DATA_GAPS, RECOVERY_SPIKE, NOISE — complementan, no cambian la condición.

**Idioma:** producto/UI/docs en español; código (identificadores/tipos) en inglés.

---

## 2. Stack actual y estructura

**Monorepo npm workspaces** (`apps/*`, `packages/*`). Node ≥ 20, npm ≥ 10.

```
pulseops/
├── packages/
│   ├── shared-types/      @pulseops/shared-types — contratos de dominio (TS puro, sin deps)
│   └── analysis-engine/   @pulseops/analysis-engine — motor puro determinístico (solo dep: shared-types)
├── apps/
│   ├── backend/           @pulseops/backend — NestJS 10 + Mongoose 9 (MongoDB)
│   └── frontend/          @pulseops/frontend — React 18 + Vite 5 + Tailwind 3
├── cypress/ + .features-gen/   E2E Cucumber/Gherkin
├── config/                docker-compose (dev)
└── docs/
```

**Regla de dependencias entre packages:** `shared-types ← analysis-engine ← {backend, frontend}`.
`analysis-engine` DEBE permanecer puro: sin HTTP, sin DB, sin I/O, determinístico.

**Versiones núcleo:** NestJS 10.3, Mongoose 9.1, @nestjs/jwt 11, passport-jwt 4, class-validator 0.14,
bcryptjs 3, nodemailer 9, React 18.2, Vite 5, react-router 7, zustand 5, recharts 2, reactflow 11,
react-hook-form 7 + yup/zod. Testing: Cypress 15 + cucumber-preprocessor 21.

---

## 3. Backend — módulos de dominio (`apps/backend/src`)

Organización por dominio; cada módulo: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `schemas/`.

| Módulo | Responsabilidad |
|---|---|
| `auth` | Login/registro, JWT (Passport), guards (jwt, demo-or-jwt, roles), estrategia jwt, decoradores `@CurrentUser`/`@Roles`. |
| `users` | CRUD de usuarios, roles admin/user, `resourceProfile` (objeto libre), flag `isMeasurable`, cambio de password. |
| `resources` | **Proxy sobre UsersService** — vista "recurso" de usuarios medibles. (Existe también schema legacy `resources` — deuda técnica.) |
| `metrics` | Catálogo de métricas (`key`, `label`, `category` PRODUCTION/STUDY/TRACKING, `categoryByResource`, `resourceIds`). |
| `records` | Series temporales: `MetricRecord` por (resourceId, metricKey, week). Upsert idempotente, filtros y paginación. |
| `charts` | Configuración de gráficas por recurso. |
| `rules` | Config de reglas por métrica (`MetricRuleConfig`) + simulación con el motor. |
| `analysis` | Orquesta el motor: `evaluate` (métrica), `overview` (todos los recursos), `consolidated` (persona). |
| `playbooks` | Pasos de acción por condición (`ConditionPlaybook`), seed de defaults. |
| `conditions` | Metadata de condiciones Hubbard (colores, orden, descripción). |
| `configuration` | Configuración activa del motor (`AnalysisConfiguration`: umbrales, señales, scoreTable, consolidatedLevels) + `BusinessRule`. |
| `notifications` | Correo de condición de un clic (nodemailer), composición pura de email + selfcheck. |
| `repo-integration` | Integración GitHub (App JWT + OAuth self-service), analizadores Dev/QA, sync a MetricRecord, scheduler. |
| `common` | Excepciones de dominio, filtro global, DTO de paginación, interfaces, decoradores, config JWT. |
| `scripts` | Seeds: admin, demo-data, e2e-data, presentation-data; fix-admin. |

### Endpoints (método · ruta · guard)

**app** — `GET /` (hello), `GET /health`.

**auth** — `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` (JWT), `POST /auth/validate` (JWT).

**users** (JWT) — `GET /users` (admin), `GET /users/:id`, `POST /users` (admin), `PUT /users/:id`,
`PUT /users/:id/measurable` (admin), `POST /users/:id/change-password`, `DELETE /users/:id` (admin).

**resources** (JWT) — `GET /resources/stats` (admin), `GET /resources` (admin ve todos / user ve el suyo),
`GET /resources/:id`, `GET /resources/:id/metrics`, `POST /resources` (admin), `PATCH /resources/:id`,
`DELETE /resources/:id` (admin).

**metrics** (JWT) — `POST /metrics` (admin), `GET /metrics` (opcional `?resourceId`),
`PATCH /metrics/:id` (admin), `DELETE /metrics/:id` (admin).

**records** (JWT) — `POST /records` (upsert), `GET /records` (filtros: resourceId, metricKey, fromWeek,
toWeek, source + paginación), `GET /records/weeks`, `DELETE /records/:id` (admin).

**charts** (JWT) — `POST /charts`, `GET /charts?resourceId`, `PATCH /charts/:id`.

**rules** (JWT) — `POST /rules`, `GET /rules?metricKey`, `POST /rules/:id/activate`, `POST /rules/simulate`.

**analysis** (JWT) — `GET /analysis/evaluate?resourceId&metricKey`, `GET /analysis/overview?windowSize`,
`GET /analysis/consolidated?resourceId`.

**configuration** (admin salvo activos) — `POST|GET /configuration/analysis`, `GET /configuration/analysis/active`,
`GET|PUT|DELETE /configuration/analysis/:id`, `POST /configuration/analysis/:id/activate`;
`POST|GET /configuration/rules`, `GET /configuration/rules/active`, `GET /configuration/rules/:id`,
`GET /configuration/rules/:id/versions`, `PUT|DELETE /configuration/rules/:id`,
`DELETE /configuration/rules/:id/permanent`, `POST /configuration/rules/:id/toggle`.

**conditions** — `GET /conditions/metadata`, `PATCH /conditions/:condition/color`.

**playbooks** — `GET /playbooks`, `GET /playbooks/:condition`, `PUT /playbooks/:condition`, `POST /playbooks/seed`.

**notifications** (JWT) — `POST /notifications/condition`.

**repo-integration** (admin, JWT) — `GET /status`, `GET /install-url`, `POST /connections`,
`DELETE /connections/:installationId`, `GET /verify-user/:login`, `POST /sync`, `GET /runs/last`,
`GET|PUT|DELETE /identities/:resourceId`, `POST /suggest-matches`.

**repo-integration/oauth/github** (JWT, cualquier usuario) — `GET /start`, `GET /me`, `GET /disconnect`,
`GET /metric-catalog?role`; `GET /callback` (público, valida state HMAC).

---

## 4. Modelo de datos (MongoDB)

Todas las colecciones usan `timestamps` salvo `condition_metadata`. La mayoría usa un `id` UUID
propio además del `_id`, y `toJSON` oculta `_id`/`__v`. **Excepción: `User` usa `_id` directamente**
(no tiene `id` UUID). Los `resourceId` en el resto de colecciones son el `_id` string del usuario.

| Colección | Clase | Campos | Índices |
|---|---|---|---|
| *(users)* | `User` | `email`(uniq, lowercase), `password`(bcrypt), `name`, `role` (admin/user), `isActive`, `resourceProfile` (objeto libre: `resourceType` DEV/TL/OTHER, `isMeasurable`, `repoIdentities[]`, `repoScope`, `status`, …), `lastLogin` | email, role, isActive |
| `records` | `MetricRecord` | `id`, `resourceId`, `metricKey`, `week` ("2026-W02"), `timestamp`, `value`, `source` (manual/github), `createdBy` | **único (resourceId, metricKey, week)** |
| `metrics` | `Metric` | `id`, `key`(uniq), `label`, `description`, `unit`, `periodType`, `category` (PRODUCTION/STUDY/TRACKING), `categoryByResource` (map), `resourceIds[]`, `createdBy` | key único |
| `charts` | `Chart` | `id`, `resourceId`, `title`, `metricKeys[]`, `order`, `isActive`, `createdBy` | — |
| `rule_configs` | `MetricRuleConfig` | `id`, `metricKey`, `version`, `isActive`, `windowSize`, `thresholds` (STEEP/MODERATE/FLAT/…), `powerMinPeriods`, `zeroThreshold`, `createdBy` | — |
| `condition_playbooks` | `ConditionPlaybook` | `condition`(uniq, enum Hubbard), `title`, `steps[]`, `version`, `isActive` | condition único |
| `condition_metadata` | `ConditionMetadata` | `condition`(uniq), `order`, `displayName`, `description`, `color`{bg,badge,text,border,glow}, `icon`, `category` (superior/normal/crisis/technical), `isActive` | condition único |
| *(analysis_configurations)* | `AnalysisConfiguration` | `name`, `isActive`, `windowSize`, `thresholds` (afluencia/normal/emergencia/peligro/poder/inexistencia + señales), `scoreTable` (puntaje por condición), `consolidatedLevels` (ratio→condición) | — |
| *(business_rules)* | `BusinessRule` | `name`, `expression` (field/operator/value), `action` (ALERT/NOTIFY/ESCALATE/LOG), versiones | — |
| `resources` | `Resource` (legacy) | colección heredada; **código muerto** — `ResourcesController` es proxy sobre Users. Decidir eliminación en la migración. |
| `repo_connections` | `RepoConnection` | `id`, `provider`, `installationId`, `account`, `isActive`, `connectedBy` | único (provider, installationId) |

> **Deuda técnica a resolver en la migración:** (a) modelo Resources/Users a medio migrar (colección
> `resources` legacy vs proxy sobre Users); (b) `role` mezcla permiso con "ser medible" (workaround
> `isMeasurable`); (c) umbrales por defecto duplicados en 3 lugares (`analysis-engine`,
> `configuration.service`, comentarios de `shared-types`).

---

## 5. Packages compartidos

### `@pulseops/shared-types` (TS puro, sin deps) — contratos de dominio
Tipos públicos (en `src/types.ts`): `MetricPoint`, `MetricSeries`, `AnalysisWindowConfig`,
`TrendDirection`, `OperationalCondition`, `TrendAnalysisResult`, `AnalysisEngine` (interfaz),
**`HubbardCondition`**, `ConditionReason`, `InclinationResult`, `MetricConditionEvaluation`,
`TrendEvaluation`, `SignalType`, `AnalysisSignal`, `FormulaStep`, `ConditionFormula`,
**`ConditionThresholds`**, `ConditionScoreTable`, `ConsolidatedLevelThresholds`, **`MetricCategory`**,
`ConsolidatedMetricInput`, `ConsolidatedContribution`, `ConsolidatedEvaluation`,
`AnalysisConfiguration`, `RuleOperator`, `RuleExpression`, `RuleAction`, `BusinessRule`.

### `@pulseops/analysis-engine` (solo dep: shared-types) — motor puro
Exporta `analysisEngine` (instancia única) con, al menos: `analyze` (tendencia básica),
evaluación de condición por métrica (temprana + tendencia), consolidado por persona, señales,
regresión lineal. **Determinístico, sin I/O.** Tiene `engine.selfcheck.ts` (verificación ejecutable
sin framework). Umbrales por defecto `DEFAULT_CONDITION_THRESHOLDS` viven aquí.

> **Estos dos packages son el corazón del producto y deben migrar casi intactos** — son TS puro sin
> dependencias de plataforma, así que encajan como `library` (no `bundle`) en el estándar Webi.AI.

---

## 6. Frontend (`apps/frontend/src`) — React 18 + Vite

- **`pages/`**: `LoginPage`, `OverviewPage`, `ResourceDashboard`, `ResourcesPage`, `MetricsPage`,
  `RecordsPage`, `ConfigurationPage`, `ProfilePage`, `UsersAdminPage`, `IntegrationsPage`.
- **`components/`**: UI reutilizable — `Header`, `Layout`, `PrivateRoute`, `CommandPalette` (Cmd+K),
  `HeaderNotifications` (campana de alertas), `GithubConnectCard`, `PaginationControls`, `SearchInput`,
  `InfoTooltip`, `MetricModal`, `ConfirmModal`, tablas y skeletons, `ColorPicker`, etc.
- **`services/api/`**: un servicio por dominio sobre un `httpClient` central: `analysisApi`,
  `conditionsApi`, `metricsApi`, `notificationsApi`, `playbooksApi`, `recordsApi`,
  `repoIntegrationApi`, `resourcesApi`. `apiClient.ts` es facade deprecado; `authService.ts` y
  `configurationApi.ts` aparte.
- **`stores/`** (Zustand), **`contexts/`** (Auth, Theme), **`hooks/`** (usePagination, usePaginatedData,
  useResources, useToast, useConfirmModal…), **`schemas/`** (yup/zod), **`modules/`** (features
  autocontenidas, ej. live-demo), **`utils/`** (chartUtils, errors, query, testId, toast).
- **Auth en el cliente:** token JWT en `localStorage` (`auth_token`), inyectado como `Bearer` por
  `httpClient`. `VITE_API_URL` (default `http://localhost:3000`).
- **Routing:** react-router 7; rutas protegidas con `PrivateRoute` (+ `requireAdmin`).

---

## 7. Autenticación y autorización

- **JWT propio** (Passport + `@nestjs/jwt`). Estrategia `jwt.strategy.ts`. Token firmado con
  `JWT_SECRET` (fail-fast en producción si falta; helper `common/config/jwt-secret.ts`).
  `JWT_EXPIRES_IN=24h`.
- **Guards:** `JwtAuthGuard`, `DemoOrJwtAuthGuard` (permite modo demo en dev), `RolesGuard`.
  Decoradores `@Roles(UserRole.ADMIN)`, `@CurrentUser()`.
- **Roles:** `admin` / `user`. Owner-vs-admin: los `user` solo ven/editan lo suyo.
- **`AUTH_MODE=demo`** inyecta un admin sin credenciales en requests sin header — **bloqueado cuando
  `NODE_ENV=production`** (en `DemoOrJwtAuthGuard` y `DemoAuthGuard`).
- **Passwords:** bcrypt; nunca se devuelve el campo `password` (`select('-password')`).
- **Admin inicial:** `seed:admin` crea `admin@pulseops.com` / `Admin1234!` (cambiar en primer login).

> **Choque con el estándar:** Webi.AI muestra **Cognito** para auth. Decisión de migración pendiente:
> conservar JWT propio o migrar a Cognito.

---

## 8. Integraciones externas

### GitHub (módulo `repo-integration`)
- **Auth API GitHub:** **GitHub App** (App JWT RS256 firmado con `crypto` nativo → token de instalación
  efímero cacheado) con fallback **PAT** para pruebas. Secretos en `.env`; en DB solo `installationId`.
- **Self-service OAuth:** cada usuario vincula su cuenta (state HMAC firmado, identidad canónica).
- **Analizadores:** `dev-analyzer` (NUI, dev efficiency, uip/día, self-churn rate, fix ratio,
  commits/día, working days — self-churn vía GraphQL blame) y `qa-analyzer` (`N/N ACs pass` de merges).
  `metrics-derivation.ts` (puro + selfcheck), `qa-parsing.ts` (puro + selfcheck), `week-range.ts`
  (ventana jueves–miércoles GMT-5 + selfcheck), `oauth-state.ts` (+ selfcheck), `app-jwt.ts` (+ selfcheck).
- **Sync:** `repo-sync.service` (upsert MetricRecord `source: github`, idempotente por semana,
  autoprovisión de métricas + asociación al recurso) + `repo-sync.scheduler` (cron dependency-free,
  miércoles 18:00 GMT-5, configurable por env).
- **Variables:** `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_TOKEN`,
  `GITHUB_ORG`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CALLBACK_URL`,
  `FRONTEND_URL`, `REPO_SYNC_ENABLED/DOW/HOUR`.

### SMTP (módulo `notifications`)
- **nodemailer**; composición de email como función pura (`compose-condition-email.ts` + selfcheck,
  con escape HTML). Sin `SMTP_HOST` el envío lanza `ServiceUnavailableException` pero la app arranca.
- **Variables:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.
- **Futuro:** migración prevista a Google Workspace (aislada en `MailService`).

---

## 9. Configuración, arranque, seeds

- **`main.ts`:** `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`),
  `GlobalExceptionFilter`, CORS abierto, puerto `PORT` (default 3000).
- **`app.module.ts`:** `ConfigModule.forRoot({ isGlobal, envFilePath: '.env' })`,
  `MongooseModule.forRoot(MONGODB_URI)`, y registra: Auth, Users, Resources, Metrics, Charts, Records,
  Rules, Analysis, Playbooks, Conditions, Configuration, Notifications, RepoIntegration.
- **Variables núcleo:** `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_MODE`
  + las de GitHub y SMTP (sección 8).
- **Scripts backend:** `dev` (nest --watch), `build` (nest build), `start:prod` (node dist/main),
  `typecheck` (tsc --noEmit), `seed:admin|demo|e2e|presentation`.
- **Scripts raíz:** `typecheck/build/dev/clean` (por workspace), `lint`, `format`, `cypress:*`, `test:e2e`.
- **Excepciones de dominio:** `common/exceptions/app.exception.ts` (`ResourceNotFoundException`,
  `ForbiddenException`, `ServiceUnavailableException`, `DuplicateResourceException`, `DatabaseException`…),
  formateadas por `GlobalExceptionFilter`.

---

## 10. Testing

- **E2E:** Cypress 15 + Cucumber (`@badeball/cypress-cucumber-preprocessor`), esbuild preprocessor,
  faker, fast-check, mochawesome. Features en `cypress/` + `.features-gen/`. POM sobre widgets,
  `data-testid` vía `tid()`. Seed determinista `seed:e2e`. Reportes en `cypress/reports/`.
- **Selfchecks (verificaciones ejecutables sin framework):** en `analysis-engine` (engine),
  y en `repo-integration` (metrics-derivation, qa-parsing, week-range, oauth-state, app-jwt) +
  `users/is-measurable`. Patrón: assert plano, corrido con `ts-node`.

---

## 11. Mapa de brechas hacia Webi.AI (resumen)

Detalle completo y preguntas en **`docs/alineacion-webiai.md`**. Resumen:

| Dimensión | PulseOps hoy | Estándar Webi.AI | Esfuerzo |
|---|---|---|---|
| Runtime | Node ≥ 20 | Bun | 🔴 |
| IaC | docker-compose | SST + Pulumi (bundle) | 🔴 |
| Cloud | agnóstico | AWS (VPC, ECS, API GW, SSM) | 🔴 |
| Estructura | monorepo npm | bundle (`webiai.config.mjs`, `infra/`+`shared/`, `modules/`) | 🟡 |
| Entorno | `.env` + ConfigService | `env.ts` tipado + visitor + `.env` | 🟡 |
| DB | MongoDB | ejemplos AWS-nativos (confirmar Mongo) | 🔴 |
| Auth | JWT propio | Cognito en ejemplos | 🔴 |
| **App (NestJS/React)** | — | fuera del alcance del estándar de infra | 🟢 |
| **Packages puros** | shared-types, analysis-engine | encajan como `library` | 🟢 |

**Mapeo tentativo a taxonomías Webi.AI** (a validar con arquitectura):
- `analysis-engine` + `shared-types` → **`library`** (TS puro, publican desde `src/`).
- backend (API) → **`bundle`** con `modules/` (servicio) — o módulo Bun.
- frontend (SPA) → **`bundle`**/módulo Vite (`DevVite`).
- Persistencia Mongo y auth: decisiones 🔴 abajo.

---

## 12. Decisiones abiertas para la planificación

Estas deben cerrarse con arquitectura **antes** de estimar la migración (son de plataforma, no de código):

1. **Runtime:** ¿NestJS se mantiene sobre Node dentro de un bundle, o se migra a Bun? (NestJS→Bun no trivial).
2. **Persistencia:** ¿MongoDB soportado (Atlas/DocumentDB/contenedor) o se cambia a persistencia AWS?
3. **Auth:** ¿se conserva JWT propio o se migra a Cognito? Impacta users/auth/guards y el frontend.
4. **Alcance del framework de app:** el estándar es de infra; ¿imponen también estructura de app
   (controllers/servicios) o solo el envoltorio de despliegue?
5. **Taxonomías:** confirmar el mapeo library/bundle/module de la sección 11.
6. **Deudas a saldar en la migración (oportunidad):** unificar Usuario/Recurso, eliminar `resources`
   legacy, consolidar umbrales por defecto (una sola fuente).
7. **Datos:** ¿se migran datos existentes (staging/demo) o se parte de base limpia con seeds?

> **Recomendación:** tratar la migración como una **spec formal** (requirements → design → tasks) en el
> repo nuevo, con estas 7 decisiones resueltas como prerequisito. Los packages puros migran primero
> (bajo riesgo); el motor y sus selfchecks son la red de seguridad de que el comportamiento se preserva.
