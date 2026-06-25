# Requirements Document

## Introduction

Esta feature establece una **suite de pruebas E2E de regresión** para PulseOps usando la infraestructura ya existente de Cypress 15 + Cucumber/Gherkin. El objetivo es disponer de una red de seguridad ejecutable **antes** de abordar el refactor de deuda técnica mayor (eliminación del módulo legacy Resources/Users, unificación de decoradores/servicios duplicados, consolidación de umbrales). Tras cada cambio del refactor, la suite debe poder correrse para detectar regresiones.

La infraestructura de Cypress ya existe pero está mal cableada: hay Page Objects (POM) y Widgets, y un util `testTags` que genera `data-testid` con prefijo `cy`, pero el frontend **no contiene ningún `data-testid`**, por lo que los POM actuales dependen de selectores frágiles por texto y las pruebas fallan. Esta feature instrumenta el frontend con `data-testid` vía el sistema `testTags`, reconstruye los POM sobre los Widgets, define datos de prueba confiables (seed fijo determinista + factories random), y deja cada módulo verde de forma incremental.

El alcance cubre flujos CRUD completos de los módulos con persistencia (Resources, Metrics, Records, Users) y flujos funcionales del resto (Auth, Navigation, Dashboard, Configuration, Profile). La autenticación se hace de forma real por la UI. La validación final (suite en verde) la ejecuta el usuario, ya que el entorno del agente no puede correr `npm install` ni Cypress.

## Glossary

- **Suite_E2E**: Conjunto de pruebas end-to-end de PulseOps ejecutadas con Cypress + Cucumber sobre la app corriendo (frontend en puerto 5173, backend en 3000, MongoDB).
- **Frontend**: Aplicación React 18 + Vite de PulseOps que se sirve en `http://localhost:5173`.
- **Backend**: API NestJS de PulseOps en `http://localhost:3000`.
- **TestTags**: Util existente (`cypress/support/utils/testTags.ts`) que genera identificadores `data-testid` deterministas con prefijo `cy`.
- **data-testid**: Atributo HTML estable usado por Cypress para seleccionar elementos, generado por TestTags.
- **POM (Page_Object)**: Clase que encapsula la interacción con una página/vista del Frontend (`cypress/support/pages/pulseops/`).
- **Widget**: Componente reutilizable de interacción de bajo nivel (`cypress/support/widgets/`: ButtonWidget, InputWidget, CheckboxWidget, LinkWidget, SelectWidget) que opera sobre un selector `data-testid`.
- **Seed_Fijo**: Datos base deterministas y conocidos, insertados antes de la corrida, usados para asserts fiables (recursos, métricas y records concretos con valores conocidos).
- **Factory_Random**: Generador de datos fake aleatorios (vía `@faker-js/faker`) usado solo para los datos que los tests **crean** durante su ejecución, garantizando unicidad por corrida.
- **Faker**: Librería `@faker-js/faker`, instalada como devDependency, fuente de los datos aleatorios de las Factory_Random.
- **Modulo_CRUD**: Módulo con operaciones de creación, lectura, actualización y borrado persistentes: Resources, Metrics, Records, Users.
- **Recurso**: En el dominio actual, una persona del equipo (modelada como User con rol `user`).
- **Condicion_Operativa**: Resultado del motor de análisis mostrado en el Dashboard (PODER, AFLUENCIA, NORMAL, EMERGENCIA, PELIGRO, INEXISTENCIA, SIN_DATOS).

## Requirements

### Requirement 1: Instrumentación del Frontend con data-testid

**User Story:** Como desarrollador que mantiene la Suite_E2E, quiero que los elementos interactivos del Frontend expongan `data-testid` estables generados por TestTags, para que los Widgets y POM seleccionen elementos de forma robusta en vez de por texto frágil.

#### Acceptance Criteria

