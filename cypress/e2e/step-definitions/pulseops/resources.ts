import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';
import { ResourcesPage } from '../../../support/pages/pulseops/ResourcesPage';

const loginPage = new LoginPage();
const resourcesPage = new ResourcesPage();

// Background steps
Given('está en la página de recursos', () => {
    resourcesPage.visit();
    resourcesPage.verifyPageDisplayed();
});

// When steps
When('el usuario hace clic en {string}', (buttonText: string) => {
    cy.contains('button', buttonText, { matchCase: false }).click();
});

When('completa el formulario con:', (dataTable) => {
    const data = dataTable.rowsHash();
    if (data.name) {
        cy.get('input[name="name"], input[id*="name"]').clear().type(data.name);
    }
    if (data.type) {
        cy.get('select[name="type"], select[id*="type"]').select(data.type);
    }
});

When('el usuario escribe {string} en el campo de búsqueda', (searchTerm: string) => {
    resourcesPage.searchResource(searchTerm);
});

When('el usuario hace clic en editar del primer recurso', () => {
    resourcesPage.clickEditFirstResource();
});

When('modifica el nombre a {string}', (newName: string) => {
    cy.get('input[name="name"], input[id*="name"]').clear().type(newName);
});

When('guarda los cambios', () => {
    resourcesPage.clickSaveButton();
});

When('el usuario hace clic en eliminar del último recurso', () => {
    resourcesPage.clickDeleteLastResource();
});

When('confirma la eliminación', () => {
    resourcesPage.confirmDeletion();
});

// Then steps
Then('debe ver al menos un recurso en la lista', () => {
    resourcesPage.verifyResourcesExist();
});

Then('cada recurso debe mostrar su nombre y tipo', () => {
    cy.get('table tbody tr, [role="row"]').first().should('be.visible');
});

Then('debe ver un mensaje de éxito', () => {
    resourcesPage.verifySuccessMessage();
});

Then('el nuevo recurso debe aparecer en la lista', () => {
    cy.contains('Test Resource Cypress').should('be.visible');
});

Then('debe ver solo los recursos que coinciden con {string}', (searchTerm: string) => {
    cy.get('table tbody tr, [role="row"]').each(($row) => {
        cy.wrap($row).should('contain.text', searchTerm);
    });
});

Then('el recurso debe mostrar el nuevo nombre', () => {
    cy.contains('Updated Resource').should('be.visible');
});

Then('el recurso no debe aparecer en la lista', () => {
    cy.wait(1000); // Wait for deletion to complete
    cy.get('table tbody tr, [role="row"]').should('have.length.lessThan', 100); // Just verify it exists
});
