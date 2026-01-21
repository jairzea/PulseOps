# PulseLoader - Loading Animado de PulseOps

## 🎯 Propósito

Componente de loading oficial de PulseOps con animación tipo electrocardiograma (ECG). Diseñado para ser llamativo, dinámico y alineado con la identidad visual de monitoreo de rendimiento.

## ✨ Características

### 1. Animación SVG de Electrocardiograma
- Path complejo simulando latidos cardíacos
- Gradientes animados con efecto de barrido
- Punto brillante que recorre la línea
- Efecto de resplandor (glow) en el fondo

### 2. Múltiples Tamaños
- `sm`: 60x30px - Para espacios reducidos
- `md`: 100x50px - **Por defecto** - Uso general
- `lg`: 140x70px - Tablas y secciones grandes
- `xl`: 180x90px - Pantallas completas

### 3. Variantes de Color
- `primary` (azul) - Loading general
- `success` (verde) - Operaciones exitosas en progreso
- `warning` (ámbar) - Validaciones/advertencias
- `danger` (rojo) - Operaciones críticas
- `white` - Sobre fondos oscuros/en botones

### 4. Tres Modos de Uso

#### PulseLoader (componente base)
```tsx
<PulseLoader 
  size="md" 
  variant="primary" 
  text="Cargando..." 
  showText={true}
  fullScreen={false}
/>
```

#### PulseLoaderOverlay (pantalla completa)
```tsx
<PulseLoaderOverlay 
  size="xl" 
  variant="primary" 
  text="Procesando datos..."
/>
```

#### PulseLoaderInline (sin texto, inline)
```tsx
<PulseLoaderInline 
  size="sm" 
  variant="white"
/>
```

## 📖 API

### Props del PulseLoader

```typescript
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';        // Tamaño del loader
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'white';
  text?: string;                            // Texto a mostrar
  fullScreen?: boolean;                     // Overlay de pantalla completa
  showText?: boolean;                       // Mostrar/ocultar texto
}
```

### Configuración de Tamaños

```typescript
const sizeConfig = {
  sm: { width: 60, height: 30, strokeWidth: 2, fontSize: 'text-xs' },
  md: { width: 100, height: 50, strokeWidth: 2.5, fontSize: 'text-sm' },
  lg: { width: 140, height: 70, strokeWidth: 3, fontSize: 'text-base' },
  xl: { width: 180, height: 90, strokeWidth: 3.5, fontSize: 'text-lg' },
};
```

### Configuración de Colores

```typescript
const colorConfig = {
  primary: { stroke: '#3B82F6', glow: '#3B82F6', text: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { stroke: '#10B981', glow: '#10B981', text: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { stroke: '#F59E0B', glow: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-500/10' },
  danger: { stroke: '#EF4444', glow: '#EF4444', text: 'text-red-500', bg: 'bg-red-500/10' },
  white: { stroke: '#FFFFFF', glow: '#FFFFFF', text: 'text-white', bg: 'bg-white/10' },
};
```

## 🚀 Casos de Uso

### 1. Loading de Tablas

```tsx
// En MetricsPage.tsx
{loading && (
  <div className="p-12">
    <PulseLoader size="lg" variant="primary" text="Cargando métricas..." />
  </div>
)}
```

**Resultado**: Loader grande, azul, con texto "Cargando métricas..."

### 2. Loading de Recursos

```tsx
// En ResourcesPage.tsx
{loading && (
  <div className="p-12">
    <PulseLoader size="lg" variant="warning" text="Cargando recursos..." />
  </div>
)}
```

**Resultado**: Loader grande, ámbar, con texto "Cargando recursos..."

### 3. Loading de Registros

```tsx
// En RecordsPage.tsx
{loading && (
  <div className="p-12">
    <PulseLoader size="lg" variant="success" text="Cargando registros..." />
  </div>
)}
```

**Resultado**: Loader grande, verde, con texto "Cargando registros..."

### 4. Loading en Botones

```tsx
// En LoadingButton.tsx
{loading && <PulseLoaderInline size="sm" variant="white" />}
```

**Resultado**: Loader pequeño, blanco, sin texto, inline con el texto del botón

### 5. Overlay de Pantalla Completa

```tsx
// En App.tsx o cualquier componente
{isProcessing && (
  <PulseLoaderOverlay 
    size="xl" 
    variant="primary" 
    text="Procesando análisis..."
  />
)}
```

**Resultado**: Fondo semi-transparente, loader XL centrado, texto grande

## 🎨 Detalles de Animación

### 1. Path del ECG
```typescript
const ecgPath = `
  M 0,${height / 2}
  L ${width * 0.2},${height / 2}
  L ${width * 0.25},${height * 0.8}    // Pico hacia abajo
  L ${width * 0.3},${height * 0.1}     // Pico grande hacia arriba
  L ${width * 0.35},${height * 0.9}    // Pico hacia abajo
  L ${width * 0.4},${height / 2}
  L ${width * 0.55},${height / 2}
  L ${width * 0.6},${height * 0.3}     // Pequeña elevación
  L ${width * 0.65},${height * 0.7}    // Pequeña depresión
  L ${width * 0.7},${height / 2}
  L ${width},${height / 2}
`;
```

### 2. Gradiente Animado
- Gradiente lineal que se mueve de 0% a 100%
- Duración: 2s
- Efecto de barrido continuo

