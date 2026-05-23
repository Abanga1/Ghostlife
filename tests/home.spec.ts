import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('renders hero with book CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const buyLink = page.getByRole('link', { name: /get the book/i }).first()
    await expect(buyLink).toBeVisible()
    await expect(buyLink).toHaveAttribute('href', /lemonsqueezy/)
  })

  test('nav signs button scrolls to signs section', async ({ page }) => {
    await page.goto('/')
    // Nav uses buttons (not links) for scroll targets
    await page.locator('nav').getByRole('button', { name: 'The Signs' }).click()
    await expect(page.locator('#signs')).toBeInViewport({ ratio: 0.1 })
  })

  test('nav becomes scrolled after 60px', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, 200))
    await expect(page.locator('header.nav')).toHaveClass(/nav--scrolled/)
  })

  test('footer links are present', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: 'Blog' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Terms' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Affiliates' })).toBeVisible()
  })
})
