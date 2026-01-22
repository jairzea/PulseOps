/**
 * 📝 Step Definitions - Validación de Título
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { HomePage } from '../../support/pages';

const homePage = new HomePage();

Given('que navego a la página principal de Kitchen Sink', () => {
  homePage.visit();
});

When('la página se carga completamente', () => {
  cy.get('h1').should('be.visible');
});

Then('debería ver el título principal {string}', (expectedTitle: string) => {
  homePage.shouldHaveTitle(expectedTitle);
});

Then('el título debería estar visible en la parte superior', () => {
  cy.get('h1').should('be.visible').and('exist');
});
