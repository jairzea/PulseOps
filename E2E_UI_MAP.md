# 🗺️ Mapa de UI - PulseOps E2E Testing

## 📋 Descripción

Este documento mapea la estructura completa de la UI de PulseOps, identificando rutas, componentes clave, selectores recomendados y riesgos de flakiness para las pruebas E2E con Playwright.

**Fecha de Exploración**: 22 de Enero de 2026  
**Versión de la App**: MVP v0.1.0  
**Método**: playwright_navigate + inspección de código

---

## 🎯 Resumen de Rutas

| Ruta | Descripción | Requiere Auth | Estado |
|------|-------------|---------------|--------|
| `/login` | Página de inicio de sesión | ❌ | ✅ Funcional |
| `/` | Dashboard principal | ✅ | ✅ Funcional |
| `/resources` | Gestión de recursos | ✅ | ✅ Funcional |
| `/metrics` | Gestión de métricas | ✅ | ✅ Funcional |
| `/records` | Gestión de registros | ✅ | ✅ Funcional |
| `/charts` | Visualización de datos | ✅ | ⚠️ Por confirmar |

---

## 🔐 Login Page (`/login`)

### Estructura Visual
```
┌────────────────────────────────────┐
│   Welcome to PulseOps              │
│   ┌──────────────────────┐         │
│   │  📧 Email input       │         │
│   └──────────────────────┘         │
│   ┌──────────────────────┐         │
│   │  🔒 Password input    │         │
│   └──────────────────────┘         │
│   ☑ Remember me                    │
│   ┌──────────────────────┐         │
│   │  Login Button        │         │
│   └──────────────────────┘         │
└────────────────────────────────────┘
```

### Elementos Clave

| Elemento | Tipo | Selector Recomendado | Selector Actual | data-testid? |
|----------|------|---------------------|----------------|--------------|
| Email Input | input[type="email"] | `input[type="email"]` | `input[type="email"]` | ❌ |
| Password Input | input[type="password"] | `input[type="password"]` | `input[type="password"]` | ❌ |
| Remember Checkbox | input[type="checkbox"] | `input[type="checkbox"]` | `input[type="checkbox"]` | ❌ |
| Login Button | button[type="submit"] | `button[type="submit"]` | `button[type="submit"]` | ❌ |
| Heading | h1 | `h1:has-text("Welcome to PulseOps")` | `h1` | ❌ |

### ⚠️ Riesgos de Flakiness
1. **React State Sync**: Los inputs necesitan eventos React correctos (`input` + `change`)
2. **Validación Cliente**: Validación antes de submit puede causar fallos si valores no son válidos
3. **No hay data-testid**: Dependencia de selectores CSS frágiles
4. **Animaciones**: Posibles transiciones CSS en botones/inputs

### 📝 Recomendaciones
- ✅ Agregar `data-testid="login-email-input"`
- ✅ Agregar `data-testid="login-password-input"`
- ✅ Agregar `data-testid="login-submit-button"`
- ✅ Usar `page.fill()` en lugar de establecer `.value` directamente
- ✅ Esperar por navegación después del submit: `await Promise.all([page.waitForURL('/'), page.click('button[type="submit"]')])`

---

## 🏠 Dashboard Page (`/`)

### Estructura Visual (Estimada)
```
┌─────────────────────────────────────────────────────┐
│ [Logo] PulseOps         [User Menu] [Logout]        │
├──────────┬──────────────────────────────────────────┤
│          │  Dashboard                               │
│ Sidebar  │  ┌────────────────────────────────┐      │
│          │  │  Selector de Recurso          │      │
│ Dashboard│  └────────────────────────────────┘      │
│ Resources│  ┌────────────────────────────────┐      │
│ Metrics  │  │  Selector de Métrica          │      │
│ Records  │  └────────────────────────────────┘      │
│          │  ┌────────────────────────────────┐      │
│          │  │  Chart de Series Temporales    │      │
│          │  └────────────────────────────────┘      │
│          │  ┌────────────────────────────────┐      │
│          │  │  Panel de Condición            │      │
│          │  │  • Condición Actual            │      │
│          │  │  • Inclinación                 │      │
│          │  │  • Señales                     │      │
│          │  │  • Playbook                    │      │
│          │  └────────────────────────────────┘      │
└──────────┴──────────────────────────────────────────┘
```

