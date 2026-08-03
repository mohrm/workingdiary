import type { PlaywrightTestConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['./features'],
  require: ['./steps/*.ts'],
  outputDir: '../build/cucumber',
});

// Only scenarios tagged @stable-layout run on every viewport below — the
// rest of the suite only needs to run once, at the default desktop size.
const STABLE_LAYOUT = /@stable-layout/;

const config: PlaywrightTestConfig = {
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
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
  testDir,
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: '../build/e2e',
      },
    ],
  ],
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'stable-layout-360',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 360, height: 800 } },
    },
    {
      name: 'stable-layout-375',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 375, height: 800 } },
    },
    {
      name: 'stable-layout-393',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 393, height: 800 } },
    },
    // Real device data supplied by the user: a Fairphone 4 running Chrome
    // Mobile on Android.
    {
      name: 'stable-layout-fairphone-4',
      grep: STABLE_LAYOUT,
      use: {
        viewport: { width: 411, height: 756 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      name: 'stable-layout-430',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 430, height: 800 } },
    },
    {
      name: 'stable-layout-600',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 600, height: 900 } },
    },
    {
      name: 'stable-layout-768',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'stable-layout-1024',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 1024, height: 800 } },
    },
    {
      name: 'stable-layout-1280',
      grep: STABLE_LAYOUT,
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
};

export default config;
