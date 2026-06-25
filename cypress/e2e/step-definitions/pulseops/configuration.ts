import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ConfigurationPage } from '../../../support/pages/pulseops/ConfigurationPage';

const configuration = new ConfigurationPage();

// Background
Given('está en la página de configuración', () => {
    configuration.visit();
});

// Then (vista)
Then('debe ver el resumen de {string}', (condition: string) => {
    configuration.shouldShowSummary(condition);
});

// When
When('edita el umbral de AFLUENCIA a {int} y guarda', (value: number) => {
    configuration.editAfluenciaThresholdAndSave(value);
});

// Then
Then('el resumen de AFLUENCIA debe mostrar {int}', (value: number) => {
    configuration.shouldShowAfluenciaThreshold(value);
});
