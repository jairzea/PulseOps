# 🎯 Prompt para Implementación de Playwright E2E

**Fecha de creación**: 22 de enero de 2026  
**Propósito**: Guía completa para que una IA implemente pruebas E2E con Playwright siguiendo los estándares del proyecto

---

## PROMPT (Copiar y enviar a la IA)

Eres un agente de automatización E2E. Tu misión es crear pruebas end-to-end para el proyecto PulseOps usando Playwright, con ejecución real en navegador mediante la herramienta `playwright_navigate` para explorar y validar la UI.

---

## 0) Reglas obligatorias (anti-distracción)

1. **No inventes endpoints, rutas, ni selectores**: si no los confirmas navegando la app, no los uses.
2. **No cambies lógica de negocio del frontend/backend**. Solo agrega/ajusta lo mínimo para testabilidad (ej: `data-testid`) si es estrictamente necesario y sin romper UI.
3. **Trabaja por entregables pequeños**: cada feature debe terminar con:
   - archivo `.feature`
   - step definitions TypeScript
   - Page Object (POM) o componente helper
   - ejecución local verde (o reporte claro de bloqueo)
4. **Mantén consistencia con el estándar ya usado en Cypress**: BDD + TypeScript + POM + estructura por features, y enfoque de calidad/flujo.

---

## 1) Preparación del repo (seguro)

- Crea una rama nueva desde la rama actual: `test/playwright-e2e`.
- No hagas refactors generales. Solo cambios necesarios para pruebas.

---

## 2) Levantar el proyecto (full stack)

**Objetivo**: dejar todo arriba para poder navegar la app real.

1. Instala dependencias (monorepo si aplica).
2. Levanta DB/infra si existe (Docker Compose).
3. Levanta backend.
4. Levanta frontend.
5. Verifica accesos:
   - Frontend responde (home/dashboard)
   - Backend responde (healthcheck o endpoints base)

**Salida requerida**: imprime (o documenta) en un archivo `E2E_PLAYWRIGHT_SETUP.md`:
- comandos exactos para levantar backend/frontend
- puertos finales
- variables de entorno relevantes
- cómo correr las pruebas

---

## 3) Estándar de arquitectura de pruebas (obligatorio)

Implementa Playwright siguiendo estos principios que ya usamos en Cypress:

- **BDD (Gherkin) + step-definitions en TypeScript**
- **Page Object Model** para encapsular UI y reducir fragilidad
- **Maneja una estructura escalable, estandarizada y convencional**
- Reutiliza la filosofía de "widgets" que ya existe en Cypress (encapsular interacciones comunes) y "test tags/test ids" para selectores estables.

### Estructura recomendada:

```
playwright/
├── e2e/
│   ├── features/              # 📝 Archivos .feature (Gherkin)
│   └── step-definitions/      # 🔧 Implementación en TypeScript
├── support/
│   ├── pages/                 # 📄 Page Object Model
│   ├── widgets/               # 🔧 Widgets reutilizables
│   ├── utils/                 # 🛠️ Utilidades (testTags, etc.)
│   └── fixtures/              # 📦 Datos de prueba
└── playwright.config.ts       # ⚙️ Configuración
```

---

## 4) Exploración guiada con playwright_navigate (obligatorio)

Antes de escribir asserts finales:

1. Usa `playwright_navigate` para recorrer TODA la app y mapear:
   - rutas reales (dashboard, resources, metrics, records, login si aplica)
   - componentes clave (tablas, modales, formularios)
   - elementos críticos (botones crear, editar, eliminar)

2. Genera un inventario en `E2E_UI_MAP.md` con:
   - ruta
   - qué valida
   - selectores recomendados (preferir `data-testid`)
   - riesgos de flakiness (animaciones, loads, skeletons)

---

## 5) Alcance inicial de features (prioridad)

Empieza por lo más "demo-ready" y con más valor:

### Feature 1: Navegación base
- Abrir app
- Ir a Dashboard
- Ir a Recursos
- Ir a Métricas
- Ir a Registros
- Validar URL y que cada página muestre un encabezado/elemento principal.

### Feature 2: Dashboard (recurso → métrica → records → análisis)
- Seleccionar un recurso
- Seleccionar una métrica
- Ver que el chart y/o panel de condición cambian
- Validar que aparece condición + inclinación + señales (si están visibles)
- Validar que playbook/fórmula (si se muestra) corresponde a la condición

### Feature 3: Records (crear registro manual)
- Ir a Registros
- Seleccionar recurso + métrica (si aplica)
- Abrir modal "Agregar Registro"
- Llenar campos mínimos válidos
- Guardar
- Validar que el nuevo registro aparece en tabla o que el chart se actualiza

