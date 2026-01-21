#!/bin/bash

# PulseOps - Script de Seeding
# Este script popula la base de datos con datos de ejemplo

BASE_URL="http://localhost:3000"

echo "🌱 Iniciando seeding de PulseOps..."
echo ""

# 1. Crear Recursos
echo "📦 Creando recursos..."

RES1_JSON=$(curl -s -X POST "$BASE_URL/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "roleType": "developer",
    "isActive": true
  }')

RES2_JSON=$(curl -s -X POST "$BASE_URL/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juanchito",
    "roleType": "developer",
    "isActive": true
  }')

# Extraer IDs usando python
RESOURCE_1=$(echo "$RES1_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
RESOURCE_2=$(echo "$RES2_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

echo "✅ Recurso 1 creado: $RESOURCE_1 (Juan Pérez)"
echo "✅ Recurso 2 creado: $RESOURCE_2 (Juanchito)"
echo ""

# 2. Crear Métricas
echo "📊 Creando métricas..."

MET1_JSON=$(curl -s -X POST "$BASE_URL/metrics" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "velocity",
    "label": "Velocidad de Desarrollo",
    "description": "Story points completados por semana",
    "unit": "story points",
    "periodType": "weekly"
  }')

MET2_JSON=$(curl -s -X POST "$BASE_URL/metrics" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "bugs",
    "label": "Bugs Introducidos",
    "description": "Número de bugs reportados por semana",
    "unit": "bugs",
    "periodType": "weekly"
  }')

METRIC_1=$(echo "$MET1_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
METRIC_2=$(echo "$MET2_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

echo "✅ Métrica 1 creada: $METRIC_1 (velocity)"
echo "✅ Métrica 2 creada: $METRIC_2 (bugs)"
echo ""

# 3. Crear Records históricos (últimas 12 semanas)
echo "📈 Creando registros históricos..."

# Generar timestamps para las últimas 12 semanas
for i in {0..11}; do
  # Calcular fecha (semanas hacia atrás desde hoy)
  TIMESTAMP=$(date -u -v-${i}w +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "$i weeks ago" +"%Y-%m-%dT%H:%M:%SZ")
  WEEK=$((12 - i))
  
  # Datos realistas con tendencia
  # Juan Pérez: Velocidad creciente (10 -> 16)
  VELOCITY_JP=$((10 + i / 2))
  
  # Juanchito: Velocidad más variable (8 -> 12)
  VELOCITY_JC=$((8 + (i % 3)))
  
  # Bugs: Decreciente para Juan (5 -> 2), Variable para Juanchito
  BUGS_JP=$((5 - i / 4))
  BUGS_JC=$((3 + (i % 2)))
  
  # Juan Pérez - Velocity
  curl -s -X POST "$BASE_URL/records" \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": \"$RESOURCE_1\",
      \"metricKey\": \"velocity\",
      \"value\": $VELOCITY_JP,
      \"week\": $WEEK,
      \"timestamp\": \"$TIMESTAMP\"
    }" > /dev/null
  
  # Juanchito - Velocity
  curl -s -X POST "$BASE_URL/records" \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": \"$RESOURCE_2\",
      \"metricKey\": \"velocity\",
      \"value\": $VELOCITY_JC,
      \"week\": $WEEK,
      \"timestamp\": \"$TIMESTAMP\"
    }" > /dev/null
  
  # Juan Pérez - Bugs
  curl -s -X POST "$BASE_URL/records" \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": \"$RESOURCE_1\",
      \"metricKey\": \"bugs\",
      \"value\": $BUGS_JP,
      \"week\": $WEEK,
      \"timestamp\": \"$TIMESTAMP\"
    }" > /dev/null
  
  # Juanchito - Bugs
  curl -s -X POST "$BASE_URL/records" \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": \"$RESOURCE_2\",
      \"metricKey\": \"bugs\",
      \"value\": $BUGS_JC,
      \"week\": $WEEK,
      \"timestamp\": \"$TIMESTAMP\"
    }" > /dev/null
  
  echo "  ✅ Semana $WEEK creada"
done

echo ""
echo "🎉 Seeding completado!"
echo ""
echo "📊 Resumen:"
echo "  - 2 Recursos (IDs: $RESOURCE_1, $RESOURCE_2)"
echo "  - 2 Métricas"
echo "  - 48 Registros (12 semanas × 2 recursos × 2 métricas)"
echo ""
echo "🌐 Prueba el frontend en: http://localhost:5173"
