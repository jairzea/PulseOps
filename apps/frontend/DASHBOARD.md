# Resource Dashboard - Frontend Implementation

## 🎯 Overview

The **Resource Dashboard** is the main interface of PulseOps Live. It provides a comprehensive view of operational metrics with real-time analysis, trend visualization, and condition evaluation.

## ✅ Implemented Features

### 1. Resource Selection
- **Component**: `ResourceSelector`
- Dynamic loading from backend
- Smooth transitions when changing selection
- Loading states with skeleton UI

### 2. Metric Selection
- **Component**: `MetricSelector`  
- Context-aware metric loading
- Integrated with resource selection
- Visual feedback on changes

### 3. Historical Chart
- **Component**: `HistoricalChart`
- Time series visualization with Recharts
- Automatic trend line calculation (linear regression)
- Interactive tooltips with delta information
- Responsive design
- Smooth animations

### 4. Condition Summary
- **Component**: `ConditionSummary`
- Displays operational condition (PODER, NORMAL, EMERGENCIA, PELIGRO, etc.)
- Shows inclination percentage
- Lists detected signals
- Confidence indicator
- Color-coded badges based on condition severity

### 5. Condition Formula
- **Component**: `ConditionFormula`
- Step-by-step formula explanation
- Based on Hubbard's operational conditions
- Educational UI for understanding the analysis

## 🏗️ Architecture

```
src/
├── services/
│   └── apiClient.ts           # Centralized HTTP client
├── hooks/
│   ├── useResources.ts        # Resource data fetching
│   ├── useMetrics.ts          # Metric data fetching
│   ├── useRecords.ts          # Record data fetching
│   └── useAnalysis.ts         # Analysis evaluation
├── components/
│   ├── ResourceSelector.tsx   # Resource dropdown
│   ├── MetricSelector.tsx     # Metric dropdown
│   ├── HistoricalChart.tsx    # Time series chart
│   ├── ConditionSummary.tsx   # Condition cards
│   └── ConditionFormula.tsx   # Formula steps
└── pages/
    └── ResourceDashboard.tsx  # Main dashboard page
```

## 🔌 Backend Integration

### API Endpoints Used

- `GET /resources` - List all resources
- `GET /metrics` - List all metrics
- `GET /records?resourceId={id}&metricKey={key}` - Get historical data
- `GET /analysis/evaluate?resourceId={id}&metricKey={key}` - Run analysis

### Data Flow

1. **On Mount**: Load resources and metrics
2. **On Selection**: Fetch records for the selected resource+metric
3. **On Data Load**: Trigger analysis evaluation
4. **On Analysis**: Update UI with condition, formula, and insights

## 🎨 UI/UX Features

### Loading States
- Skeleton screens for selectors
- Animated placeholders for charts
- Smooth fade-in transitions

### Empty States
- Clear messaging when no data is available
- Helpful icons and instructions

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly controls

### Animations
- Fade transitions between states
- Chart animations on data change
- Hover effects on interactive elements

## 🧪 TypeScript Types

All components use strict TypeScript types from:
- `services/apiClient.ts` - API response types
- `@pulseops/shared-types` - Domain types (when applicable)

## 🚀 Running the Dashboard

### Prerequisites
1. Backend running on `http://localhost:3000`
2. MongoDB running (via Docker or locally)
3. Frontend environment configured

### Start Development Server

```bash
cd apps/frontend
npm run dev
```

Access at: `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Next Steps (Not Implemented Yet)

- [ ] Auth0 integration
- [ ] Form-based data input
- [ ] CRUD operations for resources/metrics
- [ ] External data imports (CSV, Jira)
- [ ] Alert system
- [ ] Export functionality

## 🐛 Known Limitations

- No authentication (demo mode)
- No real-time updates (requires manual refresh)
- No error retry mechanisms
- Limited mobile optimization

## 📚 Related Documentation

- [Backend README](../../apps/backend/README.md)
- [API Testing Guide](../../API_TESTING.md)
- [Motor de Análisis](../../Motor%20de%20analisis%20de%20inclinación%20y%20condiciones.md)
- [Fórmulas de Condiciones](../../Fórmulas%20de%20las%20condiciones.md)
