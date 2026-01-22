import { Page } from '@playwright/test';

/**
 * Wait helpers for common application states.
 * These functions help avoid flakiness by waiting for proper loading states.
 */

export interface WaitOptions {
    timeout?: number;
}

/**
 * Waits for the application to be ready after navigation.
 * Checks for common loading indicators to disappear.
 */
export async function waitForAppReady(page: Page, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || 10000;

    // Wait for navigation to be complete
    await page.waitForLoadState('networkidle', { timeout });

    // Wait for common loading indicators to disappear
    const loadingSelectors = [
        '[data-testid*="loading"]',
        '[data-testid*="spinner"]',
        '.loading',
        '.spinner',
    ];

    for (const selector of loadingSelectors) {
        const loadingElement = page.locator(selector).first();
        const isVisible = await loadingElement.isVisible().catch(() => false);
        
        if (isVisible) {
            await loadingElement.waitFor({ state: 'hidden', timeout }).catch(() => {
                // Ignore if element doesn't disappear - might not be present
            });
        }
    }
}

/**
 * Waits for a table to be loaded with data.
 * Useful for resources, metrics, and records pages.
 */
export async function waitForTableLoaded(
    page: Page,
    tableSelector = 'table',
    options: WaitOptions = {}
): Promise<void> {
    const timeout = options.timeout || 10000;

    // Wait for table to be visible
    await page.waitForSelector(tableSelector, { state: 'visible', timeout });

    // Wait for at least one row (excluding header)
    const rowSelector = `${tableSelector} tbody tr`;
    await page.waitForSelector(rowSelector, { state: 'visible', timeout }).catch(() => {
        // Table might be empty, which is valid
    });
}

/**
 * Waits for a modal/dialog to be fully opened and ready.
 */
export async function waitForModalOpen(
    page: Page,
    modalSelector = '[role="dialog"]',
    options: WaitOptions = {}
): Promise<void> {
    const timeout = options.timeout || 5000;

    // Wait for modal to be visible
    await page.waitForSelector(modalSelector, { state: 'visible', timeout });

    // Wait for animation to complete (modals usually have fade-in)
    await page.waitForTimeout(300); // Small delay for animation

    // Ensure modal is not in transitioning state
    const modal = page.locator(modalSelector).first();
    await modal.waitFor({ state: 'visible', timeout });
}

/**
 * Waits for a modal/dialog to be fully closed.
 */
export async function waitForModalClosed(
    page: Page,
    modalSelector = '[role="dialog"]',
    options: WaitOptions = {}
): Promise<void> {
    const timeout = options.timeout || 5000;

    // Wait for modal to disappear
    await page.waitForSelector(modalSelector, { state: 'hidden', timeout }).catch(() => {
        // Modal might already be closed
    });

    // Wait for animation to complete
    await page.waitForTimeout(300); // Small delay for animation
}

/**
 * Waits for a chart/visualization to be loaded.
 * Useful for dashboard page.
 */
export async function waitForChartLoaded(
    page: Page,
    chartSelector = '[data-testid*="chart"]',
    options: WaitOptions = {}
): Promise<void> {
    const timeout = options.timeout || 10000;

    // Wait for chart container
    await page.waitForSelector(chartSelector, { state: 'visible', timeout });

    // Wait for chart SVG or canvas to be rendered
    const chartElement = page.locator(chartSelector).first();
    const svg = chartElement.locator('svg').first();
    const canvas = chartElement.locator('canvas').first();

    const hasSvg = await svg.isVisible().catch(() => false);
    const hasCanvas = await canvas.isVisible().catch(() => false);

    if (hasSvg) {
        await svg.waitFor({ state: 'visible', timeout });
    } else if (hasCanvas) {
        await canvas.waitFor({ state: 'visible', timeout });
    }

    // Small delay to ensure chart is fully rendered
    await page.waitForTimeout(500);
}

/**
 * Waits for an API response and returns it.
 * Useful for waiting for specific backend calls.
 */
export async function waitForApiResponse(
    page: Page,
    urlPattern: string | RegExp,
    options: WaitOptions = {}
): Promise<any> {
    const timeout = options.timeout || 10000;

    const response = await page.waitForResponse(
        (resp) => {
            const url = resp.url();
            if (typeof urlPattern === 'string') {
                return url.includes(urlPattern);
            }
            return urlPattern.test(url);
        },
        { timeout }
    );

    return response.json().catch(() => null);
}
