# Ejemplo de Refactorización - Separación de apiClient

## Problema Actual

El archivo `apiClient.ts` tiene 405 líneas y maneja todas las entidades del sistema, violando el **Interface Segregation Principle**.

## Solución Propuesta

### 1. Crear Cliente HTTP Base

```typescript
// services/api/httpClient.ts
import { ErrorHandler } from '../../utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const headers = {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw await ErrorHandler.handleHttpError(response);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
```

### 2. Crear Servicios Específicos

```typescript
// services/api/metricsApi.ts
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';
import type { 
  Metric, 
  CreateMetricDto, 
  UpdateMetricDto,
  PaginationParams,
  PaginatedResponse 
} from '../../types';

export interface MetricsApi {
  getAll(resourceId?: string): Promise<Metric[]>;
  getPaginated(params: PaginationParams): Promise<PaginatedResponse<Metric>>;
  getById(id: string): Promise<Metric>;
  create(data: CreateMetricDto): Promise<Metric>;
  update(id: string, data: UpdateMetricDto): Promise<Metric>;
  delete(id: string): Promise<void>;
}

class MetricsApiImpl implements MetricsApi {
  private readonly basePath = '/metrics';

  async getAll(resourceId?: string): Promise<Metric[]> {
    const query = resourceId ? `?resourceId=${resourceId}` : '';
    return httpClient.get<Metric[]>(`${this.basePath}${query}`);
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Metric>> {
    const query = buildQueryString(params);
    return httpClient.get<PaginatedResponse<Metric>>(`${this.basePath}/paginated${query}`);
  }

  async getById(id: string): Promise<Metric> {
    return httpClient.get<Metric>(`${this.basePath}/${id}`);
  }

  async create(data: CreateMetricDto): Promise<Metric> {
    return httpClient.post<Metric>(this.basePath, data);
  }

  async update(id: string, data: UpdateMetricDto): Promise<Metric> {
    return httpClient.patch<Metric>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const metricsApi = new MetricsApiImpl();
```

```typescript
// services/api/resourcesApi.ts
import { httpClient } from './httpClient';
import { buildQueryString } from '../../utils/query';
import type { 
  Resource, 
  CreateResourceDto, 
  UpdateResourceDto,
  ResourceStats,
  PaginationParams,
  PaginatedResponse 
} from '../../types';

export interface ResourcesApi {
  getAll(): Promise<Resource[]>;
  getPaginated(params: PaginationParams): Promise<PaginatedResponse<Resource>>;
  getStats(): Promise<ResourceStats>;
  getById(id: string): Promise<Resource>;
  create(data: CreateResourceDto): Promise<Resource>;
  update(id: string, data: UpdateResourceDto): Promise<Resource>;
  delete(id: string): Promise<void>;
}

class ResourcesApiImpl implements ResourcesApi {
  private readonly basePath = '/resources';

  async getAll(): Promise<Resource[]> {
    return httpClient.get<Resource[]>(this.basePath);
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Resource>> {
    const query = buildQueryString(params);
    return httpClient.get<PaginatedResponse<Resource>>(`${this.basePath}/paginated${query}`);
  }

  async getStats(): Promise<ResourceStats> {
    return httpClient.get<ResourceStats>(`${this.basePath}/stats`);
  }

  async getById(id: string): Promise<Resource> {
    return httpClient.get<Resource>(`${this.basePath}/${id}`);
  }

  async create(data: CreateResourceDto): Promise<Resource> {
    return httpClient.post<Resource>(this.basePath, data);
  }

  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    return httpClient.patch<Resource>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const resourcesApi = new ResourcesApiImpl();
```

### 3. Mantener Facade para Compatibilidad (Opcional)

```typescript
// services/apiClient.ts (Facade para compatibilidad)
import { metricsApi } from './api/metricsApi';
import { resourcesApi } from './api/resourcesApi';
import { recordsApi } from './api/recordsApi';
import { playbooksApi } from './api/playbooksApi';
import { analysisApi } from './api/analysisApi';

/**
 * @deprecated Use specific API services instead (metricsApi, resourcesApi, etc.)
 * This facade is maintained for backwards compatibility only.
 */
export const apiClient = {
  // Metrics
  getMetrics: metricsApi.getAll,
  getMetricsPaginated: metricsApi.getPaginated,
  getMetric: metricsApi.getById,
  createMetric: metricsApi.create,
  updateMetric: metricsApi.update,
  deleteMetric: metricsApi.delete,

  // Resources
  getResources: resourcesApi.getAll,
  getResourcesPaginated: resourcesApi.getPaginated,
  getResourcesStats: resourcesApi.getStats,
  getResource: resourcesApi.getById,
  createResource: resourcesApi.create,
  updateResource: resourcesApi.update,
  deleteResource: resourcesApi.delete,

  // Records
  getRecords: recordsApi.getAll,
  getRecordsPaginated: recordsApi.getPaginated,
  createRecord: recordsApi.create,
  updateRecord: recordsApi.update,
  deleteRecord: recordsApi.delete,

  // Playbooks
  getAllPlaybooks: playbooksApi.getAll,
  getPlaybook: playbooksApi.getByCondition,
  updatePlaybook: playbooksApi.update,

  // Analysis
  analyzeMetric: analysisApi.analyzeMetric,
};

// Export specific APIs
export { metricsApi, resourcesApi, recordsApi, playbooksApi, analysisApi };
```

