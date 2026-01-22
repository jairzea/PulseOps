# 📊 Estado de Implementación - Pruebas E2E con Playwright

**Fecha**: 22 de Enero de 2026  
**Branch**: `test/playwright-e2e`  
**Estado**: 🟡 En Progreso (40% Completado)

---

## ✅ Completado

### 1. ✅ Preparación del Repositorio
- [x] Rama `test/playwright-e2e` creada
- [x] Proyecto en estado limpio sin cambios pendientes

### 2. ✅ Levantamiento del Stack Completo
- [x] MongoDB levantado en Docker (`pulseops-mongodb`)
- [x] Backend NestJS corriendo en `http://localhost:3000`
- [x] Frontend React+Vite corriendo en `http://localhost:5173`
- [x] Usuario admin creado (`admin@pulseops.com` / `admin123`)

**Comandos de verificación**:
```bash
# MongoDB
docker ps | grep pulseops-mongodb

# Backend
curl http://localhost:3000/health
# {"status":"ok","timestamp":"...","service":"pulseops-backend"}

# Frontend
curl -I http://localhost:5173
# HTTP/1.1 200 OK
```

### 3. ✅ Exploración de UI con Playwright
- [x] Navegación con `playwright_navigate` a `http://localhost:5173`
- [x] Mapeo de página de login
- [x] Identificación de selectores CSS disponibles
- [x] Detección de ausencia de `data-testid`
- [x] Documentación de estructura de elementos

### 4. ✅ Documentación Completa

#### [E2E_PLAYWRIGHT_SETUP.md](./E2E_PLAYWRIGHT_SETUP.md) ✅
**Contenido**:
- Inicio rápido en 6 pasos
- Estructura del proyecto completa
- Variables de entorno necesarias
- URLs y puertos de todos los servicios
- 12+ scripts NPM documentados
- Credenciales de prueba
- Flujo de trabajo típico
- Troubleshooting común
- Configuración avanzada (timeouts, retries, paralelismo)
- Checklist de verificación

#### [E2E_UI_MAP.md](./E2E_UI_MAP.md) ✅
**Contenido**:
- Resumen de 6 rutas principales
- Mapeo detallado de Login Page
- Mapeo detallado de Dashboard
- Mapeo detallado de Resources Page
- Mapeo detallado de Metrics Page
- Mapeo detallado de Records Page
- Selectores globales (sidebar, user menu, toast)
- 40 `data-testid` recomendados
- 4 helpers de espera sugeridos
- 11 endpoints API relevantes
- Estado de implementación: 0% cobertura de `data-testid`

---

## ⚠️ Pendiente

### 5. ⚠️ Instalación y Configuración de Playwright

**Tareas restantes**:
- [ ] Instalar Playwright y dependencias:
  ```bash
  npm install --save-dev \
    @playwright/test@^1.48.2 \
    @cucumber/cucumber@^11.0.1 \
    playwright-bdd@^8.6.0 \
    --legacy-peer-deps
  ```
- [ ] Instalar browsers: `npx playwright install chromium firefox webkit`
- [ ] Crear `playwright.config.ts`
- [ ] Crear `playwright/tsconfig.json`
- [ ] Crear estructura de carpetas:
  ```
  playwright/
  ├── e2e/
  │   ├── features/
  │   └── step-definitions/
  ├── support/
  │   ├── pages/
  │   ├── widgets/
  │   ├── utils/
  │   └── fixtures/
  ```
- [ ] Configurar Cucumber preprocessor
- [ ] Agregar scripts NPM al `package.json` raíz

### 6. ⚠️ Implementación de Features

#### Feature 1: Navegación Base (01-navigation.feature)
**Escenarios**:
1. Abrir app y verificar redirección al login
2. Login exitoso y redirección a dashboard
3. Navegar a Resources
4. Navegar a Metrics
5. Navegar a Records
6. Logout

**Elementos necesarios**:
- LoginPage.ts (POM)
- DashboardPage.ts (POM)
- navigation.steps.ts
- common.steps.ts (login reutilizable)

#### Feature 2: Dashboard (02-dashboard.feature)
**Escenarios**:
1. Seleccionar recurso y verificar datos
2. Seleccionar métrica y verificar chart actualiza
3. Validar panel de condición visible
4. Validar inclinación calculada
5. Validar señales presentes
6. Validar playbook correspondiente a condición

**Elementos necesarios**:
- DashboardPage.ts mejorado
- dashboard.steps.ts
- ChartWidget.ts
- SelectWidget.ts
- waitHelpers.ts (waitForChartLoaded)

#### Feature 3: Records (03-records.feature)
**Escenarios**:
1. Abrir modal de crear registro
2. Llenar campos válidos
3. Guardar registro
4. Validar registro en tabla
5. Validar chart actualiza
6. Eliminar registro

