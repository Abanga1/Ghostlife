import { test, expect } from '@playwright/test'
import { ARTICLES } from '../src/data/articles'

test.describe('Blog', () => {
  test('blog index lists all articles', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByText(/on living a/i)).toBeVisible()

    for (const article of ARTICLES) {
      await expect(page.getByText(article.title)).toBeVisible()
    }
  })

  test('clicking article navigates to article page', async ({ page }) => {
    await page.goto('/blog')
    const first = ARTICLES[0]
    await page.getByRole('link', { name: first.title }).first().click()
    await expect(page).toHaveURL(`/blog/${first.slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(first.title)
  })

  test('article page renders all sections', async ({ page }) => {
    const article = ARTICLES[1]
    await page.goto(`/blog/${article.slug}`)

    for (const section of article.sections) {
      await expect(page.getByText(section.heading)).toBeVisible()
    }
  })

  test('article CTA links to quiz and book', async ({ page }) => {
    await page.goto(`/blog/${ARTICLES[0].slug}`)

    const quizLink = page.getByRole('link', { name: /take the quiz/i })
    await expect(quizLink).toBeVisible()
    await expect(quizLink).toHaveAttribute('href', '/#quiz')

    const bookLink = page.getByRole('link', { name: /get the book/i })
    await expect(bookLink).toHaveAttribute('href', /buy\.stripe\.com/)
  })

  test('unknown slug redirects to blog index', async ({ page }) => {
    await page.goto('/blog/this-does-not-exist')
    await expect(page).toHaveURL('/blog')
  })

  test('back link returns to blog index', async ({ page }) => {
    await page.goto(`/blog/${ARTICLES[2].slug}`)
    await page.getByRole('link', { name: /all articles/i }).click()
    await expect(page).toHaveURL('/blog')
  })
})
