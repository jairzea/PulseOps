Feature: Gestión de Registros en PulseOps

  Como usuario autenticado de PulseOps
  Quiero gestionar los registros de datos
  Para mantener el historial de valores de las métricas

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de registros

  Scenario: Ver lista de registros existentes
    Then debe ver la tabla de registros
    And debe poder ver las columnas "Recurso", "Métrica", "Valor", "Fecha"

  Scenario: Agregar un nuevo registro manual
    When hace clic en el botón "Agregar Registro"
    And completa el formulario de registro con:
      | campo     | valor              |
      | resource  | Server-01          |
      | metric    | CPU Usage          |
      | value     | 75.5               |
    And hace clic en "Guardar"
    Then debe ver un mensaje de éxito
    And el registro debe aparecer en la lista

  Scenario: Filtrar registros por recurso
    When selecciona el recurso "Server-01" en el filtro
    Then debe mostrar solo registros del recurso "Server-01"

  Scenario: Filtrar registros por métrica
    When selecciona la métrica "Temperature" en el filtro
    Then debe mostrar solo registros de la métrica "Temperature"

  Scenario: Ver detalles de un registro
    When hace clic en ver detalles del primer registro
    Then debe mostrar todos los campos del registro
    And debe mostrar el timestamp completo
