/**
 * 🔍 Querying Page - Kitchen Sink
 * Page Object Model para la página de consultas/queries
 */

import { TestTags } from '../utils/testTags';

export class QueryingPage {
  private testTags: TestTags;

  constructor() {
    this.testTags = TestTags.create('querying');
  }

  /**
   * Visita la página de Querying
   */
  visit() {
    cy.visit('/commands/querying');
  }

  /**
   * Obtiene un elemento por su ID
   */
  getElementById(id: string) {
    return cy.get(`#${id}`);
  }

  /**
   * Obtiene elementos por clase
   */
  getElementByClass(className: string) {
    return cy.get(`.${className}`);
  }

  /**
   * Obtiene el elemento que contiene cierto texto
   */
  getElementContaining(text: string) {
    return cy.contains(text);
  }

  /**
   * Verifica que un elemento con ID existe
   */
  shouldHaveElementWithId(id: string) {
    this.getElementById(id).should('exist');
  }

  /**
   * Verifica que un elemento está visible
   */
  shouldBeVisible(selector: string) {
    cy.get(selector).should('be.visible');
  }

  /**
   * Obtiene la lista de queries
   */
  getQueryList() {
    return cy.get('.query-list');
  }

  /**
   * Obtiene un ítem específico de la lista
   */
  getListItem(itemText: string) {
    return cy.get('.query-list').contains(itemText);
  }

  /**
   * Verifica que la lista contiene un ítem
   */
  shouldContainListItem(itemText: string) {
    this.getListItem(itemText).should('be.visible');
  }

  /**
   * Verifica el número de elementos en una lista
   */
  shouldHaveListItemsCount(selector: string, count: number) {
    cy.get(selector).find('li').should('have.length', count);
  }

  /**
   * Obtiene el botón de query
   */
  getQueryButton() {
    return cy.get('.query-btn');
  }

  /**
   * Verifica el texto de un elemento
   */
  shouldHaveText(selector: string, text: string) {
    cy.get(selector).should('have.text', text);
  }

  /**
   * Verifica que contiene cierto texto
   */
  shouldContainText(selector: string, text: string) {
    cy.get(selector).should('contain', text);
  }

  /**
   * Obtiene elementos por data attribute
   */
  getByDataAttribute(attribute: string, value: string) {
    return cy.get(`[data-${attribute}="${value}"]`);
  }

  /**
   * Verifica el título de la sección
   */
  shouldHaveSectionTitle(title: string) {
    cy.get('h1').should('contain', title);
  }

  /**
   * Obtiene todos los elementos con cierta clase dentro de un contenedor
   */
  getAllElementsWithClass(containerSelector: string, className: string) {
    return cy.get(containerSelector).find(`.${className}`);
  }

  /**
   * Verifica que existe un elemento con cierto atributo
   */
  shouldHaveAttribute(selector: string, attribute: string, value: string) {
    cy.get(selector).should('have.attr', attribute, value);
  }

  /**
   * Filtra elementos y obtiene el primero
   */
  getFirstElement(selector: string) {
    return cy.get(selector).first();
  }

  /**
   * Filtra elementos y obtiene el último
   */
  getLastElement(selector: string) {
    return cy.get(selector).last();
  }

  /**
   * Obtiene un elemento por índice
   */
  getElementByIndex(selector: string, index: number) {
    return cy.get(selector).eq(index);
  }
}

export default QueryingPage;
