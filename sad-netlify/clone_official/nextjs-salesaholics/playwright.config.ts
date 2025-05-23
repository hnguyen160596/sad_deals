import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // Testing with Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Testing with Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Testing with Desktop Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Testing with Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Testing with Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // Visual testing with Percy
    {
      name: 'visual',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run build && bun run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
