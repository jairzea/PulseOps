/**
 * 📝 Step Definitions - Validación de Formulario
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Variables de contexto para el formulario
let formSelector: string;
let emailInputSelector: string;
let nameInputSelector: string;
let ageInputSelector: string;
let termsCheckboxSelector: string;
let submitButtonSelector: string;
let clearButtonSelector: string;

Given('que tengo un formulario de prueba con validaciones', () => {
  // Inicializar selectores
  formSelector = '[data-testid="validation-form"]';
  emailInputSelector = '[data-testid="email-input"]';
  nameInputSelector = '[data-testid="name-input"]';
  ageInputSelector = '[data-testid="age-input"]';
  termsCheckboxSelector = '[data-testid="terms-checkbox"]';
  submitButtonSelector = '[data-testid="submit-button"]';
  clearButtonSelector = '[data-testid="clear-button"]';

  // Nota: Este formulario necesita ser creado como fixture o página de prueba
  cy.log('⚠️ Formulario de validación: Requiere implementación de página de prueba personalizada');
});

When('intento enviar el formulario sin completar el email', () => {
  cy.get(submitButtonSelector).click();
});

Then('debería ver un mensaje de error {string}', (errorMessage: string) => {
  cy.contains(errorMessage).should('be.visible');
});

Then('el formulario no debería ser enviado', () => {
  cy.url().should('not.include', '/success');
});

When('escribo {string} en el campo de email', (email: string) => {
  cy.get(emailInputSelector).clear().type(email);
});

When('escribo {string} en el campo de nombre', (name: string) => {
  cy.get(nameInputSelector).clear().type(name);
});

When('escribo {string} en el campo de edad', (age: string) => {
  cy.get(ageInputSelector).clear().type(age);
});

When('marco el checkbox de aceptar términos', () => {
  cy.get(termsCheckboxSelector).check();
});

When('hago clic en el botón de enviar', () => {
  cy.get(submitButtonSelector).click();
});

Then('debería ver un mensaje de éxito {string}', (successMessage: string) => {
  cy.contains(successMessage).should('be.visible');
});

Then('el formulario debería ser enviado exitosamente', () => {
  cy.url().should('include', '/success').or('contain', 'success');
});

When('intento enviar sin marcar términos y condiciones', () => {
  cy.get(termsCheckboxSelector).should('not.be.checked');
  cy.get(submitButtonSelector).click();
});

When('veo un mensaje de error', () => {
  cy.get('[data-testid="error-message"]').should('be.visible');
});

When('hago clic en el botón de limpiar formulario', () => {
  cy.get(clearButtonSelector).click();
});

Then('todos los campos deberían estar vacíos', () => {
  cy.get(emailInputSelector).should('have.value', '');
  cy.get(nameInputSelector).should('have.value', '');
  cy.get(ageInputSelector).should('have.value', '');
  cy.get(termsCheckboxSelector).should('not.be.checked');
});

Then('no debería ver mensajes de error', () => {
  cy.get('[data-testid="error-message"]').should('not.exist');
});
