Feature: Gestión de Métricas en PulseOps

  Como usuario autenticado de PulseOps
  Quiero gestionar las métricas del sistema
  Para poder monitorear diferentes indicadores

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de métricas

  Scenario: Ver lista de métricas existentes
    Then debe ver la tabla de métricas
    And debe poder ver las columnas "Nombre", "Unidad", "Tipo"

  Scenario: Crear una nueva métrica
    When hace clic en el botón "Crear Métrica"
    And completa el formulario con los datos:
      | campo      | valor              |
      | name       | CPU Usage          |
      | unit       | percentage         |
      | type       | gauge              |
      | description| CPU utilization    |
    And hace clic en "Guardar"
    Then debe ver un mensaje de éxito
    And la métrica "CPU Usage" debe aparecer en la lista

  Scenario: Buscar una métrica específica
    When escribe "Temperature" en el campo de búsqueda
    Then debe filtrar y mostrar solo métricas que contengan "Temperature"

  Scenario: Editar una métrica existente
    When hace clic en el botón de editar de la primera métrica
    And modifica el campo "description" a "Updated description"
    And hace clic en "Guardar"
    Then debe ver un mensaje de éxito
    And los cambios deben reflejarse en la lista

  Scenario: Eliminar una métrica
    When hace clic en el botón de eliminar de la última métrica
    And confirma la eliminación
    Then debe ver un mensaje de éxito
    And la métrica debe desaparecer de la lista
