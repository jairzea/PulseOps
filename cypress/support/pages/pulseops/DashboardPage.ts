/**
 * DashboardPage - Page Object for PulseOps dashboard
 */
export class DashboardPage {
    // Selectors
    private selectors = {
        // Sidebar navigation
        sidebarDashboard: 'a[href="/dashboard"], nav a:has-text("Dashboard")',
        sidebarResources: 'a[href="/resources"], nav a:has-text("Resources")',
        sidebarMetrics: 'a[href="/metrics"], nav a:has-text("Metrics")',
        sidebarRecords: 'a[href="/records"], nav a:has-text("Records")',
        sidebarCharts: 'a[href="/charts"], nav a:has-text("Charts")',
        
        // Dashboard elements
        pageHeading: 'h1, h2',
        resourceSelector: 'select, [role="combobox"]',
        metricSelector: 'select, [role="combobox"]',
        chart: '[data-testid*="chart"], .chart, canvas, svg',
        
        // User menu
        userMenu: '[data-testid="user-menu"], button:contains("AD")',
        logoutOption: 'text=Logout, text=Sign out',
    };

    /**
     * Visit dashboard
     */
    visit(): void {
        cy.visit('/dashboard');
    }

    /**
     * Navigate to Resources
     */
    navigateToResources(): void {
        cy.get(this.selectors.sidebarResources).first().click();
        cy.url().should('include', '/resources');
    }

    /**
     * Navigate to Metrics
     */
    navigateToMetrics(): void {
        cy.get(this.selectors.sidebarMetrics).first().click();
        cy.url().should('include', '/metrics');
    }

    /**
     * Navigate to Records
     */
    navigateToRecords(): void {
        cy.get(this.selectors.sidebarRecords).first().click();
        cy.url().should('include', '/records');
    }

    /**
     * Navigate to Charts
     */
    navigateToCharts(): void {
        cy.get(this.selectors.sidebarCharts).first().click();
        cy.url().should('include', '/charts');
    }

    /**
     * Click on sidebar menu item
     */
    clickSidebarItem(itemName: string): void {
        cy.contains('nav a', itemName, { matchCase: false }).click();
    }

    /**
     * Logout
     */
    logout(): void {
        cy.get(this.selectors.userMenu).click();
        cy.get(this.selectors.logoutOption).click();
    }

    /**
     * Verify dashboard is displayed
     */
    verifyDashboardDisplayed(): void {
        cy.url().should('include', '/dashboard');
        cy.get(this.selectors.pageHeading).should('be.visible');
    }

    /**
     * Verify on specific page
     */
    verifyOnPage(pageName: string): void {
        const pageUrl = `/${pageName.toLowerCase()}`;
        cy.url().should('include', pageUrl);
    }
}
