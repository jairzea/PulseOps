# Plan de implementación — Fase 3

- [ ] 1. Dependencia y configuración SMTP
  - Añadir `nodemailer` + `@types/nodemailer` (pinneados) a `apps/backend`. Documentar variables SMTP en `.env.example` (sin valores).
  - _Requisitos: 1.1, 1.4, 2.2_

- [ ] 2. MailService (transport SMTP aislado)
  - `notifications/mail.service.ts`: `sendMail({to,subject,html,text})` con transport desde `ConfigService`. Si falta `SMTP_HOST` → excepción tipada (no rompe arranque). Nunca logea credenciales.
  - _Requisitos: 1.2, 1.3, 2.1, 2.3, 5.4_

- [ ] 3. Composición del correo (función pura) + verificación
  - Función que arma asunto y cuerpo (texto+HTML) a partir de nombre, condición, explicación y pasos del playbook. Dejar **una verificación ejecutable** (assert sin framework) sobre la composición, sin enviar.
  - _Requisitos: 3.2_

- [ ] 4. NotificationsService + endpoint
  - `notifyCondition(resourceId, condition, opts?)`: resuelve usuario (email/name) y playbook, compone y envía. `POST /notifications/condition` con guard + `NotifyConditionDto` validado. Errores claros si falta email o playbook.
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

- [ ] 5. Registrar módulo
  - `NotificationsModule` (importa PlaybooksModule, UsersModule, ConfigModule) en `app.module.ts`.
  - _Requisitos: 2.1_

- [ ] 6. Frontend: API + botón de un clic
  - `notificationsApi.notifyCondition()`; botón "Notificar al usuario" en el badge consolidado del dashboard con `data-testid`, estado de envío (deshabilitado mientras va) y toast de éxito/error.
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Verificación de cierre
  - `getDiagnostics` limpio; build backend + typecheck frontend en verde; verificación de composición pasa. Validación runtime con SMTP de captura (Ethereal/Mailtrap) — la hace el arquitecto.
  - _Requisitos: 5.3, 5.4_
