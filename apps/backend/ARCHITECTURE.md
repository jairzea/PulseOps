# Backend - Estructura del Proyecto

API REST construida con NestJS siguiendo principios de Domain-Driven Design.

## 📁 Estructura de Carpetas

```
src/
├── main.ts                     # Entry point de la aplicación
├── app.module.ts               # Módulo raíz
├── app.controller.ts           # Controlador raíz (health check)
├── app.service.ts              # Servicio raíz
│
├── auth/                       # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts      # Endpoints de auth (login, register)
│   ├── auth.service.ts         # Lógica de autenticación
│   ├── decorators/            # Decoradores personalizados
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/                # Guards de autenticación
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── demo-or-jwt.guard.ts
│   └── strategies/            # Estrategias de passport
│       └── jwt.strategy.ts
│
├── users/                     # Módulo de usuarios
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── schemas/
│   │   └── user.schema.ts     # Mongoose schema
│   └── dto/
│       └── user.dto.ts        # Data Transfer Objects
│
├── resources/                 # Módulo de recursos (team members)
│   ├── resources.module.ts
│   ├── resources.controller.ts
│   ├── resources.service.ts
│   ├── schemas/
│   │   └── resource.schema.ts
│   └── dto/
│       └── resource.dto.ts
│
├── metrics/                   # Módulo de métricas
│   ├── metrics.module.ts
│   ├── metrics.controller.ts
│   ├── metrics.service.ts
│   ├── schemas/
│   │   └── metric.schema.ts
│   └── dto/
│       └── metric.dto.ts
│
├── records/                   # Módulo de registros de métricas
│   ├── records.module.ts
│   ├── records.controller.ts
│   ├── records.service.ts
│   ├── schemas/
│   │   └── metric-record.schema.ts
│   └── dto/
│       └── record.dto.ts
│
├── analysis/                  # Módulo de análisis
│   ├── analysis.module.ts
│   ├── analysis.controller.ts
│   └── analysis.service.ts    # Integración con @pulseops/analysis-engine
│
├── conditions/                # Módulo de condiciones operativas
│   ├── conditions.module.ts
│   ├── conditions.controller.ts
│   ├── conditions.service.ts
│   └── schemas/
│       └── condition-metadata.schema.ts
│
├── rules/                     # Módulo de reglas de negocio
│   ├── rules.module.ts
│   ├── rules.controller.ts
│   ├── rules.service.ts
│   ├── schemas/
│   │   └── metric-rule-config.schema.ts
│   └── dto/
│       └── rule.dto.ts
│
├── playbooks/                 # Módulo de playbooks
│   ├── playbooks.module.ts
│   ├── playbooks.controller.ts
│   ├── playbooks.service.ts
│   ├── schemas/
│   │   └── condition-playbook.schema.ts
│   └── dto/
│       └── upsert-playbook.dto.ts
│
├── charts/                    # Módulo de gráficos y dashboards
│   ├── charts.module.ts
│   ├── charts.controller.ts
│   ├── charts.service.ts
│   ├── schemas/
│   │   └── chart.schema.ts
│   └── dto/
│       └── chart.dto.ts
│
├── configuration/             # Módulo de configuración
│   ├── configuration.module.ts
│   ├── configuration.controller.ts
│   ├── configuration.service.ts
│   ├── rules.service.ts       # Servicio de reglas de análisis
│   ├── schemas/
│   │   ├── analysis-configuration.schema.ts
│   │   └── business-rule.schema.ts
│   └── dto/
│       ├── analysis-configuration.dto.ts
│       └── business-rule.dto.ts
│
├── common/                    # Código compartido
│   ├── decorators/           # Decoradores comunes
│   │   └── current-user.decorator.ts
│   ├── dto/                  # DTOs comunes
│   │   └── pagination-query.dto.ts
│   ├── exceptions/           # Excepciones personalizadas
│   │   └── app.exception.ts
│   ├── filters/              # Exception filters
│   │   └── global-exception.filter.ts
│   └── interfaces/           # Interfaces compartidas
│       ├── paginated-response.interface.ts
│       └── user.interface.ts
│
└── scripts/                  # Scripts de utilidad
    ├── seed-admin.ts         # Crear usuario admin
    ├── seed-demo-data.ts     # Poblar datos de demo
    └── fix-admin.ts          # Reparar usuario admin
```

## 🏗️ Arquitectura

### Principios Aplicados

- **Domain-Driven Design**: Módulos organizados por dominio de negocio
- **Clean Architecture**: Separación de capas (controllers, services, repositories)
- **SOLID Principles**: Código mantenible y extensible
- **Dependency Injection**: IoC container de NestJS

