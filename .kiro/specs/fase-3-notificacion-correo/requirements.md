# Fase 3 — Notificación por correo de un clic

## Introducción

Hoy Laura revisa la condición de cada persona y, cuando está conforme, debería poder
**notificar al usuario por correo de un solo clic**: su condición (la individual de una
métrica o la consolidada de producción) más los **pasos del playbook** de esa condición,
que ya existen en `PlaybooksModule`. Esto cierra el ciclo "revisión humana → acción", tal
como pidió Laura en la sesión del PO (botón de confirmación tras la revisión).

Cubre la feature #6 del roadmap. Arranca con **SMTP** (migración futura a Google Workspace,
fuera de alcance de esta fase, ver security.md).

## Decisiones de dominio / alcance

- El envío es **manual y deliberado** (un clic tras revisión humana), nunca automático.
- El correo incluye: nombre de la persona, condición evaluada, explicación, y los **pasos
  del playbook** de esa condición (título + pasos).
- Destinatario: el `email` del usuario/recurso evaluado.
- **Fuera de alcance:** programación/cron de envíos, plantillas multi-idioma, adjuntos,
  tracking de apertura, e integración Google Workspace.

## Requisitos

### Requisito 1 — Configuración SMTP por entorno

**Historia:** Como operador, quiero configurar el servidor SMTP por variables de entorno,
para no exponer credenciales en código y poder cambiar de proveedor sin recompilar.

#### Criterios de aceptación
1. EL backend DEBERÁ leer la config SMTP de variables de entorno (host, puerto, usuario,
   password, remitente).
2. SI la config SMTP no está presente ENTONCES el envío DEBERÁ fallar con un error claro
   (no romper el arranque de la app; el resto del sistema sigue funcionando).
3. LAS credenciales NUNCA DEBERÁN logearse ni exponerse en respuestas de la API.
4. `.env.example` DEBERÁ documentar las variables SMTP (sin valores reales).

### Requisito 2 — Servicio de correo

**Historia:** Como sistema, quiero un servicio de correo encapsulado, para enviar mensajes
sin acoplar el resto del backend al proveedor SMTP.

#### Criterios de aceptación
1. EL backend DEBERÁ exponer un servicio de correo con un método de envío (destinatario,
   asunto, cuerpo).
2. EL servicio DEBERÁ usar una librería SMTP estándar y mantenida (nodemailer), con versión
   pinneada.
3. LOS errores de envío DEBERÁN propagarse como excepciones tipadas (las de
   `common/exceptions`), nunca `throw new Error`.

### Requisito 3 — Endpoint de notificación de condición

**Historia:** Como Laura, quiero un endpoint que, dado un recurso y su condición, envíe el
correo con los pasos del playbook.

#### Criterios de aceptación
1. EL backend DEBERÁ exponer `POST /notifications/condition` protegido por guard, que reciba
   el `resourceId` y la `condition` (y opcionalmente la explicación / tipo individual vs
   consolidada).
2. EL servicio DEBERÁ resolver el `email` y `name` del recurso, y el playbook activo de esa
   condición, y componer el correo.
3. SI el recurso no tiene email o no existe playbook para la condición ENTONCES DEBERÁ
   responder un error claro (404/400 según el caso), sin enviar.
4. LA entrada DEBERÁ validarse en la frontera (DTO + class-validator); la condición debe ser
   una `HubbardCondition` válida.
5. LA respuesta DEBERÁ confirmar el envío (a quién y qué condición) sin incluir credenciales.

### Requisito 4 — Botón de un clic en la UI

**Historia:** Como Laura, quiero un botón "Notificar al usuario" en la vista de la persona,
para enviar el correo tras revisar, con confirmación visual.

#### Criterios de aceptación
1. LA UI DEBERÁ mostrar un botón de notificación junto a la condición (dashboard del recurso
   y/o consolidado).
2. AL hacer clic DEBERÁ llamar al endpoint y mostrar feedback (toast de éxito/error).
3. EL botón DEBERÁ deshabilitarse mientras se envía (evitar doble envío).
4. EL botón DEBERÁ tener `data-testid` estable para E2E.

### Requisito 5 — Seguridad y no-regresión

#### Criterios de aceptación
1. EL endpoint nace protegido por guard (como el resto). Si se decide abrirlo, señalarlo
   explícitamente.
2. NO se DEBERÁ transmitir datos del proyecto a terceros más allá del envío del correo
   solicitado explícitamente por el usuario.
3. EL build de backend y frontend DEBERÁ quedar limpio; `getDiagnostics` sin errores.
4. SI el servicio de correo no puede inicializarse (sin SMTP), el resto de la app DEBERÁ
   seguir operando con normalidad.
