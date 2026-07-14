---
inclusion: always
---

# Webi.AI SDK — Infrastructure Architecture (Bundles)

Architectural notes on **how infrastructure is built and organized inside a bundle** of the
Webi.AI SDK. `cloud.core` is taken as the canonical reference.

## How to read this document

- Each rule has a **strict, narrow scope**. We avoid general rules: we prefer many small rules,
  independently evaluable, whose **combination** describes the full architecture of the system.
- Rules are numbered (`R01`, `R02`, …) and have a short name.
- Each rule states **when it applies**, so it is possible to decide whether it is relevant in a
  given context.
- Criticality: high. It is not 100% strict, but it is the baseline that keeps the architecture
  simple and extensible. Deviating must be a conscious decision, not an accident.
- **Any deviation from, or ambiguity about, these rules must be validated with the user first.**
  Autonomous decisions that change the architecture or contradict it are prohibited. When a rule
  is unclear, or a situation is not covered, or following a rule seems wrong for the case at hand,
  stop and confirm with the user before proceeding — never resolve it unilaterally.

---

## R01 — Root files of a bundle's infrastructure

**Scope:** Structural. Identifies the files that make up the core of a `bundle` artifact's
infrastructure and the **purpose** of each one. It does not cover *how* the content of each file
is written (that belongs to later rules).

**When it applies:** When creating, reviewing, or aligning the root infrastructure structure of a
bundle. If one of these files is missing, or its purpose is mixed with another's, the structure
does not satisfy the rule.

**Rule:** A bundle's infrastructure is organized around **four main files**, each with a single,
non-overlapping purpose:

| # | File | Location | Purpose (the question it answers) |
|---|------|----------|-----------------------------------|
| 1 | `sst.config.ts` | artifact root | **SST entry point.** The file SST expects to find in order to start. Its sole responsibility is to wire up the stack definition; it contains no infrastructure logic. Answers *"where does SST enter?"*. |
| 2 | `infra/app.ts` | infra root | **Stack definition and composition root.** Declares which resources exist and orchestrates the order in which they are built. It is the single place where *"what infrastructure exists and how it is composed"* lives. |
| 3 | `infra/env.ts` | infra root | **Typed environment contract.** Declares which input variables the stack consumes and exposes them as a typed schema for `app.ts` to use. Answers *"what environment inputs does this stack need?"*. |
| 4 | `.env` | artifact root | **Local source of the stack's environment inputs.** Declares the concrete values for the stack's *own* input variables — the ones the `env.ts` contract consumes (e.g. `VPC_NETWORK_IDENTIFIER`, `LOCAL_PORT_*`). It does **not** carry invocation context such as the stage or the app/stack identity: those are provided by the Webi.AI CLI at invocation time (`--stage`, config-chain resolution), not committed to `.env`. Answers *"with which input values does the stack run locally?"*. |

**Separation principle:** each file answers a single question. The entry point (1) does not define
resources; the definition (2) does not declare the environment contract; the contract (3) does not
fix values; the local values (4) contain no logic. The architecture emerges from keeping these
four responsibilities separate.

---

## R02 — The environment contract (`env.ts` + `.env`)

**Scope:** The environment layer of a stack: the `env.ts` contract (typed schema + visitor) and
the `.env` file that feeds it. Defines the shape of the contract, where raw variables are read,
how `.env` relates to it, and a documentation requirement for every declared variable. It does
not cover how resources in `app.ts` consume the resulting schema.

**When it applies:** When creating a stack's `env.ts`, or adding, removing, or reviewing any
environment variable a stack consumes.

**Rule:**

1. **Two artifacts, one responsibility each.** `env.ts` exports exactly:
   - `interface <Name>Env` — the **typed schema**: the domain-shaped, structured view of the
     stack's configuration (grouped by concern, e.g. `aws.region`, `vpc.networkIdentifier`).
   - `<name>EnvVisitor: EnvVisitor<<Name>Env>` — the **adapter**: the single place that reads raw
     environment variables by name and produces the typed schema.

2. **The visitor is the only reader of raw env vars.** Raw variable names (`AWS_REGION`,
   `VPC_NETWORK_IDENTIFIER`, `LOCAL_PORT_*`, …) appear only inside the visitor. Type coercion
   (`.string()`, `.bool()`, `.number()`), optionality (`.optional`), and defaults
   (`?? 'us-east-1'`) are declared there. The rest of the stack consumes the typed schema
   (`this.env.schema`), never `process.env` directly.

3. **`.env` mirrors the raw vars the visitor reads.** `.env` supplies values only for the raw
   variables the visitor consumes that are not provided as invocation context (stage / app /
   stack — see R01) nor sourced from SSM. The set of keys in `.env` is a subset of the raw vars
   referenced by the visitor.

4. **Every variable in the schema MUST be documented functionally.** Each field of `<Name>Env`
   carries documentation stating:
   - **What it is** — its functional meaning (not merely its type).
   - **Its side effect** — what infrastructure behavior or decision the value drives.

   Recommended completeness: also note the backing raw variable name and whether it is required or
   has a default. A schema field without functional documentation does not satisfy the rule.
   This applies equally to fields resolved inside a lazy thunk (see point 5).

5. **Eager vs lazy resolution of schema fields.** The axis is *when* a field is resolved and
   validated, independent of whether its value is optional or required:
   - **Eager** — a plain value the visitor resolves *when it runs* (at stack load). Use this for
     configuration whose presence is unconditional. An eager field may be optional (`.optional` +
     default) or required (`.string()!`); if a required eager field's variable is missing, the
     stack **must fail to load** — that is the desired behavior, it must not run without it.
   - **Lazy** — a **thunk** (`() => ({ ... })`) that defers reading and validating its raw
     variables until the field is invoked. Use this for configuration that is **required only in
     certain contexts**. Required reads (`.string()!`, `.number()!`) live *inside* the function,
     so their enforcement happens at the point of use, not at load time. A lazy field may
     additionally be made conditional (`SST_LOCAL ? () => ({ ... }) : undefined`) so it is
     `undefined` when it does not apply.

   Rationale: a required variable that is *always* needed should be eager, so the stack refuses to
   run when it is missing. A required variable needed *only sometimes* should be lazy, so load
   does not fail on configuration that is irrelevant to the current execution; the read and its
   enforcement move to the moment the value is actually needed.

**Example (documentation shape):**

```typescript
/** Environment schema for the CloudCore stack. */
export interface CloudCoreEnv {
  /**
   * Whether the stack runs in local/dev mode.
   * Side effect: switches services to their dev runners (no real AWS service is
   * created) and enables local port wiring.
   * Backed by SST_LOCAL (optional, default false).
   */
  local: boolean;

  aws: {
    /**
     * AWS region the stack deploys into.
     * Side effect: every regional resource (VPC, ECS, gateways) is created here.
     * Backed by AWS_REGION (optional, default 'us-east-1').
     */
    region: string;
  };

  vpc: {
    /**
     * First two octets of the VPC CIDR (e.g. '10.1').
     * Side effect: determines the VPC address space and every subnet derived from
     * it; collides with other VPCs that share the same identifier.
     * Backed by VPC_NETWORK_IDENTIFIER (optional, default '10.0').
     */
    networkIdentifier: string;
  };

  /**
   * Lazily-resolved configuration required only in certain contexts.
   * Resolved on invocation; reading it enforces its required variables.
   */
  lazyResolved: () => {
    /**
     * <what it is>.
     * Side effect: <what it drives>.
     * Backed by LAZY_VAR_1 (required — enforced when lazyResolved() is called).
     */
    lazyVar1: string;
    /**
     * <what it is>.
     * Side effect: <what it drives>.
     * Backed by LAZY_VAR_2 (required — enforced when lazyResolved() is called).
     */
    lazyVar2: string;
  };
}
```

```typescript
export const cloudCoreEnvVisitor: EnvVisitor<CloudCoreEnv> = (env) => ({
  // Eager (optional): resolved at load with a default.
  local: env.SST_LOCAL?.optional.bool() ?? false,
  aws: { region: env.AWS_REGION?.optional.string() ?? 'us-east-1' },
  vpc: { networkIdentifier: env.VPC_NETWORK_IDENTIFIER?.optional.string() ?? '10.0' },

  // Lazy: required reads inside the thunk, enforced only when invoked.
  lazyResolved: () => ({
    lazyVar1: env.LAZY_VAR_1.string()!,
    lazyVar2: env.LAZY_VAR_2.string()!,
  }),
});
```

---

## R03 — Stack-owned resources as grouped class fields

**Scope:** Structural, limited to **how the resources a stack owns are declared and grouped as
class attributes** in `infra/app.ts`. It does not cover how those fields are populated (the
`run()` init phases) nor how resources are built (factories) — those are separate rules.

**When it applies:** When declaring, adding, or reviewing the resources a stack owns on the stack
class.

**Rule:**

1. **One `readonly` field per group.** Every resource the stack owns is exposed as a `readonly`
   class field, organized into **groups**, with one field per group. A group is either a
   **resource category** (Approach A) or a **cohesive domain** (Approach B) — see point 4. The
   field name is a noun naming the group (`vpcs`, `gateways`, `clusters`, `cognito`), optionally
   preceded by a header comment (`// API Gateways`, `// Cognito (auth domain)`).

2. **Each group is a typed nested object, keyed by logical name.** A group field is an inline
   object type whose keys are the **logical names** of the resource instances, each typed with its
   **canonical resource type** (e.g. `wfaws.vpc.Vpc`, `wfaws.apiGateway.ApiGateway`,
   `wfaws.cognito.UserPool`). A group MAY nest sub-objects; a single resource is a direct leaf.

3. **Initialized as an empty skeleton.** Each field is initialized to `{} as any`. When the group
   has nested sub-objects, the skeleton pre-seeds those container objects
   (`{ auth: {}, lambda: {}, appWeb: {} } as any`, `{ userPools: {}, clients: {} } as any`) so
   leaves can be assigned later without a null dereference. `readonly` applies to the container
   identity; the leaves are filled in during the init phases (out of scope here).

