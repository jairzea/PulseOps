# PulseOps Frontend

Frontend de PulseOps construido con React, Vite y TypeScript.

## Tecnologías

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- React Flow

## Scripts disponibles

```bash
# Desarrollo con HMR
npm run dev

# Compilar para producción
npm run build

# Preview de build
npm run preview

# Verificar tipos
npm run typecheck

# Limpiar build
npm run clean
```

## Estructura

```
src/
├── main.tsx         # Punto de entrada
├── App.tsx          # Componente raíz
├── index.css        # Estilos globales con Tailwind
└── vite-env.d.ts    # Tipos de Vite
```

## Desarrollo

El servidor se ejecuta por defecto en `http://localhost:5173`

```bash
npm run dev
```

## Configuración

El proyecto está configurado con:
- TypeScript strict mode
- Tailwind CSS con dark mode
- React Flow para visualización de grafos
- HMR (Hot Module Replacement)
- Estilos con Tailwind CSS

## Dark Mode

El proyecto viene configurado con dark mode por defecto usando Tailwind CSS.
