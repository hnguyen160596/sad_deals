import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display key elements', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the title is correct
    await expect(page).toHaveTitle(/Sales Aholics Deals/);

    // Check that key elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for main sections
    await expect(page.getByRole('heading', { name: /Today's Best Deals/i, exact: false })).toBeVisible();

    // Check navigation links
    const navLinks = page.locator('header').getByRole('link');
    await expect(navLinks).toHaveCount.greaterThan(3);

    // Check for the search functionality
    const searchButton = page.locator('header').getByLabel(/search/i);
    await expect(searchButton).toBeVisible();
  });

  test('should allow search', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Open search
    await page.locator('header').getByLabel(/search/i).click();

    // Fill in search query
    await page.locator('input[type="text"]').fill('Amazon');

    // Submit the search
    await page.keyboard.press('Enter');

    // Should redirect to search page
    await expect(page).toHaveURL(/\/search\?q=Amazon/);

    // Search results should be displayed
    await expect(page.getByText(/Search Results for/i)).toBeVisible();
  });

  test('should navigate to store page', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Find and click on a store link (assuming Amazon is present)
    await page.getByRole('link', { name: /Amazon/i }).first().click();

    // Should navigate to Amazon store page
    await expect(page).toHaveURL(/\/coupons-for\/amazon/i);
  });
});
