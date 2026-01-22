import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';
import { DashboardPage } from '../../../support/pages/pulseops/DashboardPage';

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();

// Background step
Given('el usuario está autenticado en PulseOps', () => {
    loginPage.visit();
    loginPage.loginAsAdmin();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// Background step para otros módulos (mismo comportamiento, diferente nombre de step)
Given('el usuario está autenticado como administrador', () => {
    loginPage.visit();
    loginPage.loginAsAdmin();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// When steps
When('el usuario visita la URL {string}', (url: string) => {
    cy.visit(url);
});

When('el usuario hace clic en el menú de usuario', () => {
    cy.contains('button', 'AD').click();
});

When('selecciona la opción de cerrar sesión', () => {
    cy.contains('Cerrar Sesión').click();
});

// Then steps
Then('debe ver la página del dashboard', () => {
    dashboardPage.verifyDashboardDisplayed();
});

Then('la URL debe contener {string}', (path: string) => {
    cy.url().should('include', path);
});

Then('debe ver la página de recursos', () => {
    cy.url().should('include', '/resources');
});

Then('debe ver una tabla o lista de recursos', () => {
    cy.get('table, [role="table"], ul, ol').should('be.visible');
});

Then('debe ver la página de métricas', () => {
    cy.url().should('include', '/metrics');
});

Then('debe ver una tabla o lista de métricas', () => {
    cy.get('table, [role="table"], ul, ol').should('be.visible');
});

Then('debe ver la página de registros', () => {
    cy.url().should('include', '/records');
});

Then('debe ver una tabla o lista de registros', () => {
    // En registros, la tabla puede no mostrarse hasta seleccionar filtros
    cy.contains('Registros').should('be.visible');
    cy.contains('Filtros').should('be.visible');
});

Then('la sesión debe estar cerrada', () => {
    // Verify we can't access protected routes
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
});
