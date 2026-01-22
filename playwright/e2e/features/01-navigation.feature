Feature: Navegación base de PulseOps

  Como usuario del sistema PulseOps
  Quiero poder navegar entre las diferentes secciones de la aplicación
  Para acceder a la funcionalidad que necesito

  Background:
    Given el usuario visita la aplicación

  Scenario: La aplicación redirige a login cuando no está autenticado
    When el usuario accede a la raíz de la aplicación
    Then es redirigido automáticamente a "/login"
    And ve el formulario de inicio de sesión

  Scenario: Login exitoso y navegación al dashboard
    Given el usuario está en la página de login
    When el usuario inicia sesión con credenciales válidas
    Then es redirigido automáticamente a "/dashboard"
    And ve el contenido del dashboard

  Scenario: Navegar a la sección de Recursos desde el dashboard
    Given el usuario ha iniciado sesión exitosamente
    And está en la página "/dashboard"
    When el usuario hace click en el enlace "Resources" en el sidebar
    Then es redirigido a "/resources"
    And ve la lista de recursos

  Scenario: Navegar a la sección de Métricas desde el dashboard
    Given el usuario ha iniciado sesión exitosamente
    And está en la página "/dashboard"
    When el usuario hace click en el enlace "Metrics" en el sidebar
    Then es redirigido a "/metrics"
    And ve la lista de métricas

  Scenario: Navegar a la sección de Registros desde el dashboard
    Given el usuario ha iniciado sesión exitosamente
    And está en la página "/dashboard"
    When el usuario hace click en el enlace "Records" en el sidebar
    Then es redirigido a "/records"
    And ve la lista de registros

  Scenario: Cerrar sesión exitosamente
    Given el usuario ha iniciado sesión exitosamente
    And está en la página "/dashboard"
    When el usuario cierra sesión
    Then es redirigido a "/login"
    And ve el formulario de inicio de sesión
