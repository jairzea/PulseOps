Feature: Navegación en PulseOps

  Como usuario autenticado de PulseOps
  Quiero poder navegar entre las diferentes secciones
  Para acceder a las funcionalidades del sistema

  Background:
    Given el usuario está autenticado en PulseOps

  Scenario: Navegar al Dashboard
    When el usuario hace clic en "Dashboard" en el menú lateral
    Then debe ver la página del dashboard
    And la URL debe contener "/dashboard"

  Scenario: Navegar a Recursos
    When el usuario hace clic en "Resources" en el menú lateral
    Then debe ver la página de recursos
    And la URL debe contener "/resources"
    And debe ver una tabla o lista de recursos

  Scenario: Navegar a Métricas
    When el usuario hace clic en "Metrics" en el menú lateral
    Then debe ver la página de métricas
    And la URL debe contener "/metrics"
    And debe ver una tabla o lista de métricas

  Scenario: Navegar a Registros
    When el usuario hace clic en "Records" en el menú lateral
    Then debe ver la página de registros
    And la URL debe contener "/records"
    And debe ver una tabla o lista de registros

  Scenario: Cerrar sesión
    When el usuario hace clic en el menú de usuario
    And selecciona la opción de cerrar sesión
    Then debe ser redirigido a la página de login
    And la sesión debe estar cerrada
