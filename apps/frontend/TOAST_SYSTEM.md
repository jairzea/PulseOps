# Sistema de Notificaciones Toast - PulseOps

## 📋 Descripción

Sistema de notificaciones toast completamente funcional, reutilizable y escalable con animaciones Lottie personalizadas para feedback visual.

## ✨ Características

- ✅ **4 tipos de notificaciones**: Success, Error, Warning, Info
- 🎨 **Animaciones Lottie** personalizadas para Success y Error
- ⏱️ **Auto-dismiss** configurable
- 🎯 **Posicionamiento** top-right (configurable)
- 🔔 **Múltiples toasts** simultáneos
- ♿ **Accesible** (ARIA labels, roles)
- 📱 **Responsivo** y adaptable
- 🎭 **Animaciones suaves** de entrada/salida
- 🌙 **Dark mode** compatible
- 🔧 **Totalmente tipado** con TypeScript

## 🚀 Uso Rápido

### Importar el hook

```tsx
import { useToast } from '../hooks/useToast';
```

### En tu componente

```tsx
function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
      success('¡Operación completada exitosamente!');
    } catch (err) {
      error('Ha ocurrido un error al procesar la solicitud');
    }
  };

  return (
    <button onClick={handleAction}>
      Ejecutar Acción
    </button>
  );
}
```

## 📚 API Completa

### useToast Hook

El hook `useToast` proporciona las siguientes funciones:

#### `success(message: string, duration?: number)`
Muestra una notificación de éxito con animación Lottie.

```tsx
const { success } = useToast();
success('Usuario creado correctamente');
success('Guardado con éxito', 3000); // 3 segundos
```

#### `error(message: string, duration?: number)`
Muestra una notificación de error con animación Lottie.

```tsx
const { error } = useToast();
error('No se pudo conectar con el servidor');
error('Error de validación', 7000); // 7 segundos
```

#### `warning(message: string, duration?: number)`
Muestra una notificación de advertencia.

```tsx
const { warning } = useToast();
warning('Ten cuidado con esta acción');
```

#### `info(message: string, duration?: number)`
Muestra una notificación informativa.

```tsx
const { info } = useToast();
info('Procesando solicitud...');
```

#### `toast(message: string, type: ToastType, duration?: number)`
Método genérico para cualquier tipo de notificación.

```tsx
const { toast } = useToast();
toast('Mensaje personalizado', 'success', 5000);
```

### Parámetros

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `message` | `string` | Texto del mensaje a mostrar | - |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | Tipo de notificación | `'info'` |
| `duration` | `number` | Duración en milisegundos (0 = sin auto-dismiss) | `5000` |

## 🎨 Estilos y Personalización

### Colores por Tipo

- **Success**: Verde (`green-500`)
- **Error**: Rojo (`red-500`)
- **Warning**: Amarillo (`yellow-500`)
- **Info**: Azul (`blue-500`)

### Animaciones

Las animaciones están definidas en [index.css](../index.css):

- **Entrada**: Slide desde la derecha con bounce
- **Salida**: Slide hacia la derecha con scale
- **Duración**: 300ms

## 📁 Estructura de Archivos

```
src/
├── assets/
│   └── animations/
│       ├── success.json       # Animación Lottie de éxito
│       └── error.json         # Animación Lottie de error
├── components/
│   ├── Toast.tsx             # Componente individual de toast
│   ├── ToastContainer.tsx    # Contenedor de todos los toasts
│   └── ToastDemo.tsx         # Demo y ejemplos de uso
├── hooks/
│   └── useToast.ts           # Hook personalizado
├── stores/
│   └── toastStore.ts         # Estado global con Zustand
└── index.css                 # Animaciones CSS
```

## 🔧 Configuración

### ToastContainer

Ya está agregado en [App.tsx](../App.tsx). Si necesitas cambiar la posición:

