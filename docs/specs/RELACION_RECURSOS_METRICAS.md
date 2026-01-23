# Arquitectura de Relación: Recursos ↔ Métricas

## 🎯 Problema Resuelto

Anteriormente teníamos una **relación bidireccional duplicada**:
- Recursos almacenaban `metricIds[]`
- Métricas almacenaban `resourceIds[]`

Esto causaba:
- ❌ **Riesgo de inconsistencias**: Un recurso podía decir que tiene métricas X, Y pero la métrica X no tenía ese recurso
- ❌ **Datos desactualizados**: Actualizar un lado no garantizaba la actualización del otro
- ❌ **Violación del principio DRY**: Misma información en dos lugares
- ❌ **Complejidad de mantenimiento**: Cada cambio requería actualizar ambos lados

## ✅ Solución: Fuente Única de Verdad

### Arquitectura Centralizada

```
┌─────────────────────────────────────────────────────────────┐
│                    FUENTE ÚNICA DE VERDAD                   │
│                                                              │
│  Colección: metrics                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ {                                                   │     │
│  │   id: "metric-1",                                  │     │
│  │   key: "commits",                                  │     │
│  │   label: "Commits Realizados",                     │     │
│  │   resourceIds: ["resource-a", "resource-b"]  ◄────┼─────┤ Array de IDs
│  │ }                                                   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Consulta mediante
                             │ findByResource()
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Colección: resources                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ {                                                   │     │
│  │   id: "resource-a",                                │     │
│  │   name: "Juan Pérez",                              │     │
│  │   roleType: "DEV"                                  │     │
│  │   // NO tiene metricIds ✅                         │     │
│  │ }                                                   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Implementación Backend

### 1. Schema de Resource (Sin metricIds)

```typescript
// apps/backend/src/resources/schemas/resource.schema.ts
@Schema({ collection: 'resources', timestamps: true })
export class Resource {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['DEV', 'TL', 'OTHER'] })
  roleType: string;

  @Prop({ default: true })
  isActive: boolean;

  // ❌ NO hay metricIds aquí (solo en métricas)

  @Prop({ required: true })
  createdBy: string;
}
```

### 2. DTOs (Acepta metricIds del frontend)

```typescript
// apps/backend/src/resources/dto/resource.dto.ts
export class CreateResourceDto {
  @IsString()
  name: string;

