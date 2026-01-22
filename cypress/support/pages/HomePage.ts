/**
 * 🏠 Home Page - Kitchen Sink
 * Page Object Model para la página principal de example.cypress.io
 */

import { TestTags } from '../utils/testTags';
import { LinkWidget } from '../widgets';

export class HomePage {
  private testTags: TestTags;

  constructor() {
    this.testTags = TestTags.create('home');
  }

  /**
   * Visita la página principal
   */
  visit() {
    cy.visit('/');
  }

  /**
   * Obtiene el título principal
   */
  getTitle() {
    return cy.get('h1');
  }

  /**
   * Verifica el título de la página
   */
  shouldHaveTitle(title: string) {
    return this.getTitle().should('contain', title);
  }

  /**
   * Navega a una sección específica
   */
  navigateToSection(sectionName: string) {
    cy.contains('a', sectionName).click();
  }

  /**
   * Verifica que la URL contiene cierto path
   */
  shouldHaveUrl(urlPath: string) {
    cy.url().should('include', urlPath);
  }

  /**
   * Navega a Querying
   */
  goToQuerying() {
    this.navigateToSection('Querying');
  }

  /**
   * Navega a Actions
   */
  goToActions() {
    this.navigateToSection('Actions');
  }

  /**
   * Navega a Traversal
   */
  goToTraversal() {
    this.navigateToSection('Traversal');
  }

  /**
   * Navega a Viewport
   */
  goToViewport() {
    this.navigateToSection('Viewport');
  }

  /**
   * Verifica que la navegación del sidebar está visible
   */
  shouldHaveNavigation() {
    cy.get('.nav-link').should('be.visible');
  }

  /**
   * Obtiene todos los enlaces de navegación
   */
  getAllNavigationLinks() {
    return cy.get('.nav-link');
  }

  /**
   * Verifica el número de secciones en la navegación
   */
  shouldHaveNavigationSectionsCount(count: number) {
    this.getAllNavigationLinks().should('have.length.greaterThan', count);
  }
}

export default HomePage;
