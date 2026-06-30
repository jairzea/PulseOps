# Diseño — Integración con repositorios

## Visión general

Un módulo `repo-integration` en el backend que, por cada persona vinculada y repo asignado:
clona/actualiza el repo, corre un **analizador Git determinístico** (mismo método del skill
`repository`: blame-based) para la(s) semana(s) objetivo, y persiste las métricas como
`MetricRecord`. Un scheduler dispara la sync el miércoles 6PM (configurable) y un endpoint
la dispara a demanda.

```
RepoProvider (GitHub | Bitbucket)   →   listar repos / clonar / autenticar
        │
        ▼
GitAnalyzer (puro, sobre un clon local)   →   NUI, Efficiency, complementarias por persona/semana
        │
        ▼
RepoSyncService   →   resuelve asociaciones, orquesta por repo/persona, upsert MetricRecord
        │
   ┌────┴─────┐
SchedulerService   SyncController (POST /repo-integration/sync  — a demanda, admin)
(miércoles 18:00)
```

## Decisión técnica central: por qué clonar y no usar la API REST

El self-churn requiere `git blame` para saber el **origen** de cada línea eliminada — la API
REST de GitHub/Bitbucket no expone eso. Por tanto el cálculo corre sobre un **clon local**
(shallow donde sea posible), igual que los scripts del skill. La API del proveedor se usa
solo para **descubrir repos** y **autenticar el clon**.

`ponytail:` clon completo necesario para blame histórico (shallow corta el historial y
rompe la atribución de origen). Optimización futura: cache de clones por repo + `git fetch`
incremental en vez de clonar de cero cada vez. Marcar el clon-por-run como el ceiling.

## A. RepoProvider (interfaz, aísla GitHub/Bitbucket)

```ts
interface RepoProvider {
  readonly name: 'github' | 'bitbucket';
  listRepositories(): Promise<RepoRef[]>;          // descubrimiento (API)
  cloneUrlFor(repo: RepoRef): string;              // URL autenticada para clonar
}
```
- `GithubProvider` primero. `BitbucketProvider` después implementa la misma interfaz.
- Credenciales desde `ConfigService` (env). Token de org por defecto; token por usuario
  como override opcional (mapa en la asociación, almacenado cifrado/no expuesto).

## B. Analizadores por rol (estrategia según el rol de la persona)

El cálculo se bifurca por rol detrás de una interfaz común. Ambos corren sobre el clon local
y son determinísticos.

```ts
interface RoleMetricAnalyzer {
  appliesTo(role: ResourceRole): boolean;
  analyze(clonePath: string, week: WeekRange, identities: Identity[]): MetricValues;
}
```

### B.1 DevAnalyzer (líneas, blame) — Developers y Arquitectos
Reusa el método del skill `repository`:
- **Gross Insertions** (Método B): suma de inserciones por commit del autor en el rango.
- **Total Deletions**: suma de deletions por commit.
- **Self-Churn**: blame del padre por archivo, cruzar líneas eliminadas → commit de origen;
  si el origen está en scope → self-churn.
- **Derivadas**: NUI = Gross − SelfChurn; Net Delta = Gross − TotalDeletions; Efficiency =
  NetDelta/Gross×100; UIP/d; Self-Churn Rate; Fix Ratio; Commits/día.
- **Exclusiones**: generados/deps/binarios/compilados; `qa()` y merges.

### B.2 QaAnalyzer (criterios de aceptación) — QA
NO cuenta líneas. Reglas confirmadas con el QA (2026-06-30):
- **Criterios validados (principal):** se leen del **título del merge commit** de cada rama
  slice/bugfix, que por convención trae `N/N ACs pass` (ej. `26/26 ACs pass`). Se cuentan
  **en la semana del merge** (el borrado de la rama no importa). → el número de ACs que
  pasaron es el numerador del `N/N` del título del merge.
- **Definición de los criterios (automatizados):** los ACs viven en **documentos dentro de
  `e2e/`**, dentro de cada bundle en los SPAs del proyecto. Sirven para trazabilidad/conteo
  de cuántos están automatizados.
- **Parsing:** del título del merge, patrón `N/N ACs pass` (regex sobre el subject del merge
  commit). Ejemplo real: `qa(e2e): update checklist — 26/26 ACs pass`.

`ponytail:` el conteo de validados se apoya en una convención de título de merge
(`N/N ACs pass`). Es frágil si el QA cambia el formato; se aísla en una función pura
testeable y se documenta la convención. Ceiling: el detalle por-AC (`AC-EN-01...`) y el
conteo de "automatizados" desde los documentos `e2e/` queda como mejora posterior; el
principal (validados) solo necesita el título del merge.