  @IsEnum(['DEV', 'TL', 'OTHER'])
  roleType: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ✅ Acepta metricIds del frontend (no se guarda en schema)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];
}
```

### 3. ResourcesService (Actualización Automática)

```typescript
// apps/backend/src/resources/resources.service.ts
@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @Inject(forwardRef(() => MetricsService))
    private metricsService: MetricsService,
  ) {}

  async create(dto: CreateResourceDto, createdBy: string): Promise<Resource> {
    // 1. Crear el recurso (sin metricIds en DB)
    const resource = new this.resourceModel({
      name: dto.name,
      roleType: dto.roleType,
      isActive: dto.isActive ?? true,
      createdBy,
    });
    const savedResource = await resource.save();

    // 2. Actualizar la relación en métricas (fuente única)
    if (dto.metricIds && dto.metricIds.length > 0) {
      await this.updateMetricsRelation(savedResource.id, dto.metricIds);
    }

    return savedResource;
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource | null> {
    // 1. Actualizar el recurso
    const updated = await this.resourceModel
      .findOneAndUpdate(
        { id },
        {
          name: dto.name,
          roleType: dto.roleType,
          isActive: dto.isActive,
        },
        { new: true },
      )
      .exec();

    // 2. Actualizar la relación en métricas
    if (dto.metricIds !== undefined) {
      await this.updateMetricsRelation(id, dto.metricIds);
    }

    return updated;
  }

  async remove(id: string): Promise<Resource | null> {
    const deleted = await this.resourceModel.findOneAndDelete({ id }).exec();
    
    // Limpiar referencias en métricas
    if (deleted) {
      await this.updateMetricsRelation(id, []);
    }
    
    return deleted;
  }

  /**
   * Método privado para sincronizar la relación en métricas
   * Esta es la ÚNICA función que modifica resourceIds en métricas
   */
  private async updateMetricsRelation(
    resourceId: string,
    metricIds: string[],
  ): Promise<void> {
    const allMetrics = await this.metricsService.findAll();

    for (const metric of allMetrics) {
      const hasResource = metric.resourceIds?.includes(resourceId) || false;
      const shouldHaveResource = metricIds.includes(metric.id);

      if (shouldHaveResource && !hasResource) {
        // Agregar recurso a la métrica
        const updatedResourceIds = [...(metric.resourceIds || []), resourceId];
        await this.metricsService.update(metric.id, {
          resourceIds: updatedResourceIds,
        });
      } else if (!shouldHaveResource && hasResource) {
        // Remover recurso de la métrica
        const updatedResourceIds = (metric.resourceIds || []).filter(
          (rid) => rid !== resourceId,
        );
        await this.metricsService.update(metric.id, {
          resourceIds: updatedResourceIds,
        });
      }
    }
  }
}
```

### 4. Nuevo Endpoint para Consultar Métricas

```typescript
// apps/backend/src/resources/resources.controller.ts
@Get(':id/metrics')
getMetricsByResource(@Param('id') id: string) {
  return this.metricsService.findByResource(id);
}
```

## 🎨 Implementación Frontend

### 1. Interface Resource (Sin metricIds)

```typescript
// apps/frontend/src/services/apiClient.ts
export interface Resource {
  id: string;
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
  isActive: boolean;
  // ❌ NO tiene metricIds
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Nuevo Método en apiClient

```typescript
// apps/frontend/src/services/apiClient.ts
async getResourceMetrics(id: string): Promise<Metric[]> {
  return fetchJSON<Metric[]>(`/resources/${id}/metrics`);
}
```

### 3. ResourceForm (Carga vía API)

```typescript
// apps/frontend/src/components/ResourceForm.tsx
useEffect(() => {
  if (resource) {
    // Cargar métricas usando el endpoint centralizado
    const loadAssociatedMetrics = async () => {
      try {
        const associatedMetrics = await apiClient.getResourceMetrics(resource.id);
        setSelectedMetrics(associatedMetrics);
        setValue('metricIds', associatedMetrics.map((m) => m.id));
      } catch (error) {
        console.error('Error cargando métricas asociadas:', error);
        setSelectedMetrics([]);
      }
    };
    loadAssociatedMetrics();
  }
}, [resource, setValue]);
```

### 4. Store (Envía metricIds pero no espera recibirlos)

```typescript
// apps/frontend/src/stores/resourcesStore.ts
createResource: async (data) => {
  const newResource = await apiClient.createResource({
    name: data.name,
    roleType: data.roleType,
    isActive: data.isActive ?? true,
    metricIds: data.metricIds || [], // ✅ Se envía al backend
  } as Partial<Resource>);
  
  // ✅ newResource NO tendrá metricIds en la respuesta
  // Las métricas se consultan vía /resources/:id/metrics
  
  await get().fetchResources();
  return newResource;
},
```

## 🔄 Flujo de Actualización

### Crear Recurso con Métricas

```
Frontend                  Backend                   Database
────────                  ───────                   ────────
   │                         │                         │
   │  POST /resources        │                         │
   │  { metricIds: [M1,M2] } │                         │
   ├────────────────────────►│                         │
   │                         │  1. Crear recurso       │
   │                         │     (sin metricIds)     │
   │                         ├────────────────────────►│
   │                         │                         │ resources: { id: R1 }
   │                         │  2. Update metric M1    │
   │                         │     resourceIds += R1   │
   │                         ├────────────────────────►│
   │                         │                         │ metrics: { id: M1, resourceIds: [R1] }
   │                         │  3. Update metric M2    │
   │                         │     resourceIds += R1   │
   │                         ├────────────────────────►│
   │                         │                         │ metrics: { id: M2, resourceIds: [R1] }
   │                         │  Response: Resource R1  │
   │◄────────────────────────┤                         │
   │                         │                         │
```

### Editar Recurso (Cambiar Métricas)

```
Antes:  R1 → [M1, M2]
Cambio: R1 → [M2, M3]

Backend ejecuta:
1. Update resource R1 (campos name, roleType, etc)
2. Recorre TODAS las métricas:
   - M1: tenía R1, ya no lo necesita → REMOVE R1
   - M2: tenía R1, sigue necesitándolo → NO CAMBIO
   - M3: no tenía R1, ahora lo necesita → ADD R1

Resultado:
  M1.resourceIds = []
  M2.resourceIds = [R1]
  M3.resourceIds = [R1]
```

### Eliminar Recurso

```
DELETE /resources/R1

Backend ejecuta:
1. Delete resource R1 from DB
2. updateMetricsRelation(R1, []) ← Array vacío
3. Recorre TODAS las métricas:
   - Si metric.resourceIds incluye R1 → REMOVE R1
```

## ✅ Beneficios de esta Arquitectura

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Fuente de verdad** | Duplicada en 2 lugares | Una sola (métricas) |
| **Consistencia** | Manual, propensa a errores | Automática, garantizada |
| **Actualización** | Requiere 2 updates | Un update en recursos, sync automático |
| **Queries** | Ambigua (¿cuál es correcta?) | Clara (`findByResource()`) |
| **Mantenimiento** | Complejo (sync manual) | Simple (centralizado) |
| **Escalabilidad** | Difícil (más duplicación) | Fácil (una sola lógica) |

## 🎓 Principios de Diseño Aplicados

1. **Single Source of Truth (SSOT)**: Métricas como única fuente
2. **Don't Repeat Yourself (DRY)**: No duplicar `resourceIds` ↔ `metricIds`
3. **Separation of Concerns**: ResourcesService gestiona la sincronización
4. **Dependency Injection**: `forwardRef()` para evitar dependencias circulares
5. **Cascading Updates**: Cambios en recursos propagan a métricas automáticamente

## 🔍 Casos de Uso

### Consultar métricas de un recurso

```typescript
// Frontend
const metrics = await apiClient.getResourceMetrics('resource-id');
```

```typescript
// Backend (ya existía)
const metrics = await metricsService.findByResource('resource-id');
```

### Consultar recursos de una métrica

```typescript
// Ya funciona porque resourceIds está en métricas
const metric = await metricsService.findByKey('commits');
const resourceIds = metric.resourceIds; // ['resource-a', 'resource-b']
```

## 🚀 Migración de Datos Existentes

Si ya tienes datos con la estructura anterior:

```typescript
// Script de migración (ejecutar una vez)
async function migrateResourceMetricRelation() {
  const resources = await resourceModel.find().exec();
  
  for (const resource of resources) {
    if (resource.metricIds && resource.metricIds.length > 0) {
      // Usar el servicio para migrar
      await resourcesService.updateMetricsRelation(
        resource.id,
        resource.metricIds
      );
      
      // Limpiar metricIds del recurso
      await resourceModel.updateOne(
        { id: resource.id },
        { $unset: { metricIds: 1 } }
      );
    }
  }
}
```

## 📝 Conclusión

Esta arquitectura centralizada garantiza:
- ✅ **Consistencia de datos** en todo momento
- ✅ **Simplicidad** en el código (una sola fuente de verdad)
- ✅ **Mantenibilidad** (cambios en un solo lugar)
- ✅ **Escalabilidad** (fácil agregar nuevas relaciones)
- ✅ **Rendimiento** (queries optimizadas con `findByResource()`)
