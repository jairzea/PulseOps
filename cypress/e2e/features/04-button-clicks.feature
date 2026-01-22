# language: es
Característica: Clicks en botones
  Como usuario del sitio de ejemplo de Cypress
  Quiero poder hacer clic en botones
  Para ejecutar acciones

  Escenario: Hacer clic en un botón de acción
    Dado que navego a la página de Actions
    Cuando hago clic en el botón de acción
    Entonces el botón debería responder al clic
    Y debería poder ver el resultado de la acción

  Escenario: Hacer doble clic en un elemento
    Dado que navego a la página de Actions
    Cuando hago doble clic en el elemento designado
    Entonces el elemento debería responder al doble clic
    Y debería mostrar el comportamiento esperado
