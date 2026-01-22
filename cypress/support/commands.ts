/**
 * 🎯 Comandos Personalizados de Cypress
 * Registra todos los widgets como comandos de Cypress
 */

import { ButtonWidget, InputWidget, CheckboxWidget, LinkWidget, SelectWidget } from './widgets';

// Declaración de tipos para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Obtiene un elemento button y retorna un ButtonWidget
       * @example cy.getButton('submit-btn').click()
       */
      getButton(testId: string): ButtonWidget;

      /**
       * Obtiene un elemento input y retorna un InputWidget
       * @example cy.getInput('email-input').type('test@example.com')
       */
      getInput(testId: string): InputWidget;

      /**
       * Obtiene un elemento checkbox y retorna un CheckboxWidget
       * @example cy.getCheckbox('terms-checkbox').check()
       */
      getCheckbox(testId: string): CheckboxWidget;

      /**
       * Obtiene un elemento link y retorna un LinkWidget
       * @example cy.getLink('home-link').click()
       */
      getLink(testId: string): LinkWidget;

      /**
       * Obtiene un elemento select y retorna un SelectWidget
       * @example cy.getSelect('country-select').selectByValue('US')
       */
      getSelect(testId: string): SelectWidget;
    }
  }
}

// Registrar comandos personalizados
Cypress.Commands.add('getButton', (testId: string) => {
  return new ButtonWidget(testId);
});

Cypress.Commands.add('getInput', (testId: string) => {
  return new InputWidget(testId);
});

Cypress.Commands.add('getCheckbox', (testId: string) => {
  return new CheckboxWidget(testId);
});

Cypress.Commands.add('getLink', (testId: string) => {
  return new LinkWidget(testId);
});

Cypress.Commands.add('getSelect', (testId: string) => {
  return new SelectWidget(testId);
});

export {};