1. THE Frontend SHALL exponer un atributo `data-testid` en cada elemento interactivo cubierto por la Suite_E2E (botones de acción, campos de formulario, selects, checkboxes, enlaces de navegación, filas/items de listado y contenedores de estado).
2. WHERE un elemento requiere `data-testid`, THE Frontend SHALL derivar el valor mediante el util TestTags con su prefijo `cy`.
3. THE Suite_E2E SHALL localizar los elementos instrumentados exclusivamente mediante selectores `data-testid` en lugar de selectores por texto o por estructura CSS.
4. IF un elemento cubierto por una prueba no expone `data-testid`, THEN THE Suite_E2E SHALL fallar la prueba con un mensaje que identifique el `data-testid` ausente.
5. THE Frontend SHALL conservar los `data-testid` con valores estables entre corridas para entradas equivalentes.

### Requirement 2: Reconstrucción de Page Objects sobre Widgets

**User Story:** Como desarrollador de pruebas, quiero que cada POM encapsule sus elementos mediante Widgets sobre `data-testid`, para que la lógica de interacción quede centralizada y reutilizable.

#### Acceptance Criteria

1. THE Page_Object SHALL encapsular cada elemento de su vista mediante un Widget construido a partir de un selector `data-testid`.
2. THE Page_Object SHALL exponer métodos de interacción de alto nivel (por ejemplo crear, editar, eliminar, verificar) que deleguen en los Widgets.
3. THE Page_Object SHALL omitir selectores basados en texto visible o en clases CSS dinámicas.
4. WHERE existe un Page_Object por módulo (Login, Resources, Metrics, Records, Dashboard, Configuration, Users, Profile), THE Suite_E2E SHALL reutilizar ese Page_Object en las step-definitions correspondientes.

### Requirement 3: Autenticación real por la interfaz

**User Story:** Como responsable de calidad, quiero que las pruebas inicien sesión a través de la UI con credenciales reales, para que el flujo de autenticación quede cubierto extremo a extremo.

#### Acceptance Criteria

1. WHEN una prueba requiere una sesión autenticada, THE Suite_E2E SHALL iniciar sesión a través del formulario de login del Frontend usando las credenciales del administrador (`admin@pulseops.com`).
2. THE Suite_E2E SHALL obtener la sesión sin inyectar tokens directamente en almacenamiento ni cabeceras.
3. WHEN se envían credenciales válidas, THE Frontend SHALL autenticar al usuario y mostrar la vista posterior al login.
4. IF se envían credenciales inválidas, THEN THE Frontend SHALL mostrar un mensaje de error y permanecer en la vista de login.
5. WHEN un usuario autenticado cierra sesión, THE Frontend SHALL terminar la sesión y mostrar la vista de login.

### Requirement 4: Datos de prueba — Seed fijo determinista

**User Story:** Como autor de pruebas, quiero un conjunto de datos base fijo y conocido cargado antes de la corrida, para que las aserciones de lectura sean fiables y repetibles.

#### Acceptance Criteria

1. THE Suite_E2E SHALL disponer de un Seed_Fijo con Recursos, métricas y records de valores conocidos y deterministas antes de ejecutar las pruebas que los consultan.
2. THE Seed_Fijo SHALL escribir los Recursos como usuarios con rol `user` en la colección que el Frontend efectivamente lee.
3. THE Seed_Fijo SHALL producir el mismo conjunto de datos en cada ejecución para entradas equivalentes.
4. WHEN una prueba verifica datos de lectura, THE Suite_E2E SHALL asertar contra los valores conocidos del Seed_Fijo.
5. THE Seed_Fijo SHALL mantenerse separado de las Factory_Random y SHALL omitir valores aleatorios.

### Requirement 5: Datos de prueba — Factories con datos aleatorios

**User Story:** Como autor de pruebas, quiero generar datos aleatorios únicos para las entidades que las pruebas crean, para evitar colisiones entre corridas y entre pruebas concurrentes.

#### Acceptance Criteria

