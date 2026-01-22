import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { waitForChartLoaded } from '../utils/waitHelpers';

/**
 * Dashboard Page Object
 * Handles all interactions with the main dashboard page.
 */
export class DashboardPage extends BasePage {
    // Selectors - will update as we explore the actual UI
    private readonly selectors = {
        // Sidebar navigation
        sidebarDashboard: 'a[href="/dashboard"], nav a:has-text("Dashboard")',
        sidebarResources: 'a[href="/resources"], nav a:has-text("Resources")',
        sidebarMetrics: 'a[href="/metrics"], nav a:has-text("Metrics")',
        sidebarRecords: 'a[href="/records"], nav a:has-text("Records")',
        sidebarCharts: 'a[href="/charts"], nav a:has-text("Charts")',
        
        // Dashboard specific elements
        resourceSelector: 'select, [role="combobox"], button:has-text("Select Resource")',
        metricSelector: 'select, [role="combobox"], button:has-text("Select Metric")',
        chart: '[data-testid*="chart"], .chart, canvas, svg[class*="chart"]',
        conditionPanel: '[data-testid*="condition"], .condition-panel',
        
        // User menu
        userMenu: '[data-testid="user-menu"], button:has-text("AD"), [aria-label*="user menu"]',
        logoutButton: 'text=Logout, text=Sign out, button:has-text("Logout")',
    };

    constructor(page: Page) {
        super(page, '/dashboard');
    }

    /**
     * Wait for dashboard to be fully loaded
     */
    async waitForDashboardLoad(): Promise<void> {
        // Wait for main container to be visible
        await this.page.waitForLoadState('networkidle');
        
        // Wait a bit for any dynamic content
        await this.page.waitForTimeout(1000);
    }

    /**
     * Navigate to Resources page via sidebar
     */
    async navigateToResources(): Promise<void> {
        await this.page.locator(this.selectors.sidebarResources).click();
        await this.waitForNavigation('/resources');
    }

    /**
     * Navigate to Metrics page via sidebar
     */
    async navigateToMetrics(): Promise<void> {
        await this.page.locator(this.selectors.sidebarMetrics).click();
        await this.waitForNavigation('/metrics');
    }

    /**
     * Navigate to Records page via sidebar
     */
    async navigateToRecords(): Promise<void> {
        await this.page.locator(this.selectors.sidebarRecords).click();
        await this.waitForNavigation('/records');
    }

    /**
     * Navigate to Charts page via sidebar
     */
    async navigateToCharts(): Promise<void> {
        await this.page.locator(this.selectors.sidebarCharts).click();
        await this.waitForNavigation('/charts');
    }

    /**
     * Select a resource from the resource selector
     */
    async selectResource(resourceName: string): Promise<void> {
        const selector = this.page.locator(this.selectors.resourceSelector).first();
        
        // Click to open dropdown
        await selector.click();
        
        // Select the resource
        await this.page.locator(`text=${resourceName}`).click();
        
        // Wait for chart to update
        await this.page.waitForTimeout(1000);
    }

    /**
     * Select a metric from the metric selector
     */
    async selectMetric(metricName: string): Promise<void> {
        const selector = this.page.locator(this.selectors.metricSelector).first();
        
        // Click to open dropdown
        await selector.click();
        
        // Select the metric
        await this.page.locator(`text=${metricName}`).click();
        
        // Wait for chart to update
        await this.page.waitForTimeout(1000);
    }

    /**
     * Check if chart is visible
     */
    async isChartVisible(): Promise<boolean> {
        const chart = this.page.locator(this.selectors.chart).first();
        return await chart.isVisible().catch(() => false);
    }

    /**
     * Check if condition panel is visible
     */
    async isConditionPanelVisible(): Promise<boolean> {
        const panel = this.page.locator(this.selectors.conditionPanel).first();
        return await panel.isVisible().catch(() => false);
    }

    /**
     * Logout from the application
     */
    async logout(): Promise<void> {
        // Click user menu
        await this.page.locator(this.selectors.userMenu).click();
        
        // Wait for menu to open
        await this.page.waitForTimeout(500);
        
        // Click logout
        await this.page.locator(this.selectors.logoutButton).click();
        
        // Wait for redirect to login
        await this.waitForNavigation('/login');
    }

    /**
     * Verify dashboard is displayed
     */
    async verifyDashboardDisplayed(): Promise<void> {
        await this.waitForDashboardLoad();
        
        // Verify we're on the dashboard path
        const currentPath = await this.getCurrentPath();
        expect(currentPath).toBe('/dashboard');
    }

    /**
     * Get visible sidebar links
     */
    async getSidebarLinks(): Promise<string[]> {
        const links = await this.page.locator('nav a').allTextContents();
        return links.filter(link => link.trim().length > 0);
    }

    /**
     * Get page title or heading
     */
    async getPageTitle(): Promise<string> {
        const heading = this.page.locator('h1, h2').first();
        return await heading.textContent() || '';
    }
}
