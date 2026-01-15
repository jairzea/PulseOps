# PulseOps Backend

Backend de PulseOps construido con NestJS.

## Tecnologías

- NestJS 10.x
- TypeScript
- ESLint
- Prettier

## Scripts disponibles

```bash
# Desarrollo con watch mode
npm run dev

# Compilar proyecto
npm run build

# Iniciar en modo producción
npm run start:prod

# Verificar tipos
npm run typecheck

# Formatear código
npm run format

# Lint
npm run lint
```

## Estructura

```
src/
├── main.ts          # Punto de entrada
├── app.module.ts    # Módulo raíz
├── app.controller.ts # Controlador básico
└── app.service.ts   # Servicio básico
```

## Endpoints

- `GET /` - Estado del servidor
- `GET /health` - Health check

## Desarrollo

El servidor se ejecuta por defecto en `http://localhost:3000`

```bash
npm run dev
```

## Configuración

El proyecto está configurado con:
- TypeScript strict mode
- ESLint con configuración de NestJS
- Prettier para formateo consistente
- CORS habilitado
