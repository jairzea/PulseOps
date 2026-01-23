# Implementación Correcta de Pruebas E2E con Cypress

## ✅ Enfoque Correcto Aplicado

### Rol de Herramientas

**Playwright** → Solo para **exploración interactiva** de la UI real
- Navegación manual con `playwright_navigate`
- Inspección de elementos
- Documentación de estructura
- Validación de flujos antes de automatizar

**Cypress** → Para **pruebas automatizadas E2E**
- BDD con Gherkin (.feature files)
- TypeScript para type safety
- Page Object Model (POM)
- Step Definitions
- Ejecución automatizada con `cypress run` y `cypress open`

## 📋 Lineamientos Aplicados

Según el documento [Lienamiento de implementación de pruebas automatizadas.md](docs/guides/Lienamiento%20de%20implementación%20de%20pruebas%20automatizadas.md):

✅ **Cypress** con TypeScript  
✅ **Cucumber preprocessor** para BDD  
✅ **Arquitectura**: `cypress/e2e/features/` + `step-definitions/`  
✅ **Page Object Model** implementado  
✅ **Gherkin** para escenarios (.feature files)  

## 🎯 Implementación Realizada para PulseOps

### 1. Configuración Base

**Archivo:** `cypress.config.ts`
```typescript
baseUrl: 'http://localhost:5173' // PulseOps local
specPattern: 'cypress/e2e/features/**/*.feature'
reporter: 'cypress-mochawesome-reporter'
```

### 2. Features en Gherkin (BDD)

Creadas 3 features para PulseOps:

#### `01-authentication.feature`
```gherkin
Feature: Autenticación en PulseOps
  
  Scenario: Login exitoso con credenciales válidas
    Given el usuario está en la página de login
    When ingresa el email "admin@pulseops.com"
    And ingresa la contraseña "Admin1234!"
    And hace clic en el botón de login
    Then debe ser redirigido al dashboard
```

#### `02-navigation.feature`
```gherkin
Feature: Navegación en PulseOps

  Background:
    Given el usuario está autenticado en PulseOps

  Scenario: Navegar a Recursos
    When el usuario hace clic en "Resources" en el menú lateral
    Then debe ver la página de recursos
    And la URL debe contener "/resources"
```

#### `03-resources.feature`
```gherkin
Feature: Gestión de Recursos en PulseOps

  Scenario: Crear un nuevo recurso
    When el usuario hace clic en "New" o "Create Resource"
    And completa el formulario con:
      | campo | valor                  |
      | name  | Test Resource Cypress  |
      | type  | Server                 |
    And hace clic en "Save" o "Create"
    Then debe ver un mensaje de éxito
```

### 3. Page Object Model (POM)

Implementados 3 POMs siguiendo patrones profesionales:

**LoginPage.ts**
```typescript
export class LoginPage {
  private selectors = {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]'
  };

  login(email: string, password: string): void {
    this.fillEmail(email);
    this.fillPassword(password);
    this.clickLogin();
  }

  loginAsAdmin(): void {
    this.login('admin@pulseops.com', 'Admin1234!');
  }
}
```

**DashboardPage.ts**
```typescript
export class DashboardPage {
  navigateToResources(): void {
    cy.get('a[href="/resources"]').first().click();
    cy.url().should('include', '/resources');
  }
  
  navigateToMetrics(): void { ... }
  navigateToRecords(): void { ... }
  logout(): void { ... }
}
```

**ResourcesPage.ts**
```typescript
export class ResourcesPage {
  createResource(name: string, type: string): void {
    this.clickCreateButton();
    this.fillResourceForm(name, type);
    this.clickSaveButton();
  }
  
  searchResource(searchTerm: string): void { ... }
  verifyResourceInList(name: string): void { ... }
}
```

### 4. Step Definitions en TypeScript

**authentication.ts**
```typescript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';

const loginPage = new LoginPage();

Given('el usuario está en la página de login', () => {
  loginPage.visit();
  loginPage.verifyLoginPageDisplayed();
});

When('ingresa el email {string}', (email: string) => {
  loginPage.fillEmail(email);
});
```

**navigation.ts**
```typescript
Given('el usuario está autenticado en PulseOps', () => {
  loginPage.visit();
  loginPage.loginAsAdmin();
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

When('el usuario hace clic en {string} en el menú lateral', (menuItem: string) => {
  dashboardPage.clickSidebarItem(menuItem);
});
```

**resources.ts**
```typescript
When('completa el formulario con:', (dataTable) => {
  const data = dataTable.rowsHash();
  if (data.name) {
    cy.get('input[name="name"]').clear().type(data.name);
  }
  if (data.type) {
    cy.get('select[name="type"]').select(data.type);
  }
});
```

## 🗂️ Estructura de Archivos