```tsx
// En ToastContainer.tsx, modifica el className:
<div className="fixed bottom-4 left-4 z-[9999]...">  // Abajo izquierda
<div className="fixed top-4 left-4 z-[9999]...">     // Arriba izquierda
<div className="fixed bottom-4 right-4 z-[9999]..."> // Abajo derecha
```

### Duración Global

Para cambiar la duración por defecto, modifica [toastStore.ts](../stores/toastStore.ts):

```tsx
duration: toast.duration ?? 7000, // Cambiar a 7 segundos
```

## 💡 Ejemplos de Uso

### CRUD Operations

```tsx
// Crear
const handleCreate = async (data) => {
  try {
    await api.create(data);
    success('Elemento creado correctamente');
  } catch (err) {
    error('Error al crear el elemento');
  }
};

// Actualizar
const handleUpdate = async (id, data) => {
  try {
    await api.update(id, data);
    success('Cambios guardados correctamente');
  } catch (err) {
    error('Error al guardar los cambios');
  }
};

// Eliminar
const handleDelete = async (id) => {
  try {
    await api.delete(id);
    success('Elemento eliminado correctamente');
  } catch (err) {
    error('Error al eliminar el elemento');
  }
};
```

### Validaciones

```tsx
const handleSubmit = (data) => {
  if (!data.email) {
    warning('Por favor ingresa un email');
    return;
  }
  
  if (!data.password || data.password.length < 8) {
    warning('La contraseña debe tener al menos 8 caracteres');
    return;
  }
  
  // Continuar con el submit...
};
```

### Notificaciones Informativas

```tsx
const handleExport = async () => {
  info('Preparando exportación...');
  
  try {
    await exportData();
    success('Datos exportados correctamente');
  } catch (err) {
    error('Error al exportar los datos');
  }
};
```

### Toast Persistente (sin auto-dismiss)

```tsx
// Para notificaciones que requieren acción del usuario
error('Sesión expirada. Por favor inicia sesión nuevamente', 0);
```

### Múltiples Notificaciones

```tsx
const handleBulkOperation = async (items) => {
  let successful = 0;
  let failed = 0;
  
  for (const item of items) {
    try {
      await processItem(item);
      successful++;
    } catch {
      failed++;
    }
  }
  
  if (successful > 0) {
    success(`${successful} elementos procesados correctamente`);
  }
  
  if (failed > 0) {
    error(`${failed} elementos fallaron`);
  }
};
```

## 🧪 Testing

Usa el componente `ToastDemo` para probar el sistema:

```tsx
import { ToastDemo } from './components/ToastDemo';

// En cualquier página temporal
<ToastDemo />
```

## 🎯 Mejores Prácticas

1. **Mensajes claros**: Usa mensajes descriptivos y concisos
2. **Tipo apropiado**: Usa el tipo correcto según la situación
3. **Duración adecuada**: 
   - Success: 3-5 segundos
   - Error: 5-7 segundos (más tiempo para leer)
   - Warning: 5-7 segundos
   - Info: 3-5 segundos
4. **No abuses**: Evita mostrar múltiples toasts innecesariamente
5. **Contexto**: Incluye información relevante en el mensaje

## ⚡ Performance

- **Lazy loading**: Los toasts solo se renderizan cuando existen
- **Auto-cleanup**: Se remueven automáticamente del DOM
- **Animaciones optimizadas**: Usando CSS transforms
- **Estado global eficiente**: Zustand con selectores optimizados

## 🔄 Actualizaciones Futuras

Posibles mejoras:

- [ ] Barra de progreso visual
- [ ] Acción personalizada (botones en el toast)
- [ ] Sonidos opcionales
- [ ] Posicionamiento configurable por toast
- [ ] Stack limit (máximo de toasts visibles)
- [ ] Prioridad de toasts
- [ ] Plantillas personalizadas

## 📝 Notas

- El z-index es `9999` para asegurar que esté sobre todo
- Las animaciones Lottie solo se usan para Success y Error
- Warning e Info usan iconos SVG para menor carga
- Compatible con accesibilidad (screen readers)

---

**Creado para PulseOps** 🚀