4. **Two grouping approaches — choose by cohesion.** The top-level axis of a group can be either:
   - **Approach A — by resource type.** The field is a resource *category* and sub-groups (if any)
     are by domain/consumer. Use when the resource is a standalone primitive that is shared or
     consumed across domains (`vpcs`, `clusters`, `gateways.auth` / `gateways.lambda`).
   - **Approach B — by domain.** The field is a *cohesive domain* and sub-groups are by the
     heterogeneous construct types that make up that domain (each still keyed by logical name, and
     each able to hold multiple instances). Use when several heterogeneous constructs form one
     indivisible aggregate that is always referenced as part of the domain — e.g. a Cognito user
     pool is meaningless without its clients and resource servers, so they live under `cognito`
     rather than as separate `userPools` / `clients` / `resourceServers` top-level fields.

   Decision criterion: **cohesion.** Independent primitives of the same kind → group by type.
   Heterogeneous constructs that only make sense together → group by domain. The two approaches can
   coexist in the same stack (e.g. `vpcs` and `clusters` by type, `cognito` by domain). Mechanically
   both follow points 1–3 identically; only the top-level axis differs.

5. **Purpose — the wiring surface (with a transient exception).** These fields exist so that
   **every resource that may need to be referenced is available for wiring from anywhere in the
   stack**. They are the typed, hierarchical, discoverable handle to what the stack owns
   (`this.vpcs.main`, `this.cognito.userPools.main`) and the single in-stack reference point for
   connecting resources together.

   **Exception — transient resources.** A resource that is purely terminal/auxiliary and is not
   expected to be referenced after creation does **not** need a class field; it may be created
   inline within its init phase. Typical cases: a queue subscription, a route attachment, an SNS
   subscription, a bucket lifecycle configuration — wiring artifacts that connect existing
   resources and are never read back.

   Default bias: **when in doubt, expose it** — the purpose of the fields is wiring availability,
   so omit only when the resource is clearly transient. If a transient resource later turns out to
   need referencing, promote it to a field at that point.

**Example (declaration shape):**

```typescript
export class Core extends Stack<CloudCoreEnv> {
  // VPC resources
  readonly vpcs: {
    main: wfaws.vpc.Vpc;
  } = {} as any;

  // API Gateways
  readonly gateways: {
    swagger: wfaws.apiGateway.ApiGateway;
    auth: {
      bff: wfaws.apiGateway.ApiGateway;
      api: wfaws.apiGateway.ApiGateway;
    };
    lambda: {
      api: wfaws.apiGateway.ApiGateway;
    };
    appWeb: {
      api: wfaws.apiGateway.ApiGateway;
    };
  } = { auth: {}, lambda: {}, appWeb: {} } as any;

  // ECS Clusters
  readonly clusters: {
    main: wfaws.ecs.ServiceCluster;
  } = {} as any;
}
```

**Example (Approach B — by domain):**

```typescript
export class Core extends Stack<CloudCoreEnv> {
  // Cognito (auth domain) — pools, clients and resource servers are one aggregate
  readonly cognito: {
    userPools: {
      main: wfaws.cognito.UserPool;
      partners: wfaws.cognito.UserPool;
    };
    clients: {
      web: wfaws.cognito.UserPoolClient;
      mobile: wfaws.cognito.UserPoolClient;
    };
    resourceServers: {
      api: wfaws.cognito.ResourceServer;
    };
  } = { userPools: {}, clients: {}, resourceServers: {} } as any;
}
```

---

## R04 — Factories: the required pattern for resource construction

**Scope:** How resources are constructed. The **factory** is the predominant and **required**
pattern for **every** resource construction in a stack. Covers the `factories/` folder structure,
what a factory is, and how factories coordinate with the stack's resource fields (R03). It does
not cover the `SharedResource` register/restore mechanism — that is a separate rule (the factory's
return type is the wrapped resource, but its cross-stack lifecycle is out of scope here).

**When it applies:** Whenever a resource (or a cohesive set of resources) needs to be created.

**Rule:**

1. **Location and shape.** Resource construction lives in `infra/factories/`, with **one file per
   resource category or domain** (`vpc.ts`, `gateways.ts`, `cognito.ts`, …). Each file exports a
   **PascalCase `namespace`** named after the category/domain (`Vpcs`, `Gateways`, `Cognito`). An
   `index.ts` barrel re-exports every namespace (and any companion types). A namespace may also
   hold related pure helpers.

   Factories may also be **grouped into subfolders** when a category/domain has many members or
   warrants its own division (e.g. `factories/routes/api1.ts`, `factories/routes/api2.ts`, with a
   `factories/routes/index.ts` barrel that the top-level `index.ts` re-exports). The subfolder is
   just a finer-grained slice of the same grouping; the namespace/nesting rules (points 1 and 5)
   apply identically inside it.

2. **A factory builds the native construct and returns its `SharedResource` wrapper.** Inside the
   namespace each resource is a **named PascalCase function** (`Vpcs.Main`, `Gateways.Swagger`). A
   factory:
   - receives the **stack instance** as its first argument (`stack: Core`), plus an optional typed
     `config` object for extra inputs;
   - constructs the native/SDK construct(s) using the **`Type-Name` naming convention** — PascalCase
     segments joined by `-` (`Vpc-Main`, `Api-Swagger`, `CognitoUserPool-Default`; nested:
     `Api-Auth-Bff`, `ApiGw-Onboarding-Invitation`). Only `-`, `_` and PascalCase are universally
     safe; `@` and `.` are prohibited because they break physical names derived from the logical
     name (CloudWatch log groups reject `@`; ECS task families reject both `@` and `.`). `-` is the
     chosen separator;
   - **wraps the native construct in its `SharedResource` subclass and returns the wrapper**
     (`return new resources.clusters.MainCluster({ native: cluster })`); for a domain it returns a
     typed bundle of wrappers. It may be `async`.

   **Authoritative: a factory that builds a shared resource MUST return its wrapper, never the
   bare native construct.** The wrapper is the resource's single identity throughout the stack:
   - the R03 class field holds the **wrapper** (`this.clusters.main` is a `MainCluster`, typed with
     the shared type `wfaws.services.EcsCluster` — not the native `services.EcsCluster`);
   - registration is `this.<field>.register(this)` in `initExports` (R05 §8) — there is no separate
     ad-hoc `new Wrapper({ native }).register()` at export time;
   - the underlying construct is reached through the wrapper's **`.native`** accessor for any further
     in-stack wiring (`this.gateways.demo.native.route(...)`,
     `this.services.docker.native.cloudmapTarget()`) and for dependency reads by other factories
     (`stack.vpcs.main.native` — see point 4).

   Returning the native construct directly is a **prohibited deviation** for shared resources: it
   splits the resource's identity (native sitting in the field, wrapper conjured ad-hoc only at
   registration) and contradicts R05 §8's `this.<field>.register(this)`. The wrapper exposes only
   `.native`, `.register()`, `.restore()`, `.ref` — so all domain methods (`.route()`, `.cluster`,
   `.cloudmapTarget()`) are invoked through `.native`. This `.native` indirection is the deliberate
   cost of keeping one identity per resource.

   **Exception — internal-only resources.** A resource that is never registered, never restored,
   and only serves as internal wiring within the same stack (e.g. a `dependsOn` ordering
   dependency, a transient configuration resource) does NOT need a wrapper. It may return the
   native Pulumi resource directly. The criterion: **if it's never `register()`ed, it doesn't need
   a wrapper.** This avoids creating SharedResource subclasses for resources that have no
   cross-stack lifecycle.

3. **Single canonical construction point.** ALL resource construction goes through a factory.
   `app.ts` (and anything else) never instantiates a native/SDK construct directly with `new` — it
   calls the factory (`Vpcs.Main(this)`). There is exactly one factory that builds a given
   resource.

   **Exported factories produce stack-field resources.** Every function exported from the factory
   namespace produces a resource (or wrapper) that is assigned to a stack field (R03). The result
   has persistent identity in the stack — it is not transient/fire-and-forget.

   Transient resources (route attachments, inline subscriptions, permissions) are created as side
   effects *within* an exported factory or within an `init*` phase — they are NOT exported
   functions of the namespace. They have no corresponding stack field.

   **Internal helpers for dynamic/repetitive creation** (e.g. looping over a list to create N
   similar resources) are acceptable as **non-exported** private functions within the factory file.
   They serve as reusable construction logic called by the exported factory, not as public API
   themselves.

   Summary:
   - Exported namespace function → result goes to a stack field. Always.
   - Transient side-effect resource → created inline, no field, no export.
   - Dynamic helper → non-exported, called by an exported factory internally.

4. **Inputs come from the stack — coordination with R03.** A factory resolves everything it needs
   from the stack instance it receives:
   - the typed env schema (`stack.env.schema.vpc.networkIdentifier`),
   - flags such as `stack.local`,
   - **other resources it depends on, by reading their R03 class fields directly**
     (`stack.vpcs.main.native`, `stack.dns.apiDomain.native`).

   This is the **consumer side of R03's wiring surface**: factories wire resources together by
   accessing the stack's resource attributes, which is precisely why those resources must be
   registered as class fields (R03). Consequence: the stack must invoke factories in **dependency
   order**, so that any field a factory reads has already been populated by an earlier factory
   call (e.g. the VPC must exist on `stack.vpcs.main` before the cluster factory reads it).

   **Exception — intra-domain dependencies (narrow).** When a factory needs an output from a
   sibling resource that was created earlier in the **same init phase** AND that sibling is
   **not yet assigned to a stack field** at the point the factory is called (i.e. it's a local
   variable in the `init*` method, not yet on `this.*`), the value may be passed as a direct
   parameter. This is the **only** case where an additional positional arg is justified.

   If the sibling IS already on a stack field (e.g. `this.auth.userPool = Auth.UserPool(this)`
   was called and the field is populated), the factory MUST read it from the stack
   (`app.auth.userPool.native.id`) — not receive it as a param. The test is simple: **can
   `app.<field>` resolve it? → no param. Can't yet? → param is acceptable.**

   **Anti-pattern — argument pollution.** A factory whose signature carries values that the stack
   already exposes (env fields, other resource attributes, derived strings) is polluted. The
   canonical factory signature is `(stack: Stack)` or `(stack: Stack, intradomainSibling)` — never
   a bag of individually-passed values that the factory could read from the stack itself.

   Violations of this anti-pattern:

   | ❌ Polluted | ✅ Correct |
   |---|---|
   | `Domain(userPoolId)` | `Domain(app)` → reads `app.auth.userPool.native.id` |
   | `Client(poolId, region, prefix, idp)` | `Client(app)` → reads `app.auth.*`, `app.env.schema.*` |
   | `Service(clusterId, vpcId, port)` | `Service(app)` → reads `app.clusters.main`, `app.vpcs.main` |

   The rule: **if the value is reachable from the stack's wiring surface (R03 fields or env
   schema), it MUST NOT be a parameter.** The factory reads it internally. This keeps factory
   signatures minimal, self-documenting (the reader sees "it needs the stack" rather than
   deciphering 4 positional args), and resilient to refactoring (if the source field moves, only
   the factory body changes — callers are unaffected).

   **The only exception** is the intra-domain case above (sibling not yet on the stack). Even
   then, the stack remains the first parameter — the sibling is an additional positional arg, not
   a replacement for the stack.

   A factory that does **not receive the stack at all** (e.g. `Domain(userPoolId)`) is always
   wrong: it cannot access env, other groups, or any stack-level utility. It must receive the
   stack and resolve the value internally.

