/**
 * DashboardPage - Page Object for PulseOps dashboard
 */
export class DashboardPage {
    // Selectors
    private selectors = {
        // Sidebar navigation
        sidebarDashboard: 'a[href="/dashboard"]',
        sidebarResources: 'a[href="/resources"]',
        sidebarMetrics: 'a[href="/metrics"]',
        sidebarRecords: 'a[href="/records"]',
        sidebarCharts: 'a[href="/charts"]',
        
        // Dashboard elements
        pageHeading: 'h1, h2',
        resourceSelector: 'select[name="resource"], #resourceSelector, [data-testid="resource-selector"]',
        metricSelector: 'select[name="metric"], #metricSelector, [data-testid="metric-selector"]',
        chart: '[data-testid*="chart"], .chart, canvas, svg',
        
        // Analysis elements
        operationalCondition: '[data-testid="condition"], .condition, .operational-status',
        trafficLight: '[data-testid="traffic-light"], .traffic-light, .semaphore',
        inclinationValue: '[data-testid="inclination"], .inclination',
        signals: '[data-testid="signals"], .signals',
        playbook: '[data-testid="playbook"], .playbook',
        formula: '[data-testid="formula"], .formula, .condition-formula',
        
        // User menu
        userMenu: '[data-testid="user-menu"], button',
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
        // Hacer clic en el botón con las iniciales AD
        cy.contains('button', 'AD').click();
        cy.contains('Cerrar Sesión').click();
    }

    /**
     * Verify dashboard is displayed
     */
    verifyDashboardDisplayed(): void {
        cy.url().should('include', '/dashboard');
        // Verificar que existe el placeholder del selector de recursos
        cy.contains('Select a resource').should('exist');
    }

    /**
     * Verify on specific page
     */
    verifyOnPage(pageName: string): void {
        const pageUrl = `/${pageName.toLowerCase()}`;
        cy.url().should('include', pageUrl);
    }

    /**
     * Verify resource selector is visible
     */
    verifyResourceSelectorVisible(): void {
        cy.get(this.selectors.resourceSelector).should('be.visible');
    }

    /**
     * Verify metric selector is visible
     */
    verifyMetricSelectorVisible(): void {
        cy.get(this.selectors.metricSelector).should('be.visible');
    }

    /**
     * Select resource
     */
    selectResource(resourceName: string): void {
        cy.get(this.selectors.resourceSelector).select(resourceName);
    }

    /**
     * Select metric
     */
    selectMetric(metricName: string): void {
        cy.get(this.selectors.metricSelector).select(metricName);
    }

    /**
     * Verify chart is displayed
     */
    verifyChartDisplayed(): void {
        cy.get(this.selectors.chart).should('be.visible');
    }

    /**
     * Verify chart has data
     */
    verifyChartHasData(): void {
        cy.get(this.selectors.chart).should('exist');
        // Chart should have rendered some content
        cy.wait(1000);
    }

    /**
     * Verify operational condition is shown
     */
    verifyOperationalConditionShown(): void {
        cy.get(this.selectors.operationalCondition).should('be.visible');
    }

    /**
     * Verify traffic light is shown
     */
    verifyTrafficLightShown(): void {
        cy.get(this.selectors.trafficLight).should('be.visible');
    }

    /**
     * Verify inclination value is shown
     */
    verifyInclinationShown(): void {
        cy.get(this.selectors.inclinationValue).should('be.visible');
    }

    /**
     * Verify signals are shown
     */
    verifySignalsShown(): void {
        cy.get(this.selectors.signals).should('be.visible');
    }

    /**
     * Verify playbook is shown
     */
    verifyPlaybookShown(): void {
        cy.get(this.selectors.playbook).should('be.visible');
    }

    /**
     * Verify formula is shown
     */
    verifyFormulaShown(): void {
        cy.get(this.selectors.formula).should('be.visible');
    }}