### Feature 4: Metrics (CRUD básico)
- Ir a Métricas
- Crear una métrica con datos válidos
- Validar que aparece en la tabla
- Editar (si existe)
- Eliminar (con confirmación si existe)

### Feature 5: Resources (si ya existe CRUD)
- Crear/editar/desactivar recurso si está implementado
- Validar que se refleja en listados

---

## 6) Reglas de selectores (para estabilidad)

1. **Prioridad 1**: `data-testid="..."`
2. **Prioridad 2**: roles accesibles (`getByRole`)
3. **Prohibido** basarse en clases de Tailwind como selector primario
4. Si no existen testids, agrega los mínimos indispensables y documenta dónde

### Ejemplo de selectores recomendados:

```typescript
// ✅ CORRECTO
await page.getByTestId('submit-button').click();
await page.getByRole('button', { name: 'Guardar' }).click();

// ❌ EVITAR
await page.locator('.bg-blue-500.rounded-lg').click();
await page.locator('div > div > button:nth-child(2)').click();
```

---

## 7) Manejo de async, loads, animaciones

La app tiene skeletons/transiciones, así que:

- **No uses `waitForTimeout`** salvo último recurso
- Usa `expect(...).toBeVisible()` con timeouts razonables
- Crea utilidades `waitForAppReady()` y `waitForTableLoaded()`

### Ejemplos:

```typescript
// Esperar a que la tabla cargue
async waitForTableLoaded(page: Page) {
  await page.waitForSelector('[data-testid="table-skeleton"]', { state: 'hidden' });
  await page.waitForSelector('[data-testid="table-body"]', { state: 'visible' });
}

// Esperar a que la app esté lista
async waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="app-loaded"]');
}
```

---

## 8) Entregables y verificación (obligatorio)

Al final debes entregar:

1. **Configuración**:
   - `playwright.config.ts` 
   - Scripts en `package.json` para:
     - modo UI
     - modo headless

2. **Features iniciales** (las 5 de arriba):
   - Archivos `.feature`
   - Step definitions TypeScript
   - Page Objects Model

3. **Documentación**:
   - `E2E_PLAYWRIGHT_SETUP.md` - Instrucciones de setup
   - `E2E_UI_MAP.md` - Mapa de la UI explorada
   - `PLAYWRIGHT_README.md` - Documentación completa

4. **Evidencia**:
   - Ejecución green local (o lista de tests que fallan y por qué)
   - Screenshots/trace en fallos (si aplica)

---

## 9) Importante

- **No inventes flujos**: todo lo confirmas navegando con `playwright_navigate`
- **Mantén el estilo BDD** y organización profesional como ya se hizo en Cypress (features + steps + pages + widgets)
- **Reutiliza conceptos de Cypress**: 
  - Sistema de TestTags (ver `cypress/support/utils/testTags.ts`)
  - Widgets base (ver `cypress/support/widgets/`)
  - Estructura de Page Objects (ver `cypress/support/pages/`)

---

## 10) Contexto del proyecto PulseOps

### Tecnologías
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: NestJS + TypeScript + MongoDB
- **Arquitectura**: Monorepo con workspaces

### URLs esperadas
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`

### Rutas principales de la app
- `/` - Dashboard principal
- `/resources` - Gestión de recursos
- `/metrics` - Gestión de métricas
- `/records` - Gestión de registros
- `/charts` - Visualización de datos (si existe)

### Conceptos clave del dominio
- **Recurso**: Persona/desarrollador en el equipo
- **Métrica**: Tipo de estadística medida (ej: Desempeño, Integraciones)
- **Serie temporal**: Historial de valores de una métrica para un recurso
- **Condición**: Estado operativo calculado (Poder, Conformidad, Confusión, etc.)
- **Inclinación**: Tendencia calculada de la métrica
- **Playbook**: Acción recomendada según la condición

---

## Checklist final

Antes de considerar la implementación completa:

- [ ] Rama `test/playwright-e2e` creada
- [ ] Proyecto corriendo (frontend + backend + DB)
- [ ] Playwright instalado y configurado
- [ ] 5 features implementadas con Gherkin
- [ ] Step definitions en TypeScript
- [ ] Al menos 3 Page Objects creados
- [ ] Sistema de widgets/helpers implementado
- [ ] Documentación completa (`E2E_PLAYWRIGHT_SETUP.md`, `E2E_UI_MAP.md`, `PLAYWRIGHT_README.md`)
- [ ] Tests ejecutándose (al menos en modo UI)
- [ ] Reportes configurados
- [ ] Código con linting/formatting

---

**Autor**: GitHub Copilot  
**Fecha**: 22 de enero de 2026  
**Versión**: 1.0.0
