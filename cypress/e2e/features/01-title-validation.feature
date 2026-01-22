# language: es
Característica: Validación del título de la página Kitchen Sink
  Como usuario del sitio de ejemplo de Cypress
  Quiero verificar que el título principal es correcto
  Para asegurarme que estoy en la página correcta

  Escenario: Verificar el título principal en la página de inicio
    Dado que navego a la página principal de Kitchen Sink
    Cuando la página se carga completamente
    Entonces debería ver el título principal "Kitchen Sink"
    Y el título debería estar visible en la parte superior
