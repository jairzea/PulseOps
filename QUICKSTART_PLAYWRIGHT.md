# 🚀 Quick Reference - Playwright E2E Setup

## ✅ Ya Completado (40%)

1. ✅ Rama `test/playwright-e2e` creada
2. ✅ Stack completo levantado (MongoDB + Backend + Frontend)
3. ✅ UI explorada y documentada
4. ✅ Documentación completa creada

## ⚡ Para Continuar

### Comandos Rápidos

```bash
# 1. Instalar Playwright
npm install --save-dev @playwright/test@^1.48.2 @cucumber/cucumber@^11.0.1 playwright-bdd@^8.6.0 --legacy-peer-deps
npx playwright install chromium

# 2. Crear estructura
mkdir -p playwright/{e2e/{features,step-definitions},support/{pages,widgets,utils,fixtures}}

# 3. Levantar servicios (en nuevas terminales)
docker-compose -f config/docker-compose.dev.yml up -d
npm run dev --workspace=apps/backend
npm run dev --workspace=apps/frontend

# 4. Seeds
npm run seed:admin --workspace=apps/backend

# 5. Ejecutar tests (cuando estén listos)
npm run test:e2e:ui
```

## 📄 Archivos a Crear

### Configuración
- [ ] `playwright.config.ts`
- [ ] `playwright/tsconfig.json`

### Features (Gherkin)
- [ ] `playwright/e2e/features/01-navigation.feature`
- [ ] `playwright/e2e/features/02-dashboard.feature`
- [ ] `playwright/e2e/features/03-records.feature`
- [ ] `playwright/e2e/features/04-metrics.feature`
- [ ] `playwright/e2e/features/05-resources.feature`

### Step Definitions
- [ ] `playwright/e2e/step-definitions/common.steps.ts`
- [ ] `playwright/e2e/step-definitions/navigation.steps.ts`
- [ ] `playwright/e2e/step-definitions/dashboard.steps.ts`
- [ ] `playwright/e2e/step-definitions/records.steps.ts`
- [ ] `playwright/e2e/step-definitions/metrics.steps.ts`
- [ ] `playwright/e2e/step-definitions/resources.steps.ts`

### Page Objects
- [ ] `playwright/support/pages/BasePage.ts`
- [ ] `playwright/support/pages/LoginPage.ts`
- [ ] `playwright/support/pages/DashboardPage.ts`
- [ ] `playwright/support/pages/ResourcesPage.ts`
- [ ] `playwright/support/pages/MetricsPage.ts`
- [ ] `playwright/support/pages/RecordsPage.ts`

### Widgets
- [ ] `playwright/support/widgets/BaseWidget.ts`
- [ ] `playwright/support/widgets/ButtonWidget.ts`
- [ ] `playwright/support/widgets/InputWidget.ts`
- [ ] `playwright/support/widgets/SelectWidget.ts`
- [ ] `playwright/support/widgets/TableWidget.ts`
- [ ] `playwright/support/widgets/ModalWidget.ts`

### Utils
- [ ] `playwright/support/utils/testTags.ts` (portar de Cypress)
- [ ] `playwright/support/utils/waitHelpers.ts`
- [ ] `playwright/support/utils/dataHelpers.ts`

### Fixtures
- [ ] `playwright/support/fixtures/users.json`
- [ ] `playwright/support/fixtures/resources.json`
- [ ] `playwright/support/fixtures/metrics.json`
- [ ] `playwright/support/fixtures/records.json`

## 🎯 Tareas Críticas Frontend

Agregar `data-testid` a:

### Login (`apps/frontend/src/pages/LoginPage.tsx`)
```tsx
<input data-testid="login-email-input" type="email" />
<input data-testid="login-password-input" type="password" />
<button data-testid="login-submit-button" type="submit" />
```

### Dashboard (`apps/frontend/src/pages/DashboardPage.tsx`)
```tsx
<select data-testid="resource-selector" />
<select data-testid="metric-selector" />
<div data-testid="time-series-chart" />
<div data-testid="condition-panel" />
```

### Sidebar (`apps/frontend/src/components/Sidebar.tsx`)
```tsx
<a data-testid="sidebar-dashboard-link" href="/" />
<a data-testid="sidebar-resources-link" href="/resources" />
<a data-testid="sidebar-metrics-link" href="/metrics" />
<a data-testid="sidebar-records-link" href="/records" />
```

## 📚 Documentos Disponibles

- [E2E_PLAYWRIGHT_SETUP.md](./E2E_PLAYWRIGHT_SETUP.md) - Setup completo
- [E2E_UI_MAP.md](./E2E_UI_MAP.md) - Mapa de UI
- [E2E_IMPLEMENTATION_STATUS.md](./E2E_IMPLEMENTATION_STATUS.md) - Estado detallado
- [docs/guides/PLAYWRIGHT_E2E_PROMPT.md](./docs/guides/PLAYWRIGHT_E2E_PROMPT.md) - Prompt para IA

## 🔑 Credenciales

- Email: `admin@pulseops.com`
- Password: `admin123`

## 🌐 URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MongoDB: localhost:27017

---

**Próximo paso**: Instalar Playwright y crear `playwright.config.ts`
