# Integración con repositorios — Estadísticas automáticas desde Git

## Introducción

Hoy las métricas de cada persona se registran a mano (o por CSV). Para los roles que
producen en código (Developers, QA, Arquitectos), las estadísticas pueden derivarse
directamente del **historial Git** de los repositorios. Esta iniciativa automatiza esa
ingesta: conecta los repos, calcula las métricas del framework por persona y semana, y las
deja como `MetricRecord` para que el motor, el consolidado y las alertas funcionen sin
cambios.

Proveedores: **GitHub primero, Bitbucket después** (ambos en esta iniciativa, GitHub como
primer entregable). Diseño detrás de una interfaz para añadir proveedores sin reescribir.

## Fuente de verdad — DOS familias de métricas según rol

Las métricas se derivan del repositorio, pero **el método difiere por rol**:

### Developers / Arquitectos — análisis de líneas (blame)
Confirmado con el documento de Gemini / skill `repository`. Se calcula analizando el
historial Git con origen línea-por-línea (`git blame`), NO desde la API REST.
- **Principales (cuentan para producción):**
  - **NUI** = Gross Insertions − Self-Churn. Unidad: líneas.
  - **Development Efficiency** = (Net Delta / Gross Insertions) × 100; Net Delta = Gross −
    Total Deletions. Unidad: %.
- **Complementarias (seguimiento):** UIP/d, Working Days, Commits/día, Self-Churn Rate,
  Fix Ratio (freq y vol).

### QA — criterios de aceptación (no es conteo de líneas)
Confirmado con "Respuestas - Estadísticas de QA". La fuente es el **contenido de los
commits** (criterios de aceptación marcados) y el **ciclo de vida de ramas** (slice/bugfix
integradas y eliminadas), NO el volumen de código.
- **Principal (cuenta para producción):** **Criterios de aceptación validados** =
  sumatoria de ACs de ramas (slice/bugfix) integradas y eliminadas en la semana. Para
  contar, un AC debe estar automatizado (existe el test) y pasar (cierra la rama).
- **Seguimiento:** **Criterios de aceptación automatizados** = ACs marcados como
  implementados en las slice cards, cada uno vinculado a un commit.

Ejemplo real (push de QA): `qa(e2e): update checklist — 26/26 ACs pass ...` con líneas
`AC-EN-01 to 09: ✅ Pass`, rama `solution/enrollment-email-notifications`. De ahí se extraen
los ACs validados, no líneas de código.

> Los Arquitectos usan el método de Developers (líneas). Cada persona tiene un rol que
> determina qué estrategia de cálculo aplica.

## Roles que aplican
Developers y Arquitectos (método líneas); QA (método criterios de aceptación).

## Requisitos

### Requisito 1 — Conexión a proveedores Git

**Historia:** Como admin, quiero conectar la organización a GitHub (y luego Bitbucket) con
credenciales seguras, para que el sistema pueda leer el historial de los repos.

#### Criterios de aceptación
1. EL sistema DEBERÁ soportar un **token de organización** (configurado por el admin) y,
   opcionalmente, **token por usuario**.
2. LOS tokens DEBERÁN almacenarse de forma segura (variables de entorno o almacenamiento
   cifrado), NUNCA en código ni en respuestas de la API, ni en logs.
3. EL diseño DEBERÁ aislar el proveedor tras una interfaz (`RepoProvider`), de modo que
   añadir Bitbucket no requiera tocar la lógica de cálculo ni de scheduling.
4. SI faltan credenciales ENTONCES la sincronización DEBERÁ fallar con error claro sin
   romper el resto de la app.
5. EL token DEBERÁ requerir solo permisos de **lectura** del historial (scope mínimo).

### Requisito 2 — Asociación persona ↔ cuenta de repositorio

**Historia:** Como admin, quiero asociar cada persona (dev/QA) con su cuenta del proveedor,
para atribuir correctamente los commits.

#### Criterios de aceptación
1. CADA persona DEBERÁ poder vincularse a una o más identidades del proveedor (username
   y/o email del commit).
2. EL sistema DEBERÁ **sugerir un match automático** cuando el email de la cuenta del
   proveedor coincida con el correo de empresa de la persona.
