# Plan de implementación — Integración con repositorios

> **Antes de la tarea 3 (analyzer):** confirmar con Gemini las secciones B–E (semana exacta,
> co-autoría, repos por persona/proyecto, histórico, scope del token). Las tareas 1–2 y 4
> (derivación pura + asociación + persistencia) no dependen de eso y se pueden adelantar.
> Proveedor: GitHub primero; Bitbucket en una iteración posterior con la misma interfaz.

- [x] 1. Tipos y derivación pura de métricas (+ verificación)
  - `metrics-derivation.ts`: función pura conteos brutos → { nui, devEfficiency, uipPerDay, selfChurnRate, fixRatioFreq, fixRatioVol, commitsPerDay }. Selfcheck (10 asserts) pasa, incluye ejemplos del documento (NUI 10000, efficiency 58.33% sobre net delta 7000/12000).
  - _Requisitos: 3.1, 7.2_

- [x] 2. Asociación persona ↔ cuenta de repo
  - `repoIdentities`/`repoScope` en resourceProfile (sin migración) vía `UsersService.setRepoProfile`. `RepoIdentityService` (get/set/clear + `suggestMatches` por email). Endpoints CRUD admin en `RepoIntegrationController`. Módulo registrado.
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 6.3_

- [x] 3. DevAnalyzer (API, sin clonar) — Developers/Arquitectos
  - `RepoProvider` interface + `GithubProvider` (REST: repos, commits, diffs, stats/contributors; GraphQL: blame). `dev-analyzer`: arma `RawGitCounts` por persona/semana desde la API; self-churn vía blame del estado padre sobre los archivos que tocó; exclusiones, `qa()`/merges. `CommitMeta.authoredDate` puebla los working days. Ventana jueves–miércoles GMT-5 en `week-range.ts` (+ selfcheck). Alimenta `deriveDevMetrics`.
  - _Requisitos: 1.1, 1.3, 1.5, 3.1, 3.2, 3.4, 3.6, 6.1, 6.2_

- [x] 3b. QaAnalyzer (criterios de aceptación) — QA
  - `qa-parsing.ts` (función pura `parseAcsFromMergeSubject`/`sumValidatedAcs`, + selfcheck) + `qa-analyzer.ts` que suma `N/N ACs pass` de los subjects de la persona QA en la semana. Selector de estrategia por rol (`resourceType === 'QA'`) en `RepoSyncService`.
  - Conteo de "automatizados" desde documentos `e2e/` por bundle: **pospuesto a v2** (acordado 2026-06-30). v1 solo calcula validados.
  - _Requisitos: 3.1, 3.3_

- [x] 4. Persistencia como MetricRecord
  - `RepoSyncService` resuelve asociaciones (confirmadas) → analyzer por rol → upsert `MetricRecord` (source `github`, metricKeys estables `nui`/`dev_efficiency`/…/`validated_acs`) idempotente por semana. Resiliencia por persona (try/catch + run result).
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Sincronización programada + a demanda + run log
  - `repo-sync.scheduler.ts` (dependency-free `setInterval` que dispara miércoles 18:00 GMT-5, configurable por env; ponytail vs `@nestjs/schedule`). `POST /repo-integration/sync` a demanda (admin) + `GET /runs/last`. Último run en memoria (v1).
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Seguridad de credenciales — **elevado a GitHub App (estándar de la industria)**
  - `GithubAuth` con dos modos: **App** (`GITHUB_APP_ID`+`GITHUB_APP_PRIVATE_KEY`, firma App JWT RS256 con `crypto` nativo en `app-jwt.ts` + selfcheck, acuña token de instalación efímero cacheado) y **PAT** (`GITHUB_TOKEN`, bootstrap/pruebas Nivel 0). App tiene prioridad. Secretos solo en `.env` (identidad del producto); en DB solo `installationId` (no secreto) vía `RepoConnection`. Nunca se logean. `.env.example` documenta ambos modos.
  - Endpoints: `GET /install-url`, `POST /connections`, `DELETE /connections/:id`; flujo "Conectar GitHub" en la UI (redirección + callback con `installation_id`). `RepoRef.installationId` se propaga a cada llamada.
  - _Requisitos: 1.2, 1.4, 6.4_

- [x] 7. Frontend: pantalla de Integraciones
  - `IntegrationsPage` (ruta `/integrations`, admin, en nav): estado del proveedor (modo App/PAT + repos), botón GitHub con estado (ícono = botón, marquilla verde/gris) que abre la App en pestaña nueva y menú de gestión al estar conectado, tabla paginada + búsqueda de asociación persona↔cuenta, verificación automática del login contra GitHub (verde+avatar/nombre / rojo "no existe", onBlur + al cargar + al sugerir), acciones solo-ícono (check/X), "Sugerir asociaciones" y "Sincronizar ahora" + último run. Incluye a admins (dev/arquitecto también se miden). `repoIntegrationApi`.
  - _Requisitos: 2.2, 2.3, 2.4, 5.2_

- [x] 7b. Self-service OAuth (cada quien vincula SU cuenta) — validado en vivo
  - `GithubOauthService` (state HMAC firmado en `oauth-state.ts` + selfcheck; canjea code → identidad canónica → guarda en el perfil como confirmada) + `GithubOauthController` (`/oauth/github/start|me|disconnect` con JWT, `callback` público). `GithubConnectCard` en el Perfil: "Conectar mi GitHub" de un clic, desvincular, aviso de cambio de cuenta (link a github.com/logout) y lista de sus métricas sincronizadas (últimas 8 semanas, con label legible). Cualquier usuario vincula solo la suya.
  - _Requisitos: 2.1, 2.2_

- [x] 7c. Verificación de identidad del login
  - `GithubProvider.verifyUser` (`GET /users/:login` con token de instalación en App / PAT directo) → identidad canónica o null. Endpoint `GET /verify-user/:login`. En la UI pinta verde/rojo. `confirmed` requiere verificación previa.
  - _Requisitos: 2.3_

- [x] 7d. Autoprovisión de métricas + sugerencias
  - `repo-metrics-catalog.ts` (fuente única de keys/labels/categoría por defecto, marca `principal`). `MetricsService.ensureMetric` (siembra sin pisar la config del admin) + `associateResourceByKey`. `RepoSyncService` siembra+asocia las métricas del rol al sincronizar (dejan de ser huérfanas; el motor/consolidado/gráficas las ven). El admin decide producción/estudio/seguimiento en la sesión de métricas. `GET /metric-catalog?role=` + botón "Métricas de repositorio" en `MetricsPage` que crea las faltantes.
  - _Requisitos: 3.1, 4.1_

- [x] 8. Verificación de cierre
  - `getDiagnostics` limpio; selfchecks pasan (derivación, qa-parsing, week-range, app-jwt, oauth-state). Sync validada en vivo con GitHub App real (1/1 OK, 8 records, source `github`, semana W26; valores 0 por no haber commits esa semana — medición correcta). OAuth self-service validado en vivo. Nota: `tsc` full se cuelga por el entorno (no por errores); getDiagnostics confirma limpio.
  - _Requisitos: 7.1, 7.2_

- [ ] 9. (Iteración posterior) BitbucketProvider
  - Implementar `BitbucketProvider` sobre la misma interfaz, sin tocar analyzer ni scheduler.
  - _Requisitos: 1.3_

- [ ] 10. (Deuda futura, spec aparte) Unificar Usuario/Recurso
  - Separar permiso (admin/user) de "ser medible"; que admins también sean recursos con métricas; una sola vista de Usuarios y eliminar el módulo `resources` legacy. Requiere su propia spec (migración de datos, decisiones de dominio).
