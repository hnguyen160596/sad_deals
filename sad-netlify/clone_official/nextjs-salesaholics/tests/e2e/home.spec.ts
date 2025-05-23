import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Sales Aholics Deals/);

    // Check that the main heading is visible
    const heading = page.getByRole('heading', { name: /Discover Amazing Deals/i });
    await expect(heading).toBeVisible();

    // Check that navigation links are present
    await expect(page.getByRole('link', { name: /daily deals/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /coupons/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /savings tips/i })).toBeVisible();
  });

  test('should navigate to deals page', async ({ page }) => {
    await page.goto('/');

    // Click on the daily deals link
    await page.getByRole('link', { name: /daily deals/i }).click();

    // Check that we're on the deals page
    await expect(page).toHaveURL(/.*\/deals/);

    // Check that the deals heading is visible
    const heading = page.getByRole('heading', { name: /daily deals/i, exact: false });
    await expect(heading).toBeVisible();
  });

  test('should show popular stores section', async ({ page }) => {
    await page.goto('/');

    // Check that the popular stores section is visible
    const storesSection = page.getByText(/popular stores/i);
    await expect(storesSection).toBeVisible();

    // Check that some store links are present
    await expect(page.getByRole('link', { name: /amazon/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /walmart/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /target/i })).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/');

    // Find and click the search button
    await page.getByLabel(/search/i).click();

    // Type a search query
    await page.getByPlaceholder(/search/i).fill('airpods');

    // Press enter to submit the search
    await page.keyboard.press('Enter');

    // Check that we're on the search results page
    await expect(page).toHaveURL(/.*\/search\?q=airpods/);

    // Check that the search results heading is visible
    const heading = page.getByText(/search results/i);
    await expect(heading).toBeVisible();
  });

  test('should show error page for non-existent URLs', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Check for 404 page indicators
    const notFoundHeading = page.getByRole('heading', { name: /not found/i, exact: false });
    await expect(notFoundHeading).toBeVisible();
  });
});
