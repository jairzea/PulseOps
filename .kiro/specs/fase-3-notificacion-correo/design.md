# Diseño — Fase 3: Notificación por correo de un clic

## Visión general

Un módulo `notifications` en el backend que: (1) encapsula el envío SMTP vía **nodemailer**,
(2) compone el correo con la condición + pasos del playbook (reusando `PlaybooksService`), y
(3) expone `POST /notifications/condition`. En el frontend, un botón "Notificar al usuario"
junto a la condición que llama al endpoint con feedback.

Principio: reusar lo que ya existe (playbooks, datos de usuario) y aislar el proveedor SMTP
detrás de un servicio para poder migrar a Workspace después sin tocar el resto.

## A. Dependencia

`nodemailer` (cliente SMTP estándar de Node, sin servidor propio). Versión pinneada.
`ponytail:` nodemailer es la opción madura y sin alternativas más simples en stdlib (Node no
trae cliente SMTP). Tipos: `@types/nodemailer` en devDependencies.

## B. Configuración (env)

Nuevas variables (documentadas en `.env.example`, sin valores):
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="PulseOps <no-reply@pulseops.local>"
```
Lectura vía `ConfigService` (patrón ya usado para JWT). Si falta `SMTP_HOST`, el servicio
marca el correo como **no configurado**: `sendMail` lanza excepción tipada, pero el módulo
carga igual (no rompe el arranque — Req 1.2 / 5.4).

`ponytail:` sin pool ni reintentos en esta fase; un `transport` por envío es suficiente para
el volumen actual (envíos manuales de un clic). Upgrade futuro: pool + cola si crece.

## C. Backend — módulo `notifications`

```
notifications/
├── notifications.module.ts      # importa PlaybooksModule, UsersModule, ConfigModule
├── notifications.controller.ts  # POST /notifications/condition (guard)
├── notifications.service.ts     # compone y delega
├── mail.service.ts              # transport SMTP (nodemailer), método sendMail()
└── dto/notify-condition.dto.ts  # validación de entrada
```

### C.1 MailService
- `sendMail({ to, subject, html, text }): Promise<void>`.
- Construye el transport desde `ConfigService`. Si no hay `SMTP_HOST` → lanza
  `ServiceUnavailableException`/excepción tipada de `common/exceptions`.
- Nunca logea password ni el objeto de credenciales.

### C.2 NotificationsService
- `notifyCondition(resourceId, condition, opts?)`:
  1. `usersService.findById(resourceId)` → `email`, `name`. Si no hay email → error.
  2. `playbooksService.findByCondition(condition)` → título + pasos. Si no hay → error.
  3. Componer asunto y cuerpo (texto + HTML simple) con nombre, condición, explicación y los
     pasos numerados.
  4. `mailService.sendMail(...)`.

### C.3 Controller + DTO
- `POST /notifications/condition` con `DemoOrJwtAuthGuard`.
- `NotifyConditionDto`: `resourceId: string` (no vacío), `condition: HubbardCondition`
  (`@IsIn` de las 8), `explanation?: string`, `kind?: 'metric' | 'consolidated'`.
- Respuesta: `{ sent: true, to: <email enmascarado o nombre>, condition }`. No incluye
  credenciales.

## D. Frontend

- `notificationsApi.notifyCondition(resourceId, condition, opts?)` sobre `httpClient`.
- Botón "Notificar al usuario" en el badge consolidado del dashboard (y opcionalmente en el
  panel de análisis por métrica). `data-testid = tid('dashboard','notify')`.
- Estado de envío: deshabilita el botón mientras va la request; toast de éxito/error
  (usa `useToast` existente).

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `apps/backend/package.json` | + nodemailer, @types/nodemailer (pinneados) |
| `apps/backend/.env.example` | + variables SMTP documentadas |
| `apps/backend/src/notifications/*` | módulo nuevo (mail, service, controller, dto) |
| `apps/backend/src/app.module.ts` | registrar `NotificationsModule` |
| `apps/frontend/src/services/api/notificationsApi.ts` | cliente nuevo |
| `apps/frontend/src/pages/ResourceDashboard.tsx` | botón "Notificar" + feedback |

## Verificación
1. `getDiagnostics` + build backend + typecheck frontend.
2. Verificación ejecutable del componedor de correo (asunto/cuerpo a partir de condición +
   playbook) — assert sin framework, sin enviar realmente (mockear/inyectar un transport
   falso o testear solo la función pura de composición).
3. Runtime: con SMTP de prueba (ej. Mailtrap/Ethereal), enviar y verificar recepción.

## Riesgos / notas
- **Credenciales SMTP**: se piden al operador; no se commitean. `.env` ya está en gitignore.
- **Migración a Workspace** (security.md): el `MailService` aísla el proveedor; el cambio
  futuro es una nueva implementación de `sendMail`, sin tocar `NotificationsService` ni UI.
- **Correo a personas reales**: en demo/seed los emails son ficticios (`@pulseops.demo`);
  probar con SMTP de captura (Ethereal/Mailtrap) para no enviar a direcciones inventadas.
