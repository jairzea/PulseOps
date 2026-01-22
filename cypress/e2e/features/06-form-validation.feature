# language: es
Característica: Validación de formulario personalizado
  Como usuario de PulseOps
  Quiero poder validar un formulario con diferentes reglas
  Para asegurarme que la validación funciona correctamente

  Antecedentes:
    Dado que tengo un formulario de prueba con validaciones

  Escenario: Validar campo de email obligatorio
    Cuando intento enviar el formulario sin completar el email
    Entonces debería ver un mensaje de error "El email es obligatorio"
    Y el formulario no debería ser enviado

  Escenario: Validar formato de email
    Cuando escribo "email-invalido" en el campo de email
    Y intento enviar el formulario
    Entonces debería ver un mensaje de error "El formato del email es inválido"
    Y el formulario no debería ser enviado

  Escenario: Validar campo de nombre con longitud mínima
    Cuando escribo "ab" en el campo de nombre
    Y intento enviar el formulario
    Entonces debería ver un mensaje de error "El nombre debe tener al menos 3 caracteres"
    Y el formulario no debería ser enviado

  Escenario: Validar campo de edad con valor numérico
    Cuando escribo "abc" en el campo de edad
    Y intento enviar el formulario
    Entonces debería ver un mensaje de error "La edad debe ser un número"
    Y el formulario no debería ser enviado

  Escenario: Enviar formulario con datos válidos
    Cuando escribo "Juan Pérez" en el campo de nombre
    Y escribo "juan@example.com" en el campo de email
    Y escribo "30" en el campo de edad
    Y marco el checkbox de aceptar términos
    Y hago clic en el botón de enviar
    Entonces debería ver un mensaje de éxito "Formulario enviado correctamente"
    Y el formulario debería ser enviado exitosamente

  Escenario: Validar checkbox de términos y condiciones
    Cuando escribo "Juan Pérez" en el campo de nombre
    Y escribo "juan@example.com" en el campo de email
    Y escribo "30" en el campo de edad
    Y intento enviar sin marcar términos y condiciones
    Entonces debería ver un mensaje de error "Debes aceptar los términos y condiciones"
    Y el formulario no debería ser enviado

  Escenario: Limpiar formulario después de error
    Cuando intento enviar el formulario sin completar el email
    Y veo un mensaje de error
    Cuando hago clic en el botón de limpiar formulario
    Entonces todos los campos deberían estar vacíos
    Y no debería ver mensajes de error
