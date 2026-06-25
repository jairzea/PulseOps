Feature: Navegación en PulseOps

  Como usuario autenticado de PulseOps
  Quiero poder navegar entre las diferentes secciones
  Para acceder a las funcionalidades del sistema

  Background:
    Given el usuario está autenticado en PulseOps

  Scenario: Navegar al Dashboard
    When el usuario navega a "dashboard"
    Then debe ver el módulo "dashboard"

  Scenario: Navegar a Recursos
    When el usuario navega a "resources"
    Then debe ver el módulo "resources"

  Scenario: Navegar a Métricas
    When el usuario navega a "metrics"
    Then debe ver el módulo "metrics"

  Scenario: Navegar a Registros
    When el usuario navega a "records"
    Then debe ver el módulo "records"

  Scenario: Navegar a Configuración
    When el usuario navega a "configuration"
    Then debe ver el módulo "configuration"

  Scenario: Cerrar sesión
    When el usuario cierra sesión
    Then debe ser redirigido a la página de login

  Scenario: Las rutas protegidas redirigen a login sin sesión
    Given el usuario no tiene sesión activa
    When el usuario accede a una ruta protegida
    Then debe ser redirigido a la página de login
