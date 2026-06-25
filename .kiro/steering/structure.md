# PulseOps — Estructura del Monorepo

Monorepo con **npm workspaces**. Node >= 20, npm >= 10.

```
pulseops/
├── packages/
│   ├── shared-types/      # @pulseops/shared-types — contratos de dominio (TS puro)
│   └── analysis-engine/   # @pulseops/analysis-engine — motor puro, sin deps externas
├── apps/
│   ├── backend/           # @pulseops/backend — NestJS 10 + Mongoose
│   └── frontend/          # @pulseops/frontend — React 18 + Vite
├── cypress/ + .features-gen/  # E2E con Cucumber/Gherkin (BDD)
├── config/                # docker-compose (dev y base)
├── scripts/               # seed-data, e2e_demo
└── docs/                  # specs de dominio, guías, API
```

## Regla de dependencias entre packages

```
shared-types  ←  analysis-engine  ←  backend
       ↑                ↑               
       └────────────────┴──────────  frontend
```

- `shared-types` no depende de nadie. Es la **única fuente de verdad** de los contratos.
- `analysis-engine` solo depende de `shared-types`. **Debe permanecer puro**: sin HTTP, sin DB, sin I/O, determinístico.
- `backend` y `frontend` consumen ambos packages. Nunca al revés.

## Backend (NestJS) — organización por dominio

Cada dominio es un módulo con la misma forma: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `schemas/`.

Módulos: `auth`, `users`, `resources`, `metrics`, `records`, `charts`, `rules`, `analysis`, `playbooks`, `conditions`, `configuration`. Transversal: `common/` (filters, exceptions, dto, interfaces, decorators).

- **Schemas** (Mongoose): la mayoría usa un `id` UUID propio además del `_id`, y transforma `toJSON` para ocultar `_id`/`__v`. Excepción: `User` usa `_id` directamente.
- **Excepciones**: usar las de `common/exceptions/app.exception.ts` (`ResourceNotFoundException`, `ForbiddenException`, etc.), nunca `throw new Error(...)` en controllers (da 500 en vez del status correcto).
- **Errores** se formatean en `GlobalExceptionFilter`.

## Frontend (React) — organización por responsabilidad

- `components/` — UI reutilizable. `pages/` — vistas por ruta. `modules/` — features autocontenidas (ej. `live-demo`).
- `hooks/` — lógica reutilizable de estado. `stores/` — Zustand (global). `contexts/` — Auth y Theme.
- `services/api/` — un servicio por dominio sobre un `httpClient` central. `services/apiClient.ts` es un **facade deprecado**; preferir los servicios específicos en código nuevo.
- `schemas/` — validación de formularios (yup/zod). `utils/` — helpers (chartUtils, errors, query).

## Convenciones

- Crear archivos pequeños con `fsWrite` y crecer con `fsAppend`.
- Renombrar símbolos con `semanticRename`; mover archivos con `smartRelocate`.
- Validar cambios con `getDiagnostics` y `npm run typecheck` antes de dar por cerrada una tarea.
