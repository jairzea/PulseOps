/**
 * RecordsPage - Page Object for PulseOps records management
 */
export class RecordsPage {
    private selectors = {
        pageHeading: 'h1, h2',
        addButton: 'button:contains("Agregar"), button:contains("Crear"), button:contains("Nuevo")',
        searchInput: 'input[type="search"], input[placeholder*="buscar" i]',
        
        // Table
        recordsTable: 'table, [role="table"]',
        tableRows: 'tbody tr, [role="row"]',
        tableHeaders: 'thead th, [role="columnheader"]',
        
        // Filters
        resourceFilter: 'select[name="resource"], #resourceFilter',
        metricFilter: 'select[name="metric"], #metricFilter',
        
        // Form
        resourceSelect: 'select[name="resource"], #resource',
        metricSelect: 'select[name="metric"], #metric',
        valueInput: 'input[name="value"], #value',
        saveButton: 'button[type="submit"], button:contains("Guardar")',
        
        // Actions
        detailsButton: 'button:contains("Detalle"), button:contains("Ver"), [aria-label*="ver" i]',
        
        // Messages
        successMessage: '[role="alert"], .alert-success, .success',
    };

    visit(): void {
        cy.visit('/records');
    }

    verifyPageDisplayed(): void {
        cy.url().should('include', '/records');
        cy.get(this.selectors.pageHeading).should('be.visible');
    }

    verifyRecordsTableExists(): void {
        cy.get(this.selectors.recordsTable).should('be.visible');
    }

    verifyTableColumns(columns: string[]): void {
        columns.forEach(column => {
            cy.get(this.selectors.tableHeaders).should('contain', column);
        });
    }

    clickAddButton(): void {
        cy.get(this.selectors.addButton).first().click();
    }

    fillRecordForm(data: Record<string, string>): void {
        if (data.resource) {
            cy.get(this.selectors.resourceSelect).select(data.resource);
        }
        if (data.metric) {
            cy.get(this.selectors.metricSelect).select(data.metric);
        }
        if (data.value) {
            cy.get(this.selectors.valueInput).clear().type(data.value);
        }
    }

    clickSave(): void {
        cy.get(this.selectors.saveButton).click();
    }

    verifySuccessMessage(): void {
        cy.get(this.selectors.successMessage, { timeout: 10000 }).should('be.visible');
    }

    verifyRecordInList(): void {
        cy.get(this.selectors.tableRows).should('have.length.at.least', 1);
    }

    filterByResource(resourceName: string): void {
        cy.get(this.selectors.resourceFilter).select(resourceName);
    }

    filterByMetric(metricName: string): void {
        cy.get(this.selectors.metricFilter).select(metricName);
    }

    verifyFilteredByResource(resourceName: string): void {
        cy.get(this.selectors.tableRows).each(($row) => {
            cy.wrap($row).should('contain', resourceName);
        });
    }

    verifyFilteredByMetric(metricName: string): void {
        cy.get(this.selectors.tableRows).each(($row) => {
            cy.wrap($row).should('contain', metricName);
        });
    }

    clickDetailsFirstRecord(): void {
        cy.get(this.selectors.tableRows).first().find(this.selectors.detailsButton).click();
    }

    verifyRecordDetails(): void {
        cy.contains('Timestamp').should('be.visible');
    }
}
