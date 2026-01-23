#!/bin/bash

# ============================================
# Script de despliegue de PulseOps
# ============================================

set -e

echo "🚀 Iniciando despliegue de PulseOps..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Error: No se encuentra package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose no está disponible. Por favor, instala Docker Compose primero."
    exit 1
fi

# Verificar que exista el archivo .env.production
if [ ! -f ".env.production" ]; then
    print_warning "No se encuentra .env.production. Creando desde el ejemplo..."
    cp .env.production.example .env.production
    print_info "Archivo .env.production creado. Por favor, edítalo con tus valores antes de continuar."
    print_info "Ejecuta: nano .env.production"
    exit 0
fi

# Preguntar qué acción realizar
echo ""
echo "Selecciona una opción:"
echo "1) Build - Construir imágenes Docker"
echo "2) Deploy - Desplegar aplicación"
echo "3) Stop - Detener aplicación"
echo "4) Restart - Reiniciar aplicación"
echo "5) Logs - Ver logs de la aplicación"
echo "6) Clean - Limpiar contenedores y volúmenes"
echo ""
read -p "Opción (1-6): " option

case $option in
    1)
        print_info "Construyendo imágenes Docker..."
        cd config
        docker compose -f docker-compose.prod.yml --env-file ../.env.production build --no-cache
        print_info "✅ Imágenes construidas exitosamente"
        ;;
    2)
        print_info "Desplegando PulseOps..."
        cd config
        docker compose -f docker-compose.prod.yml --env-file ../.env.production up -d
        print_info "⏳ Esperando a que los servicios estén listos..."
        sleep 10
        docker compose -f docker-compose.prod.yml --env-file ../.env.production ps
        print_info "✅ PulseOps desplegado exitosamente"
        print_info "Frontend: http://localhost:${FRONTEND_PORT:-80}"
        print_info "Backend: http://localhost:${BACKEND_PORT:-3000}"
        ;;
    3)
        print_info "Deteniendo PulseOps..."
        cd config
        docker compose -f docker-compose.prod.yml --env-file ../.env.production down
        print_info "✅ PulseOps detenido"
        ;;
    4)
        print_info "Reiniciando PulseOps..."
        cd config
        docker compose -f docker-compose.prod.yml --env-file ../.env.production restart
        print_info "✅ PulseOps reiniciado"
        ;;
    5)
        print_info "Mostrando logs (Ctrl+C para salir)..."
        cd config
        docker compose -f docker-compose.prod.yml --env-file ../.env.production logs -f
        ;;
    6)
        print_warning "⚠️  ADVERTENCIA: Esto eliminará todos los contenedores, volúmenes y datos."
        read -p "¿Estás seguro? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            print_info "Limpiando PulseOps..."
            cd config
            docker compose -f docker-compose.prod.yml --env-file ../.env.production down -v
            print_info "✅ PulseOps limpiado completamente"
        else
            print_info "Operación cancelada"
        fi
        ;;
    *)
        print_error "Opción no válida"
        exit 1
        ;;
esac

echo ""
print_info "🎉 Operación completada"
