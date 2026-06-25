import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { DashboardPage } from '../../../support/pages/pulseops/DashboardPage';

const dashboard = new DashboardPage();

// Background
Given('está en el dashboard principal', () => {
    dashboard.visit();
});

// When
When('selecciona el recurso {string}', (name: string) => {
    dashboard.selectResource(name);
    // El dashboard auto-selecciona la primera métrica del recurso → dispara análisis.
});

// Then
Then('debe mostrar el gráfico de serie temporal', () => {
    dashboard.shouldShowChart();
});

Then('debe mostrar la condición operativa', () => {
    dashboard.shouldShowCondition();
});

Then('la condición debe ser {string}', (condition: string) => {
    dashboard.shouldShowConditionEqual(condition);
});
