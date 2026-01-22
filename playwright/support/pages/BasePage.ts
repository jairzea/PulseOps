import { Page, Locator, expect } from '@playwright/test';
import { waitForAppReady } from '../utils/waitHelpers';

/**
 * Base Page Object
 * Provides common functionality for all page objects.
 */
export class BasePage {
    protected baseURL: string;

    constructor(
        protected page: Page,
        protected path: string = '/'
    ) {
        this.baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    }

    /**
     * Navigate to the page
     */
    async goto(): Promise<void> {
        const url = `${this.baseURL}${this.path}`;
        await this.page.goto(url, { waitUntil: 'networkidle' });
        await waitForAppReady(this.page);
    }

    /**
     * Get the current URL
     */
    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    /**
     * Get the current pathname
     */
    async getCurrentPath(): Promise<string> {
        const url = new URL(this.page.url());
        return url.pathname;
    }

    /**
     * Wait for navigation to a specific path
     */
    async waitForNavigation(expectedPath: string, timeout = 5000): Promise<void> {
        await this.page.waitForURL(`**${expectedPath}`, { timeout });
    }

    /**
     * Click an element
     */
    async click(selector: string | Locator): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.click();
    }

    /**
     * Fill an input field
     */
    async fill(selector: string | Locator, value: string): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.fill(value);
    }

    /**
     * Get text content of an element
     */
    async getText(selector: string | Locator): Promise<string> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        return (await locator.textContent()) || '';
    }

    /**
     * Check if an element is visible
     */
    async isVisible(selector: string | Locator): Promise<boolean> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        return await locator.isVisible();
    }

    /**
     * Wait for an element to be visible
     */
    async waitForSelector(selector: string, timeout = 5000): Promise<Locator> {
        await this.page.waitForSelector(selector, { state: 'visible', timeout });
        return this.page.locator(selector);
    }

    /**
     * Wait for an element to be hidden
     */
    async waitForSelectorHidden(selector: string, timeout = 5000): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    }

    /**
     * Get a locator by test ID
     */
    getByTestId(testId: string): Locator {
        return this.page.getByTestId(testId);
    }

    /**
     * Get a locator by role
     */
    getByRole(role: 'button' | 'link' | 'heading' | 'textbox' | 'dialog' | string, options?: { name?: string }): Locator {
        return this.page.getByRole(role, options);
    }

    /**
     * Get a locator by placeholder
     */
    getByPlaceholder(placeholder: string): Locator {
        return this.page.getByPlaceholder(placeholder);
    }

    /**
     * Get a locator by label
     */
    getByLabel(label: string): Locator {
        return this.page.getByLabel(label);
    }

    /**
     * Take a screenshot
     */
    async screenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    }

    /**
     * Reload the page
     */
    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: 'networkidle' });
        await waitForAppReady(this.page);
    }

    /**
     * Press a key
     */
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /**
     * Hover over an element
     */
    async hover(selector: string | Locator): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.hover();
    }

    /**
     * Select an option from a dropdown
     */
    async selectOption(selector: string | Locator, value: string): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.selectOption(value);
    }

    /**
     * Check a checkbox
     */
    async check(selector: string | Locator): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.check();
    }

    /**
     * Uncheck a checkbox
     */
    async uncheck(selector: string | Locator): Promise<void> {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.uncheck();
    }

    /**
     * Get all elements matching a selector
     */
    async getAll(selector: string): Promise<Locator> {
        return this.page.locator(selector);
    }

    /**
     * Get count of elements matching a selector
     */
    async getCount(selector: string): Promise<number> {
        return await this.page.locator(selector).count();
    }
}
