/**
 * ⌨️ Step Definitions - Interacción con Inputs
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ActionsPage } from '../../support/pages';

const actionsPage = new ActionsPage();

Given('que navego a la página de Actions', () => {
  actionsPage.visit();
});

When('escribo {string} en el campo de email', (email: string) => {
  actionsPage.typeInEmail(email);
});

Then('el campo de email debería contener {string}', (expectedEmail: string) => {
  actionsPage.shouldHaveEmailValue(expectedEmail);
});

Then('el valor debería estar visible', () => {
  actionsPage.getEmailInput().should('be.visible');
});

When('limpio el campo de email', () => {
  actionsPage.clearInput('.action-email');
});

Then('el campo de email debería estar vacío', () => {
  actionsPage.shouldBeEmpty('.action-email');
});

Then('debería ver un campo de entrada deshabilitado', () => {
  actionsPage.getDisabledInput().should('be.visible');
});

Then('no debería poder escribir en él', () => {
  actionsPage.shouldBeDisabled();
});
