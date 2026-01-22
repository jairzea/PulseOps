import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../../support/pages/LoginPage';
import { DashboardPage } from '../../support/pages/DashboardPage';

const { Given, When, Then } = createBdd();

/**
 * Common step definitions used across multiple features.
 * These steps handle authentication and basic navigation.
 */

Given('el usuario visita la aplicación', async ({ page }) => {
    // Page is available through fixture
});

Given('el usuario está en la página de login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.verifyLoginPageDisplayed();
});

Given('el usuario ha iniciado sesión exitosamente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    
    // Verify login was successful
    const isSuccess = await loginPage.isLoginSuccessful();
    expect(isSuccess).toBeTruthy();
});

Given('está en la página {string}', async ({ page }, path: string) => {
    const currentPath = await page.url();
    expect(currentPath).toContain(path);
});

When('el usuario accede a la raíz de la aplicación', async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173');
    await page.waitForLoadState('networkidle');
});

When('el usuario inicia sesión con credenciales válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
});

When('el usuario hace click en el enlace {string} en el sidebar', async ({ page }, linkText: string) => {
    const dashboardPage = new DashboardPage(page);
    
    switch (linkText.toLowerCase()) {
        case 'resources':
            await dashboardPage.navigateToResources();
            break;
        case 'metrics':
            await dashboardPage.navigateToMetrics();
            break;
        case 'records':
            await dashboardPage.navigateToRecords();
            break;
        case 'charts':
            await dashboardPage.navigateToCharts();
            break;
        default:
            throw new Error(`Unknown link: ${linkText}`);
    }
});

When('el usuario cierra sesión', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();
});

Then('es redirigido automáticamente a {string}', async ({ page }, expectedPath: string) => {
    // Wait for navigation
    await page.waitForURL(`**${expectedPath}`, { timeout: 10000 });
    
    // Verify current path
    const currentUrl = page.url();
    expect(currentUrl).toContain(expectedPath);
});

Then('es redirigido a {string}', async ({ page }, expectedPath: string) => {
    // Verify current path
    await page.waitForTimeout(1000); // Give time for navigation
    const currentUrl = page.url();
    expect(currentUrl).toContain(expectedPath);
});

Then('ve el formulario de inicio de sesión', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginPageDisplayed();
});

Then('ve el contenido del dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardDisplayed();
});
