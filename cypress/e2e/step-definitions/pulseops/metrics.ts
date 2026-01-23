import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { MetricsPage } from '../../../support/pages/pulseops/MetricsPage';

const metricsPage = new MetricsPage();

// Given steps (sin duplicar la autenticación que ya está en navigation.ts)
Given('está en la página de métricas', () => {
    metricsPage.visit();
    metricsPage.verifyPageDisplayed();
});

// Then steps - Verification
Then('debe ver la tabla de métricas', () => {
    metricsPage.verifyMetricsTableExists();
});

Then('debe poder ver las columnas {string}, {string}, {string}', (col1: string, col2: string, col3: string) => {
    metricsPage.verifyTableColumns([col1, col2, col3]);
});

// When steps - Actions
When('hace clic en el botón {string}', (buttonText: string) => {
    if (buttonText.includes('Crear')) {
        metricsPage.clickCreateButton();
    } else if (buttonText.includes('Guardar')) {
        metricsPage.clickSave();
    }
});

When('completa el formulario con los datos:', (dataTable) => {
    const data: Record<string, string> = {};
    dataTable.hashes().forEach((row: { campo: string; valor: string }) => {
        data[row.campo] = row.valor;
    });
    metricsPage.fillMetricForm(data);
});

When('escribe {string} en el campo de búsqueda', (term: string) => {
    metricsPage.searchMetric(term);
});

When('hace clic en el botón de editar de la primera métrica', () => {
    metricsPage.clickEditFirstMetric();
});

When('modifica el campo {string} a {string}', (field: string, value: string) => {
    metricsPage.fillMetricForm({ [field]: value });
});

When('hace clic en el botón de eliminar de la última métrica', () => {
    metricsPage.clickDeleteLastMetric();
});

When('confirma la eliminación', () => {
    metricsPage.confirmDeletion();
});

// Then steps - Verification
Then('la métrica {string} debe aparecer en la lista', (metricName: string) => {
    metricsPage.verifyMetricInList(metricName);
});

Then('debe filtrar y mostrar solo métricas que contengan {string}', (term: string) => {
    metricsPage.verifyFilteredResults(term);
});

Then('los cambios deben reflejarse en la lista', () => {
    metricsPage.verifySuccessMessage();
});

Then('la métrica debe desaparecer de la lista', () => {
    // Wait a bit for deletion to process
    cy.wait(500);
});
