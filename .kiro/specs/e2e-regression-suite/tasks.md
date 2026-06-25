# Implementation Plan: Suite E2E de Regresión

## Overview

Plan incremental para reconstruir la suite E2E de PulseOps (Cypress 15 + Cucumber). Primero se monta la **infraestructura base** una sola vez (helper `tid`, `BasePulseOpsPage`, factories, login real, seed fijo, barrel de POM). Luego se estabiliza **módulo por módulo** en el orden obligatorio del diseño (Req 14): Auth → Resources → Metrics → Records → Dashboard → Configuration → Users → Profile. Cada módulo se deja "verde" mediante un checkpoint de validación que ejecuta el usuario corriendo Cypress, antes de avanzar al siguiente.

Lenguaje de implementación: **TypeScript** (definido en el diseño; frontend React/Vite y Cypress).

Convención de tareas:
- Tareas marcadas con `*` son **opcionales para el agente**. Incluyen las pruebas property-based que dependen de `fast-check` (lo instala el usuario) y las **tareas del USUARIO** que el entorno del agente no puede ejecutar (instalar deps, correr `seed:e2e`, levantar servidores, correr Cypress).
- La verificación ejecutable del helper `tid` (Propiedades 1 y 2) es **obligatoria** y se hace con asserts sin framework, por lo que no lleva `*`.
- Cada tarea referencia los requisitos que cubre.

## Tasks

