import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';
import { DashboardPage } from '../../../support/pages/pulseops/DashboardPage';

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();

// Background steps
Given('el usuario visita la aplicación PulseOps', () => {
    loginPage.visitRoot();
});

Given('el usuario está en la página de login', () => {
    loginPage.visit();
    loginPage.verifyLoginPageDisplayed();
});

// When steps
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
    loginPage.clickLogin();
});

// Then steps
Then('debe ser redirigido a la página de login', () => {
    cy.url().should('include', '/login');
});

Then('debe ver el título {string}', (title: string) => {
    cy.contains(title).should('be.visible');
});

Then('debe ser redirigido al dashboard', () => {
    cy.url().should('include', '/dashboard', { timeout: 10000 });
});

Then('debe ver la URL {string}', (url: string) => {
    cy.url().should('include', url);
});

Then('debe ver un mensaje de error', () => {
    loginPage.verifyErrorMessage();
});

Then('debe permanecer en la página de login', () => {
    loginPage.verifyCurrentPageIsLogin();
});

Then('el botón de login no debe permitir el envío', () => {
    cy.get('button[type="submit"]').should('be.disabled');
});

Then('debe ver mensajes de validación', () => {
    cy.get('input:invalid, [aria-invalid="true"]').should('exist');
});
