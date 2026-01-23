# 🧪 Cypress E2E Testing - PulseOps

## 📋 Descripción

Suite completa de pruebas End-to-End (E2E) para PulseOps implementada con **Cypress**, **TypeScript**, **Cucumber** (BDD), siguiendo patrones de diseño profesionales y mejores prácticas.

## 🏗️ Arquitectura

### Estructura del Proyecto

```
cypress/
├── e2e/
│   ├── features/              # 📝 Archivos .feature en Gherkin (BDD)
│   │   ├── 01-title-validation.feature
│   │   ├── 02-navigation.feature
│   │   ├── 03-input-interaction.feature
│   │   ├── 04-button-clicks.feature
│   │   ├── 05-list-validation.feature
│   │   └── 06-form-validation.feature
│   └── step-definitions/      # 🔧 Implementación de pasos en TypeScript
│       ├── titleValidation.ts
│       ├── navigation.ts
│       ├── inputInteraction.ts
│       ├── buttonClicks.ts
│       ├── listValidation.ts
│       └── formValidation.ts
├── support/
│   ├── pages/                 # 📄 Page Object Model (POM)
│   │   ├── HomePage.ts
│   │   ├── ActionsPage.ts
│   │   ├── QueryingPage.ts
│   │   └── index.ts
│   ├── widgets/               # 🔧 Widgets personalizados reutilizables
│   │   ├── BaseWidget.ts
│   │   ├── ButtonWidget.ts
│   │   ├── InputWidget.ts
│   │   ├── CheckboxWidget.ts
│   │   ├── LinkWidget.ts
│   │   ├── SelectWidget.ts
│   │   └── index.ts
│   ├── utils/                 # 🛠️ Utilidades
│   │   └── testTags.ts        # Sistema recursivo de TestTags
│   ├── commands.ts            # Comandos personalizados
│   └── e2e.ts                 # Configuración de soporte
├── fixtures/                  # 📦 Datos de prueba
└── screenshots/              # 📸 Capturas de pantalla (generadas)
```

## 🎯 Patrones de Diseño Implementados

### 1. **BDD (Behavior-Driven Development)**
- Escenarios escritos en **Gherkin** (español)
- Sintaxis Given-When-Then
- Features organizadas por funcionalidad

### 2. **Page Object Model (POM)**
- Encapsulación de elementos y acciones de página
- Abstracción de la lógica de UI
- Fácil mantenimiento y reutilización

### 3. **Custom Widgets**
- Componentes reutilizables para elementos comunes
- Herencia desde `BaseWidget`
- API fluida y consistente

### 4. **Sistema de TestTags Recursivo**
- Generación automática de selectores `data-testid`
- Soporte para jerarquías anidadas
- Configuración flexible

## 🚀 Instalación

### Requisitos Previos
- **Node.js**: >= v20.0.0 (actualmente usando v17.9.0 - **requiere actualización**)
- **npm**: >= v10.0.0

### Instalar Dependencias

⚠️ **IMPORTANTE**: Primero actualizar Node.js a v20+ antes de ejecutar:

```bash
npm install --legacy-peer-deps
```

### Dependencias Principales

```json
{
  "cypress": "^15.9.0",
  "@badeball/cypress-cucumber-preprocessor": "^24.0.0",
  "@bahmutov/cypress-esbuild-preprocessor": "^3.1.0",
  "typescript": "^5.3.3",
  "mochawesome": "^7.1.3",
  "mochawesome-merge": "^4.3.0",
  "mochawesome-report-generator": "^7.0.1"
}
```

## 📝 Escenarios de Prueba

### 1. Validación de Título (01-title-validation.feature)
- ✅ Verificar título principal de la página Kitchen Sink
- ✅ Validar visibilidad del título

### 2. Navegación (02-navigation.feature)
- ✅ Navegar entre secciones (Querying, Actions)
- ✅ Verificar cambios de URL
- ✅ Validar carga de contenido

### 3. Interacción con Inputs (03-input-interaction.feature)
- ✅ Escribir en campos de texto
- ✅ Limpiar campos
- ✅ Verificar campos deshabilitados

### 4. Clicks en Botones (04-button-clicks.feature)
- ✅ Hacer clic simple
- ✅ Hacer doble clic
- ✅ Verificar respuesta de elementos

### 5. Validación de Listas (05-list-validation.feature)
- ✅ Verificar elementos en listas
- ✅ Contar elementos
- ✅ Validar contenido de texto

### 6. Validación de Formulario (06-form-validation.feature) ⚠️
- ✅ Validar email obligatorio
- ✅ Validar formato de email
- ✅ Validar longitud mínima de nombre
- ✅ Validar edad numérica
- ✅ Validar checkbox de términos
- ✅ Enviar formulario válido
- ✅ Limpiar formulario

⚠️ **NOTA**: Este escenario requiere la implementación de una página de prueba personalizada con un formulario de validación.

## 🎨 Uso de Widgets

### ButtonWidget
```typescript
import { ButtonWidget } from '@/support/widgets';

const submitButton = new ButtonWidget('submit-btn');
submitButton.click();
submitButton.shouldBeEnabled();
submitButton.shouldHaveText('Enviar');
```

