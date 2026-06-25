import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { UsersPage } from '../../../support/pages/pulseops/UsersPage';
import { makeUser, type UserInput } from '../../../support/factories';

const users = new UsersPage();

let createdEmail = '';
let createdName = '';

// Background
Given('está en la página de usuarios', () => {
    users.visit();
});

// When
When('crea un usuario con datos de factory', () => {
    const data: UserInput = makeUser();
    createdEmail = data.email;
    createdName = data.name;
    users.create(data);
});

When('elimina ese usuario', () => {
    users.search(createdEmail).deleteByText(createdEmail);
});

When('intenta crear un usuario sin email', () => {
    // name/password válidos pero email vacío → validación nativa bloquea el submit.
    users.openCreate().fillForm({ name: 'Sin Email', password: 'Test1234!' }).save();
});

// Then
Then('debe ver el usuario {string} en la lista', (email: string) => {
    users.shouldShowInList(email);
});

Then('el nuevo usuario debe aparecer en la lista', () => {
    users.search(createdEmail).shouldShowInList(createdName);
});

Then('el usuario no debe aparecer en la lista', () => {
    users.search(createdEmail).shouldNotShowInList(createdEmail);
});

Then('el formulario de usuario sigue abierto', () => {
    users.shouldKeepFormOpen();
});
