# Plan de implementación — Fase 3

- [x] 1. Dependencia y configuración SMTP
  - `nodemailer@9.0.1` + `@types/nodemailer@8.0.1` (exactos) en `apps/backend`. Variables SMTP documentadas en `.env.example`.
  - _Requisitos: 1.1, 1.4, 2.2_

- [x] 2. MailService (transport SMTP aislado)
  - `notifications/mail.service.ts`: `sendMail()` con transport desde `ConfigService`. Sin `SMTP_HOST` → `ServiceUnavailableException` (no rompe arranque). No logea credenciales. `isConfigured()` helper.
  - _Requisitos: 1.2, 1.3, 2.1, 2.3, 5.4_

- [x] 3. Composición del correo (función pura) + verificación
  - `compose-condition-email.ts`: asunto + texto + HTML (con escape) desde nombre, condición, explicación y pasos. Selfcheck `compose-condition-email.selfcheck.ts` pasa (10 asserts, incluye XSS-escape y sin-explicación).
  - _Requisitos: 3.2_

- [x] 4. NotificationsService + endpoint
  - `notifyCondition(dto)`: resuelve usuario (email/name) y playbook activo, compone y envía; errores tipados si falta email (ValidationException) o playbook (ResourceNotFoundException). `POST /notifications/condition` con guard + `NotifyConditionDto` validado (condición ∈ HubbardCondition).
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

- [x] 5. Registrar módulo
  - `NotificationsModule` (UsersModule + PlaybooksModule; ConfigModule global) en `app.module.ts`.
  - _Requisitos: 2.1_

- [x] 6. Frontend: API + botón de un clic
  - `notificationsApi.notifyCondition()`; botón "Notificar al usuario" en el badge consolidado con `tid('dashboard','notify')`, deshabilitado mientras envía, toast de éxito/error.
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Verificación de cierre
  - `getDiagnostics` limpio; typecheck backend y frontend en verde; selfcheck de composición pasa. Pendiente: validación runtime con SMTP de captura (Ethereal/Mailtrap) — la hace el arquitecto.
  - _Requisitos: 5.3, 5.4_