### Patrones de Diseño

#### Módulos por Dominio
Cada módulo encapsula:
- **Controller**: Endpoints HTTP, validación de entrada
- **Service**: Lógica de negocio
- **Schema**: Modelo de datos Mongoose
- **DTO**: Objetos de transferencia de datos

#### Ejemplo: Módulo de Métricas

```
metrics/
├── metrics.module.ts          # Configuración del módulo
├── metrics.controller.ts      # GET /metrics, POST /metrics, etc.
├── metrics.service.ts         # Lógica: crear, leer, actualizar, eliminar
├── schemas/
│   └── metric.schema.ts       # Mongoose schema para MongoDB
└── dto/
    └── metric.dto.ts          # CreateMetricDto, UpdateMetricDto
```

### Guards y Middleware

- **JwtAuthGuard**: Valida JWT en headers
- **RolesGuard**: Verifica roles de usuario (admin/user)
- **DemoOrJwtGuard**: Permite acceso en modo demo o con JWT
- **GlobalExceptionFilter**: Manejo centralizado de errores

### Validación

- **class-validator**: Decoradores para validación de DTOs
- **class-transformer**: Transformación automática de datos
- Pipes de validación habilitados globalmente

## 🔌 API Endpoints

Ver [../../docs/api/API_TESTING.md](../../docs/api/API_TESTING.md) para documentación completa.

### Principales Grupos

- **Auth**: `/auth/*` - Autenticación y registro
- **Users**: `/users/*` - Gestión de usuarios
- **Resources**: `/resources/*` - Gestión de recursos
- **Metrics**: `/metrics/*` - CRUD de métricas
- **Records**: `/records/*` - Registros de métricas
- **Analysis**: `/analysis/*` - Análisis de inclinación
- **Conditions**: `/conditions/*` - Condiciones operativas
- **Rules**: `/rules/*` - Reglas de negocio
- **Playbooks**: `/playbooks/*` - Playbooks de acciones
- **Charts**: `/charts/*` - Dashboards y gráficos

## 🗄️ Base de Datos

### MongoDB + Mongoose

- **Conexión**: URI configurada en `.env`
- **Schemas**: Definidos con decoradores `@Schema()`
- **Relaciones**: Referencias con `@Prop({ type: Types.ObjectId, ref: 'Model' })`
- **Índices**: Definidos en schemas para optimización

### Colecciones Principales

- `users`: Usuarios del sistema
- `metrics`: Definiciones de métricas
- `metricrecords`: Registros históricos de métricas
- `resources`: Recursos (team members)
- `conditions`: Metadatos de condiciones
- `rules`: Reglas de análisis
- `playbooks`: Playbooks de acciones
- `charts`: Configuraciones de dashboards

## 🔐 Autenticación y Autorización

### JWT (JSON Web Tokens)

- Token generado en `/auth/login`
- Incluye: `userId`, `email`, `role`
- Validado por `JwtAuthGuard`
- Expiración configurable

### Roles

- **admin**: Acceso completo al sistema
- **user**: Acceso limitado a recursos propios

### Decoradores

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('all')
getAllUsers() { ... }
```

## 🧪 Testing

```bash
# Unit tests
npm run test --workspace=apps/backend

# E2E tests
npm run test:e2e --workspace=apps/backend

# Coverage
npm run test:cov --workspace=apps/backend
```

## 🚀 Scripts

```bash
# Desarrollo
npm run dev --workspace=apps/backend

# Build
npm run build --workspace=apps/backend

# Producción
npm run start:prod --workspace=apps/backend

# Seed admin
npm run seed:admin --workspace=apps/backend

# Seed demo data
npm run seed:demo --workspace=apps/backend
```

## 📦 Dependencias Principales

- **@nestjs/core**: Framework base
- **@nestjs/mongoose**: Integración con MongoDB
- **@nestjs/jwt**: Autenticación JWT
- **@nestjs/passport**: Estrategias de autenticación
- **class-validator**: Validación de DTOs
- **bcrypt**: Hash de contraseñas
- **@pulseops/analysis-engine**: Motor de análisis

## 🌐 Variables de Entorno

Crear `.env` basado en `.env.example`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pulseops

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🔗 Referencias

- [Documentación NestJS](https://docs.nestjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [API Testing Guide](../../docs/api/API_TESTING.md)
- [Especificación del Dominio](../../docs/specs/ESPECIFICACIÓN%20FORMAL%20DEL%20DOMINIO.md)
