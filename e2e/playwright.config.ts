/**
 * Standalone Playwright config for e2e smoke tests.
 * This file is NOT wired into package.json scripts or CI.
 *
 * Usage:
 *   npm run build && npm run start
 *   npx playwright test e2e/smoke.spec.ts --config=e2e/playwright.config.ts
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 15_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