### InputWidget
```typescript
import { InputWidget } from '@/support/widgets';

const emailInput = new InputWidget('email-input');
emailInput.type('test@example.com');
emailInput.shouldHaveValue('test@example.com');
emailInput.clear();
```

### CheckboxWidget
```typescript
import { CheckboxWidget } from '@/support/widgets';

const termsCheckbox = new CheckboxWidget('terms-checkbox');
termsCheckbox.check();
termsCheckbox.shouldBeChecked();
termsCheckbox.toggle();
```

## 🏷️ Sistema de TestTags

### Uso Básico
```typescript
import { TestTags } from '@/support/utils/testTags';

// Crear tags base
const formTags = TestTags.create('login-form');

// Crear tags hijos
const emailTag = formTags.child('email-input');
// Resultado: 'cy-login-form-email-input'

// Tags recursivos
const buttonTags = formTags.recursive(['submit', 'button']);
// Resultado: 'cy-login-form-submit-button'

// Tags con estado
const errorTag = formTags.withState('error');
// Resultado: 'cy-login-form--error'

// Tags indexados
const itemTag = formTags.indexed('item', 2);
// Resultado: 'cy-login-form-item-2'
```

## 🧑‍💻 Comandos Disponibles

### Ejecutar Pruebas

```bash
# Abrir Cypress en modo interactivo
npm run cypress:open

# Ejecutar todas las pruebas (headless)
npm run cypress:run

# Ejecutar en Chrome
npm run cypress:run:chrome

# Ejecutar en Firefox
npm run cypress:run:firefox

# Ejecutar en Edge
npm run cypress:run:edge

# Ejecutar con interfaz visible
npm run test:e2e:headed
```

### Linting y Formateo

```bash
# Ejecutar ESLint
npm run lint

# Corregir errores de ESLint automáticamente
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato
npm run format:check
```

## 📊 Reportes

### Mochawesome
Los reportes se generan automáticamente después de ejecutar las pruebas:
- **Ubicación**: `mochawesome-report/`
- **Archivo principal**: `mochawesome.html`

### Capturas de Pantalla
- Se guardan automáticamente en caso de fallos
- **Ubicación**: `cypress/screenshots/`

### Videos
- Se graban automáticamente durante `cypress run`
- **Ubicación**: `cypress/videos/`

## ⚙️ Configuración

### cypress.config.ts
```typescript
{
  baseUrl: 'https://example.cypress.io',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2,
    openMode: 0
  },
  defaultCommandTimeout: 10000
}
```

### Cucumber Preprocessor
```typescript
{
  stepDefinitions: 'cypress/e2e/step-definitions/**/*.ts',
  messages: {
    enabled: true,
    output: 'cucumber-messages.ndjson'
  }
}
```

## 🎓 Mejores Prácticas Implementadas

### 1. **Selectores Estables**
- ✅ Uso de `data-testid` vía sistema TestTags
- ❌ Evitar selectores por clase CSS o estructura DOM

### 2. **Esperas Inteligentes**
- ✅ Uso de `should()` con assertions automáticas
- ✅ `waitAndClick()` en ButtonWidget
- ❌ Evitar `cy.wait()` con tiempos fijos

### 3. **Abstracción**
- ✅ Page Objects para lógica de página
- ✅ Widgets para elementos reutilizables
- ✅ Comandos personalizados

### 4. **Código Limpio**
- ✅ TypeScript para type safety
- ✅ ESLint para calidad de código
- ✅ Prettier para formato consistente

### 5. **Mantenibilidad**
- ✅ Separación de concerns (POM + Widgets)
- ✅ Nomenclatura clara y consistente
- ✅ Documentación inline

## 🐛 Troubleshooting

### Error: Node v17.9.0 incompatible
**Solución**: Actualizar a Node v20+
```bash
nvm install 20
nvm use 20
npm install --legacy-peer-deps
```

### Error: Cucumber preprocessor no carga features
**Solución**: Verificar que `specPattern` esté configurado correctamente en `cypress.config.ts`
```typescript
specPattern: 'cypress/e2e/features/**/*.feature'
```

### Error: Widget no encuentra elemento
**Solución**: Verificar que el `data-testid` exista en el DOM
```typescript
cy.get('[data-testid="cy-element"]').should('exist');
```

## 📚 Referencias

- [Cypress Documentation](https://docs.cypress.io/)
- [Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
- [BDD with Cucumber](https://cucumber.io/docs/bdd/)

## 🤝 Contribución

Para agregar nuevos escenarios:

1. Crear archivo `.feature` en `cypress/e2e/features/`
2. Implementar step definitions en `cypress/e2e/step-definitions/`
3. Crear/actualizar Page Objects si es necesario
4. Agregar widgets personalizados si aplica
5. Ejecutar linters: `npm run lint:fix && npm run format`
6. Probar: `npm run cypress:open`

## 📝 Licencia

Proyecto interno de PulseOps - Unlimitech

---

**Autor**: GitHub Copilot  
**Fecha**: Enero 2026  
**Versión**: 1.0.0
