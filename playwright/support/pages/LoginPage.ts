import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { testTag, testTagValue } from '../utils/testTags';

/**
 * Login Page Object
 * Handles all interactions with the login page.
 */
export class LoginPage extends BasePage {
    // Selectors - prioritize data-testid when available, fallback to semantic selectors
    private readonly selectors = {
        emailInput: 'input[type="email"]',
        passwordInput: 'input[type="password"]',
        rememberCheckbox: 'input[type="checkbox"]',
        submitButton: 'button[type="submit"]',
        forgotPasswordLink: 'text=Forgot Password?',
        loginHeading: 'text=Welcome to PulseOps',
        errorMessage: '[role="alert"], .error, .text-red-500',
    };

    constructor(page: Page) {
        super(page, '/login');
    }

    /**
     * Perform login with credentials
     */
    async login(email: string, password: string, remember = false): Promise<void> {
        // Fill email
        await this.page.locator(this.selectors.emailInput).fill(email);

        // Fill password
        await this.page.locator(this.selectors.passwordInput).fill(password);

        // Remember me checkbox
        if (remember) {
            await this.page.locator(this.selectors.rememberCheckbox).check();
        }

        // Setup a promise to wait for navigation
        const navigationPromise = this.page.waitForURL('**/dashboard', {
            timeout: 15000,
            waitUntil: 'networkidle'
        }).catch(() => null);

        // Click login button
        await this.page.locator(this.selectors.submitButton).click();

        // Wait for either navigation to dashboard or error message
        await Promise.race([
            navigationPromise,
            this.page.waitForSelector(this.selectors.errorMessage, { state: 'visible', timeout: 5000 }).catch(() => null),
        ]);

        // Give additional time for any client-side redirects
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }

    /**
     * Quick login with default test credentials
     */
    async loginAsAdmin(): Promise<void> {
        await this.login('admin@pulseops.com', 'admin123');
    }

    /**
     * Check if login was successful (redirected to dashboard)
     */
    async isLoginSuccessful(): Promise<boolean> {
        const currentPath = await this.getCurrentPath();
        return currentPath === '/dashboard' || currentPath.startsWith('/dashboard');
    }

    /**
     * Get error message if login failed
     */
    async getErrorMessage(): Promise<string | null> {
        const errorElement = this.page.locator(this.selectors.errorMessage).first();
        const isVisible = await errorElement.isVisible().catch(() => false);

        if (isVisible) {
            return await errorElement.textContent();
        }

        return null;
    }

    /**
     * Click "Forgot Password?" link
     */
    async clickForgotPassword(): Promise<void> {
        await this.page.locator(this.selectors.forgotPasswordLink).click();
    }

    /**
     * Verify login page is displayed
     */
    async verifyLoginPageDisplayed(): Promise<void> {
        await expect(this.page.locator(this.selectors.loginHeading)).toBeVisible();
        await expect(this.page.locator(this.selectors.emailInput)).toBeVisible();
        await expect(this.page.locator(this.selectors.passwordInput)).toBeVisible();
        await expect(this.page.locator(this.selectors.submitButton)).toBeVisible();
    }

    /**
     * Fill email field
     */
    async fillEmail(email: string): Promise<void> {
        await this.page.locator(this.selectors.emailInput).fill(email);
    }

    /**
     * Fill password field
     */
    async fillPassword(password: string): Promise<void> {
        await this.page.locator(this.selectors.passwordInput).fill(password);
    }

    /**
     * Click login button
     */
    async clickLogin(): Promise<void> {
        await this.page.locator(this.selectors.submitButton).click();
    }

    /**
     * Check remember me checkbox
     */
    async checkRememberMe(): Promise<void> {
        await this.page.locator(this.selectors.rememberCheckbox).check();
    }

    /**
     * Get the state of remember me checkbox
     */
    async isRememberMeChecked(): Promise<boolean> {
        return await this.page.locator(this.selectors.rememberCheckbox).isChecked();
    }
}
