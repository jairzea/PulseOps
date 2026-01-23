/**
 * ConfigurationPage - Page Object for PulseOps configuration page
 */
export class ConfigurationPage {
    // Selectors
    private selectors = {
        pageTitle: 'h1, h2',
        configCard: '[class*="card"], [class*="bg-white"]',
        editButton: 'button:contains("Editar"), button:has-text("Editar")',
        conditionSection: '[class*="condition"], .condition',
        versionInfo: ':contains("Versión")',
        updateDate: ':contains("Actualizada")',
        activeStatus: ':contains("Activa")',
        // Condiciones específicas
        afluenciaSection: ':contains("AFLUENCIA")',
        normalSection: ':contains("NORMAL")',
        emergenciaSection: ':contains("EMERGENCIA")',
        peligroSection: ':contains("PELIGRO")',
        poderSection: ':contains("PODER")',
    };

    /**
     * Visit configuration page
     */
    visit(): void {
        cy.visit('/configuration');
    }

    /**
     * Verify configuration page is displayed
     */
    verifyPageDisplayed(): void {
        cy.url().should('include', '/configuration');
        cy.contains('Configuración').should('be.visible');
    }

    /**
     * Verify threshold configuration is visible
     */
    verifyThresholdsVisible(): void {
        cy.contains('Configuración de Umbrales').should('be.visible');
    }

    /**
     * Verify default configuration is shown
     */
    verifyDefaultConfiguration(): void {
        cy.contains('Configuración Predeterminada').should('be.visible');
    }

    /**
     * Verify condition thresholds
     */
    verifyConditionThresholds(conditionName: string): void {
        cy.contains(conditionName.toUpperCase()).should('be.visible');
    }

    /**
     * Verify version information
     */
    verifyVersionInfo(): void {
        cy.contains('Versión').should('be.visible');
    }

    /**
     * Verify update date
     */
    verifyUpdateDate(): void {
        cy.contains('Actualizada').should('be.visible');
    }

    /**
     * Verify active status
     */
    verifyActiveStatus(): void {
        cy.contains('Activa').should('be.visible');
    }

    /**
     * Click edit configuration button
     */
    clickEditConfiguration(): void {
        cy.contains('button', 'Editar Configuración').click();
    }

    /**
     * Verify edit form is displayed
     */
    verifyEditFormDisplayed(): void {
        // After clicking edit, some form should appear
        cy.get('form, [role="dialog"], .modal').should('be.visible');
    }

    /**
     * Verify edit button exists
     */
    verifyEditButtonExists(): void {
        cy.contains('button', 'Editar Configuración').should('exist');
    }

    /**
     * Verify edit button is visible
     */
    verifyEditButtonVisible(): void {
        cy.contains('button', 'Editar Configuración').should('be.visible');
    }
}
