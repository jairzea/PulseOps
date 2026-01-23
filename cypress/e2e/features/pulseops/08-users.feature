Feature: Gestión de Usuarios en PulseOps

  Como administrador de PulseOps
  Quiero poder gestionar usuarios del sistema
  Para controlar el acceso y permisos de la aplicación

  Background:
    Given el usuario está autenticado como administrador
    And está en la página de usuarios

  Scenario: Ver lista de usuarios existentes
    Then debe ver la página de gestión de usuarios
    And debe ver "Gestión de Usuarios"
    And debe ver una tabla de usuarios
    And debe ver las columnas "Usuario", "Rol", "Estado"

  Scenario: Abrir formulario de creación de usuario
    When hace clic en Nuevo Usuario
    Then debe ver el modal de creación de usuario
    And debe ver el campo "Nombre"
    And debe ver el campo "Email"
    And debe ver el campo "Contraseña"
    And debe ver el selector de "Rol"

  Scenario: Crear un nuevo usuario básico
    When hace clic en Nuevo Usuario
    And completa el formulario de usuario:
      | campo      | valor                    |
      | Nombre     | Test User Cypress        |
      | Email      | testcypress@pulseops.com |
      | Contraseña | Test1234!                |
      | Rol        | Usuario                  |
    And hace clic en Crear Usuario
    Then debe ver un mensaje de éxito
    And el usuario debe aparecer en la lista

  Scenario: Verificar usuarios existentes en la tabla
    Then debe ver al menos 1 usuario en la tabla
    And debe ver el usuario administrador en la lista

  Scenario: Cancelar creación de usuario
    When hace clic en Nuevo Usuario
    And hace clic en "Cancelar"
    Then no debe ver el modal de creación de usuario
