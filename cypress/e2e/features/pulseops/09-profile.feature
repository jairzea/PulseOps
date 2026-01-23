Feature: Perfil de Usuario en PulseOps

  Como usuario autenticado de PulseOps
  Quiero poder ver y editar mi perfil
  Para mantener mi información actualizada

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de perfil

  Scenario: Ver información del perfil actual
    Then debe ver la página de perfil
    And debe ver "Mi Perfil"
    And debe ver el nombre del usuario
    And debe ver el email del usuario
    And debe ver el rol del usuario

  Scenario: Ver información adicional del perfil
    Then debe ver el estado de la cuenta
    And debe ver la fecha de último acceso
    And debe ver la fecha de registro

  Scenario: Acceder a editar información personal
    When hace clic en el botón "Editar" de información personal
    Then debe ver el formulario de edición
    And debe ver el campo de nombre editable
    And debe ver el campo de email editable

  Scenario: Cancelar edición de perfil
    When hace clic en el botón "Editar" de información personal
    And hace clic en "Cancelar"
    Then no debe ver el formulario de edición
    And debe ver la información del perfil en modo lectura

  Scenario: Verificar sección de seguridad
    Then debe ver la sección "Seguridad"
    And debe ver el botón "Cambiar Contraseña"
    And debe ver el mensaje sobre mantener la cuenta segura