### Elementos Clave

| Elemento | Tipo | Selector Recomendado | Selector Estimado | data-testid? |
|----------|------|---------------------|-------------------|--------------|
| Sidebar Nav: Dashboard | a | `nav a[href="/"]` | `aside a[href="/"]` | ❌ |
| Sidebar Nav: Resources | a | `nav a[href="/resources"]` | `aside a[href="/resources"]` | ❌ |
| Sidebar Nav: Metrics | a | `nav a[href="/metrics"]` | `aside a[href="/metrics"]` | ❌ |
| Sidebar Nav: Records | a | `nav a[href="/records"]` | `aside a[href="/records"]` | ❌ |
| Resource Selector | select/custom | `[data-testid="resource-selector"]` | `select` | ❌ |
| Metric Selector | select/custom | `[data-testid="metric-selector"]` | `select` | ❌ |
| Chart Container | div/canvas | `[data-testid="time-series-chart"]` | `canvas, svg` | ❌ |
| Condition Panel | div | `[data-testid="condition-panel"]` | `div[class*="condition"]` | ❌ |
| Condition Value | span/div | `[data-testid="condition-value"]` | `span:has-text(condition)` | ❌ |
| Inclinación Value | span/div | `[data-testid="slope-value"]` | `span:has-text("%")` | ❌ |
| Playbook Section | div | `[data-testid="playbook-section"]` | `div[class*="playbook"]` | ❌ |

### ⚠️ Riesgos de Flakiness
1. **Carga Asíncrona**: Datos del backend pueden tardar en cargar
2. **Skeletons/Loaders**: Animaciones de carga pueden estar presentes
3. **Charts Dinámicos**: Canvas/SVG pueden tardar en renderizar completamente
4. **Selectores Custom**: Si usan shadcn/ui, pueden ser complejos
5. **Cálculos del Motor**: Condiciones se calculan en tiempo real

### 📝 Recomendaciones
- ✅ Esperar a que desaparezcan skeletons: `await page.waitForSelector('[data-testid="skeleton"]', { state: 'hidden' })`
- ✅ Esperar a que el chart esté visible: `await page.waitForSelector('canvas', { state: 'visible' })`
- ✅ Agregar `data-testid` a todos los selectores y paneles
- ✅ Crear helper `waitForDashboardReady()`

---

## 👥 Resources Page (`/resources`)

### Estructura Visual (Estimada)
```
┌─────────────────────────────────────────────────────┐
│ Recursos                   [+ Crear Recurso]         │
├─────────────────────────────────────────────────────┤
│ 🔍 [Search]            [Filter] [Sort]              │
├─────────────────────────────────────────────────────┤
│ Nombre     | Rol      | Estado  | Acciones          │
│ John Doe   | Dev      | Activo  | ✏️ 🗑️            │
│ Jane Smith | Lead     | Activo  | ✏️ 🗑️            │
│ ...        | ...      | ...     | ...              │
└─────────────────────────────────────────────────────┘
```

### Elementos Clave

| Elemento | Tipo | Selector Recomendado | Selector Estimado | data-testid? |
|----------|------|---------------------|-------------------|--------------|
| Page Heading | h1 | `h1:has-text("Recursos")` | `h1` | ❌ |
| Create Button | button | `button:has-text("Crear")` | `button` | ❌ |
| Search Input | input | `input[placeholder*="Buscar"]` | `input[type="text"]` | ❌ |
| Resources Table | table | `table` | `table` | ❌ |
| Table Rows | tr | `table tbody tr` | `tbody tr` | ❌ |
| Edit Button | button | `button[aria-label="Editar"]` | `button` | ❌ |
| Delete Button | button | `button[aria-label="Eliminar"]` | `button` | ❌ |
| Modal Form | dialog/div | `[role="dialog"]` | `div[role="dialog"]` | ❌ |
| Name Input (Modal) | input | `input[name="name"]` | `input` | ❌ |
| Role Select (Modal) | select | `select[name="role"]` | `select` | ❌ |
| Save Button (Modal) | button | `button:has-text("Guardar")` | `button[type="submit"]` | ❌ |
| Cancel Button (Modal) | button | `button:has-text("Cancelar")` | `button` | ❌ |

