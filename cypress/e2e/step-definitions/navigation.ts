/**
 * 🧭 Step Definitions - Navegación
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { HomePage } from '../../support/pages';

const homePage = new HomePage();

Given('que estoy en la página principal de Kitchen Sink', () => {
  homePage.visit();
});

When('hago clic en el enlace {string}', (linkText: string) => {
  homePage.navigateToSection(linkText);
});

Then('debería ser redirigido a la página de Querying', () => {
  cy.url().should('include', '/commands/querying');
});

Then('debería ser redirigido a la página de Actions', () => {
  cy.url().should('include', '/commands/actions');
});

Then('la URL debería contener {string}', (urlPath: string) => {
  homePage.shouldHaveUrl(urlPath);
});

Then('debería ver el título de la sección', () => {
  cy.get('h1').should('be.visible').and('exist');
});
