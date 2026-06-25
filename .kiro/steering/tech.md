# PulseOps — Stack Técnico y Comandos

## Stack

**Backend:** NestJS 10, TypeScript 5, Mongoose 9 (MongoDB), Passport + JWT, class-validator/class-transformer, bcryptjs.
**Frontend:** React 18, Vite 5, TypeScript 5, Tailwind 3, React Router 7, Zustand 5, React Hook Form + yup/zod, Recharts, React Flow, Lottie.
**Packages:** TypeScript puro, sin dependencias de runtime externas en `analysis-engine`.
**Testing:** Cypress 15 + Cucumber (BDD/Gherkin), Mochawesome.
**DB:** MongoDB 6/7 (Docker en dev).

## Comandos clave (raíz del monorepo)

```bash
npm run typecheck     # tsc --noEmit en todos los workspaces
npm run build         # build de todos los workspaces
npm run dev           # dev de todos los workspaces
npm run lint          # eslint . --ext .ts,.tsx
npm run format        # prettier --write
```

Por workspace (ej. backend):
```bash
cd apps/backend
npm run dev           # nest start --watch
npm run typecheck
npm run seed:demo     # ts-node seed-demo-data
npm run seed:admin
```

## Verificación obligatoria tras cambios

1. `getDiagnostics` sobre los archivos tocados.
2. `npm run typecheck` (los packages y backend compilan limpio; el frontend debe quedar limpio tras Fase 0).
3. Si tocas lógica no trivial del motor, dejar **una verificación ejecutable** (assert/self-check pequeño, sin frameworks) que falle si la lógica se rompe.

## Reglas de procesos largos

- **Nunca** lanzar dev servers, watchers o procesos interactivos con `executeBash` (bloquean). Usar `controlBashProcess` con action `start`, o pedir al usuario que lo corra.
- Para tests, usar ejecución única (sin watch).

## Dependencias

- Node fija en `.nvmrc`. Respetar `engines` (Node >=20, npm >=10).
- Mantener `analysis-engine` sin dependencias nuevas. Antes de añadir cualquier dependencia, agotar stdlib y lo ya instalado (ver regla ponytail).
- Versiones pinneadas/exactas para dependencias nuevas; verificar que el nombre no sea typosquatting.

## Build artifacts

- Los `dist/` no deben editarse a mano (son salida de `tsc`/`nest build`/`vite build`).
- `node_modules/`, `dist/`, reportes de cypress y `*.log` no son fuente: no leerlos para análisis ni commitearlos.
