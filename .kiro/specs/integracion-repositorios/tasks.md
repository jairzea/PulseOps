# Plan de implementación — Integración con repositorios

> **Antes de la tarea 3 (analyzer):** confirmar con Gemini las secciones B–E (semana exacta,
> co-autoría, repos por persona/proyecto, histórico, scope del token). Las tareas 1–2 y 4
> (derivación pura + asociación + persistencia) no dependen de eso y se pueden adelantar.
> Proveedor: GitHub primero; Bitbucket en una iteración posterior con la misma interfaz.

- [ ] 1. Tipos y derivación pura de métricas (+ verificación)
  - `metrics-derivation.ts`: función pura conteos brutos (gross, deletions, selfChurn, commits, workingDays) → { nui, devEfficiency, uipPerDay, selfChurnRate, fixRatioFreq, fixRatioVol, commitsPerDay }. Selfcheck con asserts (incluye ejemplos del documento: NUI 10000, efficiency 70%).
  - _Requisitos: 3.1, 7.2_

- [ ] 2. Asociación persona ↔ cuenta de repo
  - Modelo (`repoIdentities`, `repoScope` en resourceProfile) + servicio/endpoints CRUD (asociar/desasociar) + **match sugerido por email** de empresa. Guard admin.
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 6.3_

- [ ] 3. DevAnalyzer (clon + git blame, determinístico) — Developers/Arquitectos
  - `RepoProvider` interface + `GithubProvider` (descubrir repos, clone URL autenticada desde env). `dev-analyzer`: clona/actualiza, corre git/blame por persona y semana → conteos brutos; exclusiones, `qa()`/merges, timezone jueves–miércoles GMT-5. Limpia el clon tras el cálculo.
  - _Requisitos: 1.1, 1.3, 1.5, 3.1, 3.2, 3.4, 3.6, 6.1, 6.2_

- [ ] 3b. QaAnalyzer (criterios de aceptación) — QA
  - Función pura testeable que parsea `N/N ACs pass` del título de los merge commits de la semana → criterios validados (principal). Detección de merge commits de ramas slice/bugfix en el rango. Selector de estrategia por rol.
  - Conteo de "automatizados" desde documentos `e2e/` por bundle: **pospuesto a v2** (acordado 2026-06-30). v1 solo calcula validados.
  - _Requisitos: 3.1, 3.3_

- [ ] 4. Persistencia como MetricRecord
  - `RepoSyncService` resuelve asociaciones → analyzer → upsert `MetricRecord` (source `github`, metricKeys estables) idempotente por semana. Métricas `nui`/`dev_efficiency` marcadas PRODUCTION; resto TRACKING.
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Sincronización programada + a demanda + run log
  - Scheduler cron configurable (default miércoles 18:00 GMT-5) → `runSync({trigger})`. `POST /repo-integration/sync` a demanda (admin). Resiliencia por elemento, run log (`repo-sync-runs`) y `GET /runs`. Background, sin bloquear.
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Seguridad de credenciales
  - Tokens desde env (org) + override por usuario opcional; nunca en logs ni respuestas. Fail-fast claro si faltan, sin romper la app. Scope de solo lectura documentado en `.env.example`.
  - _Requisitos: 1.2, 1.4, 6.4_

- [ ] 7. Frontend: pantalla de Integraciones
  - Estado del proveedor/token, lista de repos, tabla de asociación persona↔cuenta con match sugerido (confirmar/asociar/desasociar) y selección de repos. Botón "Sincronizar ahora" + último run.
  - _Requisitos: 2.2, 2.3, 2.4, 5.2_

- [ ] 8. Verificación de cierre
  - `getDiagnostics`; build backend + typecheck frontend; selfcheck de derivación pasa; GitAnalyzer validado contra repo de prueba con números conocidos. Actualizar roadmap.
  - _Requisitos: 7.1, 7.2_

- [ ] 9. (Iteración posterior) BitbucketProvider
  - Implementar `BitbucketProvider` sobre la misma interfaz, sin tocar analyzer ni scheduler.
  - _Requisitos: 1.3_
