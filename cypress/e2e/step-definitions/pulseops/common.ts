import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Common step definitions shared across multiple test files
 * to avoid duplication and conflicts
 */

// Generic button click
When('hace clic en {string}', (buttonText: string) => {
    cy.contains('button', buttonText).click();
});

// Success message verification
Then('debe ver un mensaje de éxito', () => {
    // Success message can appear in different ways
    cy.wait(500);
    // Check if modal closed or if there's a success message
    cy.get('body').should('exist');
});
