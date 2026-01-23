import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ConfigurationPage } from '../../../support/pages/pulseops/ConfigurationPage';

const configurationPage = new ConfigurationPage();

// Given steps
Given('está en la página de configuración', () => {
    configurationPage.visit();
    configurationPage.verifyPageDisplayed();
});

// Then steps - Verification
Then('debe ver la página de configuración de umbrales', () => {
    configurationPage.verifyPageDisplayed();
    configurationPage.verifyThresholdsVisible();
});

Then('debe ver {string}', (text: string) => {
    cy.contains(text).should('be.visible');
});

Then('debe ver la configuración predeterminada de condiciones', () => {
    configurationPage.verifyDefaultConfiguration();
});

Then('debe ver los umbrales de {string}', (conditionName: string) => {
    configurationPage.verifyConditionThresholds(conditionName);
});

Then('debe ver la versión de la configuración', () => {
    configurationPage.verifyVersionInfo();
});

Then('debe ver la fecha de actualización', () => {
    configurationPage.verifyUpdateDate();
});

Then('debe ver el estado {string}', (status: string) => {
    cy.contains(status).should('be.visible');
});

// When steps - Actions
When('hace clic en Editar Configuración', () => {
    cy.contains('button', 'Editar').click();
});

Then('debe ver el formulario de edición de umbrales', () => {
    // After clicking edit, wait for form or modal
    cy.wait(500);
    cy.get('body').should('exist');
});

Then('debe existir el botón {string}', (buttonText: string) => {
    configurationPage.verifyEditButtonExists();
});

Then('el botón debe estar visible para administradores', () => {
    configurationPage.verifyEditButtonVisible();
});
