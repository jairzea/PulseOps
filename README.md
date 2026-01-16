# PulseOps

## 🚀 Inicio Rápido

### 1. Iniciar MongoDB
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Iniciar Backend (Terminal 1)
```bash
cd apps/backend && npm run dev
```

### 3. Poblar Datos (Terminal 2)  
```bash
chmod +x seed-data.sh && ./seed-data.sh
```

### 4. Iniciar Frontend (Terminal 3)
```bash
cd apps/frontend && npm run dev
```

### 5. Abrir Dashboard
http://localhost:5173

---

# PulseOps

**Sistema de evaluación operativa basado en análisis de comportamiento de estadísticas en el tiempo.**

PulseOps centraliza, normaliza y evalúa estadísticas operativas del equipo de desarrollo, analizando el **comportamiento temporal** de las métricas (inclinación, tendencias) y asignando **condiciones operativas** basadas en fórmulas empresariales.

## ¿Qué hace PulseOps?

- 📊 **Ingesta datos** desde múltiples fuentes (CSV, JSON, Jira API)
- 🔄 **Normaliza estadísticas** bajo un modelo de dominio único
- 📈 **Analiza comportamiento temporal** (inclinación, tendencias en series de tiempo)
- ⚙️ **Asigna condiciones operativas** usando un motor declarativo de reglas
- 📉 **Visualiza resultados** mediante gráficos históricos y flujos interactivos
- 💾 **Persiste todo** en MongoDB local

> **PulseOps no es un dashboard simple**. Es un sistema de evaluación operativa con análisis temporal profundo y arquitectura orientada a dominio.

---

## Estructura del Monorepo

```
pulseops/
├── apps/
│   ├── backend/         # API REST con NestJS
│   │   └── src/
│   │       ├── analysis/     # Análisis de inclinación y tendencias
│   │       ├── charts/       # Configuración de visualizaciones
│   │       ├── metrics/      # Gestión de métricas
│   │       ├── playbooks/    # Playbooks de respuesta
│   │       ├── records/      # Registros históricos
│   │       ├── resources/    # Recursos (equipos, proyectos)
│   │       └── rules/        # Motor de reglas y condiciones
│   └── frontend/        # UI React + Vite + React Flow
├── packages/
│   ├── analysis-engine/ # Motor puro de análisis (sin dependencias)
│   └── shared-types/    # Tipos compartidos TypeScript
└── docs/                # Documentación técnica
```

---

## Conceptos Clave

### 🎯 Motor de Análisis de Inclinación

Núcleo lógico puro que:
- Recibe una **serie temporal** de valores
- Calcula la **inclinación** (tendencia)
- Interpreta el **comportamiento** (mejorando/empeorando/estable)
- Asigna una **condición operativa** (OK/WARNING/CRITICAL)
- Devuelve una **explicación** legible

Ver: [`Motor de analisis de inclinación y condiciones.md`](Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md)

### 📏 Condiciones Operativas

El sistema evalúa cada métrica y asigna:
- **OK**: Comportamiento saludable
- **WARNING**: Requiere atención
- **CRITICAL**: Requiere acción inmediata

Basado en:
- Inclinación de la tendencia
- Umbrales configurables
- Tipo de métrica (mayor-es-mejor / menor-es-mejor)

Ver: [`Fórmulas de las condiciones.md`](Fórmulas%20de%20las%20condiciones.md)

### 🔗 Recursos y Métricas

- **Resource**: Entidad que se mide (equipo, proyecto, sprint)
- **Metric**: Estadística observable (bugs, velocity, cobertura)
- **Record**: Valor de una métrica en un momento específico
- **Chart**: Configuración de visualización

Ver: [`ESPECIFICACIÓN FORMAL DEL DOMINIO.md`](ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)

---

## Requisitos

- **Node.js** >= 20.0.0 (LTS)
- **npm** >= 10.0.0
- **MongoDB** >= 6.0 (local o Docker)
- **Docker & Docker Compose** (opcional, recomendado)

---

## Instalación

### Opción 1: Local

```bash
# Instalar dependencias
npm install

# Iniciar MongoDB (si no está corriendo)
mongod --dbpath ./data/db
```

