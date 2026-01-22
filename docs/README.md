# 📚 PulseOps - Documentación

## 🗂️ Estructura de Documentación

```
docs/
├── README.md                        # Este archivo (índice principal)
├── cypress/                         # 🧪 Documentación de Cypress E2E
│   ├── INDEX.md                     # Índice de documentación Cypress
│   ├── README.md                    # Guía completa de Cypress
│   ├── IMPLEMENTATION.md            # Detalles de implementación
│   └── DEPENDENCIES.md              # Guía de instalación
├── guides/                          # 📖 Guías de desarrollo
│   ├── Lienamiento de...md         # Lineamientos de pruebas automatizadas
│   ├── DOCKER.md                   # Configuración Docker
│   ├── QUICKSTART.md               # Inicio rápido
│   └── PULSE_LOADER.md             # Carga de datos
├── api/                            # 🌐 Documentación de API
│   ├── API_TESTING.md              # Guía de testing de API
│   └── PulseOps.postman...json     # Colección de Postman
├── specs/                          # 📐 Especificaciones técnicas
│   ├── Diseño de Interfaz...md     # Motor de análisis
│   ├── ESPECIFICACIÓN FORMAL...md  # Dominio formal
│   ├── Fórmulas de las...md        # Fórmulas de condiciones
│   ├── Motor de analisis...md      # Motor de análisis
│   └── RELACION_RECURSOS...md      # Relación recursos-métricas
├── EXECUTIVE_SUMMARY.md            # 📊 Resumen ejecutivo del proyecto
└── IMPLEMENTATION_SUMMARY.md       # 📋 Resumen de implementación actual
```

---

## 📖 Documentación por Categoría

### 🧪 Testing y Calidad

#### Cypress E2E Testing
- **[Cypress Index](./cypress/INDEX.md)** - Índice completo de documentación Cypress
- **[Cypress README](./cypress/README.md)** - Guía completa de arquitectura
- **[Implementation](./cypress/IMPLEMENTATION.md)** - Detalles de implementación
- **[Dependencies](./cypress/DEPENDENCIES.md)** - Instalación y configuración
- **[Lineamientos](./guides/Lienamiento%20de%20implementación%20de%20pruebas%20automatizadas.md)** - Estándares de pruebas

#### API Testing
- **[API Testing Guide](./api/API_TESTING.md)** - Guía de testing de API
- **[Postman Collection](./api/PulseOps.postman_collection.json)** - Colección de endpoints

### 📐 Especificaciones Técnicas

#### Arquitectura del Sistema
- **[Especificación Formal del Dominio](./specs/ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)** - Definición del modelo de dominio
- **[Motor de Análisis](./specs/Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md)** - Especificación del motor
- **[Diseño de Interfaz Técnica](./specs/Diseño%20de%20Interfaz%20Técnica%20–%20Motor%20de%20Análisis%20de%20Inclinación%20(v2).md)** - Interfaz del motor

#### Lógica de Negocio
- **[Fórmulas de Condiciones](./specs/Fórmulas%20de%20las%20condiciones.md)** - Fórmulas y cálculos
- **[Relación Recursos-Métricas](./specs/RELACION_RECURSOS_METRICAS.md)** - Mapeo de recursos y métricas

### 📊 Resúmenes Ejecutivos

- **[Executive Summary](./EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo del proyecto
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Estado actual de implementación

---

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