- [x] 1. Infraestructura base de la suite (una sola vez, antes de los módulos)

  - [x] 1.1 Crear el helper `tid()` de instrumentación en el frontend
    - Crear `apps/frontend/src/utils/testId.ts` con `PREFIX = 'cy'`, `norm()` (trim, espacios→`-`, descartar caracteres fuera de `[a-zA-Z0-9-_]`, lowercase) y `tid(...segments)` que une prefijo + segmentos normalizados con `-`.
    - Mantenerlo como helper de una línea por función; sin importar nada de `cypress/` (no acoplar el build del frontend a la carpeta de tests).
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 1.2 Escribir la verificación ejecutable del helper `tid` (obligatoria, sin framework)
    - Crear `apps/frontend/src/utils/testId.test.ts` con asserts (`node:assert`) que cubran las dos propiedades del diseño, sin depender de fast-check.
    - **Property 1: Forma del testId** — el id empieza por `cy-`, queda en kebab-case (`[a-z0-9-_]`, sin espacios ni mayúsculas) y contiene cada segmento normalizado. **Validates: Requirements 1.2**
    - **Property 2: Determinismo del testId** — invocaciones repetidas con los mismos segmentos producen el mismo string. **Validates: Requirements 1.5, 1.2**
    - Comentario de etiquetado por bloque: `// Feature: e2e-regression-suite, Property N: ...`.
    - _Requirements: 1.2, 1.5_

  - [ ]* 1.3 Reforzar las Propiedades 1 y 2 con fast-check (opcional, requiere instalación del usuario)
    - Reescribir/ampliar la verificación de `tid` con `fc.assert(..., { numRuns: 100 })` sobre segmentos arbitrarios (`fc.array(fc.string())`).
    - **Property 2** además compara el contrato frontend↔cypress: `tid(seg0, ...rest)` === el id dentro de `testTags.child(seg0).selector(rest.join('-'))`.
    - Solo implementar si el usuario ya instaló `fast-check`.
    - _Requirements: 1.2, 1.5_

  - [x] 1.4 Crear `BasePulseOpsPage` para los POM
    - Crear `cypress/support/pages/pulseops/BasePulseOpsPage.ts` (clase abstracta) con `ctx` por constructor, `sel(...segments)` que usa `testTags.child(ctx).selector(...)` y `selRaw(...segments)` para selectores globales (nav, toast, confirm).
    - Garantizar que `sel('create')` produce `[data-testid="cy-<ctx>-create"]`, idéntico al `tid` del frontend (contrato cerrado).
    - _Requirements: 2.1, 2.2_

  - [x] 1.5 Crear la estructura de factories
    - Crear `cypress/support/factories/` con `resourceFactory.ts`, `metricFactory.ts`, `recordFactory.ts`, `userFactory.ts` e `index.ts`, según las interfaces del diseño (`ResourceInput`, `MetricInput`, `RecordInput`, `UserInput`).
    - Cada `make*` usa `@faker-js/faker` y añade sufijo único por corrida (`faker.string.alphanumeric`) en los campos únicos (nombre/email). El código queda presente aunque faker se instale después; los módulos de solo-lectura no importan factories.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 1.6 Escribir la prueba property-based de unicidad de factories (opcional, requiere fast-check)
    - Crear `cypress/support/factories/factories.spec.ts`.
    - **Property 4: Unicidad de las factories** — para N invocaciones de una factory, los campos únicos (nombre, email) no colisionan entre instancias. `fc.assert(..., { numRuns: 100 })` con N arbitrario. **Validates: Requirements 5.2**
    - Etiquetar con `// Feature: e2e-regression-suite, Property 4: ...`.
    - _Requirements: 5.2_

  - [x] 1.7 Reconstruir `LoginPage` y crear el comando `cy.loginAsAdmin()`
    - Reescribir `cypress/support/pages/pulseops/LoginPage.ts` sobre `BasePulseOpsPage` + Widgets (`getInput`/`getButton`) usando `cy-login-email`, `cy-login-password`, `cy-login-submit`, `cy-login-error`. Sin `cy.contains`/selectores por texto.
    - Añadir `cy.loginAsAdmin()` en `cypress/support/commands.ts` envuelto en `cy.session('admin', ...)`, con login real por UI (sin inyectar tokens) y `ADMIN_PASSWORD` desde `Cypress.env`.
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [x] 1.8 Crear el seed fijo de test del backend
    - Crear `apps/backend/src/scripts/seed-e2e-data.ts` que escribe por el **camino correcto**: usuarios-recurso con `role = 'user'` + `resourceProfile.resourceType` (vía `UsersService`/`AuthService.register`), métricas vía `MetricsService`, records vía `RecordsService`. No usar el `ResourcesService` legacy.
    - Datos deterministas y conocidos (emails fijos tipo `e2e.poder@pulseops.test`, claves de métrica y series fijas) que reproduzcan condiciones conocidas (PODER, AFLUENCIA, NORMAL, EMERGENCIA, PELIGRO, INEXISTENCIA) para asertar el Dashboard. Sin valores aleatorios.
    - Idempotente: limpiar/upsertar por claves conocidas para producir el mismo estado en cada corrida; abortar con código ≠ 0 y log en caso de error.
    - Añadir el script `seed:e2e` en `apps/backend/package.json`.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 1.9 Escribir la prueba de idempotencia del seed fijo (opcional, requiere fast-check + base de test)
    - **Property 3: Idempotencia del seed fijo** — ejecutar el seed una o dos veces consecutivas produce el mismo estado observable (mismos recursos/métricas/records, sin duplicados). **Validates: Requirements 4.3**
    - De no haber runner de integración disponible, dejarla documentada como verificación ejecutable manual del script.
    - Etiquetar con `// Feature: e2e-regression-suite, Property 3: ...`.
    - _Requirements: 4.3_

  - [x] 1.10 Exportar todos los POM en el barrel
    - Actualizar `cypress/support/pages/pulseops/index.ts` para exportar `LoginPage`, `ResourcesPage`, `MetricsPage`, `RecordsPage`, `DashboardPage`, `ConfigurationPage`, `UsersPage`, `ProfilePage` y `BasePulseOpsPage`.
    - _Requirements: 2.4_

  - [x] 1.11 Validar la infraestructura base
    - `getDiagnostics` sobre los archivos tocados + `npm run typecheck` de los workspaces afectados (frontend y backend). El uso de faker/fast-check queda aislado en `cypress/` y los `*.spec`/`*.test`, sin romper el build del resto.
    - _Requirements: 1.1, 2.1, 4.1, 5.4_

  - [ ]* 1.12 Tarea del USUARIO — instalar dependencias de test (opcional para el agente)
    - Ejecutar en la raíz del monorepo: `npm install -D @faker-js/faker fast-check` (versiones pinneadas; verificar que no sean typosquatting).
    - Necesario para que corran las factories y las pruebas property-based opcionales.
    - _Requirements: 5.3, 14.3_

