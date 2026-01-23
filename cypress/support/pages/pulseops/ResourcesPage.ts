/**
 * ResourcesPage - Page Object for PulseOps resources management
 */
export class ResourcesPage {
    // Selectors
    private selectors = {
        pageHeading: 'h1:contains("Resources"), h2:contains("Resources")',
        createButton: 'button:contains("New"), button:contains("Create"), button:contains("Add Resource")',
        searchInput: 'input[type="search"], input[placeholder*="Search"], input[placeholder*="Buscar"]',
        resourcesTable: 'table, [role="table"]',
        resourceRow: 'table tbody tr, [role="row"]',
        
        // Form fields
        nameInput: 'input[name="name"], input[id*="name"]',
        typeSelect: 'select[name="type"], select[id*="type"]',
        saveButton: 'button:contains("Save"), button:contains("Create"), button[type="submit"]',
        cancelButton: 'button:contains("Cancel")',
        
        // Actions
        editButton: 'button:contains("Edit"), [aria-label*="Edit"]',
        deleteButton: 'button:contains("Delete"), [aria-label*="Delete"]',
        confirmDelete: 'button:contains("Confirm"), button:contains("Yes"), button:contains("Delete")',
        
        // Messages
        successMessage: '[role="alert"], .success, .toast',
        errorMessage: '[role="alert"], .error',
    };

    /**
     * Visit resources page
     */
    visit(): void {
        cy.visit('/resources');
    }

    /**
     * Verify resources page is displayed
     */
    verifyPageDisplayed(): void {
        cy.url().should('include', '/resources');
        // At least one of these should be visible
        cy.get('body').then(($body) => {
            if ($body.find(this.selectors.pageHeading).length > 0) {
                cy.get(this.selectors.pageHeading).should('be.visible');
            } else {
                cy.get(this.selectors.resourcesTable).should('be.visible');
            }
        });
    }

    /**
     * Verify table or list is displayed
     */
    verifyTableOrListDisplayed(): void {
        cy.get(this.selectors.resourcesTable).should('be.visible');
    }

    /**
     * Verify at least one resource exists
     */
    verifyResourcesExist(): void {
        cy.get(this.selectors.resourceRow).should('have.length.at.least', 1);
    }

    /**
     * Click create/new button
     */
    clickCreateButton(): void {
        cy.get(this.selectors.createButton).first().click();
    }

    /**
     * Fill resource form
     */
    fillResourceForm(name: string, type: string): void {
        cy.get(this.selectors.nameInput).clear().type(name);
        cy.get(this.selectors.typeSelect).select(type);
    }

    /**
     * Click save button
     */
    clickSaveButton(): void {
        cy.get(this.selectors.saveButton).first().click();
    }

    /**
     * Create a new resource
     */
    createResource(name: string, type: string): void {
        this.clickCreateButton();
        this.fillResourceForm(name, type);
        this.clickSaveButton();
    }

    /**
     * Search for resource
     */
    searchResource(searchTerm: string): void {
        cy.get(this.selectors.searchInput).clear().type(searchTerm);
    }

    /**
     * Click edit on first resource
     */
    clickEditFirstResource(): void {
        cy.get(this.selectors.resourceRow).first().find(this.selectors.editButton).click();
    }

    /**
     * Click delete on last resource
     */
    clickDeleteLastResource(): void {
        cy.get(this.selectors.resourceRow).last().find(this.selectors.deleteButton).click();
    }

    /**
     * Confirm deletion
     */
    confirmDeletion(): void {
        cy.get(this.selectors.confirmDelete).click();
    }

    /**
     * Verify success message
     */
    verifySuccessMessage(): void {
        cy.get(this.selectors.successMessage).should('be.visible');
    }

    /**
     * Verify resource in list
     */
    verifyResourceInList(resourceName: string): void {
        cy.contains(this.selectors.resourceRow, resourceName).should('be.visible');
    }

    /**
     * Verify resource not in list
     */
    verifyResourceNotInList(resourceName: string): void {
        cy.contains(this.selectors.resourceRow, resourceName).should('not.exist');
    }
}
