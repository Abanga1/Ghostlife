import { test, expect } from '@playwright/test'

async function startQuiz(page: any) {
  await page.locator('.quiz').getByRole('button', { name: /take the quiz/i }).click()
}

function gateEmail(page: any) {
  return page.locator('.quiz--gate').getByPlaceholder(/email address/i)
}

// Click an answer and wait for the next question or the gate to appear
async function answer(page: any, label: string, index: number) {
  await page.getByRole('button', { name: label }).click()
  if (index < 19) {
    await expect(page.getByText(`${index + 2} of 20`)).toBeVisible()
  } else {
    // Last question — gate appears next
    await expect(page.locator('.quiz--gate')).toBeVisible()
  }
}

test.describe('Quiz', () => {
  test('intro screen renders and starts quiz', async ({ page }) => {
    await page.goto('/#quiz')
    const quizSection = page.locator('section.quiz').last()
    await expect(quizSection.getByText(/which stage are you in/i)).toBeVisible()
    await startQuiz(page)
    await expect(page.getByText(/1 of 20/i)).toBeVisible()
  })

  test('progress bar advances with each answer', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)

    const fill = page.locator('.quiz__progress-fill')
    const widthBefore = await fill.evaluate(el => (el as HTMLElement).style.width)

    await answer(page, 'Sometimes', 0)

    const widthAfter = await fill.evaluate(el => (el as HTMLElement).style.width)
    expect(widthAfter).not.toBe(widthBefore)
    await expect(page.getByText(/2 of 20/i)).toBeVisible()
  })

  test('email gate appears after all 20 questions', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)
    for (let i = 0; i < 20; i++) await answer(page, 'Sometimes', i)
    await expect(page.getByText(/your result is ready/i)).toBeVisible()
    await expect(gateEmail(page)).toBeVisible()
  })

  test('email gate validates email format', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)
    for (let i = 0; i < 20; i++) await answer(page, 'Often', i)
    await gateEmail(page).fill('notanemail')
    await page.getByRole('button', { name: /show my result/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('result screen shows stage and buy button after gate', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)
    for (let i = 0; i < 20; i++) await answer(page, 'Sometimes', i)
    await gateEmail(page).fill('test@example.com')
    await page.getByRole('button', { name: /show my result/i }).click()
    const result = page.locator('.quiz--result')
    await expect(result.getByText('Your result', { exact: true })).toBeVisible()
    await expect(result.getByText(/score:/i)).toBeVisible()
    await expect(result.getByRole('link', { name: /get the book/i })).toBeVisible()
    await expect(result.getByRole('button', { name: /retake/i })).toBeVisible()
  })

  test('share buttons are visible after result', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)
    for (let i = 0; i < 20; i++) await answer(page, 'Always', i)
    await gateEmail(page).fill('test@example.com')
    await page.getByRole('button', { name: /show my result/i }).click()
    await expect(page.getByText(/share your result/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /share on x/i })).toBeVisible()
  })

  test('retake resets to intro', async ({ page }) => {
    await page.goto('/')
    await startQuiz(page)
    for (let i = 0; i < 20; i++) await answer(page, 'Never', i)
    await gateEmail(page).fill('test@example.com')
    await page.getByRole('button', { name: /show my result/i }).click()
    await page.getByRole('button', { name: /retake/i }).click()
    const quizSection = page.locator('section.quiz').last()
    await expect(quizSection.getByText(/which stage are you in/i)).toBeVisible()
  })
})
