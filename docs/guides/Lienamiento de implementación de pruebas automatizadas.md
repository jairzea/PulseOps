🎯 Objetivo de la prueba
Evaluar la capacidad para:

Crear pruebas automáticas E2E usando Cypress.

Aplicar Behavior Driven Development (BDD) con Cucumber.

Usar TypeScript para una mejor estructura y tipado.

Validar flujos básicos de una aplicación web.

Verificar calidad mediante pruebas funcionales y de flujo.

🧩 Contexto
Utiliza la aplicación pública de ejemplo:
👉 https://example.cypress.io

Esta página es oficial de Cypress y contiene componentes específicos para testeo.

🛠️ Requerimientos técnicos
1. Configuración del entorno
El proyecto debe ser creado con:

Cypress

TypeScript

Cucumber preprocessor

Arquitectura recomendada:

cypress/
  e2e/
    features/
    step-definitions/
2. Configuración obligatoria
Integración completa de Cypress + Cucumber (BDD)

Ejecución con:

Modo interfaz (cypress open)

Modo headless (cypress run)

Scripts definidos en package.json

📘 Pruebas requeridas (en formato BDD - Gherkin)
Crea los escenarios en .feature y sus steps en TypeScript.

A) Página principal
Escenario: Validar el título principal
Validar que el título contiene "Kitchen Sink".

B) Navegación hacia "Commands > Actions"
Escenario: Navegar mediante el menú lateral
Navegar al apartado Commands → Actions.

Validar que la URL cambió correctamente.

C) Interacción con el input #email1
Escenario: Escribir texto en el input
Ingresar texto en el input con selector #email1.

Validar que el valor coincide con el texto ingresado.

D) Clic en el botón Submit
Escenario: Validar y hacer clic en Submit
Validar que el botón es visible y está habilitado.

Realizar clic.

E) Validación de lista en sección "Querying"
Escenario: Validar cantidad mínima de elementos
Navegar a Querying.

Validar que .query-list > li tiene al menos 5 elementos.

🔄 Prueba de flujo adicional
Simular un formulario. Crea un formulario, puede ser estatico con HTML o usar algun framework de JS.

Escenario: Enviar formulario validando campos
El checkbox debe estar marcado antes de enviar.

El input no debe estar vacío.

Al hacer clic en enviar, debe mostrarse un mensaje de confirmación en el DOM.

Esas acciones deben validarse con Cypress.
📋 Criterios de evaluación
Correcta instalación y configuración de Cypress + Cucumber + TypeScript.

Uso apropiado de selectores CSS.

Buen manejo de aserciones.

Escritura clara de escenarios en Gherkin.

Código TypeScript organizado y legible.

Arquitectura adecuada del proyecto.

Explicación del flujo y cobertura de pruebas.

Ejecución correcta en Linux o WSL.

⭐ Opcionales
No obligatorios, pero suman mucho:

1. Integrar reporter
Mochawesome

JUnit

o Allure Reports

U otro que considere.

2. Agregar linters
ESLint

Prettier

3. Añadir Page Object Model (POM)
Para ver estructura profesional de pruebas.