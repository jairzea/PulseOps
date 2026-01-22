# language: es
Característica: Interacción con campos de entrada (inputs)
  Como usuario del sitio de ejemplo de Cypress
  Quiero poder escribir en campos de entrada
  Para probar la funcionalidad de entrada de texto

  Escenario: Escribir en el campo de email en la página de Actions
    Dado que navego a la página de Actions
    Cuando escribo "test@example.com" en el campo de email
    Entonces el campo de email debería contener "test@example.com"
    Y el valor debería estar visible

  Escenario: Limpiar un campo de entrada
    Dado que navego a la página de Actions
    Cuando escribo "texto de prueba" en el campo de email
    Y limpio el campo de email
    Entonces el campo de email debería estar vacío

  Escenario: Verificar campo deshabilitado
    Dado que navego a la página de Actions
    Entonces debería ver un campo de entrada deshabilitado
    Y no debería poder escribir en él
