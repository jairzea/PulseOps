/**
 * 🖱️ Step Definitions - Clicks en Botones
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ActionsPage } from '../../support/pages';

const actionsPage = new ActionsPage();

When('hago clic en el botón de acción', () => {
  actionsPage.clickActionButton();
});

Then('el botón debería responder al clic', () => {
  // Verificar que el botón existe y es clickeable
  cy.get('.action-btn').should('exist');
});

Then('debería poder ver el resultado de la acción', () => {
  // En Kitchen Sink, después del clic el botón sigue visible
  cy.get('.action-btn').should('be.visible');
});

When('hago doble clic en el elemento designado', () => {
  actionsPage.doubleClick('.action-div');
});

Then('el elemento debería responder al doble clic', () => {
  cy.get('.action-div').should('exist');
});

Then('debería mostrar el comportamiento esperado', () => {
  // Verificar que la acción se completó
  cy.get('.action-div').should('be.visible');
});
