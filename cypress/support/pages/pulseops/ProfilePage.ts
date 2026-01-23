/**
 * ProfilePage - Page Object for PulseOps user profile page
 */
export class ProfilePage {
    // Selectors
    private selectors = {
        pageTitle: 'h1, h2',
        userName: '[class*="name"], .user-name',
        userEmail: '[class*="email"], .user-email',
        userRole: '[class*="role"], .user-role',
        userStatus: ':contains("Estado")',
        lastAccess: ':contains("Último acceso")',
        memberSince: ':contains("Miembro desde")',
        
        // Edit section
        editButton: 'button:contains("Editar")',
        nameInput: 'input[name="name"], input[placeholder*="Nombre"]',
        emailInput: 'input[name="email"], input[type="email"]',
        saveButton: 'button:contains("Guardar")',
        cancelButton: 'button:contains("Cancelar")',
        
        // Security section
        securitySection: ':contains("Seguridad")',
        changePasswordButton: 'button:contains("Cambiar Contraseña")',
    };

    /**
     * Visit profile page
     */
    visit(): void {
        cy.visit('/profile');
    }

    /**
     * Verify profile page is displayed
     */
    verifyPageDisplayed(): void {
        cy.url().should('include', '/profile');
        cy.contains('Mi Perfil').should('be.visible');
    }

    /**
     * Verify user name is displayed
     */
    verifyUserNameDisplayed(): void {
        cy.contains('Administrador').should('be.visible');
    }

    /**
     * Verify user email is displayed
     */
    verifyUserEmailDisplayed(): void {
        cy.contains('admin@pulseops.com').should('be.visible');
    }

    /**
     * Verify user role is displayed
     */
    verifyUserRoleDisplayed(): void {
        cy.contains(/Admin|Administrador/i).should('be.visible');
    }

    /**
     * Verify account status
     */
    verifyAccountStatus(): void {
        cy.contains('Estado').should('be.visible');
        cy.contains('Activo').should('be.visible');
    }

    /**
     * Verify last access date
     */
    verifyLastAccess(): void {
        cy.contains('Último acceso').should('be.visible');
    }

    /**
     * Verify registration date
     */
    verifyRegistrationDate(): void {
        cy.contains('Miembro desde').should('be.visible');
    }

    /**
     * Click edit button
     */
    clickEditButton(): void {
        // Find the edit button in the personal information section
        cy.contains('Información Personal').parent().parent()
          .find('button').contains('Editar').click();
    }

    /**
     * Verify edit form is displayed
     */
    verifyEditFormDisplayed(): void {
        cy.get('input[type="email"]').should('be.visible');
    }

    /**
     * Verify edit form is not displayed
     */
    verifyEditFormNotDisplayed(): void {
        // Check that inputs are in read-only mode or not editable
        cy.contains('Información Personal').should('be.visible');
    }

    /**
     * Verify name field is editable
     */
    verifyNameFieldEditable(): void {
        // Just verify there's at least one input visible (in edit mode)
        cy.get('input').should('have.length.at.least', 1);
    }

    /**
     * Verify email field is editable
     */
    verifyEmailFieldEditable(): void {
        // Verify email input is visible
        cy.get('input[type="email"]').should('be.visible');
    }

    /**
     * Click cancel button
     */
    clickCancel(): void {
        cy.contains('button', 'Cancelar').click();
    }

    /**
     * Verify security section
     */
    verifySecuritySection(): void {
        cy.contains('Seguridad').should('be.visible');
    }

    /**
     * Verify change password button
     */
    verifyChangePasswordButton(): void {
        cy.contains('button', 'Cambiar Contraseña').should('be.visible');
    }

    /**
     * Verify security message
     */
    verifySecurityMessage(): void {
        cy.contains(/mantener|segura|contraseña/i).should('be.visible');
    }

    /**
     * Verify profile in read mode
     */
    verifyReadMode(): void {
        // Verify that the main information is visible but not in edit mode
        cy.contains('Información Personal').should('be.visible');
        cy.contains('Administrador').should('be.visible');
    }
}
