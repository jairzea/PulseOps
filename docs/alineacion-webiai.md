# PulseOps ↔ Estándar Webi.AI SDK — Alineación de infraestructura

> Documento de trabajo para alinear con Arquitectura antes de adaptar PulseOps al estándar
> de infraestructura de la organización (`docs/infra webiai.md`, reglas R01–R10).
> **No es un plan de migración aprobado**: es la base para decidir alcance con el arquitecto.

## Contexto en una frase

El estándar Webi.AI define **cómo se despliega la infraestructura de un "bundle"** (SST + Pulumi
sobre AWS, runtime Bun, contrato `env.ts`, factories, recursos compartidos vía SSM). **No dicta
cómo se escribe la app** (NestJS/React internos). La brecha con PulseOps es de **plataforma de
despliegue**, no de código de aplicación.

---

## Parte 1 — Preguntas de alineación para el arquitecto

Ordenadas: primero las que **bloquean** decisiones, luego las de detalle.

### Alcance y tiempos
1. **¿El estándar es obligatorio para PulseOps desde ya, o es el destino a mediano plazo?**
   ¿Se puede desplegar el **staging de pruebas** como está (Docker Compose) para que Laura y el
   equipo lo usen mañana, y migrar al estándar en una iniciativa aparte? ¿O no se aprovisiona nada
   que no sea un bundle Webi.AI?
2. **¿Hay una fecha/hito en que PulseOps deba estar ya como bundle Webi.AI?** (para dimensionar si
   es urgente o planificable).

### Runtime y plataforma
3. **Runtime:** el estándar corre en **Bun**; PulseOps corre en **Node ≥ 20** (NestJS). ¿Se exige
   migrar a Bun, o Node es aceptable dentro de un bundle? (NestJS sobre Bun no es trivial ni
   plenamente soportado).
4. **IaC:** ¿es obligatorio **SST + Pulumi** (con `sst.config.ts`, `infra/app.ts`, factories,
   `register/restore`), o se acepta contenedor + Compose para staging?
5. **Cloud:** el estándar asume **AWS** (VPC, ECS, API Gateway, Cognito, SSM). ¿PulseOps debe
   desplegarse en AWS? ¿En qué cuenta/organización?

### Decisiones de dominio ya tomadas distinto (las más sensibles)
6. **Base de datos:** PulseOps usa **MongoDB**. Todos los ejemplos del SDK son AWS-nativos y no vi
   patrón para Mongo. ¿Se soporta Mongo (Atlas / DocumentDB / contenedor) dentro de un bundle, o el
   estándar empuja a otra persistencia?
7. **Autenticación:** PulseOps usa **JWT propio (Passport)**; el estándar muestra **Cognito**.
   ¿Se exige migrar a Cognito, o la auth propia de la app es válida mientras cumpla el estándar de
   infra?
8. **Secretos:** ¿el `JWT_SECRET`, la private key de la **GitHub App** y SMTP se gestionan vía el
   contrato `env.ts` + SSM del estándar? ¿Quién los provisiona (arquitectura) y cómo se cargan?

### Referencia y soporte
9. **¿Hay un bundle de referencia** (`cloud.core` se menciona como canónico) al que podamos mirar
   para replicar estructura, o un template de arranque (`webiai init`)?
10. **¿Existe el tooling** (`webiai` CLI, `@webiai/sdk.infra`) disponible para nosotros, con acceso
    y documentación de instalación?
11. **¿Quién acompaña la primera adaptación** desde arquitectura? (revisión de que el bundle cumple
    R01–R10 antes del primer deploy).

### Recomendación que llevamos a la mesa
> **Proponer dos tiempos:** (a) staging de pruebas **ya**, con el despliegue actual (Docker), para
> validar producto con el PO; (b) **adaptación al estándar** como iniciativa separada con su propia
> spec. Meter la migración de infra a la carrera antes de la demo contradice el propio principio
> R01 del estándar ("las desviaciones deben ser una decisión consciente, no un accidente").

---

## Parte 2 — Gap analysis: PulseOps hoy vs estándar Webi.AI

Leyenda de esfuerzo: 🟢 bajo · 🟡 medio · 🔴 alto/decisión de fondo.

| Dimensión | PulseOps hoy | Estándar Webi.AI | Brecha | Esfuerzo |
|---|---|---|---|---|
| **Runtime** | Node ≥ 20 | Bun (ejecuta TS directo) | NestJS→Bun no trivial; validar soporte | 🔴 |
| **IaC** | `docker-compose` + `Dockerfile` | SST + Pulumi (`sst.config.ts`, `infra/app.ts`) | No existe capa SST/Pulumi | 🔴 |
| **Cloud** | Agnóstico (contenedores) | AWS (VPC, ECS, API GW, SSM) | Definir cuenta y topología AWS | 🔴 |
| **Estructura de artefacto** | Monorepo npm (`apps/`, `packages/`) | Bundle: `webiai.config.mjs`, `infra/` + `shared/` | Falta la estructura de bundle | 🟡 |
| **Contrato de entorno** | `.env` leído por `ConfigService` (Nest) | `env.ts` tipado + visitor + `.env` de valores | Reescribir contrato como `env.ts` | 🟡 |
| **Construcción de recursos** | N/A (no hay IaC) | Factories obligatorias que devuelven wrappers | Construir factories por recurso | 🔴 |
| **Recursos compartidos** | N/A | `shared/resources/` + `register()`/`restore()` vía SSM | Solo si hay múltiples stacks | 🟡 |
| **Base de datos** | MongoDB (Mongoose) | Ejemplos AWS-nativos; sin patrón Mongo visible | Confirmar persistencia soportada | 🔴 |
| **Autenticación** | JWT propio (Passport) | Cognito en los ejemplos | Confirmar si se exige Cognito | 🔴 |
| **App (NestJS/React)** | Estándar del repo | **Fuera del alcance** del doc de infra | Sin cambios esperados | 🟢 |
| **Documentación de infra** | READMEs / steering | JSDoc funcional en env, factories, recursos (R02/R04/R08) | Documentar al estilo del estándar | 🟢 |

### Lo que NO cambia
- El código de aplicación (controllers NestJS, componentes React, motor `analysis-engine`,
  integración GitHub que acabamos de construir). El estándar es de **infraestructura**, no de app.

### Lo que exige decisión de arquitectura antes de estimar (🔴)
- **Runtime Node vs Bun**, **Mongo vs persistencia AWS**, **JWT propio vs Cognito**. Estas tres no
  son de implementación: son de plataforma y las define arquitectura. Hasta no resolverlas, no hay
  estimación fiable de la migración.

### Ruta sugerida (si el estándar se confirma obligatorio)
1. Conseguir tooling `webiai` + bundle de referencia (`cloud.core`).
2. Spec `migracion-webiai` (requirements → design → tasks) con las decisiones 🔴 ya resueltas.
3. Envolver PulseOps como bundle: `webiai.config.mjs`, `infra/app.ts`, `env.ts`, factories.
4. Resolver persistencia (Mongo) y auth (JWT/Cognito) según lo acordado.
5. Primer deploy acompañado por arquitectura, validando R01–R10.

> Mientras tanto, el staging de pruebas puede correr con el despliegue actual para no bloquear al PO.
