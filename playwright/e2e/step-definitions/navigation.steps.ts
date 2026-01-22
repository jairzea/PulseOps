import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Then } = createBdd();

/**
 * Navigation-specific step definitions
 */

Then('ve la lista de recursos', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on resources page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/resources');
    
    // Look for common elements on resources page
    // Will update these selectors after exploring the actual page
    const possibleSelectors = [
        'h1:has-text("Resources")',
        'h2:has-text("Resources")',
        'table',
        '[role="table"]',
        'text=Create Resource',
        'button:has-text("New")',
    ];
    
    // At least one of these should be visible
    let found = false;
    for (const selector of possibleSelectors) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
            found = true;
            break;
        }
    }
    
    expect(found).toBeTruthy();
});

Then('ve la lista de métricas', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on metrics page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/metrics');
    
    // Look for common elements on metrics page
    const possibleSelectors = [
        'h1:has-text("Metrics")',
        'h2:has-text("Metrics")',
        'table',
        '[role="table"]',
        'text=Create Metric',
        'button:has-text("New")',
    ];
    
    // At least one of these should be visible
    let found = false;
    for (const selector of possibleSelectors) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
            found = true;
            break;
        }
    }
    
    expect(found).toBeTruthy();
});

Then('ve la lista de registros', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on records page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/records');
    
    // Look for common elements on records page
    const possibleSelectors = [
        'h1:has-text("Records")',
        'h2:has-text("Records")',
        'table',
        '[role="table"]',
        'text=Create Record',
        'button:has-text("New")',
    ];
    
    // At least one of these should be visible
    let found = false;
    for (const selector of possibleSelectors) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
            found = true;
            break;
        }
    }
    
    expect(found).toBeTruthy();
});
