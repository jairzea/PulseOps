/**
 * 📋 Select Widget
 * Widget personalizado para interactuar con elementos select (dropdown)
 */

import BaseWidget from './BaseWidget';

export class SelectWidget extends BaseWidget {
  /**
   * Selecciona una opción por su valor
   */
  selectByValue(value: string) {
    return this.getElement().select(value);
  }

  /**
   * Selecciona una opción por su texto visible
   */
  selectByText(text: string) {
    return this.getElement().select(text);
  }

  /**
   * Selecciona una opción por su índice
   */
  selectByIndex(index: number) {
    return this.getElement().select(index);
  }

  /**
   * Verifica la opción seleccionada por valor
   */
  shouldHaveValue(value: string) {
    return this.getElement().should('have.value', value);
  }

  /**
   * Verifica que contiene una opción con cierto texto
   */
  shouldContainOption(optionText: string) {
    return this.getElement().find('option').should('contain', optionText);
  }

  /**
   * Obtiene todas las opciones
   */
  getAllOptions() {
    return this.getElement().find('option');
  }

  /**
   * Verifica el número de opciones
   */
  shouldHaveOptionsCount(count: number) {
    return this.getAllOptions().should('have.length', count);
  }

  /**
   * Obtiene el valor seleccionado actualmente
   */
  getSelectedValue(): Cypress.Chainable<string> {
    return this.getElement().invoke('val') as Cypress.Chainable<string>;
  }

  /**
   * Obtiene el texto de la opción seleccionada
   */
  getSelectedText(): Cypress.Chainable<string> {
    return this.getElement()
      .find('option:selected')
      .invoke('text') as Cypress.Chainable<string>;
  }

  /**
   * Verifica que el select está deshabilitado
   */
  shouldBeDisabled() {
    return this.getElement().should('be.disabled');
  }

  /**
   * Verifica que el select está habilitado
   */
  shouldBeEnabled() {
    return this.getElement().should('be.enabled');
  }

  /**
   * Verifica que una opción específica está seleccionada
   */
  shouldHaveSelectedText(text: string) {
    return this.getSelectedText().should('equal', text);
  }
}

export default SelectWidget;