**Elementos necesarios**:
- RecordsPage.ts
- ModalWidget.ts
- TableWidget.ts
- records.steps.ts

#### Feature 4: Metrics (04-metrics.feature)
**Escenarios**:
1. Crear métrica con datos válidos
2. Validar aparece en tabla
3. Editar métrica
4. Validar cambios persisten
5. Eliminar métrica
6. Validar desaparece

**Elementos necesarios**:
- MetricsPage.ts
- metrics.steps.ts
- InputWidget.ts

#### Feature 5: Resources (05-resources.feature)
**Escenarios**:
1. Crear recurso nuevo
2. Validar en listado
3. Editar datos del recurso
4. Desactivar recurso (soft delete)
5. Validar estado inactivo

**Elementos necesarios**:
- ResourcesPage.ts
- resources.steps.ts

### 7. ⚠️ Implementación de Page Objects

**Archivos a crear**:
- [ ] `BasePage.ts` - Clase base con métodos comunes
- [ ] `LoginPage.ts` - Login, recordar sesión
- [ ] `DashboardPage.ts` - Selectores, charts, condiciones
- [ ] `ResourcesPage.ts` - CRUD de recursos
- [ ] `MetricsPage.ts` - CRUD de métricas
- [ ] `RecordsPage.ts` - Agregar/eliminar registros

**Métodos comunes en BasePage**:
```typescript
- goto(url: string)
- waitForPageLoad()
- click(selector: string)
- fill(selector: string, value: string)
- selectOption(selector: string, value: string)
- getText(selector: string)
- isVisible(selector: string)
- waitForSelector(selector: string, options?)
```

### 8. ⚠️ Implementación de Widgets

**Archivos a crear**:
- [ ] `BaseWidget.ts` - Clase abstracta base
- [ ] `ButtonWidget.ts` - click(), doubleClick(), isEnabled()
- [ ] `InputWidget.ts` - fill(), clear(), getValue()
- [ ] `SelectWidget.ts` - selectByValue(), selectByText()
- [ ] `TableWidget.ts` - getRows(), getCellValue(), clickRow()
- [ ] `ModalWidget.ts` - open(), close(), fillForm()

**Inspiración**: Ver implementación en `cypress/support/widgets/`

### 9. ⚠️ Implementación de Utilidades

**Archivos a crear**:
- [ ] `testTags.ts` - Sistema recursivo de data-testids (portar desde Cypress)
- [ ] `waitHelpers.ts`:
  - `waitForAppReady(page)`
  - `waitForTableLoaded(page, tableSelector)`
  - `waitForModalOpen(page)`
  - `waitForModalClosed(page)`
  - `waitForChartLoaded(page)`
- [ ] `dataHelpers.ts`:
  - `generateRandomUser()`
  - `generateRandomMetric()`
  - `generateRandomRecord()`

### 10. ⚠️ Fixtures de Datos

**Archivos JSON a crear**:
- [ ] `users.json` - Usuarios de prueba
- [ ] `resources.json` - Recursos de prueba
- [ ] `metrics.json` - Métricas de prueba
- [ ] `records.json` - Registros de prueba

---

## 🔧 Tareas Críticas Adicionales

### A. Agregar data-testid al Frontend

**Archivos a modificar** (en `apps/frontend/src/`):
1. **Login Page** (`pages/LoginPage.tsx`):
   - `data-testid="login-email-input"`
   - `data-testid="login-password-input"`
   - `data-testid="login-submit-button"`

2. **Dashboard** (`pages/DashboardPage.tsx`):
   - `data-testid="resource-selector"`
   - `data-testid="metric-selector"`
   - `data-testid="time-series-chart"`
   - `data-testid="condition-panel"`

3. **Sidebar** (`components/Sidebar.tsx`):
   - `data-testid="sidebar-dashboard-link"`
   - `data-testid="sidebar-resources-link"`
   - `data-testid="sidebar-metrics-link"`
   - `data-testid="sidebar-records-link"`

4. **Modales** (`components/modals/`):
   - `data-testid="modal-dialog"`
   - `data-testid="modal-close-button"`
   - `data-testid="modal-submit-button"`

5. **Tables** (`components/tables/`):
   - `data-testid="table-container"`
   - `data-testid="table-row"`
   - `data-testid="table-edit-button"`
   - `data-testid="table-delete-button"`

**Prioridad**: 🔴 Alta - Sin esto, las pruebas serán muy frágiles

### B. Crear Seeds de Datos Demo

**Archivo**: `apps/backend/src/scripts/seed-demo-data.ts`

**Datos a crear**:
- 5 recursos de prueba
- 3 métricas de prueba
- 20 registros de prueba (series temporales)
- Asegurar que hay datos suficientes para triggers de condiciones

