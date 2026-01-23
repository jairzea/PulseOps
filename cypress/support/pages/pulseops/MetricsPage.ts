/**
 * MetricsPage - Page Object for PulseOps metrics management
 */
export class MetricsPage {
    // Selectors
    private selectors = {
        // Page elements
        pageHeading: 'h1, h2',
        createButton: 'button:contains("Crear"), button:contains("Nueva"), button:contains("Agregar")',
        searchInput: 'input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]',
        
        // Table
        metricsTable: 'table, [role="table"]',
        tableRows: 'tbody tr, [role="row"]',
        tableHeaders: 'thead th, [role="columnheader"]',
        
        // Form fields
        nameInput: 'input[name="name"], #name, [data-testid="name-input"]',
        unitInput: 'input[name="unit"], #unit, [data-testid="unit-input"]',
        typeSelect: 'select[name="type"], #type, [data-testid="type-select"]',
        descriptionInput: 'textarea[name="description"], #description, [data-testid="description-input"]',
        
        // Buttons
        saveButton: 'button[type="submit"], button:contains("Guardar"), button:contains("Save")',
        editButton: 'button:contains("Editar"), button:contains("Edit"), [aria-label*="edit" i]',
        deleteButton: 'button:contains("Eliminar"), button:contains("Delete"), [aria-label*="delete" i]',
        confirmButton: 'button:contains("Confirmar"), button:contains("Sí"), button:contains("Yes")',
        
        // Messages
        successMessage: '[role="alert"], .alert-success, .success, .text-green-500',
        errorMessage: '[role="alert"], .alert-error, .error, .text-red-500',
    };

    /**
     * Visit metrics page
     */
    visit(): void {
        cy.visit('/metrics');
    }

    /**
     * Verify metrics page is displayed
     */
    verifyPageDisplayed(): void {
        cy.url().should('include', '/metrics');
        cy.get(this.selectors.pageHeading).should('be.visible');
    }

    /**
     * Verify metrics table is visible
     */
    verifyMetricsTableExists(): void {
        cy.get(this.selectors.metricsTable).should('be.visible');
    }

    /**
     * Verify table columns
     */
    verifyTableColumns(columns: string[]): void {
        columns.forEach(column => {
            cy.get(this.selectors.tableHeaders).should('contain', column);
        });
    }

    /**
     * Click create button
     */
    clickCreateButton(): void {
        cy.get(this.selectors.createButton).first().click();
    }

    /**
     * Fill metric form
     */
    fillMetricForm(data: Record<string, string>): void {
        if (data.name) {
            cy.get(this.selectors.nameInput).clear().type(data.name);
        }
        if (data.unit) {
            cy.get(this.selectors.unitInput).clear().type(data.unit);
        }
        if (data.type) {
            cy.get(this.selectors.typeSelect).select(data.type);
        }
        if (data.description) {
            cy.get(this.selectors.descriptionInput).clear().type(data.description);
        }
    }

    /**
     * Click save button
     */
    clickSave(): void {
        cy.get(this.selectors.saveButton).click();
    }

    /**
     * Search metric
     */
    searchMetric(term: string): void {
        cy.get(this.selectors.searchInput).clear().type(term);
    }

    /**
     * Verify metric appears in list
     */
    verifyMetricInList(metricName: string): void {
        cy.get(this.selectors.metricsTable).should('contain', metricName);
    }

    /**
     * Click edit button of first metric
     */
    clickEditFirstMetric(): void {
        cy.get(this.selectors.tableRows).first().find(this.selectors.editButton).click();
    }

    /**
     * Click delete button of last metric
     */
    clickDeleteLastMetric(): void {
        cy.get(this.selectors.tableRows).last().find(this.selectors.deleteButton).click();
    }

    /**
     * Confirm deletion
     */
    confirmDeletion(): void {
        cy.get(this.selectors.confirmButton).click();
    }

    /**
     * Verify success message
     */
    verifySuccessMessage(): void {
        cy.get(this.selectors.successMessage, { timeout: 10000 }).should('be.visible');
    }

    /**
     * Verify filtered results
     */
    verifyFilteredResults(term: string): void {
        cy.get(this.selectors.tableRows).each(($row) => {
            cy.wrap($row).should('contain.text', term);
        });
    }

    /**
     * Verify metric not in list
     */
    verifyMetricNotInList(metricName: string): void {
        cy.get(this.selectors.metricsTable).should('not.contain', metricName);
    }
}
