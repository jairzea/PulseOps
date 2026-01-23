/**
 * 📝 Input Widget
 * Widget personalizado para interactuar con campos de entrada (input, textarea)
 */

import BaseWidget from './BaseWidget';

export class InputWidget extends BaseWidget {
  /**
   * Escribe texto en el input (limpia primero)
   */
  type(text: string, options?: Partial<Cypress.TypeOptions>) {
    return this.getElement().clear().type(text, options);
  }

  /**
   * Escribe texto sin limpiar
   */
  typeWithoutClear(text: string, options?: Partial<Cypress.TypeOptions>) {
    return this.getElement().type(text, options);
  }

  /**
   * Limpia el contenido del input
   */
  clear() {
    return this.getElement().clear();
  }

  /**
   * Obtiene el valor actual del input
   */
  getValue() {
    return this.getElement().invoke('val');
  }

  /**
   * Verifica el valor del input
   */
  shouldHaveValue(value: string) {
    return this.getElement().should('have.value', value);
  }

  /**
   * Verifica que el input está vacío
   */
  shouldBeEmpty() {
    return this.getElement().should('have.value', '');
  }

  /**
   * Verifica el placeholder
   */
  shouldHavePlaceholder(placeholder: string) {
    return this.getElement().should('have.attr', 'placeholder', placeholder);
  }

  /**
   * Verifica que el input está deshabilitado
   */
  shouldBeDisabled() {
    return this.getElement().should('be.disabled');
  }

  /**
   * Verifica que el input está habilitado
   */
  shouldBeEnabled() {
    return this.getElement().should('be.enabled');
  }

  /**
   * Escribe lentamente (simulando usuario)
   */
  typeSlowly(text: string, delay: number = 100) {
    return this.type(text, { delay });
  }

  /**
   * Verifica que el input tiene focus
   */
  shouldBeFocused() {
    return this.getElement().should('have.focus');
  }

  /**
   * Da focus al input
   */
  focus() {
    return this.getElement().focus();
  }

  /**
   * Remueve focus del input
   */
  blur() {
    return this.getElement().blur();
  }

  /**
   * Presiona una tecla específica
   */
  pressKey(key: string) {
    return this.getElement().type(`{${key}}`);
  }
}

export default InputWidget;
