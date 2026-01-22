/**
 * ✅ Checkbox Widget
 * Widget personalizado para interactuar con checkboxes
 */

import BaseWidget from './BaseWidget';

export class CheckboxWidget extends BaseWidget {
  /**
   * Marca el checkbox
   */
  check(options?: Partial<Cypress.CheckOptions>) {
    return this.getElement().check(options);
  }

  /**
   * Desmarca el checkbox
   */
  uncheck(options?: Partial<Cypress.CheckOptions>) {
    return this.getElement().uncheck(options);
  }

  /**
   * Alterna el estado del checkbox
   */
  toggle() {
    return this.getElement().then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.wrap($checkbox).uncheck();
      } else {
        cy.wrap($checkbox).check();
      }
    });
  }

  /**
   * Verifica que el checkbox está marcado
   */
  shouldBeChecked() {
    return this.getElement().should('be.checked');
  }

  /**
   * Verifica que el checkbox NO está marcado
   */
  shouldNotBeChecked() {
    return this.getElement().should('not.be.checked');
  }

  /**
   * Verifica que el checkbox está deshabilitado
   */
  shouldBeDisabled() {
    return this.getElement().should('be.disabled');
  }

  /**
   * Verifica que el checkbox está habilitado
   */
  shouldBeEnabled() {
    return this.getElement().should('be.enabled');
  }

  /**
   * Obtiene el estado actual (checked o no)
   */
  isChecked(): Cypress.Chainable<boolean> {
    return this.getElement().then(($checkbox) => {
      return $checkbox.is(':checked');
    });
  }

  /**
   * Marca solo si no está marcado
   */
  checkIfNotChecked() {
    return this.isChecked().then((checked) => {
      if (!checked) {
        this.check();
      }
    });
  }

  /**
   * Desmarca solo si está marcado
   */
  uncheckIfChecked() {
    return this.isChecked().then((checked) => {
      if (checked) {
        this.uncheck();
      }
    });
  }
}

export default CheckboxWidget;