### 4. Actualizar Uso en Componentes

#### Antes (Acoplamiento)
```tsx
// ❌ pages/MetricsPage.tsx
import { apiClient } from '../services/apiClient';

const loadMetrics = async () => {
    const response = await apiClient.getMetricsPaginated(params);
    setMetrics(response.data);
};
```

#### Después (Desacoplado)
```tsx
// ✅ pages/MetricsPage.tsx
import { metricsApi } from '../services/api/metricsApi';

const loadMetrics = async () => {
    const response = await metricsApi.getPaginated(params);
    setMetrics(response.data);
};
```

### 5. Actualizar Stores con Inyección de Dependencias

#### Antes
```tsx
// ❌ stores/metricsStore.ts
import { apiClient } from '../services/apiClient';

export const useMetricsStore = create<MetricsState>((set) => ({
    fetchMetrics: async () => {
        const metrics = await apiClient.getMetrics();
        set({ metrics });
    }
}));
```

#### Después
```tsx
// ✅ stores/metricsStore.ts
import type { MetricsApi } from '../services/api/metricsApi';
import { metricsApi as defaultMetricsApi } from '../services/api/metricsApi';

export const createMetricsStore = (api: MetricsApi = defaultMetricsApi) => {
    return create<MetricsState>((set) => ({
        fetchMetrics: async () => {
            const metrics = await api.getAll();
            set({ metrics });
        }
    }));
};

// Instancia por defecto
export const useMetricsStore = createMetricsStore();

// Para testing
export const createTestMetricsStore = (mockApi: MetricsApi) => {
    return createMetricsStore(mockApi);
};
```

### 6. Testing Simplificado

```typescript
// __tests__/stores/metricsStore.test.ts
import { createTestMetricsStore } from '../../stores/metricsStore';
import type { MetricsApi } from '../../services/api/metricsApi';

describe('MetricsStore', () => {
    it('should fetch metrics successfully', async () => {
        // Mock solo lo que necesitas
        const mockApi: MetricsApi = {
            getAll: jest.fn().mockResolvedValue([
                { id: '1', label: 'Test Metric' }
            ]),
            // otros métodos pueden ser stubs
            getPaginated: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const store = createTestMetricsStore(mockApi);
        
        await store.getState().fetchMetrics();
        
        expect(mockApi.getAll).toHaveBeenCalled();
        expect(store.getState().metrics).toHaveLength(1);
    });
});
```

## Beneficios de la Refactorización

### ✅ Mejoras SOLID
- **SRP**: Cada servicio tiene una sola responsabilidad
- **OCP**: Fácil agregar nuevas entidades sin modificar existentes
- **ISP**: Clientes solo dependen de interfaces que usan
- **DIP**: Dependencia de abstracciones, no implementaciones

### ✅ Mejoras de Testing
- Fácil mockear servicios específicos
- Tests más rápidos (no cargan todo apiClient)
- Mejor aislamiento de tests

### ✅ Mejoras de Mantenibilidad
- Archivos más pequeños y focalizados
- Cambios localizados (cambio en Metrics no afecta Resources)
- Más fácil navegar el código

### ✅ Mejoras de Performance
- Tree-shaking mejorado (importas solo lo que usas)
- Bundle más pequeño para páginas específicas
- Code splitting más efectivo

## Plan de Migración Gradual

1. **Fase 1**: Crear nuevos servicios (metricsApi, resourcesApi, etc.)
2. **Fase 2**: Actualizar stores para usar nuevos servicios
3. **Fase 3**: Actualizar páginas nuevas para usar servicios específicos
4. **Fase 4**: Migrar páginas existentes gradualmente
5. **Fase 5**: Marcar apiClient como deprecated
6. **Fase 6**: Remover facade cuando todas las referencias estén migradas

**Tiempo estimado**: 2-3 sprints con migración gradual sin romper nada.
