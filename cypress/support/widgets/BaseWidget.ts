/**
 * 🎨 Widget Base Class
 * 
 * Clase base para todos los widgets (custom commands) de Cypress.
 * Proporciona funcionalidad común y estructura para elementos reutilizables.
 */

export abstract class BaseWidget {
  protected selector: string;

  constructor(selector: string) {
    this.selector = selector;
  }

  /**
   * Obtiene el elemento Cypress
   */
  getElement() {
    return cy.get(this.selector);
  }

  /**
   * Verifica que el elemento existe y es visible
   */
  shouldBeVisible() {
    return this.getElement().should('be.visible');
  }

  /**
   * Verifica que el elemento no es visible
   */
  shouldNotBeVisible() {
    return this.getElement().should('not.be.visible');
  }

  /**
   * Verifica que el elemento existe en el DOM
   */
  shouldExist() {
    return this.getElement().should('exist');
  }

  /**
   * Verifica que el elemento no existe en el DOM
   */
  shouldNotExist() {
    return this.getElement().should('not.exist');
  }

  /**
   * Scroll hasta el elemento
   */
  scrollIntoView() {
    return this.getElement().scrollIntoView();
  }

  /**
   * Obtiene un atributo del elemento
   */
  getAttribute(attr: string) {
    return this.getElement().invoke('attr', attr);
  }

  /**
   * Verifica que el elemento tiene un atributo específico
   */
  shouldHaveAttribute(attr: string, value?: string) {
    if (value) {
      return this.getElement().should('have.attr', attr, value);
    }
    return this.getElement().should('have.attr', attr);
  }

  /**
   * Verifica que el elemento tiene una clase CSS
   */
  shouldHaveClass(className: string) {
    return this.getElement().should('have.class', className);
  }

  /**
   * Espera un tiempo específico
   */
  wait(ms: number) {
    return cy.wait(ms);
  }
}

export default BaseWidget;
