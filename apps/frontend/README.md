# PulseOps Frontend

**Interfaz de usuario de PulseOps construida con React, Vite y visualizaciones avanzadas.**

El frontend proporciona dashboards interactivos, gráficos históricos de métricas y visualización de flujos operativos mediante React Flow.

---

## Tecnologías

- **React** 18 - Librería UI con hooks
- **Vite** 5 - Build tool ultra-rápido con HMR
- **TypeScript** - Strict mode habilitado
- **Tailwind CSS** - Utility-first CSS con dark mode
- **React Flow** - Visualización de grafos y flujos
- **Recharts** - Gráficos históricos y tendencias
- **@pulseops/shared-types** - Tipos compartidos con backend

---

## Arquitectura

### Estructura del Proyecto

```
src/
├── main.tsx                    # Bootstrap de React
├── App.tsx                     # Componente raíz + routing
├── index.css                   # Estilos globales (Tailwind)
├── vite-env.d.ts               # Tipos de Vite
│
├── components/                 # Componentes reutilizables
│   ├── HistoricalChart.tsx     # Gráfico de series temporales
│   ├── MetricCard.tsx          # Tarjeta de métrica con condición
│   ├── ConditionBadge.tsx      # Badge de condición (OK/WARNING/CRITICAL)
│   ├── ResourceFlow.tsx        # Visualización de flujo de recursos
│   └── PlaybookPanel.tsx       # Panel de playbooks
│
├── modules/                    # Módulos funcionales
│   ├── live-demo/              # Demo en vivo
│   │   ├── LiveDemo.tsx
│   │   └── hooks/
│   ├── dashboard/              # Dashboard principal
│   ├── metrics/                # Gestión de métricas
│   ├── resources/              # Gestión de recursos
│   └── analysis/               # Visualización de análisis
│
├── utils/                      # Utilidades
│   ├── chartUtils.ts           # Helpers para gráficos
│   ├── apiClient.ts            # Cliente HTTP al backend
│   └── formatters.ts           # Formateadores de datos
│
├── hooks/                      # Custom hooks
│   ├── useMetrics.ts           # Fetching de métricas
│   ├── useAnalysis.ts          # Análisis de inclinación
│   └── useResources.ts         # Gestión de recursos
│
├── types/                      # Tipos específicos del frontend
│   └── ui.types.ts
│
└── styles/                     # Estilos adicionales
    └── charts.css              # Estilos para gráficos
```

### Principios de Diseño

- **Component-driven**: Componentes pequeños y reutilizables
- **Type-safe**: TypeScript strict en todo el código
- **Responsive**: Mobile-first con Tailwind
- **Dark mode**: Soporte nativo de tema oscuro
- **Real-time ready**: Preparado para WebSockets
- **Performance**: Code splitting y lazy loading

---

## Scripts Disponibles

```bash
# Desarrollo con HMR (Hot Module Replacement)
npm run dev

# Compilar para producción
npm run build

# Preview del build de producción
npm run preview

# Verificar tipos TypeScript
npm run typecheck

# Limpiar directorio dist/
npm run clean
```

---

## Desarrollo

### Iniciar el servidor de desarrollo

```bash
# Desde la raíz del monorepo
cd apps/frontend
npm run dev
```

El servidor se ejecuta en: **http://localhost:5173**

### Variables de Entorno

Crear un archivo `.env` en `apps/frontend/`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000

# Auth0 (opcional)
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience
```

### Conectar con el Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000`:

```bash
# En otra terminal
cd apps/backend
npm run dev
```

---

## Componentes Principales

### HistoricalChart

Gráfico de series temporales para visualizar métricas históricas:

```tsx
import { HistoricalChart } from '@/components/HistoricalChart';

<HistoricalChart
  data={[
    { week: '2024-W01', value: 15 },
    { week: '2024-W02', value: 12 },
    { week: '2024-W03', value: 10 },
  ]}
  metricKey="bugs-open"
  title="Bugs Abiertos"
  condition="OK"
/>
```

### MetricCard

Tarjeta que muestra una métrica con su condición:

```tsx
import { MetricCard } from '@/components/MetricCard';

<MetricCard
  title="Velocity"
  value={42}
  condition="WARNING"
  inclination={-5.2}
  explanation="Decreciendo 5.2 puntos por sprint"
/>
```

### ResourceFlow

Visualización de flujo de recursos con React Flow:

```tsx
import { ResourceFlow } from '@/components/ResourceFlow';

<ResourceFlow
  resources={resources}
  metrics={metrics}
  onNodeClick={handleNodeClick}
/>
```

---

## Visualizaciones

### Gráficos con Recharts

Para series temporales y tendencias:

- Line charts con indicadores de inclinación
- Bar charts para comparaciones
- Area charts para volumetrías
- Tooltips interactivos con explicaciones

### Flujos con React Flow

Para visualizar:

- Relaciones entre recursos y métricas
- Flujos de evaluación de condiciones
- Jerarquías de equipos y proyectos
- Playbooks y sus triggers

---

## Estilos

### Tailwind CSS

Utilizamos Tailwind con configuración personalizada:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pulse-ok': '#10b981',
        'pulse-warning': '#f59e0b',
        'pulse-critical': '#ef4444',
      }
    }
  }
}
```

### Dark Mode

El proyecto soporta dark mode nativo:

```tsx
// Activar dark mode
document.documentElement.classList.add('dark');

// Desactivar dark mode
document.documentElement.classList.remove('dark');
```

Las clases de Tailwind se adaptan automáticamente:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  // Contenido
</div>
```

---

## Integración con el Backend

### Cliente HTTP

```typescript
// utils/apiClient.ts
export const apiClient = {
  async getResources() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`);
    return res.json();
  },
  
  async runAnalysis(data) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

### Hooks Personalizados

```typescript
// hooks/useMetrics.ts
export function useMetrics(resourceId: string) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiClient.getMetrics(resourceId)
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, [resourceId]);
  
  return { metrics, loading };
}
```

---

## Build y Deploy

### Build de Producción

```bash
npm run build
```

Genera archivos optimizados en `dist/`:

- HTML minificado
- CSS con PurgeCSS (solo clases usadas)
- JavaScript con code splitting
- Assets con hashing

### Preview del Build

```bash
npm run preview
```

Prueba el build de producción localmente en http://localhost:4173

### Deploy

El frontend puede desplegarse en:

- **Vercel** (recomendado para Vite)
- **Netlify**
- **GitHub Pages**
- **Azure Static Web Apps**
- **AWS S3 + CloudFront**

Configuración para Vercel:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Configuración

### TypeScript

- **Strict mode** habilitado
- **Path aliases**: `@/` apunta a `src/`
- **React JSX**: Preservado para Vite

### Vite

- **HMR**: Hot Module Replacement ultra-rápido
- **Tree shaking**: Elimina código no usado
- **Code splitting**: Chunks automáticos
- **Asset optimization**: Imágenes, fonts, etc.

### ESLint & Prettier

Configuración compatible con:

- React Hooks rules
- TypeScript rules
- Tailwind class sorting

---

## Próximos Pasos

- [ ] Implementar dashboard completo
- [ ] Integrar autenticación Auth0
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Editor visual de reglas
- [ ] Exportación de reportes PDF
- [ ] Tests con Vitest y Testing Library
- [ ] Storybook para componentes

---

## Referencias

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Flow Documentation](https://reactflow.dev/)
- [Recharts Documentation](https://recharts.org/)
