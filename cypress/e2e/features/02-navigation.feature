# language: es
Característica: Navegación entre secciones
  Como usuario del sitio de ejemplo de Cypress
  Quiero poder navegar entre diferentes secciones
  Para explorar las diferentes funcionalidades

  Escenario: Navegar de la página principal a la sección de Querying
    Dado que estoy en la página principal de Kitchen Sink
    Cuando hago clic en el enlace "Querying"
    Entonces debería ser redirigido a la página de Querying
    Y la URL debería contener "/commands/querying"
    Y debería ver el título de la sección

  Escenario: Navegar de la página principal a la sección de Actions
    Dado que estoy en la página principal de Kitchen Sink
    Cuando hago clic en el enlace "Actions"
    Entonces debería ser redirigido a la página de Actions
    Y la URL debería contener "/commands/actions"
    Y debería ver el título de la sección