### Flujo CRUD
1. **Create**: Click botón crear → Llenar modal → Guardar → Validar tabla se actualiza
2. **Read**: Verificar datos en tabla
3. **Update**: Click editar → Modificar modal → Guardar → Validar cambios
4. **Delete**: Click eliminar → Confirmar modal → Validar desaparece de tabla

### ⚠️ Riesgos de Flakiness
1. **Modal Animations**: Transiciones de entrada/salida pueden causar timing issues
2. **Table Refresh**: Tabla puede recargarse vía API después de CRUD
3. **Confirmación Delete**: Modal de confirmación puede tener overlay que bloquea clicks
4. **Paginación**: Si hay muchos recursos, puede estar paginado
5. **Virtual Scrolling**: Si implementado, puede complicar selección de filas

### 📝 Recomendaciones
- ✅ Esperar modal visible: `await page.waitForSelector('[role="dialog"]', { state: 'visible' })`
- ✅ Esperar modal oculto después de guardar: `await page.waitForSelector('[role="dialog"]', { state: 'hidden' })`
- ✅ Usar `page.waitForResponse()` para interceptar llamadas API
- ✅ Agregar `data-testid="resources-create-button"`, `data-testid="resources-table"`, etc.

---

## 📊 Metrics Page (`/metrics`)

### Estructura Similar a Resources

| Elemento | Tipo | Selector Recomendado | data-testid? |
|----------|------|---------------------|--------------|
| Create Metric Button | button | `button:has-text("Crear Métrica")` | ❌ |
| Metrics Table | table | `table` | ❌ |
| Name Input | input | `input[name="name"]` | ❌ |
| Description Input | textarea | `textarea[name="description"]` | ❌ |
| Unit Input | input | `input[name="unit"]` | ❌ |

### ⚠️ Riesgos de Flakiness
- Similar a Resources Page
- Validaciones de campos pueden ser más complejas

---

## 📝 Records Page (`/records`)

### Estructura Visual (Estimada)
```
┌─────────────────────────────────────────────────────┐
│ Registros                  [+ Agregar Registro]      │
├─────────────────────────────────────────────────────┤
│ [Recurso ▼] [Métrica ▼] [Fecha] [Búsqueda]         │
├─────────────────────────────────────────────────────┤
│ Fecha    | Recurso | Métrica    | Valor | Acciones │
│ 22/01/26 | John    | Desempeño  | 8.5   | 🗑️      │
│ ...      | ...     | ...        | ...   | ...      │
└─────────────────────────────────────────────────────┘
```

### Elementos Clave

| Elemento | Tipo | Selector Recomendado | data-testid? |
|----------|------|---------------------|--------------|
| Add Record Button | button | `button:has-text("Agregar")` | ❌ |
| Resource Filter | select | `select[name="resourceId"]` | ❌ |
| Metric Filter | select | `select[name="metricId"]` | ❌ |
| Records Table | table | `table` | ❌ |
| Value Input (Modal) | input | `input[name="value"]` | ❌ |
| Week Input (Modal) | input | `input[name="week"]` | ❌ |

### ⚠️ Riesgos de Flakiness
1. **Date Pickers**: Si usan componentes custom, pueden ser complejos
2. **Number Inputs**: Validación de formato numérico
3. **Dependent Selects**: Métrica puede depender de Recurso seleccionado
4. **Chart Updates**: Dashboard debería actualizar después de crear record

---

## 🔧 Selectores Globales

### Elementos Comunes en Toda la App

