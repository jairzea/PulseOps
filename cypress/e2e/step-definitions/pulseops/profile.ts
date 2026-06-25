import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ProfilePage } from '../../../support/pages/pulseops/ProfilePage';

const profile = new ProfilePage();

// Background
Given('está en la página de perfil', () => {
    profile.visit();
});

// Then (vista)
Then('debe ver el email {string} en el perfil', (email: string) => {
    profile.shouldShowEmail(email);
});

// When
When('edita su nombre a {string}', (name: string) => {
    profile.editName(name);
});

// Then
Then('el perfil debe mostrar el nombre {string}', (name: string) => {
    profile.shouldShowName(name);
});