1. WHERE una prueba crea una entidad nueva, THE Suite_E2E SHALL generar sus datos mediante una Factory_Random.
2. THE Factory_Random SHALL producir valores únicos por corrida para los campos que deban ser únicos (por ejemplo nombre o correo).
3. THE Factory_Random SHALL obtener los datos aleatorios mediante la librería Faker.
4. WHERE Faker aún no está instalado en el entorno, THE Suite_E2E SHALL conservar el código de las Factory_Random presente en el repositorio sin impedir la compilación del resto del proyecto.
5. THE Factory_Random SHALL usarse únicamente para datos de creación y SHALL omitir su uso en los datos del Seed_Fijo.

### Requirement 6: CRUD de Resources

**User Story:** Como administrador, quiero verificar el ciclo completo de gestión de Recursos por la UI, para garantizar que crear, listar, editar y eliminar Recursos funciona tras cada cambio.

#### Acceptance Criteria

1. WHEN el administrador crea un Recurso con datos de una Factory_Random, THE Frontend SHALL persistir el Recurso y mostrarlo en el listado.
2. WHEN el administrador abre el listado de Recursos, THE Frontend SHALL mostrar los Recursos del Seed_Fijo con sus valores conocidos.
3. WHEN el administrador edita un Recurso existente, THE Frontend SHALL persistir los cambios y reflejarlos en el listado.
4. WHEN el administrador elimina un Recurso, THE Frontend SHALL retirar el Recurso del listado activo.
5. IF el administrador envía el formulario de Recurso con datos inválidos, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 7: CRUD de Metrics

**User Story:** Como administrador, quiero verificar el ciclo completo de gestión de Métricas por la UI, para garantizar que su CRUD funciona tras cada cambio.

#### Acceptance Criteria

1. WHEN el administrador crea una Métrica con datos de una Factory_Random, THE Frontend SHALL persistir la Métrica y mostrarla en el listado.
2. WHEN el administrador abre el listado de Métricas, THE Frontend SHALL mostrar las Métricas del Seed_Fijo con sus valores conocidos.
3. WHEN el administrador edita una Métrica existente, THE Frontend SHALL persistir los cambios y reflejarlos en el listado.
4. WHEN el administrador elimina una Métrica, THE Frontend SHALL retirar la Métrica del listado activo.
5. IF el administrador envía el formulario de Métrica con datos inválidos, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 8: CRUD de Records

**User Story:** Como administrador, quiero verificar el ciclo completo de gestión de Records (registros semanales de métricas) por la UI, para garantizar que su CRUD funciona tras cada cambio.

#### Acceptance Criteria

1. WHEN el administrador crea un Record asociado a un Recurso y una Métrica con datos de una Factory_Random, THE Frontend SHALL persistir el Record y mostrarlo en el listado.
2. WHEN el administrador abre el listado de Records, THE Frontend SHALL mostrar los Records del Seed_Fijo con sus valores conocidos.
3. WHEN el administrador edita un Record existente, THE Frontend SHALL persistir los cambios y reflejarlos en el listado.
4. WHEN el administrador elimina un Record, THE Frontend SHALL retirar el Record del listado activo.
5. IF el administrador envía el formulario de Record con datos inválidos, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 9: CRUD de Users

**User Story:** Como administrador, quiero verificar el ciclo completo de gestión de Usuarios por la UI, para garantizar que su CRUD funciona tras cada cambio.

#### Acceptance Criteria

1. WHEN el administrador crea un Usuario con datos de una Factory_Random, THE Frontend SHALL persistir el Usuario y mostrarlo en el listado.
2. WHEN el administrador abre el listado de Usuarios, THE Frontend SHALL mostrar los Usuarios del Seed_Fijo con sus valores conocidos.
3. WHEN el administrador edita un Usuario existente, THE Frontend SHALL persistir los cambios y reflejarlos en el listado.
4. WHEN el administrador elimina un Usuario, THE Frontend SHALL retirar el Usuario del listado activo.
5. IF el administrador envía el formulario de Usuario con datos inválidos, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 10: Navegación entre módulos

