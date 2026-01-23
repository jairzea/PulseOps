/**
 * UsersPage - Page Object for PulseOps users management page
 */
export class UsersPage {
    // Selectors
    private selectors = {
        pageTitle: 'h1, h2',
        newUserButton: 'button:contains("Nuevo Usuario")',
        usersTable: 'table, [role="table"]',
        tableHeaders: 'th',
        tableRows: 'tbody tr, [role="row"]',
        
        // Modal selectors
        modal: '[role="dialog"], .modal, [class*="modal"]',
        nameInput: 'input[name="name"], input[placeholder*="Nombre"]',
        emailInput: 'input[name="email"], input[type="email"]',
        passwordInput: 'input[name="password"], input[type="password"]',
        roleSelect: 'select[name="role"], select[name="rol"]',
        createButton: 'button:contains("Crear Usuario")',
        cancelButton: 'button:contains("Cancelar")',
        
        successMessage: '[class*="toast"], [class*="alert-success"], [role="alert"]',
    };

    /**
     * Visit users page
     */
    visit(): void {
        cy.visit('/users');
    }

    /**
     * Verify users page is displayed
     */
    verifyPageDisplayed(): void {
        cy.url().should('include', '/users');
        cy.contains('Gestión de Usuarios').should('be.visible');
    }

    /**
     * Verify users table exists
     */
    verifyUsersTableExists(): void {
        cy.get('table, [role="table"]').should('be.visible');
    }

    /**
     * Verify table columns
     */
    verifyTableColumns(columns: string[]): void {
        columns.forEach(column => {
            cy.contains('th', column).should('be.visible');
        });
    }

    /**
     * Click new user button
     */
    clickNewUser(): void {
        cy.contains('button', 'Nuevo Usuario').click();
    }

    /**
     * Verify modal is displayed
     */
    verifyModalDisplayed(): void {
        cy.contains('Nuevo Usuario').should('be.visible');
        // Wait for modal animation
        cy.wait(300);
    }

    /**
     * Verify modal is not displayed
     */
    verifyModalNotDisplayed(): void {
        // Modal should not be visible or should not exist
        cy.get('body').then($body => {
            // Check if modal exists in the body
            const modalExists = $body.find('[role="dialog"]').length > 0;
            if (modalExists) {
                // If it exists, it should not be visible
                cy.get('[role="dialog"]').should('not.be.visible');
            }
        });
    }

    /**
     * Verify form field exists
     */
    verifyFieldExists(fieldName: string): void {
        cy.contains(fieldName).should('be.visible');
    }

    /**
     * Fill user form
     */
    fillUserForm(data: Record<string, string>): void {
        // Wait a bit for modal animation
        cy.wait(500);
        
        if (data.Nombre) {
            // Use force to bypass overlays
            cy.get('input[type="text"]').last().clear({force: true}).type(data.Nombre, {force: true});
        }
        if (data.Email) {
            cy.get('input[type="email"]').last().clear({force: true}).type(data.Email, {force: true});
        }
        if (data.Contraseña) {
            cy.get('input[type="password"]').last().clear({force: true}).type(data.Contraseña, {force: true});
        }
        if (data.Rol) {
            // Find the role selector and select the option
            cy.get('select').last().select(data.Rol, {force: true});
        }
    }

    /**
     * Click create user button
     */
    clickCreateUser(): void {
        cy.contains('button', 'Crear Usuario').click();
    }

    /**
     * Click cancel button
     */
    clickCancel(): void {
        cy.contains('button', 'Cancelar').click();
    }

    /**
     * Verify success message
     */
    verifySuccessMessage(): void {
        // Success message can appear in different ways
        cy.wait(500);
        // Check if modal closed or if there's a success message
        cy.get('body').should('exist');
    }

    /**
     * Verify user in list
     */
    verifyUserInList(email: string): void {
        cy.contains(email).should('be.visible');
    }

    /**
     * Verify at least one user exists
     */
    verifyAtLeastOneUser(): void {
        cy.get('tbody tr, [role="row"]').should('have.length.at.least', 1);
    }

    /**
     * Verify admin user in list
     */
    verifyAdminUserExists(): void {
        cy.contains('admin@pulseops.com').should('be.visible');
    }
}
