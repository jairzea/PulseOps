/**
 * 🔘 Button Widget
 * Widget personalizado para interactuar con botones de forma robusta
 */

import BaseWidget from './BaseWidget';

export class ButtonWidget extends BaseWidget {
  /**
   * Hace clic en el botón
   */
  click(options?: Partial<Cypress.ClickOptions>) {
    return this.getElement().click(options);
  }

  /**
   * Hace doble clic en el botón
   */
  doubleClick() {
    return this.getElement().dblclick();
  }

  /**
   * Verifica que el botón está habilitado
   */
  shouldBeEnabled() {
    return this.getElement().should('be.enabled');
  }

  /**
   * Verifica que el botón está deshabilitado
   */
  shouldBeDisabled() {
    return this.getElement().should('be.disabled');
  }

  /**
   * Verifica el texto del botón
   */
  shouldHaveText(text: string) {
    return this.getElement().should('have.text', text);
  }

  /**
   * Verifica que el botón contiene cierto texto
   */
  shouldContainText(text: string) {
    return this.getElement().should('contain', text);
  }

  /**
   * Hace clic si el botón está habilitado
   */
  clickIfEnabled() {
    this.getElement().then(($btn) => {
      if (!$btn.is(':disabled')) {
        cy.wrap($btn).click();
      }
    });
  }

  /**
   * Espera a que el botón esté habilitado y hace clic
   */
  waitAndClick(timeout: number = 5000) {
    this.getElement().should('be.enabled', { timeout });
    return this.click();
  }
}

export default ButtonWidget;
