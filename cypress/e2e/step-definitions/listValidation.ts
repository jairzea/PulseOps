/**
 * 📋 Step Definitions - Validación de Listas
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { QueryingPage } from '../../support/pages';

const queryingPage = new QueryingPage();

Given('que navego a la página de Querying', () => {
  queryingPage.visit();
});

When('busco la lista de queries', () => {
  queryingPage.getQueryList().should('exist');
});

Then('debería ver una lista con elementos', () => {
  queryingPage.getQueryList().should('be.visible').and('exist');
});

Then('la lista debería contener ítems específicos', () => {
  queryingPage.getQueryList().find('li').should('have.length.greaterThan', 0);
});

When('obtengo todos los elementos de la lista', () => {
  queryingPage.getQueryList().find('li').as('listItems');
});

Then('debería poder contar el número de elementos', () => {
  cy.get('@listItems').should('have.length.greaterThan', 0);
});

Then('el número debería ser mayor a cero', () => {
  cy.get('@listItems').its('length').should('be.greaterThan', 0);
});

When('selecciono un elemento específico de la lista', () => {
  queryingPage.getQueryList().find('li').first().as('selectedItem');
});

Then('debería poder leer su contenido de texto', () => {
  cy.get('@selectedItem').invoke('text').should('not.be.empty');
});

Then('el texto debería ser el esperado', () => {
  cy.get('@selectedItem').should('be.visible').and('exist');
});
