Feature: Gestión de Registros en PulseOps

  Como administrador de PulseOps
  Quiero gestionar los registros semanales de métricas
  Para mantener el historial que alimenta el análisis

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de registros

  Scenario: Ver registros del seed tras filtrar
    When filtra por el primer recurso y su métrica
    Then debe ver la tabla de registros

  Scenario: Crear un nuevo registro
    When crea un registro con datos de factory
    Then debe ver un mensaje de éxito

  Scenario: Eliminar un registro recién creado
    When crea un registro con datos de factory
    And filtra por el primer recurso y su métrica
    And elimina el primer registro
    Then debe ver un mensaje de éxito

  Scenario: Validación al crear sin valores
    When intenta crear un registro sin valores
    Then el formulario de registro sigue abierto
