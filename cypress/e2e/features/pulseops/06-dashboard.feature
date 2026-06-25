Feature: Visualización del Dashboard en PulseOps

  Como Product Owner operativo
  Quiero seleccionar un recurso y ver su análisis
  Para confirmar la condición operativa que arroja el motor

  Background:
    Given el usuario está autenticado como administrador
    And está en el dashboard principal

  Scenario: Seleccionar recurso del seed y ver su gráfico
    When selecciona el recurso "E2E Afluencia"
    Then debe mostrar el gráfico de serie temporal

  Scenario: Ver la condición operativa esperada del seed
    When selecciona el recurso "E2E Afluencia"
    Then debe mostrar la condición operativa
    And la condición debe ser "PODER"

  Scenario: Ver condición de un recurso en inexistencia
    When selecciona el recurso "E2E Inexistencia"
    Then debe mostrar la condición operativa
    And la condición debe ser "INEXISTENCIA"
