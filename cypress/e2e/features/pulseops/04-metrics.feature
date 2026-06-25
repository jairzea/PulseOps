Feature: Gestión de Métricas en PulseOps

  Como administrador de PulseOps
  Quiero gestionar las métricas del sistema
  Para definir los indicadores que se evalúan

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de métricas

  Scenario: Ver métricas del seed en la lista
    Then debe ver la métrica "Story Points" en la lista
    And debe ver la métrica "Performance Score" en la lista

  Scenario: Crear una nueva métrica
    When crea una métrica con datos de factory
    Then debe ver un mensaje de éxito
    And la nueva métrica debe aparecer en la lista

  Scenario: Editar una métrica recién creada
    When crea una métrica con datos de factory
    And edita esa métrica con una nueva unidad
    Then debe ver un mensaje de éxito

  Scenario: Eliminar una métrica recién creada
    When crea una métrica con datos de factory
    And elimina esa métrica
    Then debe ver un mensaje de éxito
    And la métrica no debe aparecer en la lista

  Scenario: Validación al crear con datos inválidos
    When intenta crear una métrica sin clave
    Then debe ver un error de validación en el formulario de métrica
