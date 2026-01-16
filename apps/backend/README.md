# PulseOps Backend

**API REST del sistema PulseOps, construida con NestJS y MongoDB.**

El backend expone endpoints para gestión de recursos, métricas, análisis de inclinación, reglas de condiciones, playbooks de respuesta y visualizaciones.

---

## Tecnologías

- **NestJS** 10.x - Framework Node.js con arquitectura modular
- **TypeScript** - Strict mode habilitado
- **MongoDB** + **Mongoose** - Persistencia y ODM
- **@pulseops/analysis-engine** - Motor de análisis de inclinación
- **@pulseops/shared-types** - Tipos compartidos
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de datos

---

## Arquitectura

### Módulos Implementados

```
src/
├── main.ts                  # Bootstrap de la aplicación
├── app.module.ts            # Módulo raíz (orquestador)
├── app.controller.ts        # Endpoints básicos (/, /health)
├── app.service.ts           # Lógica básica
│
├── analysis/                # 📊 Análisis de inclinación y tendencias
│   ├── analysis.controller.ts
│   ├── analysis.service.ts
│   └── analysis.module.ts
│
├── charts/                  # 📈 Configuración de visualizaciones
│   ├── charts.controller.ts
│   ├── charts.service.ts
│   ├── charts.module.ts
│   ├── dto/
│   │   └── chart.dto.ts
│   └── schemas/
│       └── chart.schema.ts
│
├── metrics/                 # 📏 Definición de métricas
│   ├── metrics.controller.ts
│   ├── metrics.service.ts
│   ├── metrics.module.ts
│   ├── dto/
│   │   └── metric.dto.ts
│   └── schemas/
│       └── metric.schema.ts
│
├── playbooks/               # 📋 Playbooks de respuesta ante condiciones
│   ├── playbooks.controller.ts
│   ├── playbooks.service.ts
│   ├── playbooks.module.ts
│   ├── dto/
│   │   └── upsert-playbook.dto.ts
│   └── schemas/
│
├── records/                 # 📝 Registros históricos de métricas
│   ├── records.controller.ts
│   ├── records.service.ts
│   ├── records.module.ts
│   ├── dto/
│   └── schemas/
│
├── resources/               # 🎯 Recursos (equipos, proyectos, sprints)
│   ├── resources.controller.ts
│   ├── resources.service.ts
│   ├── resources.module.ts
│   ├── dto/
│   └── schemas/
│
├── rules/                   # ⚙️ Motor de reglas y condiciones
│   ├── rules.controller.ts
│   ├── rules.service.ts
│   ├── rules.module.ts
│   ├── dto/
│   └── schemas/
│
├── auth/                    # 🔐 Autenticación (en desarrollo)
│   └── guards/
│       ├── auth0.guard.ts
│       └── demo-auth.guard.ts
│
└── common/                  # 🛠️ Utilidades compartidas
    ├── decorators/
    │   └── current-user.decorator.ts
    └── interfaces/
        └── user.interface.ts
```

### Principios de Diseño

- **Modularidad**: Cada funcionalidad en su propio módulo NestJS
- **Separation of Concerns**: Controladores, servicios y schemas separados
- **DTOs validados**: Validación automática con class-validator
- **Inyección de dependencias**: Uso extensivo de DI de NestJS
- **Motor desacoplado**: El análisis de inclinación es un package independiente

---

## Scripts Disponibles

```bash
# Desarrollo con watch mode (recomendado)
npm run dev

# Iniciar servidor (sin watch)
npm run start

# Modo debug
npm run start:debug

# Compilar para producción
npm run build

# Iniciar en modo producción
npm run start:prod

# Verificar tipos TypeScript
npm run typecheck

# Formatear código
npm run format

# Lint y auto-fix
npm run lint

# Limpiar builds
npm run clean
```

---

## Endpoints Principales

### Básicos
```
GET  /              # Mensaje de bienvenida
GET  /health        # Health check
```

### Resources (Recursos)
```
GET     /api/resources           # Listar todos los recursos
POST    /api/resources           # Crear recurso
GET     /api/resources/:id       # Obtener recurso por ID
PATCH   /api/resources/:id       # Actualizar recurso
DELETE  /api/resources/:id       # Eliminar recurso
```

### Metrics (Métricas)
```
GET     /api/metrics             # Listar métricas
POST    /api/metrics             # Crear métrica
GET     /api/metrics/:id         # Obtener métrica
PATCH   /api/metrics/:id         # Actualizar métrica
DELETE  /api/metrics/:id         # Eliminar métrica
```

