import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ResourcesPage } from '../../../support/pages/pulseops/ResourcesPage';
import { makeResource, type ResourceInput } from '../../../support/factories';

const resources = new ResourcesPage();

// Nombre del recurso creado en el escenario actual (factory → único por corrida).
let createdName = '';
let updatedName = '';

// Background
Given('está en la página de recursos', () => {
    resources.visit();
});

// When
When('crea un recurso con datos de factory', () => {
    const data: ResourceInput = makeResource();
    createdName = data.name;
    resources.create(data);
});

When('edita ese recurso con un nuevo nombre', () => {
    updatedName = makeResource().name;
    resources.search(createdName).editFirstVisible({ name: updatedName });
});

When('elimina ese recurso', () => {
    resources.search(createdName).deleteFirstVisible();
});

When('intenta crear un recurso sin nombre', () => {
    // roleType válido pero nombre vacío → la validación del form debe bloquear.
    resources.openCreate().fillForm({ roleType: 'DEV' }).save();
});

// Then
Then('debe ver el recurso {string} en la lista', (name: string) => {
    resources.searchAndShouldShow(name);
});

Then('el nuevo recurso debe aparecer en la lista', () => {
    resources.search(createdName).shouldShowInList(createdName);
});

Then('el recurso debe mostrar el nuevo nombre', () => {
    resources.search(updatedName).shouldShowInList(updatedName);
});

Then('el recurso no debe aparecer en la lista', () => {
    resources.search(createdName).shouldNotShowInList(createdName);
});

Then('debe ver un error de validación en el formulario de recurso', () => {
    resources.shouldShowFormError();
});
