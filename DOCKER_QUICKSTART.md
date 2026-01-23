# 🚀 Guía Rápida de Inicio - Docker & CI/CD

## ⚡ Inicio Rápido (5 minutos)

### Opción 1: Con Script de Despliegue
```bash
# 1. Clonar repositorio
git clone https://github.com/jairzea/PulseOps.git
cd PulseOps

# 2. Configurar environment
cp .env.production.example .env.production
nano .env.production  # Editar JWT_SECRET y MONGO_ROOT_PASSWORD

# 3. Desplegar
chmod +x scripts/deploy.sh
./scripts/deploy.sh
# Seleccionar: 1 (Build) → 2 (Deploy)
```

### Opción 2: Con Docker Compose
```bash
# Build y deploy en un comando
npm run docker:build
npm run docker:up

# Ver logs
npm run docker:logs
```

**Acceso**:
- 🌐 Frontend: http://localhost
- 🔧 Backend API: http://localhost:3000
- 🗄️ MongoDB: localhost:27017

## 📦 Comandos Disponibles

### Docker
```bash
npm run docker:build    # Construir imágenes
npm run docker:up       # Iniciar servicios
npm run docker:down     # Detener servicios
npm run docker:logs     # Ver logs en tiempo real
npm run docker:clean    # Limpiar todo (cuidado: borra datos)
npm run deploy          # Script interactivo de despliegue
```

### Desarrollo
```bash
npm run dev             # Modo desarrollo (todos los servicios)
npm run build           # Compilar aplicación
npm run lint            # Verificar código
npm run test:e2e        # Tests E2E con Cypress
```

## 🔄 Pipeline CI/CD

El proyecto incluye pipeline automático con GitHub Actions:

✅ Lint y validación de código  
✅ Tests unitarios e integración  
✅ Tests E2E con Cypress  
✅ Build de imágenes Docker  
✅ Publicación a Docker Hub  
✅ Escaneo de seguridad  

### Configurar CI/CD

1. **Agregar secrets en GitHub**:
   - `DOCKERHUB_USERNAME`: Tu usuario de Docker Hub
   - `DOCKERHUB_TOKEN`: Token de acceso

2. **Push a las ramas protegidas**:
   ```bash
   git push origin dev    # Activa pipeline completo
   git push origin main   # Activa pipeline + security scan
   ```

## 📚 Documentación Completa

- **[Guía de Despliegue Docker](docs/DOCKER_DEPLOYMENT.md)** - Despliegue en producción
- **[Pipeline CI/CD](docs/CI_CD.md)** - Integración y despliegue continuo
- **[Arquitectura](apps/backend/ARCHITECTURE.md)** - Arquitectura del backend
- **[API Testing](docs/api/API_TESTING.md)** - Testing de API

## 🛠️ Tecnologías

**Backend**: Node.js, NestJS, MongoDB, TypeScript  
**Frontend**: React, TypeScript, Vite, TailwindCSS  
**Testing**: Cypress, Cucumber  
**DevOps**: Docker, GitHub Actions, Nginx  

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Antes de desplegar en producción:
- Cambiar `JWT_SECRET` en `.env.production`
- Cambiar `MONGO_ROOT_PASSWORD` en `.env.production`
- Configurar firewall del servidor
- Usar HTTPS con certificado SSL
- Configurar backups de MongoDB

Ver [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md#-seguridad-en-producción) para más detalles.

## 🆘 Soporte

**Problemas comunes**:
- Servicios no inician → Ver logs: `npm run docker:logs`
- Puerto ocupado → Cambiar puertos en `.env.production`
- MongoDB no conecta → Verificar que el servicio esté corriendo

**Documentación completa**: [docs/](docs/)  
**Issues**: [GitHub Issues](https://github.com/jairzea/PulseOps/issues)

## 📝 Licencia

Este proyecto está bajo licencia privada.
