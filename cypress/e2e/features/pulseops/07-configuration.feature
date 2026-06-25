Feature: Configuración de Umbrales en PulseOps

  Como administrador de PulseOps
  Quiero editar y guardar la configuración de umbrales
  Para ajustar las condiciones operativas del motor

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de configuración

  Scenario: Ver los umbrales vigentes
    Then debe ver el resumen de "afluencia"
    And debe ver el resumen de "normal"
    And debe ver el resumen de "peligro"

  Scenario: Editar y guardar el umbral de AFLUENCIA
    When edita el umbral de AFLUENCIA a 55 y guarda
    Then debe ver un mensaje de éxito
    And el resumen de AFLUENCIA debe mostrar 55