**User Story:** Como usuario autenticado, quiero navegar entre los módulos de la aplicación, para confirmar que el enrutamiento y los accesos de menú funcionan.

#### Acceptance Criteria

1. WHEN el usuario autenticado selecciona una entrada de navegación, THE Frontend SHALL mostrar la vista del módulo correspondiente y reflejar la ruta en la URL.
2. THE Frontend SHALL exponer las entradas de navegación de los módulos cubiertos mediante `data-testid`.
3. WHILE el usuario no está autenticado, THE Frontend SHALL redirigir las rutas protegidas a la vista de login.

### Requirement 11: Dashboard de análisis

**User Story:** Como Product Owner operativo, quiero seleccionar un Recurso y una Métrica en el Dashboard y ver su análisis, para confirmar que la visualización de Condicion_Operativa funciona.

#### Acceptance Criteria

1. WHEN el usuario selecciona un Recurso del Seed_Fijo en el Dashboard, THE Frontend SHALL mostrar las Métricas asociadas a ese Recurso.
2. WHEN el usuario selecciona una Métrica en el Dashboard, THE Frontend SHALL mostrar el análisis histórico y la Condicion_Operativa resultante.
3. WHERE el Recurso seleccionado proviene del Seed_Fijo, THE Suite_E2E SHALL asertar la Condicion_Operativa esperada según los valores conocidos del Seed_Fijo.

### Requirement 12: Configuración de umbrales

**User Story:** Como administrador, quiero editar y guardar la configuración de umbrales, para confirmar que los cambios de configuración persisten.

#### Acceptance Criteria

1. WHEN el administrador abre la vista de Configuración, THE Frontend SHALL mostrar los umbrales de condición vigentes.
2. WHEN el administrador edita un umbral y guarda, THE Frontend SHALL persistir el cambio y mostrar el valor actualizado.
3. IF el administrador guarda un umbral con un valor inválido, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 13: Perfil de usuario

**User Story:** Como usuario autenticado, quiero ver y actualizar mi perfil, para confirmar que la gestión de perfil funciona.

#### Acceptance Criteria

1. WHEN el usuario autenticado abre la vista de Perfil, THE Frontend SHALL mostrar sus datos actuales.
2. WHEN el usuario actualiza un campo editable del Perfil y guarda, THE Frontend SHALL persistir el cambio y mostrar el valor actualizado.
3. IF el usuario guarda el Perfil con datos inválidos, THEN THE Frontend SHALL mostrar un mensaje de validación y omitir la persistencia.

### Requirement 14: Ejecución incremental y validación por el usuario

**User Story:** Como desarrollador que prepara el refactor, quiero estabilizar la Suite_E2E módulo por módulo con validación manual, dado que el entorno del agente no puede ejecutar Cypress, para avanzar de forma controlada.

#### Acceptance Criteria

1. THE Suite_E2E SHALL estabilizarse por módulos en el orden Auth, Resources, Metrics, Records, Dashboard, Configuration, Users, Profile.
2. WHEN un módulo queda instrumentado y con su Page_Object reconstruido, THE proceso SHALL solicitar al usuario que ejecute Cypress para ese módulo y reporte el resultado antes de avanzar al siguiente.
3. WHERE el entorno no permite ejecutar `npm install` ni Cypress, THE proceso SHALL delegar al usuario la instalación de Faker (`npm install -D @faker-js/faker`) y la ejecución de la Suite_E2E como tareas explícitas.
4. IF el usuario reporta fallos en un módulo, THEN THE proceso SHALL corregir el módulo y volver a solicitar validación antes de continuar.
5. THE proceso SHALL omitir el lanzamiento de servidores de desarrollo, watchers o Cypress mediante ejecución de bash desde el agente.