5. **Namespace nesting mirrors the field grouping.** The factory namespace structure reflects the
   R03 field grouping one-to-one: `Gateways.Auth.Bff` ↔ `this.gateways.auth.bff`,
   `Cognito.M2M.Service` ↔ the Cognito domain group. Naming and grouping stay consistent across the
   declaration (R03) and the construction (R04).

6. **Factories MUST be documented — at both the namespace and the function level.** A factory file
   is documentation of *what infrastructure the category/domain represents and why*, not just code.
   Two levels are required:

   - **Namespace (and file header) — the architectural role of the category/domain.** Document
     what this group of resources *is* in the architecture, what role it plays in the stack, who
     consumes it, and any cross-artifact relationship (e.g. "the single shared cluster connector
     services restore"). It answers *"what does this category contribute to the system and how does
     it fit?"* — not the mechanics of construction.

   - **Each factory function — the functional purpose of the specific resource.** Document what the
     resource *is for* (its functional and architectural intent), the meaningful decisions it
     encodes (e.g. private vs public subnets, spot vs on-demand, cost trade-offs), and the
     dependencies it wires from the stack (R03 fields it reads). Describe *purpose and consequence*,
     not a line-by-line restatement of the construct's options.

   The bias is **purpose over mechanics**: the reader should learn *why this resource exists and
   what it enables* from the doc, and *how it is built* from the code. Generic headers
   ("Creates X resources for the app") do not satisfy the rule — the documentation must state the
   resource's role in the architecture. This requirement is the factory-level application of the
   project-wide documentation rules (file header + JSDoc on exported symbols).

**Example (documented factory + consumption):**

```typescript
// factories/vpc.ts
/**
 * VPC Factory — the network foundation every other cloud.core resource sits on.
 *
 * Owns the single VPC that clusters, gateways and services attach to. Registered
 * as the `MainVpc` shared resource so connector artifacts restore the same network
 * instead of creating their own. Must be built before any factory that reads it.
 */
export namespace Vpcs {
  /**
   * Main VPC — the stack's address space and service-discovery namespace.
   *
   * Cost-optimized topology: 3 AZs, a single EC2 NAT instance that doubles as the
   * bastion (one box instead of managed NAT gateways), and a Cloud Map namespace
   * so private ECS services are reachable by name. The network identifier drives
   * the CIDR and therefore collides with any VPC sharing it.
   */
  export const Main = (stack: Core): wfaws.vpc.Vpc => {
    const native = new vpc.Vpc(`Vpc-${stack.env.schema.vpc.networkIdentifier.replace('.', '-')}`, {
      networkIdentifier: stack.env.schema.vpc.networkIdentifier,
      az: 3, nat: 'ec2x1', bastion: true,
    });
    return new resources.vpc.MainVpc({ native });   // wrapped resource (register/restore: separate rule)
  };
}

// factories/clusters.ts — reads the VPC from the stack field (R03 wiring surface)
/**
 * ECS Cluster Factory — the single shared compute cluster for cloud.core.
 *
 * Builds the one cluster that backs every Fargate service in the stack and is
 * registered as `MainCluster` for connector services to restore. Depends on the
 * VPC, so it runs after `initVpcs`.
 */
export namespace Clusters {
  /**
   * Main ECS cluster — private-subnet (production-safe default) cluster.
   *
   * Containers run in private subnets (no public IPs); ingress arrives only through
   * the gateways' VPC link. Reads the network from the stack's wiring surface.
   */
  export const Main = (stack: Core): wfaws.ecs.ServiceCluster => {
    const cluster = new ecs.ServiceCluster('Cluster-Main', {
      vpc: stack.vpcs.main.native,   // dependency obtained from the R03 class field
      subnets: 'private',
    });
    return new resources.clusters.MainCluster({ native: cluster });
  };
}

// app.ts — orchestrates in dependency order, assigning each result to its field
this.vpcs.main     = Vpcs.Main(this);       // must run first
this.clusters.main = Clusters.Main(this);   // reads this.vpcs.main.native

// Further in-stack wiring goes through `.native` (the wrapper exposes no domain methods)
this.gateways.demo.native.route('$default', {
  cloudMap: this.services.docker.native.cloudmapTarget().cloudmapArn,
});

// initExports — registration is on the field (the wrapper), not an ad-hoc wrapper
this.vpcs.main.register(this);
this.clusters.main.register(this);
this.gateways.demo.register(this);
this.services.docker.register(this);
```

---

## R05 — `run()` orchestration and `init*` phase methods

**Scope:** The stack class declaration in `infra/app.ts` — its constructor wiring — and its `run()`
method together with the `init*` phase methods that initialize resource groups. Covers how the
class is set up and how orchestration is structured and ordered. It does not cover the
`SharedResource` register/restore mechanism itself (a later rule); only the orchestration point
where registration is invoked is in scope.

**When it applies:** When writing or reviewing a stack's `run()` and its resource-initialization
methods in `infra/app.ts`.

**Rule:**

1. **The stack class and its entry point.** The stack is declared as
   `class <Name> extends Stack<TEnv>`. Its constructor calls `super(appConfig, visitor)`:
   - **`appConfig`** is a function returning `{ app, stack, retain, home }` — `app` from
     `SST_APP` (required), `stack` from `SST_STACK` (optional), `retain` from `SST_RETAIN`
     (optional), and `home: 'aws'`. These come from the **invocation context injected by the CLI**,
     not from `.env` (R01/R06).
   - **`visitor`** is the `<name>EnvVisitor` from `env.ts` (R02) — this is how the typed schema
     becomes available as `this.env.schema`.

   The class overrides **`run()`**, the orchestration entry point SST ultimately invokes (via
   `resolve()` → `$config({ app, run })`); the `export default` factory returns `new <Name>()` and
   `sst.config.ts` calls `createApp().resolve()` (R01).

   ```typescript
   export class Core extends Stack<CloudCoreEnv> {
     constructor() {
       super(() => ({
         app:    Env.var('SST_APP').string()!,
         stack:  Env.var('SST_STACK').optional.string(),
         retain: Env.var('SST_RETAIN').optional.bool(),
         home: 'aws',
       }), cloudCoreEnvVisitor);
     }
     async run(): Promise<void> { /* ... */ }
   }
   ```

2. **`await super.run()` MUST be the first statement.** It bootstraps the foundational machinery —
   `SstContext`, dev credential capture (when local), the `ServiceManager` (DI), and the
   `StackEnv` load that runs the visitor. Only after it does `this.env.schema` exist. Since
   factories read `this.env.schema`, nothing may run before `super.run()`.

3. **`run()` is pure orchestration.** After `super.run()`, the body of `run()` is an **ordered
   sequence of phase-method calls** and nothing else (logging aside). It reads like a table of
   contents; it contains no resource-construction logic.

4. **One `init*` phase method per resource group.** Each resource group declared as a class field
   (R03) is initialized by its own method named `init<Group>` (`initVpcs`, `initClusters`,
   `initGateways`, `initServices`, `initSites`). A phase method calls the matching factories (R04)
   and assigns the results to the group's fields (`this.vpcs.main = Vpcs.Main(this)`). This yields
   a 1:1 correspondence across the three rules:

   ```
   field group (R03)   ↔   factory namespace (R04)   ↔   init phase (R05)
   this.gateways       ↔   Gateways                  ↔   initGateways()
   ```

5. **Phase order is dependency order.** Phases are ordered so that any field a factory reads
   (R04's wiring surface) is already populated by an earlier phase — e.g. `initVpcs` before
   `initClusters`/`initGateways`, because those factories read `this.vpcs.main`.

6. **Cross-reference cycles → finer-grained phases.** Some resource groups have **interleaved /
   cyclic dependencies** that a single phase per group cannot express linearly: create A →
   create B (needs A) → finish-configuring A (needs B). When this happens, **granularize the
   phases more finely — by functional sub-step/domain, not only by resource group**. Add
   additional `init*` methods that split the construction into ordered steps so each step's inputs
   already exist, with a later phase that finishes or wires resources created in an earlier one
   (e.g. `initFunctions` → `initCognito` → `initCognitoTriggers`). Point 5 still holds: the extra
   phases exist precisely to make a valid linear dependency order possible.

7. **Sync vs async phases.** A phase method is `async` when its factories are async, and `run()`
   awaits it (`await this.initVpcs()`); otherwise it is called directly (`this.initServices()`).

8. **`initExports` is the terminal phase.** It runs last, once every resource exists, and performs
   end-of-stack wiring: exporting environment variables to SSM (app-level) and **registering**
   shared resources (`this.vpcs.main.register(this)`). The register/restore mechanism is a
   separate rule; here it is only the orchestration slot where registration happens.

   **Critical: `initExports` MUST NOT construct resources.** It only registers resources that were
   already built in earlier `init*` phases. If a `SharedDataResource` (e.g. `DevToolsConfig`,
   `LocalPorts`) needs to be built from values of other resources, it is built in its own
   `init*` phase or in a dedicated config factory (see R16), and `initExports` simply calls
   `.register(this)` on the pre-built field. Creating `new DataResource(...)` or
   `new SomeWrapper({...})` inline in `initExports` violates R04 §3 (all construction through
   factories) and makes `initExports` responsible for two things (construction + registration).

**Example (orchestration shape):**

```typescript
async run(): Promise<void> {
  await super.run();                 // 1. bootstrap: context, DI, env load (this.env.schema ready)

  await this.initVpcs();             // 2. dependency order: VPC first
  await this.initClusters();         //    clusters read this.vpcs.main
  await this.initGateways();         //    gateways read this.vpcs.main
  this.initServices();               //    sync phase
  this.initSites();
  await this.initExports();          // 3. terminal: SSM exports + shared-resource register
}

// One init* method per resource group — calls factories (R04), assigns to fields (R03)
async initVpcs(): Promise<void> {
  this.vpcs.main = Vpcs.Main(this);
}

async initClusters(): Promise<void> {
  this.clusters.main = Clusters.Main(this);   // factory reads this.vpcs.main
}
```

---

## R06 — The `shared/` folder: an artifact's cross-artifact public surface

**Scope:** What the `shared/` folder is and why it exists, its build/publish boundary, and the
standard way other artifacts consume it. It does **not** cover *what* goes inside `shared/` or any
mechanism built on top of it — those are later rules. Here `shared/` is treated only as the
artifact's public surface and how it is built, published, and consumed.

**When it applies:** When defining what an artifact exposes to other artifacts, or when consuming
another artifact's shared surface.

**Rule:**

1. **`shared/` is the public surface; `infra/` is private.** `shared/` is what the artifact
   **exposes to other artifacts** (its consumers/connectors). `infra/` is the artifact's private
   deployment logic, consumed only by SST. The two are distinct sides of the same artifact.

2. **Taxonomy-scoped.** The dual `infra/` + `shared/` structure belongs to the **bundle**
   taxonomy — the artifact taxonomy that participates in cross-artifact sharing. The taxonomy
   (declared in `webiai.config.mjs`, e.g. `taxonomy: "bundle"`) is what determines that the
   artifact exposes a `shared/` surface. (A `library` publishes from `src/`, not `shared/`.) The
   current taxonomies are `project | library | bundle | workspace`; there is no `infrastructure`
   taxonomy (it is legacy and was unified under the `bundle` taxonomy).

3. **`shared/` is the artifact's published boundary; `infra/` is outside it.** The projects run on
   **Bun**, which executes TypeScript directly — the source is pure TypeScript and there is no
   compile-to-run step. What makes `shared/` the public boundary is therefore **scoping, not
   compilation**: a dedicated `tsconfig.shared.json` includes only `shared/`
   (`rootDir: ./shared`, `include: ["shared/**/*"]`), and `package.json` `exports` expose only the
   `shared/` entry. `infra/` is never part of that exposed boundary — it is the artifact's private
   side. Hence two tsconfigs: the dev one (`tsconfig.json`: includes both `infra/` and `shared/`
   for editing/type-checking) and the public one (`tsconfig.shared.json`: `shared/` only, the
   surface other artifacts may consume).

4. **`shared/index.ts` is the single public entry.** It re-exports whatever the artifact chooses
   to expose to other artifacts. *What* specifically goes inside `shared/` is defined by later
   rules; for this rule, `shared/` is simply the general boundary of *what an artifact shares
   across artifacts*.

5. **Internal access uses the `@shared` alias.** Within the artifact, its own shared surface is
   imported via `@shared` / `@shared/*` (mapped in `tsconfig.json` to `./shared/*`).

6. **Cross-artifact consumption is standardized — declare, resolve, alias.** To consume another
   artifact's shared surface:
   - **Declare** the dependency in the consumer's `webiai.config.mjs` by **artifact name**:
     `dependencies: ["cloud.core"]`.
   - **Resolve**: `webiai install` resolves that dependency (links the package and **injects the
     alias into the consumer's tsconfig**), so it becomes importable.
   - **Consume** via the injected alias `@dep:<artifact-name>` (e.g. `import ... from
     '@dep:cloud.core'`).

   This is the single standard path for using the shared surface of another artifact. Every
   cross-artifact reference goes through a tsconfig alias resolved by `webiai install`; never reach
   into another artifact's files by relative or absolute path.

**Example (consume another artifact's shared surface):**

```javascript
// consumer's webiai.config.mjs
export default {
  name: 'srv.swagger',
  taxonomy: 'bundle',
  dependencies: ['cloud.core'],   // declared by artifact name; webiai install wires the alias
  // ...
};
```

```typescript
// consumer's infra/app.ts — imported via the injected @dep alias
import * as CloudCore from '@dep:cloud.core';
```

---

## R07 — What goes in `shared/`: resource code vs other shared code

**Scope:** What kinds of code live in `shared/` and the folder separation between them. It does
**not** cover how infrastructure shared resources are defined or any mechanism on top of them
(later rules) — only *where* each kind of code is placed and the boundary between them.

**When it applies:** When adding any code to an artifact's `shared/` folder.

**Rule:**

1. **Two kinds of content.** `shared/` holds (a) **infrastructure shared-resource code** and
   (b) **any other shared code** the artifact exposes.

2. **Placement separation.** Infrastructure shared-resource code MUST live under
   `shared/resources/`. All other shared code lives **outside** `resources/` (elsewhere under
   `shared/`).

3. **Why the separation exists.** It is required for **compatibility with the bundler and the
   module format**. The two kinds of code resolve differently, so they must not be intermixed.

4. **Hard constraint — no reaching into `resources/`.** Code outside `resources/` must **never**
   import or reference files inside `shared/resources/` — and especially not infrastructure-related
   ones. Doing so inevitably causes runtime/execution problems. `resources/` is self-contained and
   exposed through **two distinct doors**, kept separate on purpose:
   - **Intra-artifact infra** imports the resources-only barrel directly via **`@shared/resources`**
     (`import * as resources from '@shared/resources'`) — see R08 §9. It must NOT go through the
     mixed `@shared` public barrel.
   - **Cross-artifact consumers** import the artifact's public surface via **`@dep:<artifact>`**
     (R06 §6); `shared/index.ts` re-exports the `resources` namespace for that purpose only.

   `shared/index.ts` (`@shared`) deliberately mixes `resources` with other shared code, so it is the
   cross-artifact public door — never the path infra code uses to reach its own resources.

---

## R08 — `shared/resources/`: shared resource definitions

**Scope:** The structure and content of `shared/resources/` — how the folder is organized, the two
kinds of shared resource (predefined construct wrappers and custom resources), how the wrapper acts
as the reference type (`.native` / `.ref`), the `ResourceName` identity and its impact, and the
relationship with `infra/`. It does **not** cover the register/restore mechanism in depth (next
rule); only the two modes it implies are referenced here.

**When it applies:** When defining, organizing, or documenting shared resources under
`shared/resources/`.

**Rule:**

1. **Folder layout.** `shared/resources/` contains:
   - `resource-name.ts` — the central `ResourceName` enum (see point 3).
   - `index.ts` — barrel that re-exports `ResourceName` and each sub-folder as a namespace
     (`export * as gateways`, `export * as config`, …).
   - **One sub-folder per group**, each with its own `index.ts` and **one class per file**. The
     file name is the class name prefixed with **`$$`** (canonical: `$$MainVpc.ts` exporting class
     `MainVpc`). Sub-folders may nest (`dns/domain/`).

2. **Grouping axis = same as R03/R04.** Sub-folders are organized **by functional domain or by
   resource type** (`vpc/`, `gateways/`, `cognito/`, `config/`, …), mirroring the field groups
   (R03) and factory namespaces (R04): `gateways/` ↔ `Gateways` ↔ `this.gateways`.

3. **`ResourceName` is the central identity registry.** A single enum maps a code-friendly key
   `Group_Sub_Name` to a **dotted identity string** `"Group.Sub.Name"`
   (`Gateways_Web_Api = "ApiGateway.Web.Api"`, `Config_LocalPorts = "Config.LocalPorts"`), grouped
   by header comments. Every shared resource references its name from here — never inline literals.

4. **Two kinds of shared resource.**
   - **Predefined (construct wrappers):** subclass an SDK-provided shared wrapper for a construct
     (`Vpc`, `ApiGateway`, `ServiceCluster`, `UserPool`, … from `@webiai/sdk.infra/aws/<x>`). The
     subclass only binds identity — `urnNamespace: stack.urn`, `resourceName: ResourceName.X`,
     `stack: stack.name` — and accepts `{ native }`. It wraps the native/SDK construct built by the
     factory.
   - **Custom:** when no predefined wrapper fits. The dominant case is **`SharedDataResource<TData>`**
     for sharing arbitrary typed **data** (not a cloud construct) — e.g. the `config/` folder
     (`LocalPorts`, `ServiceUrls`, `M2MSrvData`). Define a `XData` interface for the shape and
     subclass `SharedDataResource<XData>`, binding the same identity fields.

5. **The wrapper is the reference type — the native never leaks.** Factories return the **wrapper**
   type, not the native construct (R04), and R03 fields are typed as the wrapper. The native type
   stays internal to the factory; everything downstream references the wrapper.

6. **Definition-side access is ALWAYS through `.native` (important — this is the common point of
   confusion).** In the stack that **defines/owns** the shared resource, you do **not** read the
   construct's attributes off the wrapper instance directly — the wrapper is not the construct. You
   reach the underlying construct and all of its attributes through **`.native`**
   (`stack.vpcs.main.native`, then `.native.<attr>`). This is the canonical way the owning stack
   and its dependent factories consume a shared resource. Trying to access attributes on the
   wrapper instance itself is the typical mistake; the value lives under `.native`.

   The consumer side uses **`.ref`** instead (available only after restore). The detail of `.ref` —
   how a resource is exported and how it is restored, and the shape of the hydrated reference — is
   a **separate rule**; here it is enough to know it is the restore-mode counterpart of `.native`.

7. **`ResourceName` impact — stable cross-stack identity.** The `resourceName` value drives: the
   Pulumi **type string** `{prefix}:{group}:{resourceName}` (segments normalized — `.`/`-`/space →
   `_`), the ComponentResource **logical name** in state, and the **SSM path** where data is
   written/read. It must be **identical** between `register()` (owner) and `restore()` (consumer),
   or the link breaks and state is orphaned — which is exactly why it is centralized in the enum.
   This is a **separate naming domain** from R04: `Type-Name` (`Vpc-Main`) names the *native*
   construct; `ResourceName` (`Vpc.Main`) is the *shared wrapper's* identity / SSM key.

8. **Relationship with `infra/`.** Definition lives here (`shared/`); the factory in `infra/`
   creates the native construct and binds it (`{ native }`, R04); `initExports` registers it (R05);
   a consumer restores it (`{}` + `restore()`). The register/restore mechanism itself is the next
   rule — here only the definition + the two modes are in scope.

9. **Importing shared resources in infra code — `@shared/resources`, NOT `@shared`.** Infra code
   references the artifact's own shared resource definitions through the **resources barrel**
   (`@shared/resources` → `shared/resources/index.ts`) — never by relative path, and never through
   the top-level `@shared` barrel.

   **Why not `@shared`.** `shared/index.ts` is the artifact's *public surface* (R06) and it **mixes**
   two kinds of code: the `resources` namespace (infra — pulls Pulumi/SST deps) and other shared
   code (`stack`, runtime helpers, etc. — consumed by modules/services at runtime, R07). Importing
   `{ resources }` from `@shared` drags that mixed barrel into infra code, couples infra to runtime
   shared code, and risks the bundler pulling infra deps into runtime modules. Infra therefore
   imports the **resources-only** barrel directly:

   ```typescript
   // ✅ Correct — resources-only barrel
   import * as resources from '@shared/resources';
   // ...
   return new resources.vpc.MainVpc({ native });        // group → class

   // ❌ Prohibited — the mixed public barrel (resources + stack + other shared)
   import { resources } from '@shared';
   ```

   (Consuming *another* artifact's shared surface uses `@dep:<artifact>` and DOES go through that
   artifact's public barrel — R06 §6. The `@shared` vs `@shared/resources` distinction is about the
   *artifact's own* infra code, which must stay on the resources-only side.)

   **Data types come from the same barrel.** A factory that builds a `SharedDataResource` needs the
   `XData` interface for `new DataResource<XData>(...)`. That type MUST be obtained from the
   resources barrel (qualified through the group namespace), NOT by reaching into the `$$`-prefixed
   file directly. Each group barrel re-exports the data type alongside the class
   (`export { LocalPorts } from './$$LocalPorts.js'; export type { LocalPortsData } from
   './$$LocalPorts.js';`), so infra writes:

   ```typescript
   // ✅ Correct — type via the resources barrel namespace
   import * as resources from '@shared/resources';
   new resources.config.LocalPorts({
     native: new DataResource<resources.config.LocalPortsData>('DataResource-LocalPorts', { ... }),
   });

   // ❌ Prohibited — deep import into the $$ file
   import type { LocalPortsData } from '@shared/resources/config/$$LocalPorts.js';
   ```

   Rule: **infra never references a `$$`-prefixed file path.** Both the class and its `XData` type
   flow exclusively through `@shared/resources` and its group namespaces.

10. **Verify SDK symbols before importing — native vs shared wrappers.** Do not assume a construct
    name exists. The SDK separates the **functional layer** (native ComponentResources, e.g.
    `@webiai/sdk.infra/cognito` exporting `CognitoUserPoolClient`/`UserPoolClient`) from the
    **shared-wrapper layer** (`@webiai/sdk.infra/aws/<domain>` exporting the `SharedResource`
    subclasses, e.g. `aws/cognito` exporting `UserPool`/`UserPoolDomain`/`UserPoolClient` as the
    *shared* wrappers). A factory builds the **native** construct from the functional layer and
    wraps it in the artifact's `resources.*` subclass. When unsure which symbol/path is correct,
    read the SDK source under `/workspaces/sdk/packages/infra/src` — never invent a name
    (e.g. `NativeUserPoolClient` does not exist; the native construct is `CognitoUserPoolClient`).

11. **Documentation.** Each shared-resource class carries a file header / JSDoc stating **what it
    represents**, **what it wraps** (which construct, or what data), and **its cross-stack role**.
    For `SharedDataResource` subclasses, the `XData` interface documents each field functionally
    (what it is + its meaning), consistent with R02.

**Example (predefined wrapper):**

```typescript
// shared/resources/vpc/$$MainVpc.ts
export class MainVpc extends SharedVpc {
  constructor(props: { native: Vpc } | {} = {}) {
    super({
      urnNamespace: stack.urn,            // [prefix, group], e.g. ['showcase', 'Core']
      resourceName: ResourceName.Vpc_Main, // "Vpc.Main" — cross-stack identity
      stack: stack.name,
      ...props,
    });
  }
}
```

**Example (custom data resource):**

```typescript
// shared/resources/config/$$LocalPorts.ts
export interface LocalPortsData {
  /** Local dev port for the web API module. */
  appWebApi?: number;
  /** Local dev port for the data service API module. */
  srvDataApi?: number;
}

export class LocalPorts extends SharedDataResource<LocalPortsData> {
  constructor(props: { native: DataResource<LocalPortsData> } | {} = {}) {
    super({
      urnNamespace: stack.urn,
      resourceName: ResourceName.Config_LocalPorts,
      stack: stack.name,
      ...props,
    } as SharedDataResourceProps<LocalPortsData>);
  }
}
```

---

## R09 — Cross-stack export and restore: `register()` and `restore()`

**Scope:** The mechanism that exports a shared resource from its owner stack and restores it in a
consumer stack — `register()`, `restore()`, the SSM storage they use, source resolution, and the
runtime-context provider. Builds on R05 (`initExports`) and R08 (definitions, `.native` / `.ref`).

**When it applies:** When exporting a shared resource for other stacks to consume, or when
consuming (restoring) a shared resource defined by another stack.

**Rule:**

1. **Two modes, recap.** A shared resource is in **definition mode** when constructed with
   `{ native }` (the owner stack) or **restore mode** when constructed with `{}` (a consumer).
   `register()` is valid only in definition mode; `restore()` only in restore mode — the base
   class throws otherwise.

2. **Export — `register(provider)` in `initExports`.** The owner stack registers each resource in
   its terminal `initExports` phase (R05 §8): `this.vpcs.main.register(this)`. `register`:
   - runs the resource's `outputMapper` to extract serializable data from `.native`,
   - writes it to SSM as a JSON envelope `{ $: { type, source, hash }, ...data }` at
     `/stacks/{app}/{scope}/{stage}/resources/{resourceName}`,
   - persists `_wfai` identity metadata (`$app`, `$stack`, `$stage`, `$ssm`, `$type`,
     `$resourceName`) in Pulumi state,
   - stores a `SecureString` when the definition sets `secret: true`.

3. **Restore — import via `@dep`, construct with `{}`, `await restore(provider)`.** A consumer
   imports the other artifact's shared surface via `@dep:<artifact>` (R06 §6), constructs the
   resource in restore mode, and restores it inside `restore*` phase methods that mirror the
   owner's `init*` phases. In the consumer's `run()`, **the `restore*` phases come first — right
   after `super.run()`, before any `init*`/`deploy*` phase** — because the consumer's own resources
   depend on what is restored (same dependency-order principle as R05 §5):

   ```typescript
   import { resources as CloudCore } from '@dep:cloud.core';

   async run(): Promise<void> {
     await super.run();
     await this.restoreClusters();   // 1. restore dependencies FIRST
     await this.restoreGateways();
     await this.initServices();      // 2. then create own resources that use them
     await this.initRoutes();
   }

   async restoreClusters(): Promise<void> {
     this.clusters.main = await new CloudCore.clusters.MainCluster().restore(this);
     // now access the hydrated cross-stack reference via .ref
     this.clusters.main.ref.cluster;
   }
   ```

   `restore` reads the envelope from SSM, **validates `$.type` matches** the expected Pulumi type
   (mismatch throws — guards against drift/wrong resource), runs `hydrate(data)` to build the
   reference, sets `.ref`, and returns `this`.

4. **Source resolution — same app + same stage by default, overridable.** A restore resolves its
   source as `{ stack, app, stage }`:
   - **`stack`** is the **source stack** where the resource was registered — fixed by the
     definition (e.g. `stack: stack.name` / `'Core'`).
   - **`app`** and **`stage`** default to the **consumer's current app and stage** (auto-resolved
     from the runtime context), i.e. a consumer restores from the same app/stage it runs in.
   - Both `app` and `stage` can be **overridden** through the restore-mode props to point at a
     specific app/stage — for more complex cross-app or cross-stage restorations.

5. **The `provider` argument (`this`) is required for cross-package correctness.** Both `register`
   and `restore` accept a runtime-context provider; the `Stack` satisfies it, so you pass `this`.
   It supplies `{ app, scope, stage }` and **bypasses the `SstContext` singleton** — necessary
   because each artifact ships its own `.sst/` copy of the SDK, so the inherited code would
   otherwise read the wrong (producer's) singleton (the dual-package hazard). Passing `this` is the
   norm in both `register(this)` and `restore(this)`.

6. **Access after each operation.** Owner side reads the value via `.native` (R08 §6); consumer
   side reads it via `.ref` after `restore()` — the hydrated reference (typed accessors and/or
   reconstructed handles).

7. **Custom resources use the exact same mechanism.** `SharedDataResource<TData>` is a
   `SharedResource` whose `outputMapper` extracts the wrapped data and whose `hydrate` returns it
   as-is, so `register()`/`restore()` behave identically. The only difference is the shape of
   `.ref`: for a data resource it is the plain `TData` object (`creds.ref.clientId`), not a
   construct reference.

**Example (owner export):**

```typescript
async initExports(): Promise<void> {
  // construct in definition mode happened in the factory ({ native }); here we export.
  this.vpcs.main.register(this);
  this.clusters.main.register(this);
}
```

**Example (override source for a cross-app/stage restore):**

```typescript
// stack is the source stack (from the definition); app/stage overridden to target another env
await new SomeShared({ app: 'OtherApp', stage: 'prod' }).restore(this);
```

---

## R10 — Authoring a custom shared resource

**Scope:** How to create a **custom** shared resource — for when no predefined SDK wrapper (R08 §4)
fits what you need to share. Two paths: sharing **data** and wrapping a **construct**. Builds on
R08 (placement, `$$` files, `ResourceName` identity, `.native`/`.ref`) and R09 (register/restore).
Examples here are **generic**; a concrete application (port management) is a later rule.

**When it applies:** When you need to share something across stacks that has no predefined wrapper.

**Rule:**

1. **Choose the path.**
   - **Path A — share data:** you want to share an arbitrary typed object (config, credentials,
     computed values). Use `SharedDataResource<TData>` — no `outputMapper`/`hydrate` needed.
   - **Path B — wrap a construct:** you want to share a native Pulumi construct that has no
     predefined SDK wrapper. Extend `SharedResource<TData, TNative, TRef>` directly and implement
     `outputMapper` + `hydrate`. (This is the same shape the predefined SDK wrappers use.)

   **Recommendation: prefer Path A.** Path B carries significant overhead and maintenance cost (its
   own `TData`/`TNative`/`TRef` types plus `outputMapper`/`hydrate` machinery) and is only justified
   when you plan to **reuse that shared-resource type constantly and generalize it beyond the
   immediate use**. For the common case — including sharing pieces of a construct — use Path A:
   **export only the specific attributes you care about** (e.g. an `id`, `arn`, or `url`) as data,
   then restore exactly those attributes to consume them in another stack. Reach for Path B only
   when the wrapper itself is a reusable abstraction worth the cost.

2. **Path A — `SharedDataResource<TData>`.**
   - Define and document the data interface `TData` (each field functionally, per R02).
   - Subclass `SharedDataResource<TData>` in `shared/resources/<group>/$$X.ts`, binding identity
     (`urnNamespace: stack.urn`, `resourceName: ResourceName.X`, `stack: stack.name`) with a
     `{ native: DataResource<TData> } | {}` constructor; add the `ResourceName` entry (R08).
   - **Owner side**: build the data with `new DataResource<TData>('Name', { ...values })` — values
     may be plain or `Output`s composed from other resources — wrap it `new X({ native })`, and
     `register(this)` in `initExports` (R09).
   - **Consumer side**: `await new X().restore(this)`; `.ref` is the plain `TData`.

   ```typescript
   // shared/resources/example/$$ExampleConfig.ts
   export interface ExampleConfigData {
     /** What this value is and what it drives. */
     someValue: string;
     /** What this value is and what it drives. */
     someNumber: number;
   }

   export class ExampleConfig extends SharedDataResource<ExampleConfigData> {
     constructor(props: { native: DataResource<ExampleConfigData> } | {} = {}) {
       super({
         urnNamespace: stack.urn,
         resourceName: ResourceName.Example_Config,
         stack: stack.name,
         ...props,
       } as SharedDataResourceProps<ExampleConfigData>);
     }
   }

   // owner factory + initExports
   const data = new DataResource<ExampleConfigData>('ExampleConfig', { someValue: 'x', someNumber: 1 });
   this.example.config = new resources.example.ExampleConfig({ native: data });
   // ... in initExports: this.example.config.register(this);

   // consumer
   const cfg = await new CloudCore.example.ExampleConfig().restore(this);
   cfg.ref.someValue; // plain TData
   ```

3. **Path B — extend `SharedResource<TData, TNative, TRef>`.**
   - Declare the three type parameters: `TData` (the serialized shape stored in SSM), `TNative`
     (the native Pulumi resource type), `TRef` (the restored reference shape).
   - Implement `outputMapper: (native, ctx) => TData` — extract the serializable fields from the
     native construct (optionally returning `$: { type }`).
   - Implement `hydrate(data: TData): TRef` — rebuild the reference from the SSM data; reconstruct
     any native handles with `.get(..., { parent: this })` so they attach to this resource in the
     state tree.
   - Bind identity in the constructor and place it in `$$X.ts` + a `ResourceName` entry, exactly
     like a predefined wrapper. The owner wraps the real native (`{ native }`); register/restore
     work per R09.

4. **Both paths obey R08 and R09.** Placement under `resources/<group>/$$X.ts`, identity via the
   `ResourceName` enum, `.native` on the owner side and `.ref` on the consumer side, and the
   register/restore mechanism (with `this` as the provider) are identical to predefined resources.
   The only thing custom authoring adds is *how the data is produced and rehydrated* (Path A:
   automatic; Path B: your `outputMapper`/`hydrate`).

---

## R11 — Local dev port management via a centralized `LocalPorts` shared resource

**Scope:** The recommended and standard pattern for managing **local development ports** across the
monorepo, and how `.env` and `env.ts` look on both sides. It is a concrete application of R10
Path A (a custom data shared resource) and the register/restore mechanism (R09). Local/dev only —
it governs the ports used by the local processes started by the dev commands.

**When it applies:** Whenever a bundle needs a local port for a process it runs under `dev`.

**Rule:**

1. **Centralize all local ports in one main bundle.** The monorepo is a tree that **generally has
   a main bundle** (e.g. `cloud.core`) acting as the source of truth for **every** local-dev port.
   It declares them all and exposes them as one shared data resource — `LocalPorts` (Path A custom
   shared resource, R10). Other bundles **restore** `LocalPorts` and read the ports they need.
   Bundles must not each invent their own ports. Rationale: centralizing in one place is easier to
   manage, prevents **port collisions**, and gives a single clear map of which port is used where
   and for which service.

2. **Owner `.env` — the single place ports are set.** The main bundle's `.env` declares every
   `LOCAL_PORT_*` variable (these are its legitimate input vars, R01/R06):

   ```dotenv
   # cloud.core/.env — the one place local-dev ports are defined
   LOCAL_PORT_APP_WEB_API=8080
   LOCAL_PORT_APP_WEB_SPA=9000
   LOCAL_PORT_SRV_DATA_API=8081
   # ...one entry per local process in the monorepo
   ```

3. **Owner registration.** The main bundle reads the raw `LOCAL_PORT_*` vars and packs them into
   the `LocalPorts` data resource, registered **only in local mode** in `initExports` (R09). The
   `LocalPortsData` interface is the typed contract (defined per R08/R10):

   ```typescript
   if (this.local) {
     const vars = (await this.env.read.stack()).merged;
     this.localPorts = new resources.config.LocalPorts({
       native: new DataResource<LocalPortsData>('DataResource@LocalPorts', {
         appWebApi: vars.LOCAL_PORT_APP_WEB_API?.optional.number(),
         appWebSpa: vars.LOCAL_PORT_APP_WEB_SPA?.optional.number(),
         srvDataApi: vars.LOCAL_PORT_SRV_DATA_API?.optional.number(),
       }),
     });
     this.localPorts.register(this);
   }
   ```

4. **Consumer `.env` — no port vars.** Consumer bundles do **not** declare local-port variables in
   their `.env`. Ports are restored, not read from env.

5. **Consumer `env.ts` — no port fields.** A consumer's `env.ts` has **no** local-port fields; the
   schema does not read `LOCAL_PORT_*`. State it explicitly so it is not re-added by mistake:

   ```typescript
   /**
    * NOTE: Local development ports are NOT read from env vars here — they are
    * restored as a shared resource (LocalPorts) from the main bundle.
    */
   export interface ConnectorEnv {
     aws: { region: string };
     // ...no local-port fields
   }
   ```

6. **Consumer usage — restore and read.** The consumer restores `LocalPorts` from the main bundle
   (imported via `@dep:<main-bundle>`, R09) in a `restore*` phase, and reads the specific port for
   its local process (consumed by the dev runners — `DevVite`, `DevBun`, etc.):

   ```typescript
   import { resources as CloudCore } from '@dep:cloud.core';

   async restoreLocalPorts(): Promise<void> {
     this.localPorts = await new CloudCore.config.LocalPorts().restore(this);
     const spaPort = this.localPorts.ref.appWebSpa;   // plain TData value
   }
   ```

---

## R12 — The `modules/` folder: a bundle's runnable child workspaces

**Scope:** What the `modules/` folder is, when it is used, what each module is, the kinds of module,
the relationship to the parent bundle (per taxonomy), and the `install` side effects (file: deps +
`@module:` tsconfig aliases). It does **not** cover the dev commands that run modules locally — that
is the next rule.

**When it applies:** When a bundle needs to run actual executable code/processes (services,
frontends, containers) alongside its infrastructure.

**Rule:**

1. **Modules are a bundle's child workspaces.** A `bundle` artifact may contain a `modules/`
   folder; each subfolder is a **child module** (a workspace at depth 2) — a runnable unit owned by
   the bundle. The bundle's `infra/` defines, deploys, and runs them; the modules are the actual
   code.

2. **Each module is its own package, in any language.** Every module has its **own `package.json`**
   (its `name` = the module name) and **can be implemented in any language** — Python, Node/Bun, a
   Vite frontend, a Docker Compose stack, etc. It declares a `file:../..` dependency on the parent
   bundle so it can consume the parent's shared surface.

3. **Module types.** The kind of module determines how it is run locally (R13). Examples seen in
   `cloud.core`: a Python service (uvicorn), a Bun/Node service, a Vite SPA, and a Docker Compose
   stack.

4. **Relationship to the parent.** Modules are generally listed in the parent bundle's
   `package.json` **`workspaces`** — that is how they participate in the monorepo. The exception is
   an **isolated workspace**: a module that is not part of the monorepo directly (e.g. a SPA app),
   not declared under `workspaces`, yet still treated as a module. Declaring a module in the
   parent's `webiai.config.mjs` `modules: {}` is **only** needed when it carries specific
   configuration (e.g. per-module `hooks`) — it is not required otherwise.

5. **`install` side effects.** `webiai install` discovers the modules and:
   - wires the `file:` dependencies, and
   - **injects `@module:<name>` path aliases into the parent's tsconfig** (`@module:<name>` and
     `@module:<name>/*` → `./modules/<name>/src/index` and `./modules/<name>/src/*`), so the
     bundle's infra code imports a module **by alias, never by relative path**. This indexing is
     what makes modules importable from `infra/`.

6. **Run entry point.** A module generally has an **entry point or a command that runs its
   process**, but its exact form depends on the **module type** and on the **dev command** used to
   run it (an entry file, an app target, a compose file, a script, etc.). The specifics are covered
   in R13.

**Example (module package.json + parent wiring):**

```json
// modules/python-demo/package.json — a module in any language, depending on the parent
{
  "name": "python-demo",
  "private": true,
  "scripts": { "start:dev": "cd src && python -m uvicorn main:app --host 0.0.0.0 --port $PORT" },
  "dependencies": { "@webiai/showcase.cloud.core": "file:../.." }
}
```

```javascript
// parent package.json — modules generally listed as workspaces (isolated ones, e.g. a SPA, are not)
{ "workspaces": ["modules/python-demo", "modules/bun-demo"] }
```

```javascript
// parent webiai.config.mjs — declare a module here ONLY when it needs specific config (e.g. hooks)
export default {
  name: 'cloud.core',
  taxonomy: 'bundle',
  modules: { 'python-demo': { hooks: { bundle: ['bundle'] } } },
};
```

```jsonc
// parent tsconfig.json — @module alias injected by `webiai install`
"@module:python-demo":   ["./modules/python-demo/src/index"],
"@module:python-demo/*": ["./modules/python-demo/src/*"]
```

---

## R13 — Dev commands: running module processes locally

**Scope:** The local dev-run components (dev commands) — `DevNative`, `DevWatchexec`, `DevBun`,
`DevUvicorn`, `DevVite`, `DevDockerCompose` — their purpose, when to use each, and how they relate
to modules (R12) and local ports (R11). `DevTunnel` is a different kind of component (networking,
not a module runner) and has its own rule (R14). Local/dev only.

**When it applies:** When a bundle needs to run a module's process locally under `dev`.

**Rule:**

1. **What they are, and where they are created.** Dev components run a module's process **locally
   during `dev`**; they create **no AWS resources**, are no-ops in production, and are imported from
   **`@webiai/sdk.infra/dev`**. The `() => this.local` gate is what makes them dev-only.

   A dev command **represents a production resource** — the same logical service runs one way
   locally (the dev command) and another way in production (the real cloud resource). So it is
   created in the **same factory (R04)** as the production resource it represents. This takes one of
   two shapes:
   - **Integrated** — the production resource **receives the dev command as a parameter** and
     decides internally whether to run locally or deploy; the factory **always returns the
     production resource** (e.g. `EcsService` takes a `dev` command).
   - **Branching** — when the local and production representations are **different resource types**
     with no unified wrapper, the factory **branches on `local`** (e.g. Redis → `DevDockerCompose`
     locally ↔ an **ElastiCache** deployment in production).

   A dedicated dev-only phase (e.g. `initDevServices`) is used **only** for resources that exist
   solely for local dev with no production counterpart (like the showcase demo modules).

2. **Two base strategies.**
   - **`DevNative`** — runs a command directly under a lightweight supervisor, **without** a file
     watcher. Use for commands that **watch/reload themselves** (`bun --watch`, `vite`,
     `uvicorn --reload`) or for long-running processes (workers, tunnels). kill = restart.
   - **`DevWatchexec`** — runs a command with **auto-restart on file changes** (bundled watchexec,
     language-agnostic). Use for "dumb" commands that do not watch themselves. It is the canonical
     dev-loader bridge the others build on.

3. **Specializations — pick by module type.** Each composes one of the two bases and maps a tool's
   CLI:
   - **`DevBun`** (over `DevNative`) — Bun apps; Bun owns its watch (`--watch`/`--hot`).
   - **`DevUvicorn`** (over `DevNative`) — Python ASGI via uvicorn; uvicorn owns `--reload`; manages
     the venv (hash-guarded).
   - **`DevVite`** (over `DevNative`) — Vite SPA; Vite owns HMR; installs node modules once
     (hash-guarded on the lockfile).
   - **`DevDockerCompose`** (over `DevWatchexec`) — docker compose has no built-in watcher, so
     watchexec watches the cwd and restarts; the image is rebuilt conditionally via a content hash.

   (`DevTunnel` is **not** a module runner — it is networking-only and has its own rule, R14.)

4. **Relationship with modules (R12).** A dev command runs a module by pointing its `cwd` at
   `./modules/<name>`. The **module type selects the runner**: Python → `DevUvicorn`, Bun →
   `DevBun`, Vite → `DevVite`, Docker Compose → `DevDockerCompose`; a self-watching/long-running
   custom command → `DevNative`; a "dumb" command needing restart-on-change → `DevWatchexec`.

5. **Relationship with local ports (R11).** The `port` a dev command binds comes from the
   centralized `LocalPorts` shared resource — restored in a consumer (`this.localPorts.ref.X`) or
   read from the owner's env in the main bundle. This is how the centralized ports actually reach
   the running local processes, keeping them collision-free.

**Example (integrated — the production resource receives the dev command and decides):**

```typescript
// factories/services.ts — EcsService receives a dev command; it decides internally whether to
// run locally (dev) or deploy. The factory ALWAYS returns the EcsService.
export namespace Services {
  export const Web = (stack: Core) => {
    return new EcsService('Web', {
      cluster: stack.clusters.main.ref.cluster,
      service: { /* production service config */ },
      dev: DevBun.create('Web', () => stack.local, () => ({
        cwd: './modules/web', entry: './src/index.ts', watch: true,
        port: stack.localPorts.ref.webApi,
      })),
    });
  };
}
```

**Example (branching — different resource types for local vs production):**

```typescript
// factories/cache.ts — local Redis via docker compose, production ElastiCache.
export namespace Cache {
  export const Redis = (stack: Core) => {
    if (stack.local) {
      // local: Redis through docker compose
      return DevDockerCompose.create('Redis', () => stack.local, () => ({
        cwd: './modules/redis', ports: { redis: stack.localPorts.ref.redis },
      }));
    }
    // production: managed ElastiCache (a different resource type, no unified wrapper)
    return new aws.elasticache.Cluster('Redis', { /* ... */ });
  };
}
```

**Example (dev-only case — a phase for demo modules with no production counterpart):**

```typescript
initDevServices(): void {
  DevUvicorn.create('PythonDemo', () => this.local, () => ({
    cwd: './modules/python-demo', app: 'main:app', appDir: './src',
    port: 9100, reload: true,
  }));

  DevBun.create('BunDemo', () => this.local, () => ({
    cwd: './modules/bun-demo', entry: './src/index.ts', watch: true, port: 9200,
  }));

  DevVite.create('ViteDemo', () => this.local, () => ({
    cwd: './modules/vite-demo', port: 9300,
  }));

  DevDockerCompose.create('DockerDemo', () => this.local, () => ({
    cwd: './modules/docker-demo', ports: { web: 9400 },
  }));
}
```

---

## R14 — `DevTunnel`: exposing a local process to the VPC

**Scope:** The `DevTunnel` dev component — what it does, why it differs from the module-runner dev
commands (R13), and how it relates to the bastion and local ports. Imported from
`@webiai/sdk.infra/dev`. Local/dev only.

**When it applies:** When you need to reach a service running on the developer's machine from
**outside that machine, via a public IP** — instead of a local-only address. The primary case is
AWS-side callers such as an API Gateway `HTTP_PROXY` reaching the local service during `dev`. More
broadly, it covers any external client that needs a public URL rather than `localhost` (e.g.
opening a local `DevVite` dev server from another device or network). API Gateway is the main
use case the tunnel exists for, not the only one.

**Rule:**

1. **It is networking, not a module runner.** Unlike the R13 components, `DevTunnel` runs **no**
   module process. It is a standalone **reverse SSH tunnel** that exposes a local port to the VPC
   **through the bastion's public IP**, so callers **outside the developer's machine** — AWS-side
   callers (e.g. an API Gateway `HTTP_PROXY`) or any external client — can reach a service running
   locally, without a local-only address. It **decouples "open a tunnel for this port" from "who
   listens on it"** — the listener can be any runner (`DevUvicorn`, `DevNative`, even a manual
   `npm run dev`).

2. **Local/dev only.** Created via `DevTunnel.create(name, () => this.local, () => config)`; creates
   no AWS resources in production. It does **not** use the generic dev supervisor — SSH reverse
   tunnels have their own lifecycle (ControlPersist, health checks, reconnect, remote cleanup).

3. **What it does on create (local).**
   - adds an **ingress rule on the bastion security group** for the port,
   - fetches the **bastion SSH key from SSM** (build time) and writes a temp PEM,
   - generates a runner that opens the reverse tunnel and registers a dev pane (`tunnel:<name>`).

4. **Config and output.** `config = { port, bastion, name?, autostart? }` where `bastion` is
   either the `Vpc` component or a `VpcBastionConfig` (e.g. `cluster.vpc.bastion`). Because the
   tunnel is **TCP (protocol-agnostic), not HTTP**, it exposes a **host:port endpoint**, not a URL:
   - **`publicEndpoint`** → `{bastionPublicIp}:{port}` — reachable from anywhere (internet).
   - **`privateEndpoint`** → `{bastionPrivateIp}:{port}` — reachable inside the VPC (what AWS-side
     callers use).

   A caller that speaks HTTP builds its own URL from the endpoint (`http://<endpoint>`); the tunnel
   does not presuppose a protocol. (The reverse tunnel runner reflects this — it reports
   `localhost:{port}` for local, `{bastionPrivateIp}:{port}` for remote, and the bastion at its
   public IP.)

5. **Relationship with ports (R11) and runners (R13).** The `port` is the same centralized local
   port the listener binds (from `LocalPorts`); `DevTunnel` only exposes it through the bastion.
   Pair it with whichever R13 dev command runs the actual process.

6. **Built-in tunnel integration in the R13 dev commands.** Several R13 components can open the
   tunnel **for you** instead of wiring a standalone `DevTunnel`: pass a bastion source (a `Vpc` or
   `VpcBastionConfig`) and they create the tunnel(s) internally and expose the resulting
   endpoint(s):
   - **`DevBun`** and **`DevDockerCompose`** — via a **`bastion`** option (one tunnel per defined
     port).
   - **`DevUvicorn`** and **`DevVite`** — via the **`host`** option: given a bastion source the
     process binds `0.0.0.0` and an internal `DevTunnel` exposes the port (Vite includes HMR).

   `DevNative` has no built-in option — pair it with a standalone `DevTunnel` (point 1).

**Example (standalone — pair with any listener):**

```typescript
import { DevTunnel } from '@webiai/sdk.infra/dev';

// Local API runs on :8000 (e.g. via DevUvicorn); expose it through the bastion:
const tunnel = DevTunnel.create('ApiTunnel', () => this.local, () => ({
  port: 8000,
  bastion: this.vpcs.main.native,   // Vpc component, or cluster.vpc.bastion
}));
// tunnel?.publicEndpoint → {bastionPublicIp}:8000  (TCP host:port; an HTTP caller builds http://<endpoint>)
```

**Example (built-in tunnel integration — as in cloud.core):**

```typescript
// Vite dev server exposed through the bastion (reachable from AWS at the public IP, HMR included)
DevVite.create('ViteDemo', () => this.local, () => ({
  cwd: './modules/vite-demo',
  host: this.vpcs.main.native,    // bastion source → Vite binds 0.0.0.0 + internal DevTunnel
  port: 9300,
}));

// Python (uvicorn) exposed through the bastion
DevUvicorn.create('PythonDemo', () => this.local, () => ({
  cwd: './modules/python-demo', app: 'main:app', appDir: './src',
  host: this.vpcs.main.native,    // bastion source → binds 0.0.0.0 + internal DevTunnel
  port: 9100, reload: true,
}));

// Bun service exposed through the bastion
DevBun.create('BunDemo', () => this.local, () => ({
  cwd: './modules/bun-demo', entry: './src/index.ts', watch: true,
  port: 9200,
  bastion: this.vpcs.main.native,  // bastion source → one DevTunnel per port
}));

// Docker Compose stack exposed through the bastion
DevDockerCompose.create('DockerDemo', () => this.local, () => ({
  cwd: './modules/docker-demo', ports: { web: 9400 },
  bastion: this.vpcs.main.native,
}));
```


---

## R15 — Prefer SharedResources over manual SSM Parameters

**Scope:** How cross-stack data (configuration, URLs, ARNs, credentials, connection strings) is
exported from the owner stack and consumed by other stacks or processes. Covers the choice between
the `SharedResource` mechanism (R08–R10) and raw `aws.ssm.Parameter` resources for sharing
information.

**When it applies:** Whenever a stack needs to expose data that other stacks, modules, or external
processes (build scripts, CLIs, frontends) will consume.

**Rule:**

1. **SharedResources are the preferred mechanism for cross-stack data.** Whenever data needs to
   cross a stack boundary — whether another SST stack, a build script, a CLI, or any consumer —
   wrap it in a `SharedDataResource<TData>` (R10 Path A) and register it. Do NOT create raw
   `aws.ssm.Parameter` resources for this purpose.

2. **Why.** The `SharedResource` mechanism:
   - **Eliminates manual path management.** The resource name (`ResourceName` enum) determines the
     SSM path automatically; no one constructs `/webiai/{stage}/devtools/appsync-url` strings by
     hand.
   - **Provides typed contracts.** The `TData` interface is the single source of truth for what's
     shared — no loose strings, no undocumented SSM paths that drift.
   - **Enables restore/hydrate.** Consumer stacks call `new X().restore(this)` and get `.ref` with
     typed accessors — no `aws.ssm.Parameter.get()` with handcrafted paths.
   - **Centralizes identity.** The `ResourceName` enum is the registry of everything shared;
     manual SSM params scatter that registry across arbitrary path strings in `initExports`.

3. **Group by functional domain.** A single `SharedDataResource` should hold all related fields
   that belong to the same functional domain. For example: all URLs, keys, and identifiers that
   a specific consumer needs form ONE shared resource — not one SSM parameter per value.

   Grouping criterion: **"who consumes this together?"** If a set of values is always consumed as
   a unit by the same consumer(s), they belong in one `SharedDataResource`. If two values serve
   completely different consumers, they may be separate resources.

4. **When raw SSM Parameters ARE acceptable.** The rare exceptions:
   - **External systems that poll SSM directly** and cannot use the restore mechanism (e.g. a
     third-party CI/CD that reads a parameter by path). Even then, prefer a `SharedDataResource`
     and have the external system read the same SSM path the resource writes to (the path is
     deterministic from `ResourceName`).
   - **Stack-internal SSM exports** (`this.env.export(...)`) for propagating env vars to the SST
     app-level namespace — these are NOT cross-stack data sharing but internal SST wiring.

5. **Anti-pattern: clusters of `new aws.ssm.Parameter(...)` in `initExports`.** If `initExports`
   has more than 1–2 raw SSM parameters, it is almost certainly violating this rule. Each cluster
   should be refactored into a `SharedDataResource` with a typed interface, a `ResourceName`
   entry, and a `$$` file in `shared/resources/`.

**Example (anti-pattern → correct):**

```typescript
// ❌ Anti-pattern: 7 raw SSM params in initExports
async initExports() {
  const base = `/webiai/${$app.stage}/devtools`;
  new aws.ssm.Parameter('SSM-Appsync-Url',     { name: `${base}/appsync-url`,   value: ... });
  new aws.ssm.Parameter('SSM-Appsync-WsUrl',   { name: `${base}/appsync-ws`,    value: ... });
  new aws.ssm.Parameter('SSM-ApiKey',           { name: `${base}/api-key`,       value: ... });
  new aws.ssm.Parameter('SSM-CognitoDomain',   { name: `${base}/cognito-domain`, value: ... });
  new aws.ssm.Parameter('SSM-ClientId',         { name: `${base}/client-id`,     value: ... });
  new aws.ssm.Parameter('SSM-TokenRelayUrl',    { name: `${base}/token-relay`,   value: ... });
  new aws.ssm.Parameter('SSM-AuthSpaUrl',       { name: `${base}/auth-spa-url`,  value: ... });
}

// ✅ Correct: one SharedDataResource with typed interface
// shared/resources/config/$$DevToolsConfig.ts
export interface DevToolsConfigData {
  appsyncUrl: string;
  appsyncWsUrl: string;
  appsyncApiKey: string;
  cognitoDomain: string;
  clientId: string;
  tokenRelayUrl: string;
  authSpaUrl: string;
}
export class DevToolsConfig extends SharedDataResource<DevToolsConfigData> { ... }

// initExports — build and register
this.config.devTools = new resources.config.DevToolsConfig({
  native: new DataResource('DataResource-DevToolsConfig', {
    appsyncUrl: this.tokenRelay.appsync.api.uris.apply(u => u['GRAPHQL'] ?? ''),
    appsyncWsUrl: this.tokenRelay.appsync.api.uris.apply(u => u['REALTIME'] ?? ''),
    appsyncApiKey: this.tokenRelay.appsync.apiKey.key,
    cognitoDomain: `https://studio-${$app.stage}.auth.${region}.amazoncognito.com`,
    clientId: this.auth.devToolsClient.native.clientId,
    tokenRelayUrl: this.tokenRelay.apiGateway.url,
    authSpaUrl: this.local ? 'http://localhost:5174' : '',
  }),
});
this.config.devTools.register(this);
```


---

## R16 — Config factory: construction of exportable SharedDataResources

**Scope:** How `SharedDataResource` instances (R10 Path A) that aggregate computed values from
multiple stack resources are constructed. Covers the factory pattern that keeps `initExports`
clean (registration only) while the construction logic lives in a dedicated factory.

**When it applies:** Whenever a stack needs to build a `SharedDataResource` whose fields are
derived from other resources (e.g. URLs, ARNs, keys from various domains composed into one export
bundle for consumers).

**Rule:**

1. **Construction belongs in a factory, not in `initExports`.** A `SharedDataResource` that
   aggregates values from multiple stack resources (e.g. `DevToolsConfig` combining AppSync URLs,
   Cognito domain, API Gateway URL) is built by a **Config factory** — a namespace function in
   `infra/factories/` that receives the stack and returns the typed wrapper. `initExports` only
   calls `.register(this)` on the pre-built field.

2. **The Config factory is a regular factory (R04).** It lives in a file like `config.ts` (or
   within the domain factory if the config is domain-specific), exports a PascalCase namespace
   (`Config`), and each function receives the stack and returns the wrapper. It accesses whatever
   it needs from the stack's wiring surface (R04 §4).

3. **Phase placement.** Config factories run in a dedicated `initConfig` phase — after all other
   resources exist (so the values are available) but before `initExports` (so the fields are
   populated for registration). Alternatively, if the config is simple and the dependencies are
   clear, it may run inline in `initExports` as the exception (but only if it's a single-line
   assignment, not multi-line construction with `new DataResource(...)`).

4. **Why.** Keeping construction out of `initExports`:
   - Maintains the R05 §8 invariant (terminal phase = registration only).
   - Makes the config factory independently testable/documentable.
   - Avoids bloating `initExports` with domain logic (value composition, conditional fields).
   - Makes R04 §3 ("all construction through factories") hold universally.

**Example:**

```typescript
// infra/factories/config.ts
export namespace Config {
  export const DevTools = (stack: CloudCore): resources.config.DevToolsConfig => {
    return new resources.config.DevToolsConfig({
      native: new DataResource<DevToolsConfigData>('DataResource-DevToolsConfig', {
        appsyncUrl: stack.tokenRelay.appsync.api.uris.apply(u => u['GRAPHQL'] ?? ''),
        cognitoDomain: `https://studio-${$app.stage}.auth.${stack.env.schema.aws.region}.amazoncognito.com`,
        clientId: stack.auth.devToolsClient.native.clientId,
        tokenRelayUrl: stack.tokenRelay.apiGateway.url,
        // ...
      }),
    });
  };

  export const LocalPorts = (stack: CloudCore): resources.config.LocalPorts | undefined => {
    if (!stack.local) return undefined;
    return new resources.config.LocalPorts({
      native: new DataResource<LocalPortsData>('DataResource-LocalPorts', {
        authSpa: Number(process.env.LOCAL_PORT_AUTH_SPA) || 5174,
      }),
    });
  };
}

// app.ts — initConfig phase (runs after all resources, before initExports)
initConfig(): void {
  this.devToolsConfig = Config.DevTools(this);
  this.localPorts = Config.LocalPorts(this);
}

// app.ts — initExports (registration only)
async initExports(): Promise<void> {
  this.vpcs.main.register(this);
  this.clusters.main.register(this);
  // ...
  this.devToolsConfig.register(this);
  if (this.localPorts) this.localPorts.register(this);
}
```
