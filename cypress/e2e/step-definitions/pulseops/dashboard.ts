import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { DashboardPage } from '../../../support/pages/pulseops/DashboardPage';

const dashboardPage = new DashboardPage();

// Given steps (sin duplicar la autenticación que ya está en navigation.ts)
Given('está en el dashboard principal', () => {
    dashboardPage.visit();
    dashboardPage.verifyDashboardDisplayed();
});

// Scenario 1: Ver selector de recursos y métricas
Then('debe ver el selector de recursos', () => {
    dashboardPage.verifyResourceSelectorVisible();
});

Then('debe ver el selector de métricas', () => {
    dashboardPage.verifyMetricSelectorVisible();
});

// Scenario 2: Seleccionar recurso y métrica para visualizar
When('selecciona el recurso {string}', (resourceName: string) => {
    dashboardPage.selectResource(resourceName);
});

When('selecciona la métrica {string}', (metricName: string) => {
    dashboardPage.selectMetric(metricName);
});

Then('debe mostrar el gráfico de serie temporal', () => {
    dashboardPage.verifyChartDisplayed();
});

Then('el gráfico debe tener datos', () => {
    dashboardPage.verifyChartHasData();
});

// Scenario 3: Ver condición operativa actual
When('visualiza un recurso con métrica configurada', () => {
    // Assume resource and metric already selected
    cy.wait(500); // Wait for data to load
});

Then('debe mostrar la condición operativa actual', () => {
    dashboardPage.verifyOperationalConditionShown();
});

Then('debe mostrar el color del semáforo', () => {
    dashboardPage.verifyTrafficLightShown();
});

// Scenario 4: Ver inclinación y señales
When('visualiza un recurso con histórico', () => {
    // Assume resource with historical data selected
    cy.wait(500);
});

Then('debe mostrar el valor de inclinación', () => {
    dashboardPage.verifyInclinationShown();
});

Then('debe mostrar las señales detectadas', () => {
    dashboardPage.verifySignalsShown();
});

// Scenario 5: Ver playbook o fórmula asociada
When('selecciona una condición con playbook', () => {
    // This might require specific data setup or navigation
    cy.wait(500);
});

Then('debe mostrar el playbook asociado', () => {
    dashboardPage.verifyPlaybookShown();
});

Then('debe poder ver la fórmula de la condición', () => {
    dashboardPage.verifyFormulaShown();
});