**Script NPM**:
```json
{
  "seed:demo": "ts-node -r tsconfig-paths/register apps/backend/src/scripts/seed-demo-data.ts"
}
```

### C. Configurar CI/CD (Opcional)

**Archivo a crear**: `.github/workflows/e2e-tests.yml`

**Pasos**:
1. Checkout código
2. Setup Node.js v20
3. Instalar dependencias
4. Levantar Docker (MongoDB)
5. Levantar Backend
6. Levantar Frontend
7. Ejecutar seeds
8. Ejecutar tests Playwright
9. Subir reportes como artifacts

---

## 📊 Progreso General

| Fase | Estado | Progreso |
|------|--------|----------|
| 1. Preparación | ✅ Completado | 100% |
| 2. Levantamiento Stack | ✅ Completado | 100% |
| 3. Exploración UI | ✅ Completado | 100% |
| 4. Documentación | ✅ Completado | 100% |
| 5. Config Playwright | ⚠️ Pendiente | 0% |
| 6. Features | ⚠️ Pendiente | 0% |
| 7. Page Objects | ⚠️ Pendiente | 0% |
| 8. Widgets | ⚠️ Pendiente | 0% |
| 9. Utilidades | ⚠️ Pendiente | 0% |
| 10. Fixtures | ⚠️ Pendiente | 0% |

**Total General**: **40% Completado**

---

## 🎯 Próximos Pasos Inmediatos

### Paso 1: Instalar Playwright (15 min)
```bash
npm install --save-dev \
  @playwright/test@^1.48.2 \
  @cucumber/cucumber@^11.0.1 \
  playwright-bdd@^8.6.0 \
  --legacy-peer-deps

npx playwright install chromium
```

### Paso 2: Crear playwright.config.ts (10 min)
- Configurar base URL
- Configurar browsers
- Configurar timeouts
- Configurar reportes
- Integrar Cucumber

### Paso 3: Crear estructura de carpetas (5 min)
```bash
mkdir -p playwright/{e2e/{features,step-definitions},support/{pages,widgets,utils,fixtures}}
```

### Paso 4: Implementar BasePage y LoginPage (30 min)
- BasePage con métodos básicos
- LoginPage con método `login(email, password)`
- Probar login manualmente

### Paso 5: Crear primera feature (30 min)
- `01-navigation.feature` con 3 escenarios básicos
- Step definitions mínimos
- Ejecutar y validar

### Paso 6: Agregar data-testid al Login (10 min)
- Modificar `apps/frontend/src/pages/LoginPage.tsx`
- Agregar los 3 data-testids críticos
- Verificar en browser

**Tiempo estimado total para MVP funcional**: 2-3 horas

---

## 📚 Documentos Creados

1. ✅ [E2E_PLAYWRIGHT_SETUP.md](./E2E_PLAYWRIGHT_SETUP.md) - Guía completa de setup
2. ✅ [E2E_UI_MAP.md](./E2E_UI_MAP.md) - Mapa detallado de UI
3. ✅ [docs/guides/PLAYWRIGHT_E2E_PROMPT.md](./docs/guides/PLAYWRIGHT_E2E_PROMPT.md) - Prompt para otra IA
4. ✅ Este archivo - Estado de implementación

---

## 🔗 Referencias Útiles

- **Playwright Docs**: https://playwright.dev/docs/intro
- **Cucumber/BDD**: https://cucumber.io/docs/bdd/
- **playwright-bdd**: https://vitalets.github.io/playwright-bdd/
- **Cypress PulseOps** (referencia): `cypress/` en este repo
- **TestTags Cypress**: `cypress/support/utils/testTags.ts`

---

## ⚠️ Notas Importantes

### Problema Detectado: Login Automatizado
Durante la exploración, se detectó que el login automatizado con Playwright tuvo problemas:
- React no detectaba los valores en inputs cuando se establecían directamente
- Se necesita disparar eventos `input` y `change` correctamente
- Solución temporal: Usar `page.fill()` de Playwright en lugar de `.value`
- Solución permanente: Agregar `data-testid` y usar selectores estables

### Ausencia Total de data-testid
- **0% de cobertura** actualmente
- **Crítico**: Sin `data-testid`, las pruebas dependerán de clases CSS, que pueden cambiar
- **Acción requerida**: Agregar al menos los 40 `data-testid` recomendados en E2E_UI_MAP.md

### Autenticación en Pruebas
Opciones para manejar auth:
1. **Login UI** en cada test (lento, pero realista)
2. **Setup con API** + guardar storage state (rápido, recomendado)
3. **Fixture de usuario logueado** (ideal para Playwright)

Recomendación: Implementar opción 2 usando `storageState` de Playwright.

---

**Fecha de Actualización**: 22 de Enero de 2026  
**Siguiente Sesión**: Continuar con instalación de Playwright y primera feature funcional