### Records (Registros)
```
GET     /api/records                      # Listar registros (con filtros)
POST    /api/records                      # Crear registro
GET     /api/records/resource/:resourceId # Registros de un recurso
GET     /api/records/metric/:metricKey    # Registros de una métrica
```

### Analysis (Análisis)
```
POST    /api/analysis/run                 # Ejecutar análisis de inclinación
GET     /api/analysis/resource/:id        # Análisis de un recurso
GET     /api/analysis/metric/:key         # Análisis de una métrica
```

### Charts (Visualizaciones)
```
GET     /api/charts                # Listar configuraciones de charts
POST    /api/charts                # Crear chart
GET     /api/charts/:id            # Obtener chart
PATCH   /api/charts/:id            # Actualizar chart
DELETE  /api/charts/:id            # Eliminar chart
```

### Rules (Reglas)
```
GET     /api/rules                 # Listar reglas
POST    /api/rules                 # Crear regla
GET     /api/rules/:id             # Obtener regla
PATCH   /api/rules/:id             # Actualizar regla
DELETE  /api/rules/:id             # Eliminar regla
POST    /api/rules/:id/simulate    # Simular impacto de regla
```

### Playbooks (Playbooks)
```
GET     /api/playbooks             # Listar playbooks
POST    /api/playbooks             # Crear playbook
GET     /api/playbooks/:id         # Obtener playbook
PUT     /api/playbooks/:id         # Actualizar playbook (upsert)
DELETE  /api/playbooks/:id         # Eliminar playbook
```

**Documentación completa**: Ver [`API_TESTING.md`](../../API_TESTING.md) y colección de Postman.

---

## Desarrollo

### Iniciar el servidor

```bash
# Desde la raíz del monorepo
cd apps/backend
npm run dev
```

El servidor se ejecuta en: **http://localhost:3000**

### Variables de Entorno

Crear un archivo `.env` en `apps/backend/`:

```env
# Puerto del servidor
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/pulseops

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173

# Auth (opcional, para desarrollo)
JWT_SECRET=your-secret-key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
```

### Testing con Postman

1. Importar [`PulseOps.postman_collection.json`](../../PulseOps.postman_collection.json)
2. Configurar variables:
   - `baseUrl`: `http://localhost:3000`
3. Ejecutar requests de prueba

Ver [`API_TESTING.md`](../../API_TESTING.md) para ejemplos completos.

---

## Integración con el Motor

El backend integra el **motor de análisis de inclinación** (`@pulseops/analysis-engine`):

```typescript
import { analyzeInclination } from '@pulseops/analysis-engine';

// En analysis.service.ts
const result = analyzeInclination({
  resourceId: 'team-alpha',
  metricKey: 'bugs-open',
  history: [
    { week: '2024-W01', value: 15 },
    { week: '2024-W02', value: 12 },
    { week: '2024-W03', value: 10 },
  ]
});

// result:
// {
//   condition: 'OK',
//   inclination: -2.5,
//   explanation: 'Mejorando: La métrica decrece 2.5 unidades por semana'
// }
```

Ver: [`Motor de analisis de inclinación y condiciones.md`](../../Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md)

---

## Base de Datos

### Colecciones MongoDB

- `resources` - Equipos, proyectos, sprints
- `metrics` - Definiciones de métricas
- `records` - Valores históricos de métricas
- `charts` - Configuraciones de visualización
- `rules` - Reglas de evaluación de condiciones
- `playbooks` - Playbooks de respuesta

### Conexión

La conexión a MongoDB se configura en `app.module.ts`:

```typescript
MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseops')
```

---

## Configuración

El proyecto usa:

- **TypeScript strict mode** - Máxima seguridad de tipos
- **ESLint** - Linting con reglas de NestJS
- **Prettier** - Formateo consistente
- **CORS** - Habilitado para frontend local
- **Validation Pipe** - Validación automática de DTOs
- **Transform** - Transformación automática de tipos

---

## Próximos Pasos

- [ ] Implementar autenticación JWT completa
- [ ] Integración real con Jira API
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Sistema de caché con Redis
- [ ] Tests unitarios e integración
- [ ] Documentación OpenAPI/Swagger

---

## Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [`Motor de analisis de inclinación y condiciones.md`](../../Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md)
- [`ESPECIFICACIÓN FORMAL DEL DOMINIO.md`](../../ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)
