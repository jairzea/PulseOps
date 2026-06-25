import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { NavigationPage, type NavModule } from '../../../support/pages/pulseops/NavigationPage';

const nav = new NavigationPage();

// Given
Given('el usuario no tiene sesión activa', () => {
    // Termina cualquier sesión cacheada y limpia almacenamiento (sin inyectar tokens).
    Cypress.session.clearAllSavedSessions();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
});

// When
When('el usuario navega a {string}', (module: NavModule) => {
    nav.goTo(module);
});

When('el usuario cierra sesión', () => {
    nav.logout();
});

When('el usuario accede a una ruta protegida', () => {
    cy.visit('/resources');
});

// Then
Then('debe ver el módulo {string}', (module: NavModule) => {
    nav.shouldBeOn(module);
});

Then('la URL debe contener {string}', (path: string) => {
    cy.url().should('include', path);
});
