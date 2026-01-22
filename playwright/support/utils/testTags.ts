/**
 * Utility functions for generating and working with test IDs (data-testid).
 * Ported from Cypress implementation for consistency.
 */

export interface TestTagOptions {
    /**
     * The tag name to use as prefix (default: 'data-testid')
     */
    tagName?: string;
}

/**
 * Generates a data-testid selector from parts.
 * Recursively concatenates parts with hyphens.
 *
 * @example
 * testTag('login', 'email', 'input') // => '[data-testid="login-email-input"]'
 * testTag('dashboard', 'chart') // => '[data-testid="dashboard-chart"]'
 */
export function testTag(...parts: Array<string | number>): string {
    if (parts.length === 0) {
        throw new Error('testTag requires at least one argument');
    }

    const tagValue = parts
        .filter((part) => part !== '' && part !== null && part !== undefined)
        .join('-')
        .toLowerCase();

    return `[data-testid="${tagValue}"]`;
}

/**
 * Gets only the data-testid value without brackets (for Playwright locators).
 *
 * @example
 * testTagValue('login', 'email') // => 'login-email'
 */
export function testTagValue(...parts: Array<string | number>): string {
    if (parts.length === 0) {
        throw new Error('testTagValue requires at least one argument');
    }

    return parts
        .filter((part) => part !== '' && part !== null && part !== undefined)
        .join('-')
        .toLowerCase();
}

/**
 * Creates a test tag for a specific component with a prefix.
 *
 * @example
 * const loginTags = tagFactory('login');
 * loginTags('email', 'input') // => '[data-testid="login-email-input"]'
 */
export function tagFactory(prefix: string) {
    return (...parts: Array<string | number>) => testTag(prefix, ...parts);
}

/**
 * Creates a test tag value factory for a specific component.
 *
 * @example
 * const dashboardTagValues = tagValueFactory('dashboard');
 * dashboardTagValues('resource', 'selector') // => 'dashboard-resource-selector'
 */
export function tagValueFactory(prefix: string) {
    return (...parts: Array<string | number>) => testTagValue(prefix, ...parts);
}
