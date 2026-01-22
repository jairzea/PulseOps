🎯 Objetivo de la prueba
Evaluar la capacidad para:

Crear pruebas automáticas E2E usando Cypress.

Aplicar Behavior Driven Development (BDD) con Cucumber.

Usar TypeScript para una mejor estructura y tipado.

Validar flujos básicos de una aplicación web.

Verificar calidad mediante pruebas funcionales y de flujo.

🧩 Contexto
Utiliza la aplicación que estamos trabajando y actualiza lo necesario si no estamos apuntando a esta aplicacion

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