```
cypress/
├── e2e/
│   ├── features/
│   │   ├── pulseops/                      # Features de PulseOps
│   │   │   ├── 01-authentication.feature  # Login y validación
│   │   │   ├── 02-navigation.feature      # Navegación sidebar
│   │   │   └── 03-resources.feature       # CRUD de recursos
│   │   └── *.feature                      # Features de ejemplo (example.cypress.io)
│   └── step-definitions/
│       ├── pulseops/                      # Steps de PulseOps
│       │   ├── authentication.ts
│       │   ├── navigation.ts
│       │   └── resources.ts
│       └── *.ts                           # Steps de ejemplo
└── support/
    ├── pages/
    │   ├── pulseops/                      # POMs de PulseOps
    │   │   ├── LoginPage.ts
    │   │   ├── DashboardPage.ts
    │   │   ├── ResourcesPage.ts
    │   │   └── index.ts
    │   └── *.ts                           # POMs de ejemplo
    ├── widgets/                           # Componentes reutilizables
    │   ├── BaseWidget.ts
    │   ├── InputWidget.ts
    │   └── ...
    └── utils/
        └── testTags.ts                    # Utilidades
```

## 🚀 Comandos de Ejecución

### Instalación de Dependencias
```bash
npm install --save-dev \
  cypress@15.9.0 \
  @badeball/cypress-cucumber-preprocessor \
  @bahmutov/cypress-esbuild-preprocessor \
  cypress-mochawesome-reporter
```

### Ejecutar Pruebas

```bash
# Modo interfaz (visual)
npm run cypress:open

# Modo headless (CI/CD)
npm run cypress:run

# Solo features de PulseOps
npx cypress run --spec "cypress/e2e/features/pulseops/**/*.feature"

# Feature específica
npx cypress run --spec "cypress/e2e/features/pulseops/01-authentication.feature"

# Con navegador visible
npx cypress run --spec "cypress/e2e/features/pulseops/*.feature" --browser chrome --headed
```

## 📊 Cobertura de Pruebas

### Feature 1: Autenticación (4 escenarios)
- ✅ Redirección a login cuando no autenticado
- ✅ Login exitoso con credenciales válidas
- ✅ Login fallido con credenciales inválidas
- ✅ Validación de campos requeridos

### Feature 2: Navegación (5 escenarios)
- ✅ Navegar al Dashboard
- ✅ Navegar a Recursos
- ✅ Navegar a Métricas
- ✅ Navegar a Registros
- ✅ Cerrar sesión

### Feature 3: Recursos (5 escenarios)
- ✅ Ver lista de recursos existentes
- ✅ Crear un nuevo recurso
- ✅ Buscar un recurso específico
- ✅ Editar un recurso existente
- ✅ Eliminar un recurso

**Total:** 14 escenarios automatizados

## 🔧 Próximos Pasos

### Pendientes de Implementación
1. **Instalar dependencias de Cypress**
   ```bash
   npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor
   ```

2. **Ejecutar pruebas por primera vez**
   ```bash
   npx cypress run --spec "cypress/e2e/features/pulseops/*.feature"
   ```

3. **Ajustar selectores** según UI real
   - Algunos selectores son genéricos
   - Requieren validación con UI real
   - Agregar data-testid cuando sea posible

4. **Crear features adicionales** (opcionales)
   - 04-metrics.feature (CRUD de métricas)
   - 05-records.feature (CRUD de registros)
   - 06-dashboard.feature (selección de recursos/métricas)

5. **Configurar reporters** (ya configurado Mochawesome)

6. **Agregar linters** (opcional)
   - ESLint
   - Prettier

## 📝 Credenciales de Prueba

```
Email: admin@pulseops.com
Password: Admin1234!
```

## ⚠️ Notas Importantes

### Diferencia con Implementación Anterior

**Antes (INCORRECTO):**
- ❌ Pruebas implementadas con Playwright
- ❌ playwright-bdd para BDD
- ❌ Fixtures de Playwright para steps

**Ahora (CORRECTO):**
- ✅ Playwright solo para exploración
- ✅ Pruebas implementadas con Cypress
- ✅ @badeball/cypress-cucumber-preprocessor para BDD
- ✅ Cypress commands en steps

### Playwright vs Cypress

| Herramienta | Uso                           | Cuándo                    |
|-------------|-------------------------------|---------------------------|
| Playwright  | Exploración manual            | Antes de automatizar      |
| Playwright  | Navegación interactiva        | Descubrir selectores      |
| Playwright  | Screenshots y videos          | Documentar flujos         |
| Cypress     | Pruebas automatizadas         | Siempre para E2E          |
| Cypress     | Ejecución CI/CD               | Pipelines automáticos     |
| Cypress     | BDD con Gherkin               | Features y scenarios      |

## 🎯 Alineación con Lineamientos

Siguiendo [Lienamiento de implementación de pruebas automatizadas.md](docs/guides/Lienamiento%20de%20implementación%20de%20pruebas%20automatizadas.md):

✅ **Cypress + TypeScript + Cucumber**: Implementado  
✅ **BDD con Gherkin**: 3 features con 14 escenarios  
✅ **Page Object Model**: 3 POMs profesionales  
✅ **Selectores CSS apropiados**: Semánticos, evitando clases Tailwind  
✅ **Aserciones correctas**: cy.should() en todos los Then steps  
✅ **Código organizado y legible**: Estructura clara y comentarios  
✅ **Scripts en package.json**: cypress:open y cypress:run configurados  

## 📚 Referencias

- [Cypress Documentation](https://docs.cypress.io)
- [Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)
- [TypeScript con Cypress](https://docs.cypress.io/guides/tooling/typescript-support)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
