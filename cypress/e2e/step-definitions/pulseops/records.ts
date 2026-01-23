import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../../support/pages/pulseops/LoginPage';
import { RecordsPage } from '../../../support/pages/pulseops/RecordsPage';

const loginPage = new LoginPage();
const recordsPage = new RecordsPage();

Given('está en la página de registros', () => {
    recordsPage.visit();
    recordsPage.verifyPageDisplayed();
});

Then('debe ver la tabla de registros', () => {
    recordsPage.verifyRecordsTableExists();
});

When('hace clic en el botón {string}', (buttonText: string) => {
    if (buttonText.includes('Agregar') || buttonText.includes('Guardar')) {
        if (buttonText.includes('Agregar')) {
            recordsPage.clickAddButton();
        } else {
            recordsPage.clickSave();
        }
    }
});

When('completa el formulario de registro con:', (dataTable) => {
    const data: Record<string, string> = {};
    dataTable.hashes().forEach((row: { campo: string; valor: string }) => {
        data[row.campo] = row.valor;
    });
    recordsPage.fillRecordForm(data);
});

Then('el registro debe aparecer en la lista', () => {
    recordsPage.verifyRecordInList();
});

When('selecciona el recurso {string} en el filtro', (resourceName: string) => {
    recordsPage.filterByResource(resourceName);
});

Then('debe mostrar solo registros del recurso {string}', (resourceName: string) => {
    recordsPage.verifyFilteredByResource(resourceName);
});

When('selecciona la métrica {string} en el filtro', (metricName: string) => {
    recordsPage.filterByMetric(metricName);
});

Then('debe mostrar solo registros de la métrica {string}', (metricName: string) => {
    recordsPage.verifyFilteredByMetric(metricName);
});

When('hace clic en ver detalles del primer registro', () => {
    recordsPage.clickDetailsFirstRecord();
});

Then('debe mostrar todos los campos del registro', () => {
    recordsPage.verifyRecordDetails();
});

Then('debe mostrar el timestamp completo', () => {
    cy.contains(/\d{4}-\d{2}-\d{2}/).should('be.visible');
});
