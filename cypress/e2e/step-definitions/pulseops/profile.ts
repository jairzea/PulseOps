import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ProfilePage } from '../../../support/pages/pulseops/ProfilePage';

const profilePage = new ProfilePage();

// Given steps
Given('está en la página de perfil', () => {
    profilePage.visit();
    profilePage.verifyPageDisplayed();
});

// Then steps - Verification
Then('debe ver la página de perfil', () => {
    profilePage.verifyPageDisplayed();
});

Then('debe ver el nombre del usuario', () => {
    profilePage.verifyUserNameDisplayed();
});

Then('debe ver el email del usuario', () => {
    profilePage.verifyUserEmailDisplayed();
});

Then('debe ver el rol del usuario', () => {
    profilePage.verifyUserRoleDisplayed();
});

Then('debe ver el estado de la cuenta', () => {
    profilePage.verifyAccountStatus();
});

Then('debe ver la fecha de último acceso', () => {
    profilePage.verifyLastAccess();
});

Then('debe ver la fecha de registro', () => {
    profilePage.verifyRegistrationDate();
});

Then('debe ver un botón de {string}', (buttonText: string) => {
    cy.contains('button', buttonText).should('be.visible');
});

// When steps - Actions
When('hace clic en el botón {string} de información personal', (buttonText: string) => {
    if (buttonText === 'Editar') {
        profilePage.clickEditButton();
    } else {
        cy.contains('button', buttonText).click();
    }
});

Then('debe ver el formulario de edición', () => {
    profilePage.verifyEditFormDisplayed();
});

Then('debe ver el campo de nombre editable', () => {
    profilePage.verifyNameFieldEditable();
});

Then('debe ver el campo de email editable', () => {
    profilePage.verifyEmailFieldEditable();
});

Then('debe ver un botón {string}', (buttonText: string) => {
    cy.contains('button', buttonText).should('be.visible');
});

Then('debe ver el botón {string}', (buttonText: string) => {
    if (buttonText === 'Cambiar Contraseña') {
        profilePage.verifyChangePasswordButton();
    } else {
        cy.contains('button', buttonText).should('be.visible');
    }
});

Then('debe ver el mensaje sobre mantener la cuenta segura', () => {
    profilePage.verifySecurityMessage();
});
Then('no debe ver el formulario de edición', () => {
    profilePage.verifyEditFormNotDisplayed();
});

Then('debe ver la información del perfil en modo lectura', () => {
    profilePage.verifyReadMode();
});

Then('debe ver la sección {string}', (sectionName: string) => {
    if (sectionName === 'Seguridad') {
        profilePage.verifySecuritySection();
    } else {
        cy.contains(sectionName).should('be.visible');
    }
});

Then('debe ver un botón de {string} en la sección de seguridad', (buttonText: string) => {
    profilePage.verifyChangePasswordButton();
});

Then('debe ver un mensaje sobre la seguridad de la cuenta', () => {
    profilePage.verifySecurityMessage();
});
