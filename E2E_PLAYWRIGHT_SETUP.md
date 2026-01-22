# 🎭 Setup de Pruebas E2E con Playwright - PulseOps

## 📋 Resumen

Este documento describe la configuración completa para ejecutar pruebas End-to-End (E2E) con Playwright en el proyecto PulseOps.

**Fecha**: 22 de Enero de 2026  
**Branch**: `test/playwright-e2e`  
**Autor**: GitHub Copilot (Claude Sonnet 4.5)

---

## 🚀 Inicio Rápido

### 1️⃣ Pre-requisitos

- **Node.js**: >= v20.0.0
- **npm**: >= v10.0.0
- **Docker Desktop**: Corriendo (para MongoDB)
- **Puertos disponibles**: 3000 (Backend), 5173 (Frontend), 27017 (MongoDB)

### 2️⃣ Instalación

```bash
# 1. Clonar repositorio y cambiar a branch de pruebas
git checkout test/playwright-e2e

# 2. Instalar dependencias del monorepo
npm install

# 3. Instalar Playwright y dependencias E2E
npm install --save-dev \
  @playwright/test@^1.48.2 \
  @cucumber/cucumber@^11.0.1 \
  @cucumber/gherkin@^31.0.1 \
  playwright-bdd@^8.6.0 \
  --legacy-peer-deps

# 4. Instalar browsers de Playwright
npx playwright install chromium firefox webkit
```

### 3️⃣ Levantar Servicios

#### Opción A: Levantar todos los servicios con una tarea

```bash
npm run start:all
# O usando VS Code: Run Task > "🚀 Start All Services"
```

#### Opción B: Levantar servicios individualmente

```bash
# Terminal 1: Levantar MongoDB
docker-compose -f config/docker-compose.dev.yml up -d

# Terminal 2: Levantar Backend
npm run dev --workspace=apps/backend

# Terminal 3: Levantar Frontend
npm run dev --workspace=apps/frontend
```

### 4️⃣ Verificar Servicios

```bash
# Verificar Backend
curl http://localhost:3000/health
# Esperado: {"status":"ok","timestamp":"...","service":"pulseops-backend"}

# Verificar Frontend
curl -I http://localhost:5173
# Esperado: HTTP/1.1 200 OK

# Verificar MongoDB
docker exec pulseops-mongodb mongosh --eval "db.version()"
```

### 5️⃣ Crear Usuario Admin (Seed)

```bash
npm run seed:admin --workspace=apps/backend
# Credenciales:
# Email: admin@pulseops.com
# Password: admin123
```

### 6️⃣ Ejecutar Pruebas E2E

```bash
# Modo UI (interactivo, recomendado para desarrollo)
npm run test:e2e:ui

# Modo headless (CI/CD)
npm run test:e2e

# Ejecutar feature específica
npm run test:e2e -- --grep "@navigation"

# Ejecutar en navegador específico
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

---

## 📂 Estructura del Proyecto

```
pulseops/
├── apps/
│   ├── backend/               # Backend NestJS
│   │   ├── src/
│   │   └── package.json
│   └── frontend/              # Frontend React + Vite
│       ├── src/
│       └── package.json
├── playwright/                # 🎭 Pruebas E2E con Playwright
│   ├── e2e/
│   │   ├── features/         # 📝 Archivos .feature (Gherkin)
│   │   │   ├── 01-navigation.feature
│   │   │   ├── 02-dashboard.feature
│   │   │   ├── 03-records.feature
│   │   │   ├── 04-metrics.feature
│   │   │   └── 05-resources.feature
│   │   └── step-definitions/ # 🔧 Step definitions TypeScript
│   │       ├── common.steps.ts
│   │       ├── navigation.steps.ts
│   │       ├── dashboard.steps.ts
│   │       ├── records.steps.ts
│   │       ├── metrics.steps.ts
│   │       └── resources.steps.ts
│   ├── support/
│   │   ├── pages/            # 📄 Page Object Model
│   │   │   ├── BasePage.ts
│   │   │   ├── LoginPage.ts
│   │   │   ├── DashboardPage.ts
│   │   │   ├── ResourcesPage.ts
│   │   │   ├── MetricsPage.ts
│   │   │   └── RecordsPage.ts
│   │   ├── widgets/          # 🔧 Widgets reutilizables
│   │   │   ├── BaseWidget.ts
│   │   │   ├── ButtonWidget.ts
│   │   │   ├── InputWidget.ts
│   │   │   ├── SelectWidget.ts
│   │   │   ├── TableWidget.ts
│   │   │   └── ModalWidget.ts
│   │   ├── utils/            # 🛠️ Utilidades
│   │   │   ├── testTags.ts
│   │   │   ├── waitHelpers.ts
│   │   │   └── dataHelpers.ts
│   │   └── fixtures/         # 📦 Datos de prueba
│   │       ├── users.json
│   │       ├── resources.json
│   │       ├── metrics.json
│   │       └── records.json
│   ├── playwright.config.ts  # ⚙️ Configuración principal
│   └── tsconfig.json          # TypeScript config
├── config/
│   └── docker-compose.dev.yml # Docker Compose para MongoDB
├── E2E_PLAYWRIGHT_SETUP.md    # 📘 Este archivo
├── E2E_UI_MAP.md              # 🗺️ Mapa de UI explorada
└── package.json
```

---

## ⚙️ Configuración de Entorno

### Variables de Entorno

#### Backend (`apps/backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pulseops
AUTH_MODE=demo
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=PulseOps
```

#### Playwright (`playwright/.env`)

```env
BASE_URL=http://localhost:5173
API_URL=http://localhost:3000
HEADLESS=false
SLOW_MO=100
```

---

## 🌐 URLs y Puertos

| Servicio   | URL                        | Puerto | Descripción              |
|------------|----------------------------|--------|--------------------------|
| Frontend   | http://localhost:5173      | 5173   | React + Vite             |
| Backend    | http://localhost:3000      | 3000   | NestJS API               |
| MongoDB    | mongodb://localhost:27017  | 27017  | Base de datos            |
| Playwright | http://localhost:5173      | -      | Ejecuta tests en frontend|

---

## 📝 Scripts NPM Disponibles

### Servicios

```bash
npm run start:all              # Levantar todos los servicios
npm run stop:all               # Detener todos los servicios
npm run seed:admin             # Crear usuario admin
npm run seed:demo              # Crear datos de prueba demo
```

### Pruebas E2E

```bash
# Ejecución
npm run test:e2e               # Headless (todos los browsers)
npm run test:e2e:ui            # Modo UI (interactivo)
npm run test:e2e:headed        # Con interfaz visible
npm run test:e2e:chromium      # Solo Chromium
npm run test:e2e:firefox       # Solo Firefox
npm run test:e2e:webkit        # Solo WebKit/Safari
npm run test:e2e:debug         # Modo debug
npm run test:e2e:codegen       # Codegen (generar tests)

