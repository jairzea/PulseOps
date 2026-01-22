Feature: Configuración de Umbrales en PulseOps

  Como administrador de PulseOps
  Quiero poder gestionar la configuración de umbrales
  Para ajustar las condiciones operativas del sistema

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de configuración

  Scenario: Ver configuración de umbrales actual
    Then debe ver la página de configuración de umbrales
    And debe ver "Configuración de Umbrales"
    And debe ver la configuración predeterminada de condiciones

  Scenario: Visualizar umbrales de cada condición
    Then debe ver los umbrales de "AFLUENCIA"
    And debe ver los umbrales de "NORMAL"
    And debe ver los umbrales de "EMERGENCIA"
    And debe ver los umbrales de "PELIGRO"
    And debe ver los umbrales de "PODER"

  Scenario: Ver información de la configuración activa
    Then debe ver la versión de la configuración
    And debe ver la fecha de actualización
    And debe ver el estado "Activa"

  Scenario: Acceder a editar configuración
    When hace clic en Editar Configuración
    Then debe ver el formulario de edición de umbrales

  Scenario: Verificar que solo administradores pueden editar
    Then debe existir el botón "Editar Configuración"
    And el botón debe estar visible para administradores
