#!/bin/bash

echo "🔍 Iniciando análisis de código con SonarJS..."
echo "=============================================="
echo ""

# Backend Analysis
echo "📦 Analizando Backend..."
cd apps/backend
npx eslint src --ext .ts --format json --output-file ../../sonar-backend-report.json || true
npx eslint src --ext .ts || true
cd ../..

echo ""
echo "📦 Analizando Frontend..."
cd apps/frontend  
npx eslint src --ext .ts,.tsx --format json --output-file ../../sonar-frontend-report.json || true
npx eslint src --ext .ts,.tsx || true
cd ../..

echo ""
echo "📊 Generando reporte consolidado..."
echo ""
echo "✅ Análisis completado. Revisa los archivos:"
echo "   - sonar-backend-report.json"
echo "   - sonar-frontend-report.json"
