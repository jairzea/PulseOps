# PulseOps — Seguridad y Camino a Producción

El producto va hacia producción. La seguridad deja de ser opcional.

## Autenticación / Autorización

- Auth por **JWT** (Passport). Roles: `admin`, `user`.
- `JWT_SECRET` **debe** venir de entorno. NO usar el fallback hardcodeado `'pulseops-secret-key-change-in-production'` en código productivo; el arranque debe fallar si no está definido fuera de dev.
- `AUTH_MODE=demo` inyecta un admin sin credenciales en requests sin header. **Prohibido en producción**: debe bloquearse cuando `NODE_ENV=production`.
- Autorización owner-vs-admin: preferir guards/decoradores reutilizables sobre checks manuales dispersos en controllers.
- En controllers, lanzar `ForbiddenException` (de `common/exceptions`), nunca `throw new Error('Forbidden')` (devuelve 500 en vez de 403).

## Datos sensibles

- Nunca logear secretos ni `MONGODB_URI`/`JWT_SECRET` completos (hoy `main.ts` lo hace en debug — debe limpiarse).
- Passwords siempre con bcrypt; nunca devolver el campo `password` en respuestas (los services ya hacen `.select('-password')`).
- Tratar datos de archivos/CSV/API externas como **no confiables**: validar en la frontera (DTOs + class-validator).

## Endpoints

- Todo endpoint nuevo nace protegido por guard salvo decisión explícita. Si se crea un endpoint sin auth, señalarlo explícitamente.
- Validación global activa (`ValidationPipe` con `whitelist`/`forbidNonWhitelisted`/`transform`). Mantener DTOs validados.

## Acciones de riesgo

- Operaciones destructivas (borrados masivos, drops, cambios de infra/producción, modificación de auth) requieren confirmación explícita del usuario antes de ejecutar.
- Preferir soft-delete (`isActive=false`) sobre hard-delete salvo que se pida lo contrario.

## Integraciones externas (futuro)

- Correo: arrancar con SMTP, con migración prevista a **Google Workspace** (la empresa usa Workspace). No transmitir datos del proyecto a terceros sin que el usuario lo pida explícitamente.
- Tracking de Workspace / "3 canastillas": iniciativa separada, condicionada a viabilidad y aprobación. No incluir en el ciclo actual.
