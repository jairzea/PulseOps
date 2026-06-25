Feature: Gestión de Usuarios en PulseOps

  Como administrador de PulseOps
  Quiero gestionar los usuarios del sistema
  Para controlar el acceso y los permisos

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de usuarios

  Scenario: Ver usuarios del seed en la lista
    Then debe ver el usuario "e2e.poder@pulseops.test" en la lista

  Scenario: Crear un nuevo usuario
    When crea un usuario con datos de factory
    Then debe ver un mensaje de éxito
    And el nuevo usuario debe aparecer en la lista

  Scenario: Eliminar un usuario recién creado
    When crea un usuario con datos de factory
    And elimina ese usuario
    Then debe ver un mensaje de éxito
    And el usuario no debe aparecer en la lista

  Scenario: Validación al crear con datos inválidos
    When intenta crear un usuario sin email
    Then el formulario de usuario sigue abierto
