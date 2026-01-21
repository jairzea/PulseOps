# PulseOps - Documentación

## 📚 Índice de Documentación

### 🚀 Guías de Inicio

- [**QUICKSTART.md**](./guides/QUICKSTART.md) - Guía rápida para comenzar con el proyecto
- [**DOCKER.md**](./guides/DOCKER.md) - Configuración y uso de Docker
- [**PULSE_LOADER.md**](./guides/PULSE_LOADER.md) - Carga de datos y configuración inicial

### 📖 Especificaciones Técnicas

- [**ESPECIFICACIÓN FORMAL DEL DOMINIO.md**](./specs/ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md) - Definición formal del modelo de dominio
- [**Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md**](./specs/Diseño%20de%20Interfaz%20Técnica%20–%20Motor%20de%20Análisis%20de%20Inclinación%20(v2).md) - Arquitectura del motor de análisis
- [**Motor de analisis de inclinación y condiciones.md**](./specs/Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md) - Detalles de implementación del motor
- [**Fórmulas de las condiciones.md**](./specs/Fórmulas%20de%20las%20condiciones.md) - Fórmulas matemáticas para evaluación de condiciones
- [**RELACION_RECURSOS_METRICAS.md**](./specs/RELACION_RECURSOS_METRICAS.md) - Relación entre recursos y métricas

### 🔌 API y Testing

- [**API_TESTING.md**](./api/API_TESTING.md) - Documentación de endpoints y ejemplos de uso
- [**PulseOps.postman_collection.json**](./api/PulseOps.postman_collection.json) - Colección de Postman

### 🛠️ Guías de Desarrollo

- [**ERROR_HANDLING.md**](./guides/ERROR_HANDLING.md) - Manejo de errores y excepciones
- [**ERROR_HANDLING_SUMMARY.md**](./guides/ERROR_HANDLING_SUMMARY.md) - Resumen de estrategias de error
- [**PLANTILLA ESTÁNDAR DE PROMPTS — PULSEOPS.md**](./guides/PLANTILLA%20ESTÁNDAR%20DE%20PROMPTS%20—%20PULSEOPS.md) - Guía para uso de IA en desarrollo

### 📝 Documentos Raíz

- [**../README.md**](../README.md) - README principal del proyecto
- [**../context.md**](../context.md) - Contexto y memoria del proyecto

## 🗂️ Estructura de Carpetas

```
docs/
├── README.md                    # Este archivo
├── api/                         # Documentación de API
│   ├── API_TESTING.md
│   └── PulseOps.postman_collection.json
├── guides/                      # Guías operativas
│   ├── QUICKSTART.md
│   ├── DOCKER.md
│   ├── PULSE_LOADER.md
│   ├── ERROR_HANDLING.md
│   ├── ERROR_HANDLING_SUMMARY.md
│   └── PLANTILLA ESTÁNDAR DE PROMPTS — PULSEOPS.md
└── specs/                       # Especificaciones técnicas
    ├── ESPECIFICACIÓN FORMAL DEL DOMINIO.md
    ├── Diseño de Interfaz Técnica – Motor de Análisis de Inclinación (v2).md
    ├── Motor de analisis de inclinación y condiciones.md
    ├── Fórmulas de las condiciones.md
    └── RELACION_RECURSOS_METRICAS.md
```

## 🔍 Cómo Usar Esta Documentación

1. **Para empezar**: Lee [QUICKSTART.md](./guides/QUICKSTART.md)
2. **Para entender el dominio**: Revisa [ESPECIFICACIÓN FORMAL DEL DOMINIO.md](./specs/ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)
3. **Para usar la API**: Consulta [API_TESTING.md](./api/API_TESTING.md)
4. **Para desarrollar**: Lee [context.md](../context.md) y las guías en `guides/`
5. **Para arquitectura**: Revisa los documentos en `specs/`
