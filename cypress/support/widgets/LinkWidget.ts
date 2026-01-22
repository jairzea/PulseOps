/**
 * 🔗 Link Widget
 * Widget personalizado para interactuar con enlaces (a, link)
 */

import BaseWidget from './BaseWidget';

export class LinkWidget extends BaseWidget {
  /**
   * Hace clic en el enlace
   */
  click(options?: Partial<Cypress.ClickOptions>) {
    return this.getElement().click(options);
  }

  /**
   * Verifica el href del enlace
   */
  shouldHaveHref(href: string) {
    return this.getElement().should('have.attr', 'href', href);
  }

  /**
   * Verifica que el href contiene cierto texto
   */
  shouldContainHref(partialHref: string) {
    return this.getElement().should('have.attr', 'href').and('contain', partialHref);
  }

  /**
   * Verifica el target del enlace (_blank, _self, etc.)
   */
  shouldHaveTarget(target: string) {
    return this.getElement().should('have.attr', 'target', target);
  }

  /**
   * Verifica el texto del enlace
   */
  shouldHaveText(text: string) {
    return this.getElement().should('have.text', text);
  }

  /**
   * Verifica que el enlace contiene cierto texto
   */
  shouldContainText(text: string) {
    return this.getElement().should('contain', text);
  }

  /**
   * Obtiene el href del enlace
   */
  getHref(): Cypress.Chainable<string> {
    return this.getElement().invoke('attr', 'href') as Cypress.Chainable<string>;
  }

  /**
   * Hace clic en el enlace sin seguir la navegación
   */
  clickWithoutNavigation() {
    return this.getElement().invoke('removeAttr', 'target').click();
  }

  /**
   * Verifica que el enlace abre en nueva pestaña
   */
  shouldOpenInNewTab() {
    return this.shouldHaveTarget('_blank');
  }

  /**
   * Hace clic y verifica que la URL cambie
   */
  clickAndVerifyNavigation(expectedUrl: string) {
    this.click();
    return cy.url().should('include', expectedUrl);
  }
}

export default LinkWidget;
