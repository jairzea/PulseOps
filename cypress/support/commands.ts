/**
 * 🎯 Comandos Personalizados de Cypress
 * Registra todos los widgets como comandos de Cypress
 */

import { ButtonWidget, InputWidget, CheckboxWidget, LinkWidget, SelectWidget } from './widgets';
import { LoginPage } from './pages/pulseops/LoginPage';

// Declaración de tipos para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Obtiene el elemento por su selector data-testid (chainable de Cypress).
       * Permite usar los comandos nativos (type/click/select/should...).
       * @example cy.getButton('[data-testid="cy-login-submit"]').click()
       */
      getButton(testId: string): Chainable<JQuery<HTMLElement>>;
      getInput(testId: string): Chainable<JQuery<HTMLElement>>;
      getCheckbox(testId: string): Chainable<JQuery<HTMLElement>>;
      getLink(testId: string): Chainable<JQuery<HTMLElement>>;
      getSelect(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Inicia sesión como administrador mediante login real por UI.
       * Cacheado con cy.session para reutilizar la sesión entre escenarios.
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;
    }
  }
}

// Los widgets siguen disponibles para uso directo (new InputWidget(sel)).
// Los comandos devuelven el elemento como chainable para encadenar comandos nativos.
void ButtonWidget;
void InputWidget;
void CheckboxWidget;
void LinkWidget;
void SelectWidget;

Cypress.Commands.add('getButton', (testId: string) => cy.get(testId));
Cypress.Commands.add('getInput', (testId: string) => cy.get(testId));
Cypress.Commands.add('getCheckbox', (testId: string) => cy.get(testId));
Cypress.Commands.add('getLink', (testId: string) => cy.get(testId));
Cypress.Commands.add('getSelect', (testId: string) => cy.get(testId));

Cypress.Commands.add('loginAsAdmin', () => {
  cy.session(
    'admin',
    () => {
      // Login real por UI (sin inyectar tokens). El token se persiste en cuanto la
      // API responde; esperamos por él con reintento manual amplio (entornos lentos).
      const login = new LoginPage();
      login.visit().submit('admin@pulseops.com', Cypress.env('ADMIN_PASSWORD'));
      const waitForToken = (attempt = 0): void => {
        cy.window()
          .its('localStorage')
          .invoke('getItem', 'auth_token')
          .then((token) => {
            if (token) return;
            if (attempt >= 30) throw new Error('Login no persistió auth_token tras 30 intentos');
            cy.wait(1000);
            waitForToken(attempt + 1);
          });
      };
      waitForToken();
    },
    // Reutiliza la sesión entre specs: solo el primer login real es necesario.
    { cacheAcrossSpecs: true },
  );
});

export {};
