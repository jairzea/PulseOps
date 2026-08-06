# 🐳 Guía de Despliegue con Docker

Esta guía explica cómo desplegar PulseOps utilizando Docker y Docker Compose en cualquier servidor.

## 📋 Requisitos Previos

- Docker Engine 20.10 o superior
- Docker Compose V2
- 2GB de RAM mínimo (4GB recomendado)
- 10GB de espacio en disco

## 🚀 Instalación de Docker

### Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt update

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
docker compose version
```

### CentOS/RHEL
```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### macOS
```bash
# Instalar Docker Desktop desde:
# https://docs.docker.com/desktop/install/mac-install/
```

## 📦 Despliegue Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/jairzea/PulseOps.git
cd PulseOps
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Variables importantes a configurar:**
```env
# Seguridad
JWT_SECRET=tu-clave-super-secreta-aqui-cambiar
MONGO_ROOT_PASSWORD=password-seguro-para-mongodb

# URLs (si despliegas en servidor remoto)
VITE_API_URL=http://tu-servidor.com:3000

# Puertos (opcional)
BACKEND_PORT=3000
FRONTEND_PORT=80
MONGODB_PORT=27017
```

### 3. Desplegar con el script
```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar script
./scripts/deploy.sh
```

El script te presentará un menú interactivo:
1. **Build** - Construir imágenes Docker
2. **Deploy** - Desplegar aplicación
3. **Stop** - Detener aplicación
4. **Restart** - Reiniciar aplicación
5. **Logs** - Ver logs
6. **Clean** - Limpiar todo

### 4. Acceder a la aplicación

Una vez desplegado:
- **Frontend**: http://localhost (o http://tu-servidor.com)
- **Backend API**: http://localhost:3000 (o http://tu-servidor.com:3000)
- **MongoDB**: localhost:27017

## 🔧 Despliegue Manual

Si prefieres ejecutar comandos manualmente:

### Build de las imágenes
```bash
cd config
docker compose -f docker-compose.prod.yml build
```

### Iniciar servicios
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Ver estado de los servicios
```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs
```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo backend
docker compose -f docker-compose.prod.yml logs -f backend

# Solo frontend
docker compose -f docker-compose.prod.yml logs -f frontend

# Solo mongodb
docker compose -f docker-compose.prod.yml logs -f mongodb
```

### Detener servicios
```bash
docker compose -f docker-compose.prod.yml down
```

### Limpiar todo (incluyendo volúmenes)
```bash
docker compose -f docker-compose.prod.yml down -v
```

## 🔄 Actualización de la Aplicación

### Método 1: Con el script
```bash
./scripts/deploy.sh
# Seleccionar opción 1 (Build) y luego opción 4 (Restart)
```

### Método 2: Manual
```bash
cd config

# Detener servicios
docker compose -f docker-compose.prod.yml down

# Actualizar código
git pull origin main

# Reconstruir imágenes
docker compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d
```

## 🌐 Despliegue en Servidor Remoto

### Configuración de Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Configuración con Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS con Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo crontab -e
# Agregar: 0 3 * * * certbot renew --quiet
```

## 📊 Monitoreo y Salud

### Health Checks
```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/health

# MongoDB
docker exec pulseops-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Verificar recursos
```bash
# Ver uso de recursos
docker stats

# Ver logs de sistema
docker compose -f config/docker-compose.prod.yml logs --tail=100
```

## 🐛 Troubleshooting

### Los servicios no inician
```bash
# Ver logs detallados
docker compose -f config/docker-compose.prod.yml logs

# Verificar puertos en uso
sudo netstat -tulpn | grep -E ':(80|3000|27017)'

# Reiniciar Docker
sudo systemctl restart docker
```

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker ps | grep mongodb

# Reiniciar solo MongoDB
docker compose -f config/docker-compose.prod.yml restart mongodb

# Verificar logs de MongoDB
docker compose -f config/docker-compose.prod.yml logs mongodb
```

### Frontend no carga
```bash
# Verificar que el build se completó
docker compose -f config/docker-compose.prod.yml logs frontend

# Reconstruir frontend
docker compose -f config/docker-compose.prod.yml build --no-cache frontend
docker compose -f config/docker-compose.prod.yml up -d frontend
```

### Problemas de permisos
```bash
# Dar permisos al usuario actual
sudo chown -R $USER:$USER .

# Limpiar y reconstruir
docker compose -f config/docker-compose.prod.yml down -v
docker compose -f config/docker-compose.prod.yml build --no-cache
docker compose -f config/docker-compose.prod.yml up -d
```

## 🔐 Seguridad en Producción

### Checklist de Seguridad
- [ ] Cambiar `JWT_SECRET` en `.env.production`
- [ ] Cambiar `MONGO_ROOT_PASSWORD` en `.env.production`
- [ ] Configurar firewall para limitar acceso a puertos
- [ ] Usar HTTPS con certificado SSL
- [ ] Configurar backup automático de MongoDB
- [ ] Limitar acceso SSH al servidor
- [ ] Actualizar Docker y el sistema operativo regularmente

### Backup de MongoDB
```bash
# Backup manual
docker exec pulseops-mongodb mongodump --out /data/backup

# Copiar backup al host
docker cp pulseops-mongodb:/data/backup ./backup-$(date +%Y%m%d)

# Automatizar backups (crontab)
0 2 * * * docker exec pulseops-mongodb mongodump --out /data/backup && docker cp pulseops-mongodb:/data/backup /backups/$(date +\%Y\%m\%d)
```

### Restaurar Backup
```bash
# Copiar backup al contenedor
docker cp ./backup-20260123 pulseops-mongodb:/data/restore

# Restaurar
docker exec pulseops-mongodb mongorestore /data/restore
```

## 📈 Escalabilidad

Para despliegues de alta disponibilidad, considera:

1. **MongoDB Replica Set**: Configurar un cluster de MongoDB
2. **Load Balancer**: Usar Nginx o HAProxy para múltiples instancias del backend
3. **Docker Swarm o Kubernetes**: Para orquestación avanzada
4. **CDN**: Para servir assets estáticos del frontend

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker compose -f config/docker-compose.prod.yml logs`
2. Verifica la configuración en `.env.production`
3. Consulta la sección de Troubleshooting arriba
4. Abre un issue en GitHub con los detalles del error