# Reportes
npm run test:e2e:report        # Abrir último reporte HTML
npm run test:e2e:trace         # Abrir trace viewer

# Utiler
npm run test:e2e:install       # Reinstalar browsers
npm run test:e2e:update        # Actualizar snapshots
```

---

## 🔑 Credenciales de Prueba

### Usuario Admin
- **Email**: `admin@pulseops.com`
- **Password**: `admin123`
- **Rol**: ADMIN

### Usuario Demo (después de seed)
- **Email**: `demo@pulseops.com`
- **Password**: `demo123`
- **Rol**: USER

---

## 🎯 Flujo de Trabajo Típico

```bash
# 1. Levantar servicios
npm run start:all

# 2. Crear datos de prueba (primera vez)
npm run seed:admin
npm run seed:demo

# 3. Ejecutar pruebas en modo UI para desarrollo
npm run test:e2e:ui

# 4. Ejecutar feature específica
npm run test:e2e -- --grep "@dashboard"

# 5. Ver reportes
npm run test:e2e:report

# 6. Detener servicios cuando termines
npm run stop:all
```

---

## 🐛 Troubleshooting

### Error: "Browsers not installed"
```bash
npx playwright install
```

### Error: "MongoDB connection failed"
```bash
# Verificar Docker Desktop
docker ps | grep pulseops-mongodb

# Si no está corriendo
docker-compose -f config/docker-compose.dev.yml up -d
```

### Error: "Backend no responde"
```bash
# Verificar logs del backend
npm run dev --workspace=apps/backend

# Verificar puerto
lsof -i :3000
```

### Error: "Frontend no carga"
```bash
# Limpiar cache y reinstalar
rm -rf apps/frontend/node_modules/.vite
npm run dev --workspace=apps/frontend
```

### Tests fallan en login
```bash
# Recrear usuario admin
npm run seed:admin

# Verificar usuario en DB
docker exec pulseops-mongodb mongosh pulseops --eval "db.users.findOne({email: 'admin@pulseops.com'})"
```

---

## 📊 Reportes y Evidencias

### HTML Report
Ubicación: `playwright-report/index.html`
```bash
npm run test:e2e:report
```

### Screenshots
Ubicación: `playwright/test-results/`
- Se generan automáticamente en fallos
- Se pueden solicitar manualmente en tests

### Videos
Ubicación: `playwright/test-results/`
- Solo se graban en fallos (por defecto)
- Configurables en `playwright.config.ts`

### Traces
Ubicación: `playwright/test-results/`
```bash
npx playwright show-trace <trace-file>.zip
```

---

## 🔧 Configuración Avanzada

### Timeouts

```typescript
// playwright.config.ts
{
  timeout: 30000,          // Timeout por test (30s)
  expect: { timeout: 5000 },  // Timeout para assertions (5s)
  navigationTimeout: 30000,   // Timeout para navegación
}
```

### Retry Strategy

```typescript
// playwright.config.ts
{
  retries: process.env.CI ? 2 : 0,  // Reintentos en CI
}
```

### Paralelismo

```typescript
// playwright.config.ts
{
  workers: process.env.CI ? 1 : 4,  // Workers paralelos
}
```

---

## 📚 Documentación Adicional

- [E2E_UI_MAP.md](./E2E_UI_MAP.md) - Mapa de UI explorada
- [PLAYWRIGHT_README.md](./PLAYWRIGHT_README.md) - Documentación completa
- [docs/guides/PLAYWRIGHT_E2E_PROMPT.md](./docs/guides/PLAYWRIGHT_E2E_PROMPT.md) - Prompt de implementación

---

## ✅ Checklist de Verificación

Antes de ejecutar pruebas:

- [ ] Node.js v20+ instalado
- [ ] Docker Desktop corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] Playwright instalado (`npx playwright install`)
- [ ] MongoDB levantado (`docker ps`)
- [ ] Backend corriendo (http://localhost:3000/health)
- [ ] Frontend corriendo (http://localhost:5173)
- [ ] Usuario admin creado (`npm run seed:admin`)
- [ ] Datos demo creados (`npm run seed:demo`) [opcional]

---

**Última actualización**: 22 de Enero de 2026  
**Versión**: 1.0.0  
**Mantenedor**: Equipo PulseOps