### Opción 2: Docker (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up
```

Ver [DOCKER.md](DOCKER.md) para configuración detallada.

---

## Scripts Disponibles

```bash
# Verificación de tipos en todos los workspaces
npm run typecheck

# Build de todos los packages
npm run build

# Desarrollo (inicia backend y frontend)
npm run dev

# Limpiar builds
npm run clean
```

---

## Desarrollo

### Local

```bash
# Terminal 1: Backend (puerto 3000)
cd apps/backend
npm run dev

# Terminal 2: Frontend (puerto 5173)
cd apps/frontend
npm run dev
```

### Docker

```bash
# Iniciar todos los servicios
docker-compose up

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir imágenes
docker-compose up --build
```

---

## Arquitectura

### Stack Tecnológico

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilos)
- React Flow (visualización de grafos)
- Recharts (gráficos históricos)

**Backend**
- NestJS 10 + TypeScript
- MongoDB + Mongoose
- REST API
- Inyección de dependencias

**Motor**
- TypeScript puro
- Sin dependencias externas
- 100% testeable
- Matemáticas de regresión lineal

**Base de Datos**
- MongoDB 6.x
- Schemas con Mongoose
- Índices para performance

### Principios de Diseño

1. **Separación de concerns**: Motor puro separado de infraestructura
2. **Domain-driven**: Modelo de dominio rico y expresivo
3. **Temporal analysis**: Análisis basado en series de tiempo, no snapshots
4. **Configurable**: Reglas y umbrales configurables sin código
5. **Extensible**: Fácil agregar nuevas fuentes y métricas

---

## URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **MongoDB**: mongodb://localhost:27017/pulseops

---

## Endpoints Principales

```
GET    /health                    # Estado del servidor
GET    /api/resources             # Listar recursos
POST   /api/metrics               # Crear métrica
GET    /api/records               # Obtener registros
POST   /api/analysis              # Ejecutar análisis
GET    /api/charts                # Configuraciones de gráficos
GET    /api/rules                 # Reglas de condiciones
```

Ver: [`API_TESTING.md`](API_TESTING.md) para colección completa de Postman.

---

## Documentación Técnica

- [`context.md`](context.md) - Visión del producto y contexto del proyecto
- [`Motor de analisis de inclinación y condiciones.md`](Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md) - Especificación del motor
- [`Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md`](Diseño%20de%20Interfaz%20Técnica%20–%20Motor%20de%20Análisis%20de%20Inclinación%20(v2).md) - API del motor
- [`ESPECIFICACIÓN FORMAL DEL DOMINIO.md`](ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md) - Modelo de dominio
- [`Fórmulas de las condiciones.md`](Fórmulas%20de%20las%20condiciones.md) - Lógica de evaluación
- [`DOCKER.md`](DOCKER.md) - Configuración de Docker
- [`API_TESTING.md`](API_TESTING.md) - Testing de API con Postman

---

## Estado del Proyecto

### ✅ Implementado

- ✅ Arquitectura base de monorepo
- ✅ Backend NestJS con módulos principales
- ✅ Frontend React + Vite
- ✅ Modelo de dominio (Resources, Metrics, Records, Charts)
- ✅ Persistencia en MongoDB
- ✅ Motor de análisis de inclinación
- ✅ Sistema de reglas y condiciones
- ✅ Playbooks de respuesta
- ✅ Docker Compose setup

### 🚧 En Desarrollo

- 🚧 Integración con Jira API
- 🚧 Autenticación JWT
- 🚧 UI de visualización con React Flow
- 🚧 Dashboard de métricas en tiempo real

### 📋 Pendiente

- ⏳ Editor visual de reglas
- ⏳ Sistema de alertas
- ⏳ Exportación de reportes
- ⏳ Tests end-to-end

---

## Contribuir

Este es un proyecto MVP. Para contribuir:

1. Leer [`context.md`](context.md) para entender la visión
2. Revisar [`ESPECIFICACIÓN FORMAL DEL DOMINIO.md`](ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)
3. Seguir la estructura de módulos existente
4. Mantener el motor de análisis sin dependencias
5. Usar TypeScript strict mode

---

## Licencia

MIT © Unlimitech
