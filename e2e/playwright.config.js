import { defineBddConfig } from 'playwright-bdd';

/**
 * Playwright configuration file, see link for more information:
 * https://playwright.dev/docs/test-configuration
 *
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
export default {
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  workers: 4,
  use: {
    baseURL: 'http://localhost:5173/',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
  testDir: defineBddConfig({
    paths: ['./features'],
    require: ['./steps/*.ts'],
    outputDir: '../build/cucumber'
  }),
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: '../build/e2e',
      },
    ],
  ],
};
