/**
 * E2E smoke tests - static public routes only.
 *
 * Run against a local production build:
 *   npm run build && npm run start
 *   npx playwright test e2e/smoke.spec.ts --config=e2e/playwright.config.ts
 *
 * NEVER run against production (svsit.nl).
 * These tests require a running server at http://localhost:3000.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

async function goTo(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`)
}

test.describe('Public route smoke tests', () => {
  test('homepage has a title and navbar', async ({ page }) => {
    await goTo(page, '/')
    await expect(page).toHaveTitle(/.+/)
    // Navbar: look for a nav element or a link to known routes
    const nav = page.locator('nav')
    await expect(nav.first()).toBeVisible()
  })

  test('/faq has a title and navbar', async ({ page }) => {
    await goTo(page, '/faq')
    await expect(page).toHaveTitle(/.+/)
    const nav = page.locator('nav')
    await expect(nav.first()).toBeVisible()
  })

  test('/partners has a title and navbar', async ({ page }) => {
    await goTo(page, '/partners')
    await expect(page).toHaveTitle(/.+/)
    const nav = page.locator('nav')
    await expect(nav.first()).toBeVisible()
  })

  test('homepage body is non-empty', async ({ page }) => {
    await goTo(page, '/')
    const body = page.locator('body')
    const text = await body.innerText()
    expect(text.trim().length).toBeGreaterThan(0)
  })

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await goTo(page, '/')
    // Allow time for hydration
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })
})
