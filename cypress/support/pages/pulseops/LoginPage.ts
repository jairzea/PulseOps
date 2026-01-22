/**
 * LoginPage - Page Object for PulseOps login page
 */
export class LoginPage {
    // Selectors
    private selectors = {
        emailInput: 'input[type="email"]',
        passwordInput: 'input[type="password"]',
        rememberCheckbox: 'input[type="checkbox"]',
        loginButton: 'button[type="submit"]',
        errorMessage: '[role="alert"], .error, .text-red-500',
    };

    /**
     * Visit login page
     */
    visit(): void {
        cy.visit('/login');
    }

    /**
     * Visit root (should redirect to login if not authenticated)
     */
    visitRoot(): void {
        cy.visit('/');
    }

    /**
     * Fill email field
     */
    fillEmail(email: string): void {
        cy.get(this.selectors.emailInput).clear().type(email);
    }

    /**
     * Fill password field
     */
    fillPassword(password: string): void {
        cy.get(this.selectors.passwordInput).clear().type(password);
    }

    /**
     * Check remember me checkbox
     */
    checkRememberMe(): void {
        cy.get(this.selectors.rememberCheckbox).check();
    }

    /**
     * Click login button
     */
    clickLogin(): void {
        cy.get(this.selectors.loginButton).click();
    }

    /**
     * Perform complete login
     */
    login(email: string, password: string, remember = false): void {
        this.fillEmail(email);
        this.fillPassword(password);
        if (remember) {
            this.checkRememberMe();
        }
        this.clickLogin();
    }

    /**
     * Login as admin with default credentials
     */
    loginAsAdmin(): void {
        this.login('admin@pulseops.com', 'Admin1234!');
    }

    /**
     * Verify login page is displayed
     */
    verifyLoginPageDisplayed(): void {
        cy.contains('Welcome to PulseOps').should('be.visible');
        cy.get(this.selectors.emailInput).should('be.visible');
        cy.get(this.selectors.passwordInput).should('be.visible');
        cy.get(this.selectors.loginButton).should('be.visible');
    }

    /**
     * Verify error message
     */
    verifyErrorMessage(): void {
        cy.get(this.selectors.errorMessage).should('be.visible');
    }

    /**
     * Verify current page is login
     */
    verifyCurrentPageIsLogin(): void {
        cy.url().should('include', '/login');
    }

    /**
     * Verify redirected to dashboard
     */
    verifyRedirectedToDashboard(): void {
        cy.url().should('include', '/dashboard');
    }
}
