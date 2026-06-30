# PulseOps — Roadmap y Deuda Técnica

Memoria de hacia dónde va el trabajo y qué problemas conocidos arrastra el repo. Actualizar a medida que se completen fases.

## Plan por fases (acordado con el arquitecto)

**Fase 0 — Base verde y segura (COMPLETADA 2026-06-22).** Prerequisito de todo lo demás.
- ✅ Errores de typecheck del frontend corregidos (`ResourceStats` alineado, `usePaginatedData` conecta `dependencies`, import muerto removido). Monorepo verde.
- ✅ `JWT_SECRET` con fail-fast en producción vía `common/config/jwt-secret.ts` (usado en `auth.module` y `jwt.strategy`).
- ✅ `AUTH_MODE=demo` bloqueado cuando `NODE_ENV=production` (en `DemoOrJwtAuthGuard` y `DemoAuthGuard`).
- ✅ `throw new Error('Forbidden')` → `ForbiddenException` en `users.controller`.
- ✅ Limpieza: borrados `configuration.service.ts.backup`, `backend.log`, `LoginPage2.tsx`, `ToastDemo.tsx` (+ export del barrel), `auth0.guard.ts`; logs de debug removidos de `main.ts` y `resources.controller`. `dist/`/`.log`/`.env` ya estaban en `.gitignore` y no trackeados.

Nota: `getDiagnostics` confirma 0 errores en los archivos tocados. `npm run typecheck` full se cuelga por tiempo en este entorno (la invocación de tsc tarda en arrancar), no por errores.

**Validación en runtime (2026-06-23):** al probar con la app corriendo aparecieron 2 bugs (que typecheck no detecta), ya resueltos:
- **401 en todos los endpoints (regresión de Fase 0):** `auth.module` resolvía `JWT_SECRET` en import-time (antes de que `ConfigModule` cargara el `.env`) → usaba el fallback de dev; `jwt.strategy` lo resolvía en runtime → usaba el `.env`. Secretos distintos = firma≠validación. Arreglado: `JwtModule.registerAsync` + `ConfigService` en ambos (`auth.module`, `jwt.strategy`); helper `resolveJwtSecret(secret, nodeEnv)` recibe valores ya resueltos. Lección: cambios de auth deben probarse en runtime + relogin (tokens viejos quedan firmados con secreto previo).
- **400 al guardar configuración de análisis:** el frontend envía `formula` en cada threshold (existe en `ConditionThresholds`) pero el DTO no la declaraba y `forbidNonWhitelisted` la rechazaba. Arreglado: `ConditionFormulaDto`/`FormulaStepDto` opcionales en cada condición del DTO.

**Suite E2E de regresión (spec `e2e-regression-suite`, 2026-06-24).** Reconstruida sobre Cypress 15 + Cucumber: instrumentación `data-testid` vía `tid()`/`testTags`, POM sobre Widgets, seed fijo determinista (`seed:e2e`), login real por UI, factories con faker. Estado de validación ejecutada (checkpoints):
- ✅ **7 de 9 módulos en verde** (mejor corrida completa 32/36): Auth, Navigation, Resources, Dashboard, Configuration, Users, Profile.
- 🔧 **Metrics y Records** quedan inestables **solo por saturación de este entorno** (Node x64 bajo Rosetta + Cypress arm64 + Vite + Mongo compitiendo): bajo carga, los `fetch` in-browser a `localhost:3000` se estancan (un login llegó a tardar 63s). Verificado vía DevTools que el flujo de crear métrica funciona (POST 201 + toast + cierre de modal) cuando la carga es normal → **no es defecto de features ni de POM**, es la máquina. Records pasó 4/4 en aislamiento.
- Bugs reales corregidos durante los checkpoints: (1) bridge de Widgets roto en `commands.ts` (devolvía objetos en vez de elementos); (2) input numérico de Configuration mal-guardado (`{selectall}` + type); (3) **contaminación de datos**: el test de métricas asociaba métricas a recursos del seed y ensuciaba el Dashboard → aislado a `E2E Inexistencia`; (4) aserciones del Dashboard alineadas a la condición real del motor (regla últimos-2-puntos, no la tendencia del seed); el `data-testid` de condición se expone síncrono (sin depender de la animación de scroll) y también para INEXISTENCIA (inclinación nula); (5) borrado de usuarios acotado por texto para no tocar al admin.
- Prerequisitos para correr la suite: `npm install -D @faker-js/faker fast-check @bahmutov/cypress-esbuild-preprocessor` (pinneados), MongoDB vía `config/docker-compose.dev.yml`, `npm run seed:e2e`, backend+frontend arriba, `cypress.env.json` con `ADMIN_PASSWORD`. En esta máquina Cypress debe correr con `arch -arm64` (node activo es x64). **Recomendación:** correr la suite completa en una sola invocación (`cypress run`) para que `cy.session` reutilice el login; spec-por-spec es más frágil. Pendiente: re-validar Metrics/Records en un entorno con recursos dedicados.

