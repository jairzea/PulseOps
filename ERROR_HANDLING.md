# Sistema Centralizado de Manejo de Errores

## Arquitectura

Sistema de manejo de errores centralizado que sigue los principios SOLID:

- **Responsabilidad Única**: Cada clase tiene una única razón para cambiar
- **Abierto/Cerrado**: Abierto a extensión, cerrado a modificación
- **Sustitución de Liskov**: Las clases derivadas pueden sustituir a sus clases base
- **Segregación de Interfaces**: Interfaces específicas en lugar de una genérica
- **Inversión de Dependencias**: Depender de abstracciones, no de implementaciones concretas

## Backend (NestJS)

### Estructura

```
apps/backend/src/common/
├── exceptions/
│   └── app.exception.ts        # Excepciones personalizadas
└── filters/
    └── global-exception.filter.ts  # Filtro global de excepciones
```

### Excepciones Personalizadas

Todas heredan de `AppException`:

```typescript
export abstract class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorCode: string,
    public readonly details?: unknown,
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
```

#### Tipos disponibles:

- **ValidationException** (400) - Errores de validación
- **ResourceNotFoundException** (404) - Recurso no encontrado
- **DuplicateResourceException** (409) - Recurso duplicado
- **BusinessLogicException** (422) - Error de lógica de negocio
- **DatabaseException** (500) - Error de base de datos
- **UnauthorizedException** (401) - No autorizado
- **ForbiddenException** (403) - Acceso prohibido

### Uso en Services

```typescript
import {
  ResourceNotFoundException,
  DuplicateResourceException,
  DatabaseException,
} from '../common/exceptions/app.exception';

async create(dto: CreateMetricDto, createdBy: string): Promise<Metric> {
  try {
    const existing = await this.metricModel.findOne({ key: dto.key }).exec();
    if (existing) {
      throw new DuplicateResourceException('Métrica', 'key', dto.key);
    }

    const metric = new this.metricModel({ ...dto, createdBy });
    return await metric.save();
  } catch (error) {
    if (error instanceof DuplicateResourceException) {
      throw error; // Re-lanzar excepciones conocidas
    }
    // Envolver errores desconocidos
    throw new DatabaseException('Error al crear la métrica', {
      originalError: error.message,
    });
  }
}
```

### Filtro Global

Configurado en `main.ts`:

```typescript
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

app.useGlobalFilters(new GlobalExceptionFilter());
```

**Respuesta estandarizada:**

```json
{
  "statusCode": 409,
  "message": "Métrica con key 'commits' ya existe",
  "errorCode": "DUPLICATE_RESOURCE",
  "details": {
    "resource": "Métrica",
    "field": "key",
    "value": "commits"
  },
  "timestamp": "2026-01-16T12:34:56.789Z",
  "path": "/metrics"
}
```

## Frontend (React)

### Estructura

```
apps/frontend/src/utils/errors/
├── AppError.ts          # Clases de error
├── ErrorFactory.ts      # Factory para crear errores (Patrón Factory)
├── ErrorHandler.ts      # Handler centralizado
└── index.ts            # Barrel export
```

### Clases de Error

Todas heredan de `AppError`:

```typescript
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  abstract getUserMessage(): string;
  abstract isRecoverable(): boolean;
}
```

#### Tipos disponibles:

- **ValidationError** (400) - Datos inválidos
- **NotFoundError** (404) - Recurso no encontrado
- **ConflictError** (409) - Conflicto (duplicado)
- **BusinessError** (422) - Error de lógica de negocio
- **NetworkError** (0) - Error de red/conexión
- **ServerError** (500) - Error del servidor
- **UnauthorizedError** (401) - No autorizado
- **ForbiddenError** (403) - Sin permisos
- **UnknownError** (0) - Error desconocido

### ErrorFactory - Patrón Factory

Crea instancias de `AppError` desde respuestas del backend:

```typescript
export class ErrorFactory {
  static fromBackendResponse(response: BackendErrorResponse): AppError {
    const creator = this.errorCreators.get(response.errorCode);
    
    if (creator) {
      return creator(response);
    }

    return this.fromStatusCode(response.statusCode, response.message, response.details);
  }

  // Permite extensión sin modificar el código base
  static registerErrorCreator(errorCode: string, creator: ErrorCreator): void {
    this.errorCreators.set(errorCode, creator);
  }
}
```

### ErrorHandler - Handler Centralizado

Procesa errores y ejecuta callbacks:

```typescript
export class ErrorHandler {
  static async handleHttpError(
    response: Response,
    customCallbacks?: ErrorHandlerCallbacks,
  ): Promise<never> {
    const errorResponse = await response.json();
    const appError = ErrorFactory.fromBackendResponse(errorResponse);
    this.executeCallbacks(appError, customCallbacks);
    throw appError;
  }

  static handleGenericError(
    error: unknown,
    customCallbacks?: ErrorHandlerCallbacks,
  ): never {
    const appError = error instanceof AppError
      ? error
      : ErrorFactory.fromFetchError(error);

    this.executeCallbacks(appError, customCallbacks);
    throw appError;
  }
}
```

