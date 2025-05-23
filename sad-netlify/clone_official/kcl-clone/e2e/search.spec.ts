import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test('should display search results', async ({ page }) => {
    // Go directly to search page with a query
    await page.goto('/search?q=deals');

    // Check page title
    await expect(page).toHaveTitle(/Search Results/);

    // Check that search results are displayed
    await expect(page.getByText(/Search Results for/)).toBeVisible();

    // Check that tabs exist
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stores/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Deals/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Articles/i })).toBeVisible();
  });

  test('should filter results by tab', async ({ page }) => {
    // Go to search page
    await page.goto('/search?q=amazon');

    // Click on Stores tab
    await page.getByRole('button', { name: /Stores/i }).click();

    // URL should be updated with tab parameter
    await expect(page).toHaveURL(/tab=stores/);

    // Only store results should be visible
    await expect(page.getByText(/store results/i)).toBeVisible();
  });

  test('should apply filters', async ({ page }) => {
    // Go to search page
    await page.goto('/search?q=discount');

    // Open filters on mobile view (if on mobile)
    if (page.viewportSize()?.width! < 768) {
      await page.getByRole('button', { name: /Filters & Sort/i }).click();
    }

    // Select a category filter if available
    const categorySelect = page.locator('#deal-category, #mobile-deal-category').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('electronics');

      // URL should be updated with category parameter
      await expect(page).toHaveURL(/category=electronics/);
    }

    // Select a sort option
    const sortSelect = page.locator('#sort-by, #mobile-sort-by').first();
    await sortSelect.selectOption('price-asc');

    // URL should be updated with sort parameter
    await expect(page).toHaveURL(/sort=price-asc/);
  });
});