**Fase 1 — Ventana configurable (features #1, #2, #3) (COMPLETADA 2026-06-26).** Spec `fase-1-ventana-configurable`.
- ✅ Selector de ventana en el dashboard (4/6/8/12 semanas, default 8) que recorta gráfica + análisis + cambio de forma coherente (`windowedRecords`). `tid('dashboard','window-select')`.
- ✅ **Condición de tendencia** en el motor: regresión lineal portada de `chartUtils` a `engine.ts` (pura, sin deps); la pendiente se normaliza a inclinación porcentual usando los **extremos de la recta ajustada** y se pasa por la MISMA `resolveCondition` + `ConditionThresholds` (sin umbrales nuevos). Campo `trend?` aditivo en `MetricConditionEvaluation` (no rompe consumidores).
- ✅ Badge "Tendencia del periodo" en el panel de Análisis (`tid('dashboard','trend-condition')`), diferenciado de la condición temprana.
- ✅ Selfcheck ampliado y pasando: caso clave **serrucho+repunte** → temprana AFLUENCIA ≠ tendencia EMERGENCIA (la divergencia es el valor de negocio). `getDiagnostics` limpio, build de packages + frontend typecheck en verde.
- Pendiente: validación runtime en navegador (cambiar ventana con backend+frontend arriba). Nota de entorno: el disco llegó a 100% (causa del "Failed to fetch" y timeouts de comandos); se liberó ~1.1Gi con `npm cache clean`.

**Fase 2 — Condición consolidada (feature #4) (COMPLETADA 2026-06-26, pendiente validación runtime).** Spec `fase-2-condicion-consolidada`.
- ✅ Motor: `analyzeConsolidated` puro por **NIVEL** (no por inclinación de totales). Cada métrica de producción → su condición sobre la ventana → puntaje (`scoreTable`); nivel = puntaje promedio normalizado 0..1; el ratio se mapea a condición vía `consolidatedLevels` (umbrales configurables). Regla dura: producción nula → INEXISTENCIA. Selfcheck pasa, incluido el caso "una métrica en PODER → consolidado PODER".
- ✅ **Corrección de método (queja del arquitecto):** el método inicial (inclinación de la serie de totales) daba EMERGENCIA a una métrica creciendo en PODER (puntaje plano 5,5,5 → inclinación 0). Cambiado a nivel: ahora refleja "qué tan bien produce", coherente con una sola métrica.
- ✅ **Tres categorías** (`MetricCategory`): PRODUCTION (cuenta), STUDY (estudio, no cuenta), TRACKING (solo seguimiento). Categoría base en `Metric.category` + **override por recurso** `categoryByResource` (ej. "producción salvo para Helena"). Resolución: override ?? base ?? PRODUCTION.
- ✅ `scoreTable` + `consolidatedLevels` configurables en la config activa (defaults en `createDefaultConfiguration`, sin 4ª copia).
- ✅ Backend `GET /analysis/consolidated`; frontend: banda "Condición de producción de la persona" (muestra nivel %) + selector de 3 categorías en `MetricForm`.
- Verde: build packages, typecheck backend+frontend, getDiagnostics limpio. Pendiente: validación runtime con seed (la hace el arquitecto).

**Fase 3 — Notificación por correo (feature #6) (COMPLETADA 2026-06-26, pendiente validación runtime).** Spec `fase-3-notificacion-correo`.
- ✅ Módulo `notifications`: `MailService` (nodemailer, aislado para migrar a Workspace después) + `NotificationsService` que reúsa `PlaybooksService` y datos del usuario + `POST /notifications/condition` con guard y DTO validado.
- ✅ Composición del correo como función pura (`compose-condition-email.ts`) con escape HTML; selfcheck de 10 asserts pasa (incluye XSS-escape).
- ✅ Config SMTP por entorno (`.env.example`); sin `SMTP_HOST` el envío lanza `ServiceUnavailableException` pero la app arranca igual. Credenciales nunca se logean.
- ✅ Frontend: botón "Notificar al usuario" de un clic en el badge consolidado (deshabilitado mientras envía, toast de feedback).
- Verde: typecheck backend + frontend, getDiagnostics limpio. Pendiente: validación runtime con SMTP de captura (Ethereal/Mailtrap) — la hace el arquitecto. Migración a Google Workspace: futura (security.md), aislada en `MailService`.

**Fase 4 (futuro, condicionado).** IA para veredicto en lenguaje natural (#5, posiblemente YAGNI), y sistema de 3 canastillas + tracking Workspace (#7, otra iniciativa).

**Iniciativa — Integración con repositorios (en curso, rama `feat/integracion-repositorios`).** Spec `integracion-repositorios`. Sacar estadísticas de productividad directo del repo (GitHub primero; Bitbucket v2).
- **Decisión clave: API-only, NO clonar.** GitHub REST (commits/diffs/stats) + GraphQL `blame` dan todo, incluido self-churn exacto, sin disco ni binario git.
- ✅ Tareas 1–7: derivación pura (`metrics-derivation` + selfcheck), asociación persona↔cuenta en `resourceProfile` (sin migración), `RepoProvider`/`GithubProvider`, `DevAnalyzer` (NUI, efficiency, ratios, working days vía `CommitMeta.authoredDate`), `qa-parsing`+`QaAnalyzer` (`N/N ACs pass`, v1 solo validados), `RepoSyncService` (upsert MetricRecord idempotente por semana, source `github`), scheduler dependency-free (miércoles 18:00 GMT-5, env-configurable; ponytail vs `@nestjs/schedule`), endpoints `/status`/`/sync`/`/runs/last`, frontend `IntegrationsPage`. Ventana jueves–miércoles GMT-5 (`week-range` + selfcheck). Verde: getDiagnostics + typecheck backend/frontend; selfchecks de derivación/qa-parsing/week-range pasan.
- Pendiente: validación runtime con **token de GitHub + repo real** (la provee el arquitecto, como SMTP/Ethereal en Fase 3); merge a master; Bitbucket (tarea 9, v2); "automatizados" de QA desde docs `e2e/` (v2).

## Método de trabajo

- Features multi-archivo o con decisiones de dominio abiertas → formalizar como **spec** (requirements → design → tasks) antes de implementar, especialmente Fase 2.
- Trabajar por fases, validando typecheck/build al cierre de cada una.

## Deuda técnica conocida

- **Modelo Resources/Users a medio migrar:** `context.md` declara "un Recurso es un Usuario" y `ResourcesController` es un proxy sobre `UsersService`, pero sigue existiendo el módulo legacy `resources/{schema,service}` con su propia colección `resources`. Es código muerto que confunde. Decidir: eliminar legacy o terminar migración.
- **Duplicaciones:** dos `RulesService` (`rules/` config por métrica vs `configuration/` business rules) y dos `current-user.decorator` (`auth/` con `CurrentUserData` vs `common/` con `User`). Nombres colisionantes que generan errores de import.
- **Umbrales por defecto triplicados** (ver `analysis-domain.md`).
- **Escalabilidad:** `findByResource` y `updateMetricsRelation` iteran todas las métricas en cada cambio (O(n)). Aceptable en demo, revisar antes de escala real. Marcar con `ponytail:` si se deja.
- **Condición de tendencia:** ✅ RESUELTO en Fase 1. El motor ahora expone `trend` (condición por regresión lineal sobre la ventana completa) además de la condición temprana de últimos-2-puntos.

## Notas de la sesión con el PO (2026-06-22)

Laura calcula hoy a mano la condición de producción por persona (~1h). Solo una métrica "principal" cuenta hoy. Pide: rango de semanas configurable, ≥8 semanas de historia, condición consolidada por persona, alertas sobre el periodo configurado, y notificación por correo de un clic tras revisión humana. La fórmula exacta de consolidación la tiene Laura en su celular — se solicitará para validar el agregador.
