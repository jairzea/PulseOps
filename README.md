# PulseOps

Sistema de evaluación operativa basado en comportamiento de estadísticas.

## Estructura del Monorepo

```
pulseops/
├── apps/
│   ├── backend/         # Servidor NestJS
│   └── frontend/        # Aplicación React + Vite
├── packages/
│   ├── analysis-engine/ # Motor de análisis de inclinación (núcleo puro)
│   └── shared-types/    # Tipos compartidos
└── package.json         # Configuración de workspaces
```

## Requisitos

- Node.js >= 20.0.0 (LTS)
- npm >= 10.0.0
- Docker & Docker Compose (opcional, para entorno containerizado)

## Instalación

### Opción 1: Local

```bash
npm install
```

### Opción 2: Docker

```bash
docker-compose up
```

Ver [DOCKER.md](DOCKER.md) para más detalles.

## Scripts Disponibles

```bash
# Verificación de tipos en todos los workspaces
npm run typecheck

# Build de todos los packages
npm run build

# Limpiar builds
npm run clean
```

## Desarrollo

### Local

```bash
# Backend (puerto 3000)
cd apps/backend
npm run dev

# Frontend (puerto 5173)
cd apps/frontend
npm run dev
```

### Docker

```bash
# Iniciar todos los servicios
docker-compose up

# Ver logs
docker-compose logs -f
```

## Arquitectura

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + React Flow
- **Backend**: Node.js + NestJS + TypeScript
- **Motor**: Puro dominio, sin dependencias externas
- **Base de datos**: MongoDB (local)

## URLs de Acceso

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Backend Health: http://localhost:3000/health
- MongoDB: mongodb://localhost:27017/pulseops

## Próximos Pasos

1. Implementar motor de análisis en `packages/analysis-engine`
2. Configurar NestJS en `apps/backend`
3. Configurar React + Vite en `apps/frontend`
4. Definir tipos de dominio en `packages/shared-types`