### B.3 Derivación pura (compartida, verificable)
La aritmética que convierte conteos brutos → métricas finales (NUI, Efficiency, ratios) se
aísla en `metrics-derivation.ts`, función pura con verificación ejecutable. El parsing de
ACs de QA también se aísla como función pura testeable.

## C. Modelo de datos

### Asociación persona ↔ cuenta (nuevo)
En `User.resourceProfile` (ya es objeto libre) o subdocumento dedicado:
```ts
repoIdentities?: Array<{
  provider: 'github' | 'bitbucket';
  username?: string;
  email?: string;          // email de commits
  confirmed: boolean;      // sugerido vs confirmado por admin
}>;
repoScope?: {
  allRepos: boolean;       // true = toda la org
  repoIds?: string[];      // subconjunto si allRepos=false
};
```
`ponytail:` reutilizar `resourceProfile` (objeto libre) evita migración de schema. Si crece,
extraer a colección `repo-identity`.

### Métricas → MetricRecord (sin cambios de modelo)
`metricKey` estables: `nui`, `dev_efficiency`, `uip_per_day`, `self_churn_rate`,
`fix_ratio_freq`, `fix_ratio_vol`, `commits_per_day`, `working_days`. `source = 'github'`.
La marca producción/estudio/seguimiento la pone la config de Fase 2 (`Metric.category`):
`nui` y `dev_efficiency` = PRODUCTION; el resto = TRACKING por defecto.

### Run log (nuevo, opcional)
Colección `repo-sync-runs`: `{ startedAt, finishedAt, trigger: 'scheduled'|'manual',
results: [{ repo, person, status, error? }], summary }`.

## D. Scheduler

- `@nestjs/schedule` (CronModule). Cron configurable; default `0 18 * * 3` (miércoles 18:00)
  en TZ America/Bogota.
- El cron llama a `RepoSyncService.runSync({ trigger: 'scheduled' })`.
- El run corre en background (no bloquea requests). Respeta la regla de no lanzar procesos
  que bloqueen el event loop: el clonado/blame se hace con procesos `git` hijos con `await`,
  encolados por repo, no todos a la vez.

## E. Backend — módulo `repo-integration`

```
repo-integration/
├── repo-integration.module.ts
├── providers/ (repo-provider.interface.ts, github.provider.ts, bitbucket.provider.ts[fase 2])
├── git-analyzer.service.ts          # clona + corre git, devuelve conteos brutos
├── metrics-derivation.ts            # PURO: conteos → NUI/Efficiency/ratios (+ selfcheck)
├── repo-sync.service.ts             # orquesta: asociaciones → analyzer → upsert records
├── repo-sync.scheduler.ts           # cron miércoles 18:00
├── repo-integration.controller.ts  # POST /sync (a demanda), GET /runs, CRUD asociaciones
└── dto/
```

## F. Frontend

- Pantalla de **Integraciones** (admin): conectar proveedor (estado del token), lista de
  repos, y tabla de asociación persona↔cuenta con **match sugerido** (badge "sugerido",
  botones confirmar/asociar/desasociar) y selección de repos por persona.
- Botón **"Sincronizar ahora"** + indicador del último run (fecha, resultado, errores).
- Reusa `httpClient`, toasts, y patrón de páginas admin existente.

## Verificación
1. `metrics-derivation.ts` con **verificación ejecutable** (assert sin framework):
   conteos conocidos → NUI/Efficiency/ratios esperados (incluye el ejemplo del documento:
   12000 gross, 2000 churn → NUI 10000; 10000 ins, 3000 del → efficiency 70%).
2. `GitAnalyzer` validado contra un repo de prueba pequeño con commits conocidos (los
   números deben coincidir con correr el skill `repository` a mano).
3. `getDiagnostics` + build backend + typecheck frontend.

## Riesgos / preguntas abiertas
**Developers (Gemini secciones B–E):**
- Confirmar semana (jueves–miércoles GMT-5 vs otra) — Req 3.5.
- Co-autoría/pair: ¿un commit cuenta para varias personas? Default: autor del commit.
- Repos por persona vs por proyecto/equipo (D-11).
- Histórico disponible para 8 semanas (E-13); scope exacto del token (E-14).

**QA — confirmado con el QA (2026-06-30):**
- ✅ Validados = `N/N ACs pass` del **título del merge commit**, contados en la **semana del
  merge**. No depende del borrado de la rama.
- ✅ Definición de ACs vive en documentos dentro de `e2e/` por bundle en los SPAs.
- Pendiente menor: ¿el conteo de "automatizados" se quiere desde esos documentos `e2e/`, o
  basta con el principal (validados) en esta primera versión?
- Pendiente: identidad del QA en el repo (cuenta/email de commits) — Req 2.
