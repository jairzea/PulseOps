# Guía Rápida - Resource Dashboard

## 🚀 Iniciar el Proyecto

### 1. Iniciar MongoDB

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Iniciar Backend

```bash
cd apps/backend
npm run dev
```

Backend en: `http://localhost:3000`

### 3. Iniciar Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend en: `http://localhost:5173`

## 📊 Poblar con Datos de Prueba

### Opción A: Usando Postman

1. Importa `PulseOps.postman_collection.json`
2. Ejecuta los requests en este orden:
   - Create Resource (Team Alpha)
   - Create Metric (Bugs Open)
   - Create Record (varias semanas)
   - Evaluate Analysis

### Opción B: Usando curl

```bash
# 1. Crear un recurso
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "team-alpha",
    "name": "Team Alpha",
    "type": "TEAM",
    "description": "Core development team"
  }'

# 2. Crear una métrica
curl -X POST http://localhost:3000/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metricKey": "bugs-open",
    "name": "Open Bugs",
    "description": "Number of open bugs",
    "unit": "bugs",
    "targetDirection": "LOWER_IS_BETTER"
  }'

# 3. Crear registros históricos
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "team-alpha",
    "metricKey": "bugs-open",
    "week": "2026-W01",
    "value": 15
  }'

curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "team-alpha",
    "metricKey": "bugs-open",
    "week": "2026-W02",
    "value": 12
  }'

curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "team-alpha",
    "metricKey": "bugs-open",
    "week": "2026-W03",
    "value": 8
  }'

# 4. Ejecutar análisis
curl "http://localhost:3000/analysis/evaluate?resourceId=team-alpha&metricKey=bugs-open"
```

## ✅ Verificar que Funciona

1. Abre `http://localhost:5173`
2. Deberías ver:
   - Selector de recursos con "Team Alpha"
   - Selector de métricas con "Open Bugs"
   - Gráfico con 3 puntos y línea de tendencia
   - Condición operativa (probablemente "OK" o "MEJORANDO")
   - Fórmula aplicada con pasos

## 🎨 Features del Dashboard

### Selectores
- Cambiar recurso → actualiza todo automáticamente
- Cambiar métrica → recalcula análisis y gráfico

### Gráfico
- Línea azul = valores reales
- Línea morada punteada = tendencia lineal
- Hover para ver detalles

### Resumen de Condición
- Badge con % de confianza
- Inclinación (positiva/negativa)
- Señales detectadas
- Timestamp de evaluación

### Fórmula
- Pasos numerados
- Basado en condiciones de Hubbard
- UI educativa

## 🐛 Troubleshooting

### "No resources available"
→ Backend no está corriendo o no hay datos
→ Ejecuta los curls de arriba

### "No data available" en el gráfico
→ No hay records para esa combinación recurso+métrica
→ Crea records con los curls

### Error de conexión
→ Verifica que backend esté en puerto 3000
→ Revisa CORS en backend (debe permitir localhost:5173)

### TypeScript errors
```bash
npm run typecheck
```

## 📝 Próximos Pasos

- Agregar más recursos y métricas
- Poblar con datos realistas (varias semanas)
- Probar diferentes condiciones (EMERGENCIA, PELIGRO, etc.)
- Experimentar con diferentes tipos de métricas

## 📚 Documentación

- [Frontend DASHBOARD.md](apps/frontend/DASHBOARD.md)
- [Backend README](apps/backend/README.md)
- [API Testing](API_TESTING.md)