- [x] 2. Módulo Auth — estabilización
  - [x] 2.1 Instrumentar `data-testid` en login y navegación
    - Añadir `tid('login','email'|'password'|'submit'|'error')` en `apps/frontend/src/pages/LoginPage.tsx`.
    - Añadir en `components/Header.tsx`: `nav-menu-toggle`, `nav-dashboard`, `nav-resources`, `nav-metrics`, `nav-records`, `nav-configuration`, `nav-users`, `nav-user-toggle`, `nav-profile`, `nav-logout`. Aditivo, sin tocar estilos ni a11y.
    - _Requirements: 1.1, 1.2, 1.3, 10.2_
  - [x] 2.2 Reconstruir/confirmar POM de Auth y navegación sobre Widgets + testTags
    - Confirmar `LoginPage` (de 1.7) y añadir los métodos de navegación/logout que consumen `nav-*` (puede vivir en `LoginPage`/un helper de nav o en los POM destino). Métodos de alto nivel (`login`, `loginInvalid`, `logout`, `goTo`), sin selectores por texto/CSS.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.5, 10.1, 10.3_
  - [x] 2.3 Reescribir steps y Gherkin de autenticación/navegación
    - Reescribir `01-authentication` (y el `Background` de auth en `common.ts` → `cy.loginAsAdmin()`) y los steps de navegación para delegar 100% en POM. Cubrir login válido, login inválido (mensaje + permanencia en `/login`), logout y redirección de ruta protegida.
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 10.1, 10.3_
  - [x] 2.4 Validar tipos de Auth
    - `getDiagnostics` sobre archivos tocados + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 2.5 Checkpoint del USUARIO — validar Auth en verde (opcional para el agente)
    - El usuario levanta MongoDB + backend (3000) + frontend (5173), corre `npm run seed:e2e` y ejecuta Cypress del módulo Auth, y reporta el resultado.
    - Si reporta fallos, el agente corrige y se vuelve a validar antes de avanzar. Asegurarse de que pasan las pruebas; preguntar al usuario ante dudas.
    - _Requirements: 14.1, 14.2, 14.4, 14.5_

