import { test, expect } from '@playwright/test'

const PAGES = [
  '/contact',
  '/privacy',
  '/terms',
  '/affiliate',
  '/thank-you',
  '/blog',
]

test.describe('Inner pages', () => {
  for (const path of PAGES) {
    test(`${path} renders without error`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await expect(page.locator('body')).not.toContainText('404')
    })
  }

  test('unknown route falls back to SPA (no blank page)', async ({ page }) => {
    await page.goto('/does-not-exist')
    // historyApiFallback serves index.html — React Router shows home
    await expect(page.locator('body')).not.toContainText('404')
    await expect(page.locator('#root')).not.toBeEmpty()
  })

  test('back link on contact page returns home', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('link', { name: /back/i }).click()
    await expect(page).toHaveURL('/')
  })
})
