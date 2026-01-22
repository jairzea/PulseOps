# 📦 Dependencias Necesarias para Cypress E2E Testing

## ⚠️ Requisito Previo Crítico

**Actualizar Node.js a v20+**
- Actualmente: Node v17.9.0
- Requerido: Node >= v20.0.0
- Recomendado: Node v20.11.0 LTS o superior

### Actualizar Node.js con nvm (recomendado)
```bash
nvm install 20
nvm use 20
node --version  # Verificar que muestra v20.x.x
```

### O descargar desde nodejs.org
https://nodejs.org/en/download/

---

## 📋 Comando de Instalación

Una vez que tengas Node v20+, ejecuta:

```bash
npm install --save-dev \
  cypress@^15.9.0 \
  @badeball/cypress-cucumber-preprocessor@^24.0.0 \
  @bahmutov/cypress-esbuild-preprocessor@^3.1.0 \
  esbuild@^0.27.2 \
  typescript@^5.3.3 \
  @types/node@^20.11.0 \
  mochawesome@^7.1.3 \
  mochawesome-merge@^4.3.0 \
  mochawesome-report-generator@^7.0.1 \
  eslint@^8.56.0 \
  @typescript-eslint/parser@^6.19.0 \
  @typescript-eslint/eslint-plugin@^6.19.0 \
  eslint-plugin-cypress@^2.15.1 \
  prettier@^3.2.4 \
  --legacy-peer-deps
```

---

## 📦 Desglose de Dependencias

### Cypress Core
```json
{
  "cypress": "^15.9.0"
}
```
- Framework principal de testing E2E

### Cucumber/BDD Support
```json
{
  "@badeball/cypress-cucumber-preprocessor": "^24.0.0"
}
```
- Soporte para Gherkin (Given/When/Then)
- Permite escribir features en español

### Preprocessor
```json
{
  "@bahmutov/cypress-esbuild-preprocessor": "^3.1.0",
  "esbuild": "^0.27.2"
}
```
- Transpila TypeScript a JavaScript
- Importación de módulos ESM

### TypeScript
```json
{
  "typescript": "^5.3.3",
  "@types/node": "^20.11.0"
}
```
- Type checking y autocompletado
- Tipos de Node.js

### Reporters
```json
{
  "mochawesome": "^7.1.3",
  "mochawesome-merge": "^4.3.0",
  "mochawesome-report-generator": "^7.0.1"
}
```
- Reportes HTML profesionales
- Merge de múltiples reportes
- Generador de reportes visuales

### Linters y Formatters
```json
{
  "eslint": "^8.56.0",
  "@typescript-eslint/parser": "^6.19.0",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "eslint-plugin-cypress": "^2.15.1",
  "prettier": "^3.2.4"
}
```
- ESLint para calidad de código
- Reglas específicas de Cypress
- Prettier para formato consistente

---

## 🔧 Configuración Post-Instalación

### 1. Verificar instalación de Cypress
```bash
npx cypress verify
```

### 2. Abrir Cypress por primera vez
```bash
npm run cypress:open
```

### 3. Ejecutar pruebas de ejemplo
```bash
npm run cypress:run
```

---

## 📝 Alternativa: Instalar en Etapas

Si tienes problemas con la instalación completa:

### Etapa 1: Cypress Core
```bash
npm install --save-dev cypress@^15.9.0 --legacy-peer-deps
```

### Etapa 2: Cucumber Support
```bash
npm install --save-dev \
  @badeball/cypress-cucumber-preprocessor@^24.0.0 \
  @bahmutov/cypress-esbuild-preprocessor@^3.1.0 \
  esbuild@^0.27.2 \
  --legacy-peer-deps
```

### Etapa 3: TypeScript
```bash
npm install --save-dev \
  typescript@^5.3.3 \
  @types/node@^20.11.0 \
  --legacy-peer-deps
```

### Etapa 4: Reporters
```bash
npm install --save-dev \
  mochawesome@^7.1.3 \
  mochawesome-merge@^4.3.0 \
  mochawesome-report-generator@^7.0.1 \
  --legacy-peer-deps
```

### Etapa 5: Linters
```bash
npm install --save-dev \
  eslint@^8.56.0 \
  @typescript-eslint/parser@^6.19.0 \
  @typescript-eslint/eslint-plugin@^6.19.0 \
  eslint-plugin-cypress@^2.15.1 \
  prettier@^3.2.4 \
  --legacy-peer-deps
```

---

## ⚠️ Problemas Comunes

### Error: ERESOLVE
**Solución**: Usar `--legacy-peer-deps`
```bash
npm install --legacy-peer-deps
```

### Error: esbuild version mismatch
**Solución**: Instalar versión específica de esbuild
```bash
npm install --save-dev esbuild@0.27.2 --legacy-peer-deps
```

### Error: Cypress binary not found
**Solución**: Reinstalar Cypress
```bash
npm uninstall cypress
npm install --save-dev cypress@^15.9.0 --legacy-peer-deps
npx cypress install
```

### Error: TypeScript errors
**Solución**: Verificar tsconfig.json
```bash
npx tsc --noEmit
```

---

## ✅ Verificación de Instalación

### Verificar todas las dependencias
```bash
npm list --depth=0 | grep -E "cypress|cucumber|esbuild|mochawesome|eslint|prettier"
```

### Verificar Cypress
```bash
npx cypress version
```

### Ejecutar prueba de ejemplo
```bash
npx cypress run --spec "cypress/e2e/features/01-title-validation.feature"
```

---

## 📚 Versiones Específicas Instaladas

Después de la instalación, verifica las versiones exactas con:
```bash
npm list cypress
npm list @badeball/cypress-cucumber-preprocessor
npm list esbuild
npm list typescript
npm list mochawesome
```

---

## 🎯 Próximos Pasos

1. ✅ Actualizar Node.js a v20+
2. ✅ Instalar dependencias
3. ✅ Ejecutar `npm run cypress:open`
4. ✅ Seleccionar E2E Testing
5. ✅ Elegir browser (Chrome recomendado)
6. ✅ Ejecutar features
7. ✅ Revisar reportes en `mochawesome-report/`

---

**Nota**: Todas las dependencias listadas son compatibles con Node v20+. El proyecto está configurado para usar `--legacy-peer-deps` debido a posibles conflictos de dependencias entre diferentes versiones de paquetes.