### Uso en apiClient

```typescript
import { ErrorHandler } from '../utils/errors';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return await ErrorHandler.handleHttpError(response);
    }

    return response.json();
  } catch (error) {
    return ErrorHandler.handleGenericError(error);
  }
}
```

### Uso en Stores (Zustand)

```typescript
import { AppError } from '../utils/errors';

fetchMetrics: async () => {
  set({ loading: true, error: null });
  try {
    const metrics = await apiClient.getMetrics();
    set({ metrics, loading: false });
  } catch (error) {
    const errorMessage = error instanceof AppError 
      ? error.getUserMessage() 
      : 'Error al cargar métricas';
    set({ error: errorMessage, loading: false });
  }
}
```

## Extensibilidad

### Agregar una nueva excepción en Backend

```typescript
// 1. Crear la excepción en app.exception.ts
export class RateLimitException extends AppException {
  constructor(message: string, retryAfter: number) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', {
      retryAfter,
    });
  }
}

// 2. Usar en el servicio
if (requestCount > limit) {
  throw new RateLimitException('Demasiadas solicitudes', 60);
}
```

### Agregar un nuevo error en Frontend

```typescript
// 1. Crear la clase de error en AppError.ts
export class RateLimitError extends AppError {
  constructor(message: string, retryAfter: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
  }

  getUserMessage(): string {
    return `Demasiadas solicitudes. Intenta de nuevo en ${this.details.retryAfter}s`;
  }

  isRecoverable(): boolean {
    return true;
  }
}

// 2. Registrar en el factory (ErrorFactory.ts)
ErrorFactory.registerErrorCreator(
  'RATE_LIMIT_EXCEEDED',
  (response) => new RateLimitError(response.message, response.details.retryAfter)
);
```

## Configuración de Callbacks Globales

```typescript
// En main.tsx o App.tsx
import { ErrorHandler } from './utils/errors';

ErrorHandler.setDefaultCallbacks({
  onValidationError: (error) => {
    toast.error(error.getUserMessage());
  },
  onServerError: (error) => {
    toast.error('Error del servidor. Por favor, intenta más tarde.');
    console.error('[ServerError]', error);
  },
  onNetworkError: (error) => {
    toast.error('Sin conexión a internet');
  },
  onAnyError: (error) => {
    // Log global de errores
    console.error('[GlobalError]', error);
  },
});
```

## Beneficios

### ✅ Responsabilidad Única
- Cada clase tiene una única responsabilidad
- Excepciones: representar un tipo de error
- Factory: crear instancias de errores
- Handler: procesar y ejecutar acciones
- Filter: formatear respuestas HTTP

### ✅ Abierto/Cerrado
- Abierto a extensión: Agregar nuevos tipos de error sin modificar código existente
- Cerrado a modificación: El core no cambia cuando se agregan nuevos errores
- Factory permite registrar nuevos creadores dinámicamente

### ✅ Centralización
- Un único punto de entrada para errores HTTP (ErrorHandler)
- Un único filtro global en backend (GlobalExceptionFilter)
- Respuestas estandarizadas en toda la app

### ✅ Type Safety
- TypeScript garantiza tipos correctos
- Interfaces bien definidas
- IntelliSense completo

### ✅ Extensibilidad
- Fácil agregar nuevos tipos de error
- Sistema de callbacks configurable
- Registro dinámico de error creators

### ✅ UX Mejorada
- Mensajes de error user-friendly
- Separación entre mensajes técnicos y de usuario
- Recuperabilidad explícita de errores

### ✅ Debugging
- Stack traces preservados
- Details con contexto adicional
- Logs centralizados con diferentes niveles

## Testing

```typescript
// Backend
describe('MetricsService', () => {
  it('should throw DuplicateResourceException when key exists', async () => {
    await expect(service.create(dto, 'user123')).rejects.toThrow(
      DuplicateResourceException,
    );
  });
});

// Frontend
describe('ErrorFactory', () => {
  it('should create ValidationError from 400 response', () => {
    const error = ErrorFactory.fromStatusCode(400, 'Invalid data');
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.getUserMessage()).toBe('Los datos ingresados no son válidos');
  });
});
```

## Próximos pasos

1. ✅ Sistema de excepciones backend implementado
2. ✅ Sistema de errores frontend implementado
3. ✅ Integración con apiClient
4. ✅ Uso en metricsStore
5. ⏳ Agregar toast notifications (react-hot-toast)
6. ⏳ Implementar en resourcesStore
7. ⏳ Implementar en recordsStore
8. ⏳ Tests unitarios
9. ⏳ Documentar patrones de uso
