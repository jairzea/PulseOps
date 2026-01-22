Feature: Visualización del Dashboard en PulseOps

  Como usuario autenticado de PulseOps
  Quiero ver gráficos y análisis en el dashboard
  Para monitorear el estado operativo del sistema

  Background:
    Given el usuario está autenticado como administrador
    And está en el dashboard principal

  Scenario: Ver selector de recursos y métricas
    Then debe ver el selector de recursos
    And debe ver el selector de métricas

  Scenario: Seleccionar recurso y métrica para visualizar
    When selecciona el recurso "Server-01"
    And selecciona la métrica "CPU Usage"
    Then debe mostrar el gráfico de serie temporal
    And el gráfico debe tener datos

  Scenario: Ver condición operativa actual
    When selecciona un recurso con datos
    And selecciona una métrica configurada
    Then debe mostrar la condición operativa actual
    And debe mostrar el color del semáforo

  Scenario: Ver inclinación y señales
    When visualiza un recurso con histórico
    Then debe mostrar el valor de inclinación
    And debe mostrar las señales detectadas

  Scenario: Ver playbook o fórmula asociada
    When selecciona una condición con playbook
    Then debe mostrar el playbook asociado
    And debe poder ver la fórmula de la condición
