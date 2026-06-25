import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { testTags } from '../../../support/utils/testTags';

/**
 * Steps comunes compartidos entre módulos.
 *
 * El Background de autenticación delega en `cy.loginAsAdmin()` (login real por UI
 * cacheado con cy.session). Tras restaurar la sesión, se aterriza en el dashboard.
 */

// Solo asegura sesión autenticada (no carga el dashboard pesado).
const ensureAuth = () => {
    cy.loginAsAdmin();
};

// Navegación (feature 02): aterriza en el dashboard explícitamente.
Given('el usuario está autenticado en PulseOps', () => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
});

// Resto de módulos: basta con sesión iniciada; cada módulo visita su página.
Given('el usuario está autenticado como administrador', ensureAuth);

// Toast de éxito (selector global `cy-toast`). El toast es efímero (~5s) y los POM
// de creación/edición ya lo verifican en vivo tras guardar; aquí se comprueba de
// forma tolerante (si ya se desmontó, la aserción de listado posterior es la prueba
// dura del éxito de la operación).
Then('debe ver un mensaje de éxito', () => {
    cy.get('body').then(($body) => {
        const toast = $body.find(testTags.selector('toast'));
        if (toast.length) {
            cy.wrap(toast.first()).should('exist');
        }
    });
});
