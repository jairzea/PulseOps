Feature: Perfil de Usuario en PulseOps

  Como usuario autenticado de PulseOps
  Quiero ver y actualizar mi perfil
  Para mantener mi información al día

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de perfil

  Scenario: Ver datos actuales del perfil
    Then debe ver el email "admin@pulseops.com" en el perfil

  Scenario: Actualizar el nombre del perfil
    When edita su nombre a "Admin E2E"
    Then debe ver un mensaje de éxito
    And el perfil debe mostrar el nombre "Admin E2E"
