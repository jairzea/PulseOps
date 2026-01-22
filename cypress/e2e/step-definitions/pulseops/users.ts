import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { UsersPage } from '../../../support/pages/pulseops/UsersPage';

const usersPage = new UsersPage();

// Given steps
Given('está en la página de usuarios', () => {
    usersPage.visit();
    usersPage.verifyPageDisplayed();
});

// Then steps - Verification
Then('debe ver la página de gestión de usuarios', () => {
    usersPage.verifyPageDisplayed();
});

Then('debe ver una tabla de usuarios', () => {
    usersPage.verifyUsersTableExists();
});

Then('debe ver las columnas {string}, {string}, {string}', (col1: string, col2: string, col3: string) => {
    usersPage.verifyTableColumns([col1, col2, col3]);
});

// When steps - Actions
When('hace clic en Nuevo Usuario', () => {
    usersPage.clickNewUser();
});

When('hace clic en Crear Usuario', () => {
    usersPage.clickCreateUser();
});

Then('debe ver el modal de creación de usuario', () => {
    usersPage.verifyModalDisplayed();
});

Then('debe ver el campo {string}', (fieldName: string) => {
    usersPage.verifyFieldExists(fieldName);
});

Then('debe ver el selector de {string}', (fieldName: string) => {
    usersPage.verifyFieldExists(fieldName);
});

When('completa el formulario de usuario:', (dataTable: any) => {
    const data: Record<string, string> = {};
    dataTable.hashes().forEach((row: any) => {
        data[row.campo] = row.valor;
    });
    usersPage.fillUserForm(data);
});

Then('el usuario debe aparecer en la lista', () => {
    // Wait for the user to be added
    cy.wait(1000);
});

Then('debe ver al menos {int} usuario en la tabla', (count: number) => {
    usersPage.verifyAtLeastOneUser();
});

Then('debe ver el usuario administrador en la lista', () => {
    usersPage.verifyAdminUserExists();
});

Then('no debe ver el modal de creación de usuario', () => {
    usersPage.verifyModalNotDisplayed();
});
