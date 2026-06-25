import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { MetricsPage } from '../../../support/pages/pulseops/MetricsPage';
import { makeMetric, type MetricInput } from '../../../support/factories';

const metrics = new MetricsPage();

let createdLabel = '';
let createdKey = '';

// Background
Given('está en la página de métricas', () => {
    metrics.visit();
});

// When
When('crea una métrica con datos de factory', () => {
    const data: MetricInput = makeMetric();
    createdLabel = data.label;
    createdKey = data.key;
    metrics.create(data);
});

When('edita esa métrica con una nueva unidad', () => {
    metrics.reloadAndSearch(createdLabel).editByText(createdLabel, { unit: 'hours' });
});

When('elimina esa métrica', () => {
    metrics.reloadAndSearch(createdLabel).deleteByText(createdLabel);
});

When('intenta crear una métrica sin clave', () => {
    // label válido pero key vacía → validación del form debe bloquear.
    metrics.openCreate().fillForm({ label: 'Sin Clave', unit: 'count' }).save();
});

// Then
Then('debe ver la métrica {string} en la lista', (label: string) => {
    metrics.search(label).shouldShowInList(label);
});

Then('la nueva métrica debe aparecer en la lista', () => {
    metrics.reloadAndSearch(createdLabel).shouldShowInList(createdKey);
});

Then('la métrica no debe aparecer en la lista', () => {
    metrics.reloadAndSearch(createdLabel).shouldNotShowInList(createdLabel);
});

Then('debe ver un error de validación en el formulario de métrica', () => {
    metrics.shouldShowFormError();
});
