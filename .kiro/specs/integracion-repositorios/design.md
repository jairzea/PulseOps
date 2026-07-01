# Diseño — Integración con repositorios

## Visión general

Un módulo `repo-integration` en el backend que, por cada persona vinculada y repo asignado:
consume la **API del proveedor** (GitHub REST + GraphQL; sin clonar) para obtener los datos
crudos, corre un **analizador determinístico por rol** y persiste las métricas como
`MetricRecord`. Un scheduler dispara la sync el miércoles 6PM (configurable) y un endpoint
la dispara a demanda.

```
RepoProvider (GitHub | Bitbucket)   →   API: repos, commits, diffs, blame, contributors
        │
        ▼
RoleMetricAnalyzer (Dev | QA)   →   conteos crudos → derivación pura → métricas por persona/semana
        │
        ▼
RepoSyncService   →   resuelve asociaciones, orquesta por repo/persona, upsert MetricRecord
        │
   ┌────┴─────┐
SchedulerService   SyncController (POST /repo-integration/sync  — a demanda, admin)
(miércoles 18:00)
```

## Decisión técnica central: API-only (sin clonar) — revisado 2026-06-30

Investigación confirmó que **NO es necesario clonar**. La API de GitHub expone todo lo
necesario, incluido el origen de línea para el self-churn:

| Dato | Fuente API (sin clonar) |
|---|---|
| Gross insertions/deletions por autor y semana | REST `GET /repos/{o}/{r}/stats/contributors` |
| Commits por autor en rango (working days, commits/día, fix ratio por mensaje) | REST `GET /repos/{o}/{r}/commits?author=&since=&until=` |
| Líneas que borró cada commit (diff/patch) | REST `GET /repos/{o}/{r}/commits/{sha}` |
| **Origen de cada línea (self-churn exacto)** | **GraphQL `blame(path:)` → ranges{ startingLine, endingLine, commit{ oid, author } }** |
| QA: `N/N ACs pass` en merge commits | REST `GET /repos/{o}/{r}/commits` (subject del merge) |

Ventajas vs clonar: sin disco, sin binario `git`, sin clon temporal que limpiar, sin
historial pesado; mucho más liviano para el backend y este entorno. El cálculo deja de ser
"correr git local" y pasa a ser "consumir API + derivación pura" (la derivación pura ya está
hecha y verificada).

`ponytail:` el self-churn exacto por GraphQL `blame` es por path → una query por archivo con
borrados en la semana. Es más llamadas a la API (con rate limit), pero elimina clonado por
completo. **Optimización lazy v1:** calcular self-churn solo sobre los archivos que el autor
tocó esa semana (no todo el repo); cachear el resultado semanal. Ceiling: repos con cientos
de archivos tocados/semana → muchas queries; mitigación = paginar y respetar rate limit, o
aproximar self-churn (ver nota) si el volumen lo exige.

Nota sobre stats endpoints: `stats/contributors`/`code_frequency` pueden devolver 202
(GitHub computa en background) la primera vez; el cliente debe reintentar. Tope de 10k
commits en algunos stats endpoints — para repos enormes, derivar gross/deletions desde el
listado de commits + sus patches en vez del stats endpoint.

## A. RepoProvider (interfaz, aísla GitHub/Bitbucket)

```ts
interface RepoProvider {
  readonly name: 'github' | 'bitbucket';
  listRepositories(): Promise<RepoRef[]>;                       // descubrimiento
  listContributors(): Promise<RepoAccount[]>;                   // cuentas para match
  // Datos crudos por autor y semana (sin clonar):
  commitsInRange(repo, identities, week): Promise<CommitMeta[]>;     // sha, autor, msg, ins/del
  deletedLinesByFile(repo, sha): Promise<Record<path, number[]>>;    // líneas borradas (diff)
  blame(repo, ref, path): Promise<BlameRange[]>;                     // GraphQL: origen de línea
}
```
- `GithubProvider` primero (REST + GraphQL). `BitbucketProvider` después (misma interfaz;
  Bitbucket tiene endpoints equivalentes de commits/diffs; el self-churn se evalúa aparte).
- Credenciales vía `GithubAuth` (ver sección A.1). Modo App (producción) o PAT (bootstrap/pruebas).

## A.1 Autenticación — GitHub App (estándar de la industria) — añadido 2026-06-30

Decisión: la integración se autentica con una **GitHub App**, no con un PAT en `.env`. Es el
patrón que usan Vercel/Linear/CircleCI para integrarse con repos de clientes y resuelve el
acoplamiento de "un token de persona en config": multi-org, multi-proyecto, conectar desde la
UI, tokens efímeros y permisos finos de solo lectura.

**Dos modos detrás de `GithubAuth`** (estrategia; el provider no sabe cuál se usa):
- **App** (producción): `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY` (+ `GITHUB_APP_SLUG`).
  `GithubAuth` firma un **App JWT** (RS256 con `crypto` nativo, `app-jwt.ts`, sin librería de
  JWT) y acuña un **token de instalación efímero (~1h)** por `installationId`, cacheado.