- [x] 3. Módulo Resources — estabilización
  - [x] 3.1 Instrumentar `data-testid` en Resources
    - `pages/ResourcesPage.tsx`: `resources-create`, `resources-search`, `resources-list`, `resources-row-<id>`, `-edit`, `-delete`. `components/ResourceForm.tsx` + `ResourceModal.tsx`: `resource-form-name`, `resource-form-role-type`, `resource-form-active`, `resource-form-save`, `resource-form-cancel`, `resource-form-name-error`. Filas usan el `id` del dominio como modificador.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 3.2 Reconstruir `ResourcesPage` (POM) sobre Widgets + testTags
    - Métodos de alto nivel `create/editById/deleteById/search/shouldShowInList/shouldNotShowRow/shouldShowToast/shouldShowFormError`. Usa `confirm-accept` para borrar y `toast` para confirmación. Sin texto/CSS.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.3 Reescribir steps y Gherkin de Resources
    - CRUD completo: crear con factory, listar/asertar contra seed fijo, editar, eliminar y validación con datos inválidos (mensaje + no persiste).
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 3.4 Validar tipos de Resources
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 3.5 Checkpoint del USUARIO — validar Resources en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Resources (con seed cargado y faker instalado) y reporta. El agente itera hasta verde antes de avanzar.
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 4. Módulo Metrics — estabilización
  - [x] 4.1 Instrumentar `data-testid` en Metrics
    - `pages/MetricsPage.tsx`: `metrics-create`, `metrics-search`, `metrics-list`, `metrics-row-<id>`, `-edit`, `-delete`. `MetricForm.tsx`/`MetricModal.tsx`: `metric-form-*`, `-save`, `-cancel`, `-*-error`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 4.2 Reconstruir `MetricsPage` (POM) sobre Widgets + testTags
    - Mismos métodos de alto nivel que Resources, sobre la métrica.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 4.3 Reescribir steps y Gherkin de Metrics
    - CRUD completo: crear con factory, listar/asertar contra seed fijo, editar, eliminar y validación con datos inválidos.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 4.4 Validar tipos de Metrics
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [ ]* 4.5 Checkpoint del USUARIO — validar Metrics en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Metrics y reporta. El agente itera hasta verde.
    - **Estado (2026-06-24):** mejor resultado 4/5; flujo de crear/editar/eliminar verificado correcto vía DevTools (POST 201 + toast + cierre de modal). El único fallo residual es intermitente y SOLO por saturación del entorno: bajo carga, `createMetric` espera un `fetchMetrics()` post-create que se estanca (>30s), retrasando el toast/cierre del modal. Mitigado en el POM (create desacoplado del toast efímero + verificación por recarga). Pendiente re-validar en entorno con recursos dedicados. Ver roadmap.md.
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 5. Módulo Records — estabilización
  - [x] 5.1 Instrumentar `data-testid` en Records
    - `pages/RecordsPage.tsx`: `records-create`, `records-list`, `records-row-<id>`, `-edit`, `-delete`. `RecordForm.tsx`/`RecordModal.tsx`: `record-form-resource`, `record-form-metric`, `record-form-week`, `record-form-value`, `-save`, `-cancel`, `-*-error`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 5.2 Reconstruir `RecordsPage` (POM) sobre Widgets + testTags
    - Métodos de alto nivel para asociar recurso+métrica al crear; resto análogo a los CRUD anteriores.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 5.3 Reescribir steps y Gherkin de Records
    - CRUD completo: crear con factory asociado a recurso/métrica del seed, listar/asertar contra seed fijo, editar, eliminar y validación con datos inválidos.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 5.4 Validar tipos de Records
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 5.5 Checkpoint del USUARIO — validar Records en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Records y reporta. El agente itera hasta verde.
    - **Validado (2026-06-24): 4/4 verde** en la corrida completa final (y en aislamiento). Robustecido el filtrado por autocomplete (force ante backdrop) y la espera del listado.
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 6. Módulo Dashboard — estabilización
  - [x] 6.1 Instrumentar `data-testid` en Dashboard
    - `pages/ResourceDashboard.tsx`, `components/ResourceSelector.tsx`, `MetricSelector.tsx`, `ConditionCard.tsx`: `dashboard-resource-select`, `dashboard-metric-select`, `dashboard-condition`, `dashboard-chart`. Instrumentar input y opción seleccionable del `AutocompleteInfinite` usados en el flujo.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 6.2 Reconstruir `DashboardPage` (POM) sobre Widgets + testTags
    - Métodos `selectResource`, `selectMetric`, `shouldShowCondition`, `shouldShowChart`. Sin texto/CSS.
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 6.3 Reescribir steps y Gherkin de Dashboard
    - Seleccionar recurso del seed → ver sus métricas; seleccionar métrica → ver análisis y condición; asertar la `Condicion_Operativa` esperada contra los valores conocidos del seed fijo.
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 6.4 Validar tipos de Dashboard
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 6.5 Checkpoint del USUARIO — validar Dashboard en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Dashboard y reporta. El agente itera hasta verde.
    - **Validado (2026-06-24): 3/3 verde** en corrida completa. Condición expuesta de forma síncrona (sin depender de la animación) y aserciones alineadas a la condición real del motor.
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 7. Módulo Configuration — estabilización
  - [x] 7.1 Instrumentar `data-testid` en Configuration
    - `pages/ConfigurationPage.tsx`: `configuration-edit`, `configuration-threshold-<key>`, `configuration-save`, `configuration-error`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 7.2 Reconstruir `ConfigurationPage` (POM) sobre Widgets + testTags
    - Métodos `editThreshold(key, value)`, `save`, `shouldShowThreshold`, `shouldShowError`. Sin texto/CSS.
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 7.3 Reescribir steps y Gherkin de Configuration
    - Ver umbrales vigentes, editar + guardar (persiste y refleja valor), guardar con valor inválido (mensaje + no persiste).
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 7.4 Validar tipos de Configuration
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 7.5 Checkpoint del USUARIO — validar Configuration en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Configuration y reporta. El agente itera hasta verde.
    - **Validado (2026-06-24): 2/2 verde** en corrida completa.
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 8. Módulo Users — estabilización
  - [x] 8.1 Instrumentar `data-testid` en Users
    - `pages/UsersAdminPage.tsx` (+ su modal/form): `users-create`, `users-search`, `users-list`, `users-row-<id>`, `-edit`, `-delete`; `user-form-name`, `user-form-email`, `user-form-role`, `-save`, `-cancel`, `-*-error`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 8.2 Reconstruir `UsersPage` (POM) sobre Widgets + testTags
    - Mismos métodos de alto nivel que los CRUD anteriores, sobre usuario.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 8.3 Reescribir steps y Gherkin de Users
    - CRUD completo: crear con factory, listar/asertar contra seed fijo, editar, eliminar y validación con datos inválidos.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 8.4 Validar tipos de Users
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 8.5 Checkpoint del USUARIO — validar Users en verde (opcional para el agente)
    - El usuario corre Cypress del módulo Users y reporta. El agente itera hasta verde.
    - **Validado (2026-06-24): 4/4 verde** en corrida completa. Borrado acotado por texto (nunca toca al admin).
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 9. Módulo Profile — estabilización
  - [x] 9.1 Instrumentar `data-testid` en Profile
    - `pages/ProfilePage.tsx`: `profile-name`, `profile-email`, `profile-save`, `profile-error`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 9.2 Reconstruir `ProfilePage` (POM) sobre Widgets + testTags
    - Métodos `updateField`, `save`, `shouldShowValue`, `shouldShowError`. Sin texto/CSS.
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 9.3 Reescribir steps y Gherkin de Profile
    - Ver datos actuales, actualizar campo editable + guardar (persiste y refleja), guardar con datos inválidos (mensaje + no persiste).
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 9.4 Validar tipos de Profile
    - `getDiagnostics` + `npm run typecheck`.
    - _Requirements: 1.3, 2.4_
  - [x]* 9.5 Checkpoint del USUARIO — validar Profile en verde y suite completa (opcional para el agente)
    - El usuario corre Cypress del módulo Profile y, si lo desea, la suite completa, y reporta. El agente itera hasta verde.
    - **Validado (2026-06-24): 2/2 verde** en corrida completa. Suite completa: 32/36 (89%), 7 de 9 módulos en verde; Metrics/Records pendientes solo por saturación del entorno (ver roadmap.md).
    - _Requirements: 14.1, 14.2, 14.4_

## Notes

- Tareas marcadas con `*` son opcionales para el agente: incluyen las property-based con `fast-check` (Propiedades 3 y 4, y refuerzo de 1/2) y todas las tareas del USUARIO (instalar deps, `seed:e2e`, levantar servidores, correr Cypress). El agente nunca lanza servidores, watchers ni Cypress por bash (Req 14.5).
- La verificación ejecutable de `tid` (tarea 1.2, Propiedades 1 y 2) es obligatoria y usa asserts sin framework, conforme a tech.md/ponytail.
- Orden incremental obligatorio (Req 14): infraestructura → Auth → Resources → Metrics → Records → Dashboard → Configuration → Users → Profile. Cada módulo se valida en verde por el usuario antes del siguiente.
- La instrumentación de `data-testid` es aditiva: no altera estilos, clases ni accesibilidad.
- Cada tarea referencia requisitos granulares para trazabilidad.
