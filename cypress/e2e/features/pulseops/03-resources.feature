Feature: Gestión de Recursos en PulseOps

  Como usuario autenticado de PulseOps
  Quiero gestionar recursos
  Para monitorear los componentes del sistema

  Background:
    Given el usuario está autenticado en PulseOps
    And está en la página de recursos

  Scenario: Ver lista de recursos existentes
    Then debe ver al menos un recurso en la lista
    And cada recurso debe mostrar su nombre y tipo

  Scenario: Crear un nuevo recurso
    When el usuario hace clic en "New" o "Create Resource"
    And completa el formulario con:
      | campo | valor                  |
      | name  | Test Resource Cypress  |
      | type  | Server                 |
    And hace clic en "Save" o "Create"
    Then debe ver un mensaje de éxito
    And el nuevo recurso debe aparecer en la lista

  Scenario: Buscar un recurso específico
    When el usuario escribe "Test" en el campo de búsqueda
    Then debe ver solo los recursos que coinciden con "Test"

  Scenario: Editar un recurso existente
    When el usuario hace clic en editar del primer recurso
    And modifica el nombre a "Updated Resource"
    And guarda los cambios
    Then debe ver un mensaje de éxito
    And el recurso debe mostrar el nuevo nombre

  Scenario: Eliminar un recurso
    When el usuario hace clic en eliminar del último recurso
    And confirma la eliminación
    Then debe ver un mensaje de éxito
    And el recurso no debe aparecer en la lista