3. EL admin DEBERÁ poder **confirmar, asociar y desasociar** manualmente la vinculación.
4. LA asociación DEBERÁ poder definir **qué repositorios** cuentan para cada persona (todos
   los de la org o un subconjunto).
5. SIN asociación confirmada, los commits de esa identidad NO DEBERÁN atribuirse (se
   reportan como no asignados, no se inventan).

### Requisito 3 — Cálculo de métricas por persona y semana (según rol)

**Historia:** Como sistema, quiero calcular las métricas del rol de cada persona por semana,
de forma determinística y trazable.

#### Criterios de aceptación
1. EL cálculo DEBERÁ seleccionar la **estrategia según el rol** de la persona:
   - **Developer/Arquitecto:** NUI y Development Efficiency (principales) + complementarias,
     vía análisis de líneas (blame).
   - **QA:** Criterios de aceptación validados (principal) + automatizados (seguimiento),
     vía análisis del contenido de commits y ciclo de vida de ramas.
2. EL self-churn (dev) DEBERÁ calcularse por **origen de línea (`git blame`)**, atribuyendo
   retrabajo solo cuando el origen está dentro del scope de la persona/periodo.
3. LOS criterios de QA validados DEBERÁN extraerse del **título del merge commit**
   (`N/N ACs pass`), contados en la **semana del merge**. La definición de los ACs reside en
   documentos dentro de `e2e/` por bundle (para el conteo de automatizados, si se incluye).
4. EL cálculo (dev) DEBERÁ aplicar las **exclusiones estándar** y excluir commits `qa()` y
   merges según el framework.
5. LA semana DEBERÁ ser configurable; por defecto **jueves–miércoles GMT-5**.
6. EL cálculo DEBERÁ ser determinístico (mismo repo + rango → mismo resultado) y no
   modificar los repos (solo lectura/clonado).

### Requisito 4 — Persistencia como MetricRecord

**Historia:** Como sistema, quiero guardar las métricas calculadas en el modelo existente,
para que el motor y el consolidado las usen sin cambios.

#### Criterios de aceptación
1. CADA métrica calculada DEBERÁ persistirse como `MetricRecord` (resourceId, metricKey,
   week, value) vía upsert idempotente.
2. EL `source` del record DEBERÁ indicar el origen (`github`/`bitbucket`), distinguiéndolo
   de `manual`.
3. RE-sincronizar la misma semana DEBERÁ actualizar (no duplicar) los records existentes.
4. LAS métricas DEBERÁN registrarse con `metricKey` estables (ej. `nui`, `dev_efficiency`,
   ...) y poder marcarse como producción/estudio/seguimiento por la config de Fase 2.

### Requisito 5 — Sincronización programada y a demanda

**Historia:** Como admin, quiero que la sincronización corra automáticamente cada semana y
también poder dispararla manualmente.

#### Criterios de aceptación
1. EL sistema DEBERÁ ejecutar la sincronización **automáticamente** en un horario
   configurable; por defecto **miércoles 6:00 PM** (cierre de la semana del framework).
2. EL admin DEBERÁ poder **disparar la sincronización a demanda** desde la UI.
3. LA sincronización DEBERÁ ser **resiliente**: el fallo de un repo o una persona no
   detiene el resto; se reporta por elemento.
4. EL proceso DEBERÁ registrar un resumen del run (qué se sincronizó, errores, duración) y
   exponerlo para revisión.
5. LA sincronización NO DEBERÁ bloquear la app (proceso en background; respeta la regla de
   no lanzar procesos largos que bloqueen).

### Requisito 6 — Seguridad y privacidad

#### Criterios de aceptación
1. EL sistema DEBERÁ leer **solo metadata e historial** (conteos de líneas, autoría), nunca
   exponer ni almacenar el código fuente del cliente más allá del clon temporal necesario.
2. EL clon temporal DEBERÁ limpiarse tras el cálculo; no se persiste el código.
3. LOS endpoints de configuración/sync DEBERÁN estar protegidos por guard y restringidos a
   admin.
4. NO se DEBERÁN transmitir datos del proyecto a terceros fuera de la lectura de los repos
   autorizados.

### Requisito 7 — No-regresión
1. LA ingesta manual existente (`RecordsService`) DEBERÁ seguir funcionando.
2. Tipos y build DEBERÁN quedar limpios end-to-end; lógica no trivial deja verificación
   ejecutable.