- **PAT** (bootstrap / pruebas Nivel 0): solo `GITHUB_TOKEN`. Sirve para validar el motor
  contra repos personales sin registrar App. Si hay App configurada, tiene prioridad.

**Qué es secreto y dónde vive (rompe el acoplamiento que preocupaba):**
- En `.env`: la **identidad del producto** (App ID + private key + slug). No cambia por cliente.
- En DB (`repo_connections`): solo el **`installationId` + cuenta** — **no es un secreto**,
  solo dice "dónde se instaló la App". El token se acuña en runtime. Acordado: nada de
  secretos en Mongo (una sola org, menos superficie de seguridad).

**Flujo de conexión (amigable, sin copiar tokens):** admin → "Conectar GitHub" → instala/edita
la App en GitHub → GitHub redirige al front con `installation_id` → el front confirma vía
`POST /repo-integration/connections`. `RepoRef.installationId` se propaga a cada llamada.

`ponytail:` firma de JWT manual (solo RS256, lo único que GitHub Apps acepta) y token de
instalación cacheado en memoria por proceso. Ceiling: varias instancias acuñan cada una su
token (GitHub lo permite); webhooks de instalación/borrado → futuro (hoy se confirma desde la UI).

## A.2 RepoProvider (interfaz original)

```ts
interface RepoProvider {
  readonly name: 'github' | 'bitbucket';
  listRepositories(): Promise<RepoRef[]>;                       // descubrimiento
  listContributors(): Promise<RepoAccount[]>;                   // cuentas para match
  // Datos crudos por autor y semana (sin clonar):
  commitsInRange(repo, identities, week): Promise<CommitMeta[]>;     // sha, autor, msg, ins/del
  deletedLinesByFile(repo, sha): Promise<Record<path, number[]>>;    // líneas borradas (diff)
  blame(repo, ref, path): Promise<BlameRange[]>;                     // GraphQL: origen de línea
}
```

## B. Analizadores por rol (estrategia según el rol de la persona)

El cálculo se bifurca por rol detrás de una interfaz común. Ambos consumen el `RepoProvider`
(API, sin clonar) y alimentan la derivación pura. Determinísticos para el mismo rango.

```ts
interface RoleMetricAnalyzer {
  appliesTo(role: ResourceRole): boolean;
  analyze(provider: RepoProvider, repos: RepoRef[], week: WeekRange, identities: Identity[]): MetricValues;
}
```

### B.1 DevAnalyzer (líneas) — Developers y Arquitectos
Consume la API y arma los `RawGitCounts` que ya consume `deriveDevMetrics`:
- **Gross/Deletions**: de `stats/contributors` (por autor/semana) o sumando los patches de
  los commits del autor en el rango.
- **Self-Churn**: para cada commit del autor, obtener las líneas que borró
  (`deletedLinesByFile`); por cada archivo, consultar `blame` del estado padre y ver el
  commit de origen de esas líneas; si el origen está en el scope (autor+periodo) → self-churn.
- **Commits/working days/fix ratio**: del listado de commits (mensaje → `fix(`/`bugfix/`).
- **Exclusiones**: generados/deps/binarios/compilados; `qa()` y merges.

### B.2 QaAnalyzer (criterios de aceptación) — QA
Reglas confirmadas con el QA (2026-06-30), todo por API (sin clonar):
- **Criterios validados (principal):** del **subject del merge commit** de cada rama
  slice/bugfix mergeada en la semana, parsear `N/N ACs pass` (ej. `26/26 ACs pass`). Se
  cuentan en la **semana del merge**.
- **Definición de ACs:** documentos dentro de `e2e/` por bundle (relevante para
  "automatizados", pospuesto a v2).
- **Parsing:** regex sobre el subject del merge. v1 solo validados.

`ponytail:` el conteo de validados se apoya en la convención de título `N/N ACs pass`. Frágil
si cambia el formato; aislado en función pura testeable y documentado. v1 no lee los docs
`e2e/` (automatizados = v2).

### B.3 Derivación pura (compartida, verificable) — YA IMPLEMENTADA
`metrics-derivation.ts` convierte `RawGitCounts` → métricas finales. Función pura con
selfcheck pasando (tarea 1). El parsing de `N/N ACs pass` de QA también se aísla como función
pura testeable.

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
- El run corre en background (no bloquea requests). El consumo de API se hace con `await`,
  encolando por repo y respetando el rate limit, no todo a la vez.

## E. Backend — módulo `repo-integration`

```
repo-integration/
├── repo-integration.module.ts
├── providers/ (repo-provider.interface.ts, github.provider.ts, bitbucket.provider.ts[fase 2])
├── dev-analyzer.ts                  # API → RawGitCounts (gross/del/self-churn vía blame)
├── qa-analyzer.ts                   # API → criterios validados (N/N del merge)
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
