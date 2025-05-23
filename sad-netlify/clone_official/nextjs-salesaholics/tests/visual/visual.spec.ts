import { test, expect } from '@playwright/test';

// Enable Percy visual testing
const percySnapshot = async (page, name) => {
  // This is a mock for the Percy snapshot function
  // In a real implementation, you would use @percy/playwright
  await page.screenshot({ path: `./screenshots/${name}.png`, fullPage: true });
  console.log(`[Percy] Visual snapshot taken: ${name}`);
};

test.describe('Visual Regression Tests', () => {
  test('Home page visual regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a visual snapshot
    await percySnapshot(page, 'home-page');
  });

  test('Deals page visual regression', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Take a visual snapshot
    await percySnapshot(page, 'deals-page');
  });

  test('Mobile menu visual regression', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    await page.getByLabel(/menu/i).click();
    await page.waitForTimeout(500); // Wait for animations

    // Take a visual snapshot of the mobile menu
    await percySnapshot(page, 'mobile-menu');
  });

  test('Dark mode visual regression', async ({ page }) => {
    await page.goto('/');

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    await page.waitForTimeout(500); // Wait for theme to apply

    // Take a visual snapshot in dark mode
    await percySnapshot(page, 'home-page-dark-mode');
  });

  test('Error page visual regression', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');

    // Take a visual snapshot of the 404 page
    await percySnapshot(page, '404-page');
  });
});
