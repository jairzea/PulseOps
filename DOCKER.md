# Docker Setup - PulseOps

Configuración Docker para entorno de desarrollo local.

## Servicios

- **MongoDB** (puerto 27017): Base de datos
- **Backend** (puerto 3000): API NestJS
- **Frontend** (puerto 5173): UI React + Vite

## Requisitos

- Docker
- Docker Compose

## Uso

### Iniciar todos los servicios

```bash
docker-compose up
```

### Iniciar en background

```bash
docker-compose up -d
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Detener servicios

```bash
docker-compose down
```

### Detener y eliminar volúmenes

```bash
docker-compose down -v
```

### Reconstruir imágenes

```bash
docker-compose build
docker-compose up
```

## URLs de acceso

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Backend Health: http://localhost:3000/health
- MongoDB: mongodb://localhost:27017/pulseops

## Variables de entorno

Copia `.env.example` a `.env` y ajusta según necesites:

```bash
cp .env.example .env
```

## Desarrollo

Para desarrollo activo con hot reload:

```bash
# Backend
cd apps/backend
npm run dev

# Frontend
cd apps/frontend
npm run dev
```

## Troubleshooting

### Puerto en uso

Si los puertos están ocupados, modifica `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "5174:5173"  # Cambia el puerto externo
```

### Limpiar todo

```bash
docker-compose down -v
docker system prune -a
```

### Conectar a MongoDB

```bash
docker exec -it pulseops-mongodb mongosh pulseops
```
