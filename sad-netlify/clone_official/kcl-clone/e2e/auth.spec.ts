import { test, expect } from '@playwright/test';

// Test user credentials (using mocks)
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!',
  displayName: 'Test User',
};

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /log in/i, exact: false }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i, exact: false }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  });

  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling in fields
    await page.getByRole('button', { name: /log in/i }).click();

    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();

    // Fill in email only
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByRole('button', { name: /log in/i }).click();

    // Should still show password error
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  // This test simulates a successful login by setting localStorage
  // In a real app, you would test the actual login process
  test('should login and access protected pages', async ({ page }) => {
    await page.goto('/');

    // Simulate a successful login by setting localStorage
    await page.evaluate((user) => {
      const mockUser = {
        id: 'user_123',
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');
    }, TEST_USER);

    // Reload the page
    await page.reload();

    // Should now show the user profile link
    await expect(page.getByText(TEST_USER.displayName)).toBeVisible();

    // Navigate to profile page
    await page.getByText(TEST_USER.displayName).click();
    await page.getByRole('link', { name: /profile/i }).click();

    // Should be on profile page now
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /your profile/i })).toBeVisible();
  });

  test('should not access protected pages when not logged in', async ({ page }) => {
    // Try to access profile page directly
    await page.goto('/profile');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });
});
