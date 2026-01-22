/**
 * 🎯 Actions Page - Kitchen Sink
 * Page Object Model para la página de acciones
 */

import { TestTags } from '../utils/testTags';
import { InputWidget, ButtonWidget } from '../widgets';

export class ActionsPage {
  private testTags: TestTags;

  constructor() {
    this.testTags = TestTags.create('actions');
  }

  /**
   * Visita la página de Actions
   */
  visit() {
    cy.visit('/commands/actions');
  }

  /**
   * Obtiene el campo de email
   */
  getEmailInput() {
    return cy.get('.action-email');
  }

  /**
   * Escribe en el campo de email
   */
  typeInEmail(email: string) {
    this.getEmailInput().type(email);
  }

  /**
   * Verifica el valor del campo de email
   */
  shouldHaveEmailValue(email: string) {
    this.getEmailInput().should('have.value', email);
  }

  /**
   * Hace clic en el botón de acción
   */
  clickActionButton() {
    cy.get('.action-btn').click();
  }

  /**
   * Obtiene el campo disabled
   */
  getDisabledInput() {
    return cy.get('.action-disabled');
  }

  /**
   * Verifica que un input está deshabilitado
   */
  shouldBeDisabled() {
    this.getDisabledInput().should('be.disabled');
  }

  /**
   * Hace focus en un input
   */
  focusOnInput(selector: string) {
    cy.get(selector).focus();
  }

  /**
   * Verifica que un elemento tiene focus
   */
  shouldHaveFocus(selector: string) {
    cy.get(selector).should('have.focus');
  }

  /**
   * Hace blur en un input
   */
  blurInput(selector: string) {
    cy.get(selector).blur();
  }

  /**
   * Limpia un campo de texto
   */
  clearInput(selector: string) {
    cy.get(selector).clear();
  }

  /**
   * Verifica que un input está vacío
   */
  shouldBeEmpty(selector: string) {
    cy.get(selector).should('have.value', '');
  }

  /**
   * Hace submit de un formulario
   */
  submitForm(formSelector: string) {
    cy.get(formSelector).submit();
  }

  /**
   * Hace clic en un elemento en coordenadas específicas
   */
  clickAtPosition(selector: string, position: string) {
    cy.get(selector).click(position as any);
  }

  /**
   * Hace doble clic en un elemento
   */
  doubleClick(selector: string) {
    cy.get(selector).dblclick();
  }

  /**
   * Hace clic derecho en un elemento
   */
  rightClick(selector: string) {
    cy.get(selector).rightclick();
  }

  /**
   * Verifica el título de la sección
   */
  shouldHaveSectionTitle(title: string) {
    cy.get('h1').should('contain', title);
  }

  /**
   * Escribe con delay en un campo
   */
  typeSlowly(selector: string, text: string, delay: number = 100) {
    cy.get(selector).type(text, { delay });
  }

  /**
   * Verifica que un campo tiene cierto placeholder
   */
  shouldHavePlaceholder(selector: string, placeholder: string) {
    cy.get(selector).should('have.attr', 'placeholder', placeholder);
  }
}

export default ActionsPage;
