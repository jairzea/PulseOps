import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { RecordsPage } from '../../../support/pages/pulseops/RecordsPage';
import { makeRecord } from '../../../support/factories';

const records = new RecordsPage();

// Background
Given('está en la página de registros', () => {
    records.visit();
});

// When
When('filtra por el primer recurso y su métrica', () => {
    records.filterFirstResourceAndMetric();
});

When('crea un registro con datos de factory', () => {
    const data = makeRecord();
    records.create(data.value);
});

When('elimina el primer registro', () => {
    records.deleteFirstVisible();
});

When('intenta crear un registro sin valores', () => {
    // Abre el modal y guarda sin recurso/valores → el submit queda bloqueado.
    records.openCreate();
});

// Then
Then('debe ver la tabla de registros', () => {
    records.shouldShowList();
});

Then('el formulario de registro sigue abierto', () => {
    records.shouldKeepFormOpen();
});
