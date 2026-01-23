# 🚀 Quick Start Guide - Cypress E2E Testing

## ⚡ Inicio Rápido en 5 Pasos

### Paso 1️⃣: Actualizar Node.js
```bash
# Verificar versión actual
node --version
# Si es v17.9.0, actualizar a v20+

# Con nvm (recomendado)
nvm install 20
nvm use 20

# Verificar
node --version  # Debe mostrar v20.x.x
```

### Paso 2️⃣: Instalar Dependencias
```bash
cd /Users/jairzeapaez/Documents/Proyectos/unlimitech/pulseops
npm install --legacy-peer-deps
```

⏱️ **Tiempo estimado**: 5-10 minutos

### Paso 3️⃣: Verificar Instalación
```bash
npx cypress verify
npx cypress version
```

Deberías ver:
```
✔  Verified Cypress! 
Cypress version: 15.9.0
```

### Paso 4️⃣: Abrir Cypress
```bash
npm run cypress:open
```

Selecciona:
1. **E2E Testing**
2. **Chrome** (recomendado)
3. Aparecerán las 6 features

### Paso 5️⃣: Ejecutar Primera Prueba
- Haz clic en `01-title-validation.feature`
- Observa la ejecución en vivo
- ✅ Prueba exitosa!

---

## 📚 Archivos Importantes

### 📖 Documentación
- **[CYPRESS_README.md](./CYPRESS_README.md)** - Documentación completa
- **[DEPENDENCIES.md](./DEPENDENCIES.md)** - Guía de instalación
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen técnico

### 🧪 Código de Ejemplo
- **[cypress/examples/usage-examples.ts](./cypress/examples/usage-examples.ts)** - 12 ejemplos prácticos

### ⚙️ Configuración
- **[cypress.config.ts](./cypress.config.ts)** - Configuración principal
- **[.eslintrc.json](./.eslintrc.json)** - Reglas de linting
- **[.prettierrc](./.prettierrc)** - Formato de código

---

## 🎯 Comandos Más Usados

### Ejecutar Pruebas

```bash
# Modo interactivo (recomendado para desarrollo)
npm run cypress:open

# Modo headless (CI/CD)
npm run cypress:run

# Ejecutar en Chrome con interfaz visible
npm run test:e2e:chrome

# Ejecutar prueba específica
npx cypress run --spec "cypress/e2e/features/01-title-validation.feature"
```

### Linting y Formato

```bash
# Verificar errores
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

---

## 🏗️ Estructura Rápida

```
cypress/
├── e2e/
│   ├── features/           # 📝 6 archivos .feature (Gherkin)
│   └── step-definitions/   # 🔧 6 archivos .ts (Steps)
├── support/
│   ├── pages/             # 📄 3 Page Objects (Home, Actions, Querying)
│   ├── widgets/           # 🔧 6 Widgets (Button, Input, Checkbox, etc.)
│   ├── utils/             # 🛠️ TestTags recursivo
│   ├── commands.ts        # Comandos personalizados
│   └── e2e.ts            # Configuración global
├── fixtures/              # 📦 Datos de prueba
└── examples/             # 🎓 Ejemplos de uso
```

---

## 💡 Ejemplos Rápidos

### Usar un Widget

```typescript
import { InputWidget, ButtonWidget } from '../support/widgets';

// InputWidget
const emailInput = new InputWidget('email-input');
emailInput.type('test@example.com');
emailInput.shouldHaveValue('test@example.com');

// ButtonWidget
const submitButton = new ButtonWidget('submit-btn');
submitButton.click();
submitButton.shouldBeEnabled();
```

### Usar TestTags

```typescript
import { TestTags } from '../support/utils/testTags';

const formTags = TestTags.create('login-form');
const emailId = formTags.child('email').create();
// Resultado: 'cy-login-form-email'

cy.get(`[data-testid="${emailId}"]`).type('user@example.com');
```

### Usar Page Object

```typescript
import { HomePage } from '../support/pages';

const homePage = new HomePage();
homePage.visit();
homePage.goToActions();
homePage.shouldHaveUrl('/commands/actions');
```

---

## 🐛 Problemas Comunes

### ❌ Error: "Cypress binary not found"
```bash
npx cypress install
npx cypress verify
```

### ❌ Error: "Cannot find module"
```bash
npm install --legacy-peer-deps
```

### ❌ Error: "Node version"
Actualiza Node.js a v20+:
```bash
nvm install 20
nvm use 20
```

### ❌ Tests fallan en Kitchen Sink
Verifica que estás conectado a internet y que https://example.cypress.io está accesible.

---

## 📊 Ver Reportes

### Ejecutar tests y generar reporte
```bash
npm run cypress:run
```

### Abrir reporte HTML
```bash
open mochawesome-report/mochawesome.html
```

El reporte incluye:
- ✅ Tests pasados/fallidos
- ⏱️ Tiempos de ejecución
- 📸 Screenshots de fallos
- 📊 Gráficas y estadísticas

---

## 🎓 Próximos Pasos

1. **Lee la documentación completa**: [CYPRESS_README.md](./CYPRESS_README.md)
2. **Estudia los ejemplos**: [cypress/examples/usage-examples.ts](./cypress/examples/usage-examples.ts)
3. **Ejecuta todas las features**: `npm run cypress:open`
4. **Crea tu primer test personalizado**
5. **Implementa página de validación de formulario** (opcional)

---

## 📞 Recursos Adicionales

- [Cypress Documentation](https://docs.cypress.io/)
- [Cucumber Best Practices](https://cucumber.io/docs/bdd/)
- [Page Object Pattern](https://martinfowler.com/bliki/PageObject.html)
- [TypeScript with Cypress](https://docs.cypress.io/guides/tooling/typescript-support)

---

## ✅ Checklist de Verificación

Antes de considerar el setup completo, verifica:

- [ ] Node.js v20+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cypress verificado (`npx cypress verify`)
- [ ] Tests ejecutándose en modo interactivo (`npm run cypress:open`)
- [ ] Al menos 1 feature pasando exitosamente
- [ ] Reportes generándose correctamente
- [ ] ESLint sin errores (`npm run lint`)
- [ ] Código formateado (`npm run format`)

---

**🎉 ¡Listo para empezar!**

Si tienes algún problema, consulta:
- [DEPENDENCIES.md](./DEPENDENCIES.md) - Troubleshooting de instalación
- [CYPRESS_README.md](./CYPRESS_README.md) - Documentación completa
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Detalles técnicos

---

**Autor**: GitHub Copilot  
**Fecha**: Enero 2026  
**Versión**: 1.0.0