| Elemento | Selector Recomendado | Ubicación |
|----------|---------------------|-----------|
| Sidebar | `aside, nav` | Todas las páginas autenticadas |
| User Menu | `[aria-label="User menu"]` | Header |
| Logout Button | `button:has-text("Salir")` | User menu |
| Toast/Notification | `[role="alert"]` | Global |
| Loading Spinner | `[aria-label="Loading"]` | Durante cargas |
| Error Message | `[role="alert"][aria-live="assertive"]` | En errores |

---

## 📋 Resumen de data-testid Recomendados

### Login Page
- `login-email-input`
- `login-password-input`
- `login-submit-button`
- `login-remember-checkbox`

### Dashboard
- `resource-selector`
- `metric-selector`
- `time-series-chart`
- `condition-panel`
- `condition-value`
- `slope-value`
- `signals-list`
- `playbook-section`

### Resources Page
- `resources-create-button`
- `resources-search-input`
- `resources-table`
- `resources-table-row`
- `resource-edit-button`
- `resource-delete-button`
- `resource-modal`
- `resource-name-input`
- `resource-role-select`
- `resource-save-button`

### Metrics Page
- `metrics-create-button`
- `metrics-table`
- `metric-name-input`
- `metric-description-textarea`
- `metric-unit-input`
- `metric-save-button`

### Records Page
- `records-add-button`
- `records-resource-filter`
- `records-metric-filter`
- `records-table`
- `record-value-input`
- `record-week-input`
- `record-save-button`

### Global
- `sidebar-nav`
- `sidebar-dashboard-link`
- `sidebar-resources-link`
- `sidebar-metrics-link`
- `sidebar-records-link`
- `user-menu`
- `logout-button`
- `toast-notification`
- `loading-spinner`

---

## 🛠️ Helpers de Espera Recomendados

### `waitForAppReady()`
```typescript
async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="app-loaded"]', { state: 'visible', timeout: 10000 });
}
```

### `waitForTableLoaded()`
```typescript
async function waitForTableLoaded(page: Page, tableSelector: string) {
  await page.waitForSelector('[data-testid="table-skeleton"]', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForSelector(tableSelector, { state: 'visible' });
  await page.waitForTimeout(500); // Estabilización
}
```

### `waitForModalOpen()`
```typescript
async function waitForModalOpen(page: Page) {
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForTimeout(300); // Esperar animación
}
```

### `waitForModalClosed()`
```typescript
async function waitForModalClosed(page: Page) {
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
}
```

---

## 📊 Endpoints API Relevantes

Para usar con `page.waitForResponse()`:

| Endpoint | Método | Descripción | Usado en |
|----------|--------|-------------|----------|
| `/auth/login` | POST | Login | Login Page |
| `/resources` | GET | Listar recursos | Resources Page, Dashboard |
| `/resources` | POST | Crear recurso | Resources Page |
| `/resources/:id` | PATCH | Actualizar recurso | Resources Page |
| `/resources/:id` | DELETE | Eliminar recurso | Resources Page |
| `/metrics` | GET | Listar métricas | Metrics Page, Dashboard |
| `/metrics` | POST | Crear métrica | Metrics Page |
| `/records` | GET | Listar registros | Records Page, Dashboard |
| `/records` | POST | Crear registro | Records Page |
| `/analysis/evaluate` | GET | Evaluar condiciones | Dashboard |
| `/charts` | GET/POST | Datos de gráficos | Dashboard |

---

## ✅ Estado de Implementación de data-testid

| Página | data-testid Implementados | Cobertura | Prioridad |
|--------|---------------------------|-----------|-----------|
| Login | 0/4 | 0% | 🔴 Alta |
| Dashboard | 0/8 | 0% | 🔴 Alta |
| Resources | 0/9 | 0% | 🟡 Media |
| Metrics | 0/6 | 0% | 🟡 Media |
| Records | 0/7 | 0% | 🟡 Media |
| Global | 0/6 | 0% | 🔴 Alta |

**Cobertura Total**: 0% (0/40 data-testids)

---

**Última Actualización**: 22 de Enero de 2026  
**Próximos Pasos**:
1. Agregar data-testids a componentes críticos (Login, Dashboard, Navegación)
2. Implementar helpers de espera
3. Validar selectores en pruebas reales
