# language: es
Característica: Validación de listas
  Como usuario del sitio de ejemplo de Cypress
  Quiero poder verificar elementos en una lista
  Para asegurarme que la información está correctamente mostrada

  Escenario: Verificar que una lista contiene elementos específicos
    Dado que navego a la página de Querying
    Cuando busco la lista de queries
    Entonces debería ver una lista con elementos
    Y la lista debería contener ítems específicos

  Escenario: Contar elementos en una lista
    Dado que navego a la página de Querying
    Cuando obtengo todos los elementos de la lista
    Entonces debería poder contar el número de elementos
    Y el número debería ser mayor a cero

  Escenario: Verificar texto de elementos en lista
    Dado que navego a la página de Querying
    Cuando selecciono un elemento específico de la lista
    Entonces debería poder leer su contenido de texto
    Y el texto debería ser el esperado