### 3. Punto Brillante
- Círculo que sigue el path usando `<animateMotion>`
- Radio: `strokeWidth * 1.5`
- Opacidad pulsante: 1 → 0.5 → 1 (1s)

### 4. Resplandor de Fondo
- Div con blur de 12px
- Opacidad 50%
- Animación pulse de Tailwind

### 5. Puntos de Carga
- 3 puntos debajo del texto
- Animación escalonada (0s, 0.2s, 0.4s)
- Efecto pulse de 1.5s

## 🔧 Integración en la Aplicación

### Archivos Modificados

**Nuevos (1)**:
- `apps/frontend/src/components/PulseLoader.tsx` (225 líneas)

**Modificados (4)**:
- `apps/frontend/src/pages/MetricsPage.tsx` (+2 líneas)
- `apps/frontend/src/pages/ResourcesPage.tsx` (+2 líneas)
- `apps/frontend/src/pages/RecordsPage.tsx` (+2 líneas)
- `apps/frontend/src/components/LoadingButton.tsx` (+5 líneas)

### Componentes Exportados

```typescript
export const PulseLoader: React.FC<PulseLoaderProps>;
export const PulseLoaderOverlay: React.FC<Omit<PulseLoaderProps, 'fullScreen'>>;
export const PulseLoaderInline: React.FC<Omit<PulseLoaderProps, 'fullScreen' | 'showText'>>;
```

## 🎯 Ventajas sobre el Anterior

### Antes (TableSkeleton + Spinner genérico)
- ❌ Skeleton solo para tablas
- ❌ Spinner genérico sin personalidad
- ❌ Inconsistencia visual entre páginas
- ❌ No alineado con identidad de PulseOps

### Después (PulseLoader)
- ✅ Componente único para toda la app
- ✅ Animación personalizada alineada con "Pulse"
- ✅ Múltiples variantes para diferentes contextos
- ✅ Consistencia visual total
- ✅ Identidad visual fuerte (ECG/monitoreo)

## 📏 Estándares de Uso

### Cuándo usar cada variante:

| Variante | Uso |
|----------|-----|
| `primary` | Loading general, datos, métricas |
| `success` | Registros, confirmaciones, guardados |
| `warning` | Recursos, validaciones, advertencias |
| `danger` | Eliminaciones, operaciones críticas |
| `white` | Dentro de botones, sobre fondos oscuros |

### Cuándo usar cada tamaño:

| Tamaño | Uso |
|--------|-----|
| `sm` | Botones, espacios reducidos, inline |
| `md` | Cards, secciones pequeñas (default) |
| `lg` | Tablas, secciones grandes, páginas |
| `xl` | Pantallas completas, overlays |

## 🧪 Ejemplos Completos

### Ejemplo 1: Página de Dashboard
```tsx
function DashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PulseLoader 
          size="xl" 
          variant="primary" 
          text="Cargando dashboard..."
        />
      </div>
    );
  }

  return <Dashboard data={data} />;
}
```

### Ejemplo 2: Modal con Operación Async
```tsx
function DeleteModal({ onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <Modal>
      {deleting && (
        <PulseLoaderOverlay 
          size="lg" 
          variant="danger" 
          text="Eliminando..."
        />
      )}
      <button onClick={handleDelete}>Eliminar</button>
    </Modal>
  );
}
```

### Ejemplo 3: Botón de Acción
```tsx
<LoadingButton 
  loading={isSaving} 
  variant="primary"
  onClick={handleSave}
>
  Guardar Métrica
</LoadingButton>
```
El PulseLoaderInline se muestra automáticamente cuando `loading=true`.

## 🎨 Personalización Futura

### Agregar nueva variante:
```typescript
// En PulseLoader.tsx
const colorConfig = {
  // ... existentes
  info: {
    stroke: '#06B6D4',  // Cyan
    glow: '#06B6D4',
    text: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
};
```

### Ajustar animación:
```typescript
// Cambiar duración del barrido
<animate
  attributeName="offset"
  values="0;1"
  dur="3s"  // Era 2s
  repeatCount="indefinite"
/>
```

## ✅ Validación

**Build exitoso**:
```bash
✓ 877 modules transformed
dist/assets/index-DJ9C18iU.js  690.57 kB │ gzip: 200.25 kB
✓ built in 4.74s
```

**Funcionalidad**:
- ✅ Animación de ECG fluida
- ✅ Gradientes funcionando correctamente
- ✅ Punto brillante recorre el path
- ✅ Resplandor visible
- ✅ Todos los tamaños renderizando correctamente
- ✅ Todas las variantes con colores correctos

## 🚀 Próximos Pasos

1. ✅ **COMPLETADO**: PulseLoader base con 5 variantes
2. ✅ **COMPLETADO**: Integración en MetricsPage, ResourcesPage, RecordsPage
3. ✅ **COMPLETADO**: LoadingButton con PulseLoaderInline
4. ⏳ **PENDIENTE**: Integrar en AnalysisPage cuando se cree
5. ⏳ **PENDIENTE**: Agregar en estados de error con variante `danger`
6. ⏳ **PENDIENTE**: Documentar en Storybook (si se implementa)

---

**Fecha de creación**: 16 Enero 2026  
**Componente**: PulseLoader  
**Estado**: ✅ COMPLETADO Y EN USO
