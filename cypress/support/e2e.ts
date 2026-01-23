/**
 * 🎬 Archivo de soporte principal de Cypress
 * Se carga antes de cada archivo de especificaciones
 */

// Importar comandos personalizados
import './commands';

// Importar utilidades
import './utils/testTags';

// Configuración global de Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornar false previene que Cypress falle el test por excepciones no capturadas
  // Solo en casos específicos donde la aplicación maneja sus propios errores
  return false;
});

// Hook global before
before(() => {
  cy.log('🚀 Iniciando suite de pruebas E2E');
});

// Hook global after
after(() => {
  cy.log('✅ Suite de pruebas E2E completada');
});
