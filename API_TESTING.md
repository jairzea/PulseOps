# PulseOps API - Guía de Testing

Base URL: `http://localhost:3000`

## 📋 Índice
- [Health & Info](#health--info)
- [Resources](#resources)
- [Metrics](#metrics)
- [Records](#records)
- [Rules](#rules)
- [Charts](#charts)
- [Analysis](#analysis)

---

## Health & Info

### Health Check
```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T23:00:00.000Z",
  "service": "pulseops-backend"
}
```

### Root Endpoint
```bash
curl http://localhost:3000/
```

**Respuesta esperada:**
```
PulseOps Backend - Ready
```

---

## Resources

### Crear Resource
```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Server 01",
    "type": "server",
    "metadata": {
      "environment": "production",
      "region": "us-east-1"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "_id": "67879b1e2f4a3c001f123456",
  "name": "API Server 01",
  "type": "server",
  "metadata": {
    "environment": "production",
    "region": "us-east-1"
  },
  "createdAt": "2026-01-15T23:00:00.000Z",
  "updatedAt": "2026-01-15T23:00:00.000Z"
}
```

### Listar Resources
```bash
curl http://localhost:3000/resources
```

### Actualizar Resource
```bash
curl -X PATCH http://localhost:3000/resources/RESOURCE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Server 01 - Updated",
    "metadata": {
      "environment": "staging"
    }
  }'
```

---

## Metrics

### Crear Métrica
```bash
curl -X POST http://localhost:3000/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "key": "cpu_usage",
    "name": "CPU Usage",
    "unit": "percent",
    "description": "Porcentaje de uso de CPU"
  }'
```

**Respuesta esperada:**
```json
{
  "_id": "67879b1e2f4a3c001f789012",
  "key": "cpu_usage",
  "name": "CPU Usage",
  "unit": "percent",
  "description": "Porcentaje de uso de CPU",
  "createdAt": "2026-01-15T23:00:00.000Z",
  "updatedAt": "2026-01-15T23:00:00.000Z"
}
```

### Listar Métricas
```bash
curl http://localhost:3000/metrics
```

### Actualizar Métrica
```bash
curl -X PATCH http://localhost:3000/metrics/METRIC_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CPU Usage - Updated",
    "description": "Porcentaje de uso de CPU del sistema"
  }'
```

---

## Records

### Crear Record
```bash
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "RESOURCE_ID_AQUI",
    "metricKey": "cpu_usage",
    "value": 75.5,
    "timestamp": "2026-01-15T23:00:00Z"
  }'
```

**Respuesta esperada:**
```json
{
  "_id": "67879b1e2f4a3c001f345678",
  "resourceId": "67879b1e2f4a3c001f123456",
  "metricKey": "cpu_usage",
  "value": 75.5,
  "timestamp": "2026-01-15T23:00:00.000Z",
  "createdAt": "2026-01-15T23:00:00.000Z"
}
```

### Listar Records (con filtros)
```bash
# Por resource
curl "http://localhost:3000/records?resourceId=RESOURCE_ID"

# Por métrica
curl "http://localhost:3000/records?metricKey=cpu_usage"

# Combinado
curl "http://localhost:3000/records?resourceId=RESOURCE_ID&metricKey=cpu_usage"
```

### Eliminar Record
```bash
curl -X DELETE http://localhost:3000/records/RECORD_ID
```

---

## Rules

### Crear Regla
```bash
curl -X POST http://localhost:3000/rules \
  -H "Content-Type: application/json" \
  -d '{
    "metricKey": "cpu_usage",
    "version": 1,
    "name": "CPU Usage Rule",
    "config": {
      "windowSize": 10,
      "periodType": "minutes",
      "thresholds": {
        "critical": { "inclination": 15, "value": 90 },
        "alert": { "inclination": 10, "value": 75 },
        "warning": { "inclination": 5, "value": 60 }
      }
    }
  }'
```

**Respuesta esperada:**
```json
{
  "_id": "67879b1e2f4a3c001f901234",
  "metricKey": "cpu_usage",
  "version": 1,
  "name": "CPU Usage Rule",
  "isActive": false,
  "config": {
    "windowSize": 10,
    "periodType": "minutes",
    "thresholds": {
      "critical": { "inclination": 15, "value": 90 },
      "alert": { "inclination": 10, "value": 75 },
      "warning": { "inclination": 5, "value": 60 }
    }
  },
  "createdAt": "2026-01-15T23:00:00.000Z",
  "updatedAt": "2026-01-15T23:00:00.000Z"
}
```

### Listar Reglas
```bash
curl http://localhost:3000/rules
```

### Activar Regla
```bash
curl -X POST http://localhost:3000/rules/RULE_ID/activate
```

### Simular Regla
```bash
curl -X POST http://localhost:3000/rules/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "metricKey": "cpu_usage",
    "config": {
      "windowSize": 10,
      "periodType": "minutes",
      "thresholds": {
        "critical": { "inclination": 15, "value": 90 },
        "alert": { "inclination": 10, "value": 75 },
        "warning": { "inclination": 5, "value": 60 }
      }
    },
    "series": {
      "metricId": "cpu_usage",
      "points": [
        { "timestamp": "2026-01-15T23:00:00Z", "value": 50 },
        { "timestamp": "2026-01-15T23:01:00Z", "value": 55 },
        { "timestamp": "2026-01-15T23:02:00Z", "value": 60 },
        { "timestamp": "2026-01-15T23:03:00Z", "value": 70 },
        { "timestamp": "2026-01-15T23:04:00Z", "value": 85 }
      ]
    }
  }'
```

**Respuesta esperada:**
```json
{
  "analysis": {
    "inclination": 8.5,
    "trend": "increasing",
    "conditions": {
      "critical": false,
      "alert": false,
      "warning": true
    }
  }
}
```

---

## Charts

### Crear Chart
```bash
curl -X POST http://localhost:3000/charts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CPU Performance Chart",
    "type": "line",
    "metrics": ["cpu_usage"],
    "config": {
      "refreshInterval": 60
    }
  }'
```

**Respuesta esperada:**
```json
{
  "_id": "67879b1e2f4a3c001f567890",
  "name": "CPU Performance Chart",
  "type": "line",
  "metrics": ["cpu_usage"],
  "config": {
    "refreshInterval": 60
  },
  "createdAt": "2026-01-15T23:00:00.000Z",
  "updatedAt": "2026-01-15T23:00:00.000Z"
}
```

### Listar Charts
```bash
curl http://localhost:3000/charts
```

### Actualizar Chart
```bash
curl -X PATCH http://localhost:3000/charts/CHART_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CPU & Memory Chart",
    "metrics": ["cpu_usage", "memory_usage"]
  }'
```

---

## Analysis

### Evaluar Métrica
```bash
curl "http://localhost:3000/analysis/evaluate?resourceId=RESOURCE_ID&metricKey=cpu_usage&windowSize=10"
```

**Respuesta esperada:**
```json
{
  "metricKey": "cpu_usage",
  "resourceId": "67879b1e2f4a3c001f123456",
  "analysis": {
    "inclination": 5.2,
    "trend": "increasing",
    "currentValue": 75.5,
    "conditions": {
      "critical": false,
      "alert": false,
      "warning": true
    }
  },
  "timestamp": "2026-01-15T23:00:00.000Z"
}
```

---

## 🔄 Flujo de Prueba Completo

### 1. Crear un Resource
```bash
RESOURCE=$(curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Server",
    "type": "server",
    "metadata": {"environment": "test"}
  }' | jq -r '._id')

echo "Resource ID: $RESOURCE"
```

### 2. Crear una Métrica
```bash
curl -X POST http://localhost:3000/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "key": "cpu_usage",
    "name": "CPU Usage",
    "unit": "percent"
  }'
```

### 3. Crear Records (serie de datos)
```bash
# Record 1
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceId\": \"$RESOURCE\",
    \"metricKey\": \"cpu_usage\",
    \"value\": 50,
    \"timestamp\": \"$(date -u -v-10M +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Record 2
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceId\": \"$RESOURCE\",
    \"metricKey\": \"cpu_usage\",
    \"value\": 65,
    \"timestamp\": \"$(date -u -v-5M +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Record 3
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceId\": \"$RESOURCE\",
    \"metricKey\": \"cpu_usage\",
    \"value\": 80,
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"
```

### 4. Crear y Activar Regla
```bash
RULE=$(curl -X POST http://localhost:3000/rules \
  -H "Content-Type: application/json" \
  -d '{
    "metricKey": "cpu_usage",
    "version": 1,
    "name": "Test Rule",
    "config": {
      "windowSize": 10,
      "periodType": "minutes",
      "thresholds": {
        "critical": {"inclination": 15, "value": 90},
        "alert": {"inclination": 10, "value": 75},
        "warning": {"inclination": 5, "value": 60}
      }
    }
  }' | jq -r '._id')

echo "Rule ID: $RULE"

# Activar regla
curl -X POST "http://localhost:3000/rules/$RULE/activate"
```

### 5. Evaluar Análisis
```bash
curl "http://localhost:3000/analysis/evaluate?resourceId=$RESOURCE&metricKey=cpu_usage&windowSize=10"
```

---

## 📦 Importar Colección a Postman

1. Abre Postman
2. Click en "Import"
3. Selecciona el archivo `PulseOps.postman_collection.json`
4. La colección estará lista para usar

**Nota:** Recuerda reemplazar los IDs de ejemplo (`RESOURCE_ID`, `METRIC_ID`, etc.) con los IDs reales generados por tu API.
