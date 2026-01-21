# Scripts

Scripts de utilidad para el proyecto PulseOps.

## Scripts Disponibles

### 🌱 seed-data.sh

Script para poblar la base de datos con datos iniciales.

**Uso:**
```bash
bash scripts/seed-data.sh
```

### 📝 e2e_demo.sh

Script para ejecutar demo end-to-end del sistema.

**Uso:**
```bash
bash scripts/e2e_demo.sh
```

## Scripts de NPM

Ejecutar desde la raíz del proyecto:

```bash
# Desarrollo
npm run dev:backend    # Inicia backend en modo desarrollo
npm run dev:frontend   # Inicia frontend en modo desarrollo
npm run dev:all        # Inicia todos los servicios

# Build
npm run build:backend  # Compila backend
npm run build:frontend # Compila frontend
npm run build:all      # Compila todo el monorepo

# Testing
npm run test:backend   # Tests del backend
npm run test:frontend  # Tests del frontend

# Linting
npm run lint           # Ejecuta linter en todo el proyecto
```

## Docker

Para gestión de servicios Docker, ver [../docs/guides/DOCKER.md](../docs/guides/DOCKER.md)

```bash
# Iniciar servicios
docker-compose -f config/docker-compose.dev.yml up -d

# Detener servicios
docker-compose -f config/docker-compose.dev.yml down
```
