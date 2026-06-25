Feature: Gestión de Recursos en PulseOps

  Como administrador de PulseOps
  Quiero gestionar recursos
  Para mantener al día al equipo evaluado

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de recursos

  Scenario: Ver recursos del seed en la lista
    Then debe ver el recurso "E2E Poder" en la lista
    And debe ver el recurso "E2E Peligro" en la lista

  Scenario: Crear un nuevo recurso
    When crea un recurso con datos de factory
    Then debe ver un mensaje de éxito
    And el nuevo recurso debe aparecer en la lista

  Scenario: Editar un recurso recién creado
    When crea un recurso con datos de factory
    And edita ese recurso con un nuevo nombre
    Then debe ver un mensaje de éxito
    And el recurso debe mostrar el nuevo nombre

  Scenario: Eliminar un recurso recién creado
    When crea un recurso con datos de factory
    And elimina ese recurso
    Then debe ver un mensaje de éxito
    And el recurso no debe aparecer en la lista

  Scenario: Validación al crear con datos inválidos
    When intenta crear un recurso sin nombre
    Then debe ver un error de validación en el formulario de recurso
