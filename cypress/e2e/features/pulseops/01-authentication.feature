Feature: Autenticación en PulseOps

  Como usuario de PulseOps
  Quiero poder autenticarme en el sistema
  Para acceder a las funcionalidades de la aplicación

  Background:
    Given el usuario visita la aplicación PulseOps

  Scenario: Validar que la aplicación redirige a login
    When el usuario accede a la raíz de la aplicación
    Then debe ser redirigido a la página de login
    And debe ver el título "Welcome to PulseOps"

  Scenario: Login exitoso con credenciales válidas
    Given el usuario está en la página de login
    When ingresa el email "admin@pulseops.com"
    And ingresa la contraseña "admin123"
    And hace clic en el botón de login
    Then debe ser redirigido al dashboard
    And debe ver la URL "/dashboard"

  Scenario: Login fallido con credenciales inválidas
    Given el usuario está en la página de login
    When ingresa el email "wrong@test.com"
    And ingresa la contraseña "wrongpass"
    And hace clic en el botón de login
    Then debe ver un mensaje de error
    And debe permanecer en la página de login

  Scenario: Validar campos requeridos en login
    Given el usuario está en la página de login
    When intenta hacer login sin ingresar credenciales
    Then el botón de login no debe permitir el envío
    Or debe ver mensajes de validación
