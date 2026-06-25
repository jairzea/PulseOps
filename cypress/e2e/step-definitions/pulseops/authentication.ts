import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';

const loginPage = new LoginPage();

// Background / Given
Given('el usuario visita la aplicación PulseOps', () => {
    loginPage.visitRoot();
});

Given('el usuario está en la página de login', () => {
    loginPage.visit().shouldShowTitle();
});

// When
When('el usuario accede a la raíz de la aplicación', () => {
    loginPage.visitRoot();
});

When('ingresa el email {string}', (email: string) => {
    loginPage.fillEmail(email);
});

When('ingresa la contraseña {string}', (password: string) => {
    loginPage.fillPassword(password);
});

When('hace clic en el botón de login', () => {
    loginPage.clickLogin();
});

When('intenta hacer login sin ingresar credenciales', () => {
    // Sin credenciales, el submit dispara la validación nativa (required) y no navega.
    loginPage.clickLogin();
});

// Then
Then('debe ser redirigido a la página de login', () => {
    loginPage.shouldStayOnLogin();
});

Then('debe ver el título de bienvenida', () => {
    loginPage.shouldShowTitle();
});

Then('debe ser redirigido al dashboard', () => {
    // Tras el login real hay una animación (~2s) antes de navegar; timeout amplio.
    cy.url({ timeout: 25000 }).should('include', '/dashboard');
});

Then('debe ver la URL {string}', (url: string) => {
    cy.url().should('include', url);
});

Then('debe ver un mensaje de error', () => {
    loginPage.shouldShowError();
});

Then('debe permanecer en la página de login', () => {
    loginPage.shouldStayOnLogin();
});

Then('el botón de login no debe permitir el envío', () => {
    loginPage.shouldHaveInvalidEmail();
});
